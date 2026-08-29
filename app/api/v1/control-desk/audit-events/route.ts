import { desc } from "drizzle-orm";
import { auditLogs } from "../../../../../db/schema";
import { authorizeControlDesk, controlDeskJson, hasControlDeskRole } from "../../../../control-desk-auth.mjs";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const auth = await authorizeControlDesk(request);
  if (!auth.ok) return controlDeskJson({ok:false,error:auth.error},auth.status,request);
  if (!hasControlDeskRole(auth,["platform_owner","support_operator"])) return controlDeskJson({ok:false,error:"Denetim kayıtlarını görüntüleme yetkiniz yok."},403,request);
  const { getDb } = await import("../../../../../db"); const db=getDb();
  const rows=await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt),desc(auditLogs.id)).limit(250);
  return controlDeskJson({ok:true,format:"avci-control-desk.audit.v1",events:rows.map((row)=>({id:row.id,actor:row.userEmail,action:row.action,entity:row.entity,entityId:row.entityId,details:row.details,ipAddress:row.ipAddress,createdAt:row.createdAt}))},200,request);
}
