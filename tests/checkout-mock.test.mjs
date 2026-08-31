import test from "node:test";
import assert from "node:assert/strict";
import { initializeCheckoutTestDatabase } from "../scripts/checkout-test-database.mjs";
import { createMockOrder, completeMockPayment, deliverMockMail, setCheckoutPassword, checkoutDomain } from "../app/checkout-mock.mjs";
import { packageEntitlements } from "../app/checkout-entitlements.mjs";
const email="test@example.test";
const input=(plan="start",domain="store.example.test")=>({packageSlug:plan,domain,email,name:"Test User"});
test("exact independent commercial rights and manifest scope contracts",()=>{
  assert.deepEqual(packageEntitlements("start").groups.map(x=>x.key),["shipping","parasut","marketplaces","whatsapp"]);
  assert.deepEqual(packageEntitlements("scale").groups.map(x=>x.key),["builder","tofy","whatsapp","design","marketplaces","parasut","shipping","print"]);
  assert.ok(packageEntitlements("start").scopes.includes("addon.marketplace.hepsiburada"));
  assert.ok(!packageEntitlements("start").scopes.includes("addon.tofy"));
  assert.throws(()=>packageEntitlements("enterprise"));
});
test("strict domain, quote-only and test-recipient restrictions",()=>{
  const db=initializeCheckoutTestDatabase();
  try{
    for(const domain of ["localhost","https://example.com","x.com/path","x.com:443","x.com@evil.com","127.0.0.1"]) assert.throws(()=>checkoutDomain(domain));
    assert.equal(checkoutDomain("WWW.Example.COM"),"example.com");
    assert.throws(()=>createMockOrder(db,input("enterprise"),email));
    assert.throws(()=>createMockOrder(db,{...input(),email:"other@example.test"},email));
    createMockOrder(db,input(),email);
    assert.throws(()=>createMockOrder(db,input(),email));
  }finally{db.close();}
});
test("failed payment and tampered amount create no customer or license",async()=>{
  const db=initializeCheckoutTestDatabase();
  try{
    const order=createMockOrder(db,input(),email);
    await assert.rejects(completeMockPayment(db,{id:order.id,status:"success",amountKurus:1}));
    await completeMockPayment(db,{id:order.id,status:"failed",amountKurus:order.amountKurus});
    await assert.rejects(completeMockPayment(db,{id:order.id,status:"success",amountKurus:order.amountKurus}));
    assert.equal(db.prepare("SELECT count(*) n FROM customers").get().n,0);
    assert.equal(db.prepare("SELECT count(*) n FROM commerce_license_installations").get().n,0);
  }finally{db.close();}
});
test("transaction rolls back provisioning if any module grant fails",async()=>{
  const db=initializeCheckoutTestDatabase();
  try{
    const order=createMockOrder(db,input(),email);
    db.exec("CREATE TRIGGER test_failure BEFORE INSERT ON checkout_license_rights BEGIN SELECT RAISE(ABORT, 'test failure'); END;");
    await assert.rejects(completeMockPayment(db,{id:order.id,status:"success",amountKurus:order.amountKurus}));
    assert.equal(db.prepare("SELECT count(*) n FROM customers").get().n,0);
    assert.equal(db.prepare("SELECT count(*) n FROM commerce_license_installations").get().n,0);
    assert.equal(db.prepare("SELECT status FROM checkout_orders").get().status,"pending");
  }finally{db.close();}
});
test("price, duration and rights are snapshotted; SMTP failure retries without duplicate grants",async()=>{
  const db=initializeCheckoutTestDatabase();
  try{
    const order=createMockOrder(db,input(),email);
    db.exec("UPDATE packages SET price_amount_kurus=1,license_duration_days=1 WHERE slug='start'");
    const result=await completeMockPayment(db,{id:order.id,status:"success",amountKurus:order.amountKurus});
    const license=db.prepare("SELECT * FROM commerce_license_installations").get();
    assert.ok(new Date(license.valid_until)-Date.now()>29*86400000);
    await assert.rejects(deliverMockMail(db,order.id,{publicUrl:"http://localhost",send:async()=>{throw new Error("SMTP down");}}));
    assert.equal(db.prepare("SELECT count(*) n FROM checkout_setup_tokens").get().n,0);
    let sent=0;
    await deliverMockMail(db,order.id,{publicUrl:"http://localhost",send:async()=>{sent++;}});
    await deliverMockMail(db,order.id,{publicUrl:"http://localhost",send:async()=>{sent++;}});
    assert.equal(sent,1);assert.equal(db.prepare("SELECT count(*) n FROM checkout_license_rights WHERE license_id=?").get(result.licenseId).n,4);
  }finally{db.close();}
});
test("setup token expires, is one-use and cannot replace existing account password",async()=>{
  const db=initializeCheckoutTestDatabase();
  try{
    const order=createMockOrder(db,input(),email);
    await completeMockPayment(db,{id:order.id,status:"success",amountKurus:order.amountKurus});
    let link;
    const now=Date.now();
    await deliverMockMail(db,order.id,{now,publicUrl:"http://localhost",send:async message=>{link=message.setupUrl;}});
    const token=new URL(link).hash.slice(1);
    assert.notEqual(db.prepare("SELECT token_hash FROM checkout_setup_tokens").get().token_hash,token);
    await assert.rejects(setCheckoutPassword(db,token,"MockPassword123!",now+1800001));
    await setCheckoutPassword(db,token,"MockPassword123!",now+1000);
    await assert.rejects(setCheckoutPassword(db,token,"DifferentPassword123!",now+1001));
    const before=db.prepare("SELECT password_hash FROM customer_portal_credentials").get().password_hash;
    const second=createMockOrder(db,input("scale","second.example.test"),email);
    await completeMockPayment(db,{id:second.id,status:"success",amountKurus:second.amountKurus});
    await deliverMockMail(db,second.id,{publicUrl:"http://localhost",send:async m=>{assert.equal(m.setupUrl,null);assert.equal(m.existingAccount,true);}});
    assert.equal(db.prepare("SELECT password_hash FROM customer_portal_credentials").get().password_hash,before);
    assert.equal(db.prepare("SELECT count(*) n FROM customers").get().n,1);
  }finally{db.close();}
});
test("repeated webhook delivery for the same paid order is idempotent",async()=>{
  const db=initializeCheckoutTestDatabase();
  try{
    const order=createMockOrder(db,input(),email);
    const first=await completeMockPayment(db,{id:order.id,status:"success",amountKurus:order.amountKurus});
    const replay=await completeMockPayment(db,{id:order.id,status:"success",amountKurus:order.amountKurus});
    assert.equal(replay.status,"paid");
    assert.equal(replay.replay,true);
    assert.equal(replay.id,first.id);
    assert.equal(db.prepare("SELECT count(*) n FROM customers").get().n,1);
    assert.equal(db.prepare("SELECT count(*) n FROM commerce_license_installations").get().n,1);
    assert.equal(db.prepare("SELECT count(*) n FROM checkout_mail_jobs").get().n,1);
  }finally{db.close();}
});
