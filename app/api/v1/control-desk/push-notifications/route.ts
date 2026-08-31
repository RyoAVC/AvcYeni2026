import { and, desc, eq } from "drizzle-orm";
import { mobilePushDeliveries, mobilePushDevices } from "../../../../../db/schema";
import { logAdminAction } from "../../../../audit-log.mjs";
import { authorizeControlDesk, controlDeskJson, hasControlDeskRole } from "../../../../control-desk-auth.mjs";
import { ensureCommerceLicenseTables } from "../../../../local-d1-schema.mjs";
import { decryptPushToken } from "../../../../mobile-push-crypto.mjs";

export const dynamic="force-dynamic";
const clean=(value:unknown,max=180)=>String(value??"").trim().slice(0,max);

export async function GET(request:Request){
  const auth=await authorizeControlDesk(request);
  if(!auth.ok)return controlDeskJson({ok:false,error:auth.error},auth.status,request);
  const isStaff=hasControlDeskRole(auth,["platform_owner","support_operator","installer"]),isCustomer=Boolean(auth.customerId)&&hasControlDeskRole(auth,["customer_owner","customer_viewer"]);
  if(!isStaff&&!isCustomer)return controlDeskJson({ok:false,error:"Bildirim teslim kayıtlarını görüntüleme yetkiniz yok."},403,request);
  await ensureCommerceLicenseTables(auth.env);const {getDb}=await import("../../../../../db");const db=getDb();
  const deliveries=isStaff?await db.select().from(mobilePushDeliveries).orderBy(desc(mobilePushDeliveries.createdAt)).limit(200):await db.select().from(mobilePushDeliveries).where(eq(mobilePushDeliveries.customerId,Number(auth.customerId))).orderBy(desc(mobilePushDeliveries.createdAt)).limit(100);
  return controlDeskJson({ok:true,format:"avci-mobile.push-deliveries.v1",deliveries},200,request);
}

export async function POST(request:Request){
  const auth=await authorizeControlDesk(request);
  if(!auth.ok)return controlDeskJson({ok:false,error:auth.error},auth.status,request);
  if(!hasControlDeskRole(auth,["platform_owner"]))return controlDeskJson({ok:false,error:"Mobil bildirim gönderimi yalnız platform yöneticisine açıktır."},403,request);
  const body=await request.json().catch(()=>null) as Record<string,unknown>|null;
  const customerId=Number(body?.customerId||0),storeKey=clean(body?.storeKey,96),title=clean(body?.title,100),message=clean(body?.body,500),target=clean(body?.target,120)||"/notifications";
  if(!Number.isInteger(customerId)||customerId<1||!title||!message)return controlDeskJson({ok:false,error:"Müşteri, başlık ve bildirim metni gereklidir."},400,request);
  await ensureCommerceLicenseTables(auth.env);const {getDb}=await import("../../../../../db");const db=getDb();
  const scope=storeKey?and(eq(mobilePushDevices.customerId,customerId),eq(mobilePushDevices.storeKey,storeKey),eq(mobilePushDevices.permissionStatus,"granted"),eq(mobilePushDevices.revokedAt,"")):and(eq(mobilePushDevices.customerId,customerId),eq(mobilePushDevices.permissionStatus,"granted"),eq(mobilePushDevices.revokedAt,""));
  const devices=await db.select({id:mobilePushDevices.id,storeKey:mobilePushDevices.storeKey,tokenCiphertext:mobilePushDevices.tokenCiphertext,tokenNonce:mobilePushDevices.tokenNonce}).from(mobilePushDevices).where(scope).limit(500);
  if(body?.dryRun===true)return controlDeskJson({ok:true,dryRun:true,eligibleDevices:devices.length},200,request);
  if(!devices.length)return controlDeskJson({ok:false,error:"Bu kapsamda bildirim izni bulunan cihaz yok."},409,request);
  const secret=String(auth.env.MOBILE_PUSH_ENCRYPTION_KEY||"");
  if(secret.length<32)return controlDeskJson({ok:false,error:"Mobil bildirim kasası yapılandırılmamış."},503,request);
  const prepared=[] as Array<{deviceId:number;storeKey:string;payload:Record<string,unknown>}>;
  for(const device of devices){try{const token=await decryptPushToken(device.tokenCiphertext,device.tokenNonce,secret);prepared.push({deviceId:device.id,storeKey:device.storeKey,payload:{to:token,sound:"default",title,body:message,data:{target,storeKey:device.storeKey},priority:"high"}});}catch{/* Bozuk tek kayıt tüm gönderimi durdurmaz. */}}
  if(!prepared.length)return controlDeskJson({ok:false,error:"Cihaz tokenları güvenli kasadan çözülemedi."},503,request);
  const headers:Record<string,string>={"Content-Type":"application/json","Accept":"application/json","Accept-Encoding":"gzip, deflate"};
  if(auth.env.EXPO_ACCESS_TOKEN)headers.Authorization=`Bearer ${String(auth.env.EXPO_ACCESS_TOKEN)}`;
  const response=await fetch("https://exp.host/--/api/v2/push/send",{method:"POST",headers,body:JSON.stringify(prepared.map((item)=>item.payload))});
  const provider=await response.json().catch(()=>({data:[]})) as {data?:Array<{status?:string;id?:string;message?:string;details?:{error?:string}}>};
  const now=new Date().toISOString(),tickets=Array.isArray(provider.data)?provider.data:[];
  for(let index=0;index<prepared.length;index+=1){const item=prepared[index],ticket=tickets[index]||{},sent=response.ok&&ticket.status==="ok";await db.insert(mobilePushDeliveries).values({customerId,storeKey:item.storeKey,deviceId:item.deviceId,requestedBy:auth.email,title,status:sent?"accepted":"failed",providerTicketId:clean(ticket.id,180),errorCode:clean(ticket.details?.error||(!response.ok?`HTTP_${response.status}`:"UNKNOWN"),80),errorMessage:clean(ticket.message,300),createdAt:now,updatedAt:now});}
  await logAdminAction(db,{userEmail:auth.email,action:"mobile_push_notification_sent",entity:"customer",entityId:String(customerId),details:JSON.stringify({customerId,storeKey,requested:prepared.length,accepted:tickets.filter((item)=>item.status==="ok").length,target})});
  if(!response.ok)return controlDeskJson({ok:false,error:`Bildirim sağlayıcısı isteği reddetti (HTTP ${response.status}).`},502,request);
  return controlDeskJson({ok:true,requested:prepared.length,accepted:tickets.filter((item)=>item.status==="ok").length,failed:tickets.filter((item)=>item.status!=="ok").length},202,request);
}
