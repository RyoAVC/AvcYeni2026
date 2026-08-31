import { and, desc, eq, inArray } from "drizzle-orm";
import { commerceLicenseInstallations, mobilePushDevices } from "../../../../../db/schema";
import { logAdminAction } from "../../../../audit-log.mjs";
import { authorizeControlDesk, controlDeskJson, hasControlDeskRole } from "../../../../control-desk-auth.mjs";
import { ensureCommerceLicenseTables } from "../../../../local-d1-schema.mjs";
import { encryptPushToken, hashPushToken } from "../../../../mobile-push-crypto.mjs";

export const dynamic="force-dynamic";
const clean=(value:unknown,max=180)=>String(value??"").trim().slice(0,max);
const validDeviceId=(value:string)=>/^[a-zA-Z0-9][a-zA-Z0-9._:-]{15,127}$/u.test(value);
const validExpoToken=(value:string)=>/^(?:Exponent|Expo)PushToken\[[A-Za-z0-9_-]{8,200}\]$/u.test(value);

export async function GET(request:Request){
  const auth=await authorizeControlDesk(request);
  if(!auth.ok)return controlDeskJson({ok:false,error:auth.error},auth.status,request);
  const isStaff=hasControlDeskRole(auth,["platform_owner","support_operator","installer"]),isCustomer=Boolean(auth.customerId)&&hasControlDeskRole(auth,["customer_owner","customer_viewer"]);
  if(!isStaff&&!isCustomer)return controlDeskJson({ok:false,error:"Mobil cihaz kayıtlarını görüntüleme yetkiniz yok."},403,request);
  await ensureCommerceLicenseTables(auth.env);
  const {getDb}=await import("../../../../../db");const db=getDb();
  const projection={id:mobilePushDevices.id,customerId:mobilePushDevices.customerId,storeKey:mobilePushDevices.storeKey,deviceInstallationId:mobilePushDevices.deviceInstallationId,platform:mobilePushDevices.platform,provider:mobilePushDevices.provider,appVersion:mobilePushDevices.appVersion,permissionStatus:mobilePushDevices.permissionStatus,lastSeenAt:mobilePushDevices.lastSeenAt,revokedAt:mobilePushDevices.revokedAt,createdAt:mobilePushDevices.createdAt,updatedAt:mobilePushDevices.updatedAt};
  const rows=isStaff
    ?await db.select(projection).from(mobilePushDevices).orderBy(desc(mobilePushDevices.updatedAt)).limit(500)
    :await db.select(projection).from(mobilePushDevices).where(eq(mobilePushDevices.customerId,Number(auth.customerId))).orderBy(desc(mobilePushDevices.updatedAt)).limit(50);
  return controlDeskJson({ok:true,format:"avci-mobile.push-devices.v1",devices:rows},200,request);
}

