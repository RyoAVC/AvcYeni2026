import { and, eq, inArray } from "drizzle-orm";
import { commerceLicenseInstallations } from "../../../../../db/schema";
import { base64Url, issueCommerceLicense, normalizeCommerceDomain, validCommerceIdentifier } from "../../../../commerce-license-control-plane.mjs";
import { authorizeControlDesk, controlDeskJson, hasControlDeskRole } from "../../../../control-desk-auth.mjs";
import { ensureCommerceLicenseTables } from "../../../../local-d1-schema.mjs";

export const dynamic="force-dynamic";

export async function POST(request:Request){
  const auth=await authorizeControlDesk(request);
  if(!auth.ok)return controlDeskJson({ok:false,error:auth.error},auth.status,request);
  if(!auth.customerId||!hasControlDeskRole(auth,["customer_owner","customer_viewer"]))return controlDeskJson({ok:false,error:"Mobil mağaza oturumu için müşteri hesabı gereklidir."},403,request);
  const body=await request.json().catch(()=>null) as Record<string,unknown>|null,storeKey=String(body?.storeKey??"").trim();
  if(!validCommerceIdentifier(storeKey))return controlDeskJson({ok:false,error:"Geçerli mağaza anahtarı gereklidir."},400,request);
  await ensureCommerceLicenseTables(auth.env);const {getDb}=await import("../../../../../db");const db=getDb();
  const [installation]=await db.select({installationId:commerceLicenseInstallations.installationId,primaryDomain:commerceLicenseInstallations.primaryDomain,status:commerceLicenseInstallations.status,validUntil:commerceLicenseInstallations.validUntil}).from(commerceLicenseInstallations).where(and(eq(commerceLicenseInstallations.customerId,Number(auth.customerId)),eq(commerceLicenseInstallations.storeKey,storeKey),inArray(commerceLicenseInstallations.status,["active","trial"]))).limit(1);
  const domain=normalizeCommerceDomain(installation?.primaryDomain);
  if(!installation||!domain||new Date(installation.validUntil).getTime()<=Date.now())return controlDeskJson({ok:false,error:"Mağaza için geçerli Commerce lisansı bulunamadı."},403,request);
  const privateKey=String(auth.env.COMMERCE_LICENSE_PRIVATE_KEY_PKCS8||"").trim(),keyId=String(auth.env.COMMERCE_LICENSE_KEY_ID||"avci-commerce-ed25519-v1").trim().slice(0,80);
  if(!privateKey)return controlDeskJson({ok:false,error:"Mobil mağaza oturum imzalayıcısı yapılandırılmamış."},503,request);
  const now=Math.floor(Date.now()/1000),expiresAt=now+120,roles=(auth.roles||[]).filter((role)=>["customer_owner","customer_viewer"].includes(role));
  const session=await issueCommerceLicense({format:"avci-commerce.mobile-store-session.v1",iss:"avci-control-plane",aud:"avci-commerce-mobile",key_id:keyId,jti:base64Url(crypto.getRandomValues(new Uint8Array(18))),customer_id:Number(auth.customerId),store_key:storeKey,installation_id:installation.installationId,roles,scope:["orders.read","dashboard.read"],iat:now,exp:expiresAt},privateKey);
  return controlDeskJson({ok:true,format:"avci-commerce.mobile-store-session.v1",commerceOrigin:`https://${domain}`,sessionToken:session,expiresAt:new Date(expiresAt*1000).toISOString()},201,request);
}
