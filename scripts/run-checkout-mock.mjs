import { createServer } from "node:http";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { parseEnv } from "node:util";
import { randomBytes, createHash } from "node:crypto";
import assert from "node:assert/strict";
import { initializeCheckoutTestDatabase } from "./checkout-test-database.mjs";
import { createMockHttpHandler } from "../app/checkout-mock-http.mjs";
import { sendTestPasswordSetupMail } from "../app/checkout-smtp.mjs";
import { verifyCustomerPassword } from "../app/customer-password.mjs";
import { createCustomerSessionToken, readCustomerSessionToken } from "../app/customer-session.mjs";

const realMail = process.argv.includes("--smtp");
const saved = realMail ? parseEnv(readFileSync(new URL("../.env.local",import.meta.url),"utf8")) : {};
// Do not inherit any DB path, production signer or payment merchant configuration.
const env = { NODE_ENV:"test", CHECKOUT_MOCK_MODE:"1", PAYTR_TEST_MODE:"1", CHECKOUT_TEST_EMAIL:realMail?saved.CHECKOUT_TEST_EMAIL:"checkout@example.test" };
for (const key of ["SMTP_HOST","SMTP_PORT","SMTP_USER","SMTP_PASS","SMTP_FROM","SMTP_SECURE"]) if (saved[key]) env[key]=saved[key];
mkdirSync(resolve("outputs"),{recursive:true});
const directory=mkdtempSync(join(resolve("outputs"),"checkout-mock-"));
const dbPath=join(directory,"test.sqlite");
const db=initializeCheckoutTestDatabase(dbPath);
const authorization=`Bearer ${randomBytes(32).toString("hex")}`;
const delivered=[];
let handler;
const server=createServer(async(req,res)=>{
  try {
    const chunks=[];let size=0;
    for await (const chunk of req) {size+=chunk.length;if(size>8192){res.writeHead(413);res.end();return;}chunks.push(chunk);}
    const request=new Request(`${env.CHECKOUT_PUBLIC_URL}${req.url}`,{method:req.method,headers:req.headers,...(req.method==="GET"?{}:{body:Buffer.concat(chunks)})});
    const response=await handler(request);
    res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
  }catch{res.writeHead(500);res.end("Test request failed");}
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
env.CHECKOUT_PUBLIC_URL=`http://127.0.0.1:${server.address().port}`;
handler=createMockHttpHandler({db,env,authorization,sendMail:async message=>{
  if(realMail) await sendTestPasswordSetupMail(message,{env});
  delivered.push(message);
}});
console.log(`Local checkout: ${env.CHECKOUT_PUBLIC_URL}/checkout`);
const post=async(path,body,authorized=false)=>{
  const response=await fetch(`${env.CHECKOUT_PUBLIC_URL}${path}`,{method:"POST",headers:{origin:env.CHECKOUT_PUBLIC_URL,"content-type":"application/json",...(authorized?{authorization}:{})},body:JSON.stringify(body)});
  return {status:response.status,body:await response.json()};
};
try{
  assert.equal((await fetch(`${env.CHECKOUT_PUBLIC_URL}/checkout`)).status,200);
  const cases=[];
  for(const [plan,count] of [["start",4],["scale",8]]){
    const created=await post("/api/checkout/mock/orders",{packageSlug:plan,name:"Mock Test",email:env.CHECKOUT_TEST_EMAIL,domain:`${plan}.checkout-example.test`});
    assert.equal(created.status,201,JSON.stringify(created.body));
    const payment={id:created.body.id,status:"success",amountKurus:created.body.amountKurus};
    assert.equal((await post("/api/checkout/mock/payment",payment)).status,403);
    assert.equal((await post("/api/checkout/mock/payment",{...payment,amountKurus:1},true)).status,400);
    const result=await post("/api/checkout/mock/payment",payment,true);
    assert.equal(result.status,200,JSON.stringify(result.body));
    const replay=await post("/api/checkout/mock/payment",payment,true);
    assert.equal(replay.body.replay,true);
    const row=db.prepare("SELECT o.domain,o.duration_days,l.primary_domain,l.scopes_json,l.valid_until,l.customer_id FROM checkout_orders o JOIN commerce_license_installations l ON o.license_id=l.id WHERE o.id=?").get(payment.id);
    const rights=db.prepare("SELECT right_key,label,status FROM checkout_license_rights WHERE license_id=? ORDER BY right_key").all(result.body.licenseId);
    assert.equal(row.domain,`${plan}.checkout-example.test`);assert.equal(row.primary_domain,row.domain);assert.equal(rights.length,count);
    assert.ok(rights.every(x=>x.status==="active"));
    cases.push({plan,domain:row.domain,licenseDomain:row.primary_domain,durationDays:row.duration_days,rightCount:rights.length,rights: rights.map(x=>x.label),scopes:JSON.parse(row.scopes_json),replayNoDuplicates:true});
  }
  assert.equal(delivered.length,2);assert.ok(delivered.every(x=>x.to===env.CHECKOUT_TEST_EMAIL));
  const token=new URL(delivered[0].setupUrl).hash.slice(1);
  const password=`MockA9${randomBytes(18).toString("hex")}`;
  assert.equal((await post("/api/checkout/mock/password",{token,password})).status,200);
  assert.equal((await post("/api/checkout/mock/password",{token,password})).status,400);
  const customer=db.prepare("SELECT c.id,c.email,c.name,p.password_hash FROM customers c JOIN customer_portal_credentials p ON p.customer_id=c.id").get();
  assert.ok(await verifyCustomerPassword(password,customer.password_hash));
  const secret=randomBytes(32).toString("hex");
  const session=await createCustomerSessionToken(secret,{customerId:customer.id,email:customer.email,displayName:customer.name});
  assert.ok(await readCustomerSessionToken(secret,session));
  const report={mode:"isolated-mock-http",timestamp:new Date().toISOString(),paytrRequests:0,productionWrites:0,dbPath,cases,email:{transport:realMail?"real SMTP":"mock",accepted:delivered.length,allRecipientsMatchConfiguredTestEmail:true,recipientFingerprint:createHash("sha256").update(env.CHECKOUT_TEST_EMAIL).digest("hex").slice(0,12)},password:{singleUse:true,storedHashed:true,verificationPassed:true,sessionSigningPassed:true},note:"Test links consumed during verification. No Commerce store was contacted; activation means central license rights, not live provider synchronization."};
  writeFileSync(join(directory,"report.json"),JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));
  console.log(`Evidence: ${join(directory,"report.json")}`);
  if(!process.argv.includes("--keep")){server.close();db.close();}
}catch(error){console.error("Mock test failed:",error instanceof assert.AssertionError?error.message:"Check test configuration or database schema; details suppressed.");server.close();db.close();process.exitCode=1;}