export async function POST(request:Request){
  const auth=await authorizeControlDesk(request);
  if(!auth.ok)return controlDeskJson({ok:false,error:auth.error},auth.status,request);
  if(!auth.customerId||!auth.sessionId||!hasControlDeskRole(auth,["customer_owner","customer_viewer"]))return controlDeskJson({ok:false,error:"Mobil cihaz kaydı için müşteri oturumu gereklidir."},403,request);
  const body=await request.json().catch(()=>null) as Record<string,unknown>|null;
  if(!body)return controlDeskJson({ok:false,error:"Geçersiz istek."},400,request);
  const action=clean(body.action,20)||"register",deviceInstallationId=clean(body.deviceInstallationId,128),storeKey=clean(body.storeKey,96);
  if(!validDeviceId(deviceInstallationId))return controlDeskJson({ok:false,error:"Geçerli cihaz kurulum kimliği gereklidir."},400,request);
  await ensureCommerceLicenseTables(auth.env);const {getDb}=await import("../../../../../db");const db=getDb(),customerId=Number(auth.customerId),now=new Date().toISOString();
  if(action==="revoke"){
    const changed=await db.update(mobilePushDevices).set({revokedAt:now,permissionStatus:"revoked",updatedAt:now}).where(and(eq(mobilePushDevices.customerId,customerId),eq(mobilePushDevices.deviceInstallationId,deviceInstallationId),eq(mobilePushDevices.sessionId,String(auth.sessionId)))).returning({id:mobilePushDevices.id});
    if(!changed.length)return controlDeskJson({ok:false,error:"Bu oturuma ait cihaz kaydı bulunamadı."},404,request);
    await logAdminAction(db,{userEmail:auth.email,action:"mobile_push_device_revoked",entity:"mobile_push_device",entityId:String(changed[0].id),details:JSON.stringify({customerId,storeKey})});
    return controlDeskJson({ok:true,revoked:true},200,request);
  }
  if(action!=="register")return controlDeskJson({ok:false,error:"Desteklenmeyen cihaz işlemi."},400,request);
  const platform=clean(body.platform,12),token=clean(body.token,260),appVersion=clean(body.appVersion,40);
  if(!["ios","android"].includes(platform)||!validExpoToken(token)||!storeKey)return controlDeskJson({ok:false,error:"Platform, mağaza ve geçerli Expo push token gereklidir."},400,request);
  const [license]=await db.select({id:commerceLicenseInstallations.id}).from(commerceLicenseInstallations).where(and(eq(commerceLicenseInstallations.customerId,customerId),eq(commerceLicenseInstallations.storeKey,storeKey),inArray(commerceLicenseInstallations.status,["active","trial"]))).limit(1);
  if(!license)return controlDeskJson({ok:false,error:"Seçilen mağaza bu müşteriye ait aktif bir lisansla doğrulanamadı."},403,request);
  const tokenHash=await hashPushToken(token),existingToken=await db.select({id:mobilePushDevices.id,customerId:mobilePushDevices.customerId,deviceInstallationId:mobilePushDevices.deviceInstallationId}).from(mobilePushDevices).where(eq(mobilePushDevices.tokenHash,tokenHash)).limit(1);
  if(existingToken[0]&&(existingToken[0].customerId!==customerId||existingToken[0].deviceInstallationId!==deviceInstallationId))return controlDeskJson({ok:false,error:"Bu cihaz tokenı başka bir kurulumla eşleşiyor."},409,request);
  let encrypted;try{encrypted=await encryptPushToken(token,String(auth.env.MOBILE_PUSH_ENCRYPTION_KEY||""));}catch{return controlDeskJson({ok:false,error:"Mobil bildirim kasası yapılandırılmamış."},503,request);}
  const existing=await db.select({id:mobilePushDevices.id}).from(mobilePushDevices).where(and(eq(mobilePushDevices.customerId,customerId),eq(mobilePushDevices.deviceInstallationId,deviceInstallationId))).limit(1);
  const values={sessionId:String(auth.sessionId),storeKey,platform,provider:"expo",tokenHash,tokenCiphertext:encrypted.ciphertext,tokenNonce:encrypted.nonce,appVersion,permissionStatus:"granted",lastSeenAt:now,revokedAt:"",updatedAt:now};
  const id=existing[0]?.id?(await db.update(mobilePushDevices).set(values).where(eq(mobilePushDevices.id,existing[0].id)).returning({id:mobilePushDevices.id}))[0]?.id:(await db.insert(mobilePushDevices).values({customerId,deviceInstallationId,...values,createdAt:now}).returning({id:mobilePushDevices.id}))[0]?.id;
  await logAdminAction(db,{userEmail:auth.email,action:"mobile_push_device_registered",entity:"mobile_push_device",entityId:String(id||""),details:JSON.stringify({customerId,storeKey,platform,appVersion})});
  return controlDeskJson({ok:true,id,registered:true},existing[0]?200:201,request);
}
