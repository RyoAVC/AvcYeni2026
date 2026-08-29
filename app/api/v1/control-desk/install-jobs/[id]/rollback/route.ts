import { eq } from "drizzle-orm";
import { commerceInstallJobEvents, commerceInstallJobs } from "../../../../../../../db/schema";
import { logAdminAction } from "../../../../../../audit-log.mjs";
import { authorizeControlDesk, controlDeskJson, hasControlDeskRole } from "../../../../../../control-desk-auth.mjs";
import { ensureCommerceLicenseTables } from "../../../../../../local-d1-schema.mjs";

export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
  const auth=await authorizeControlDesk(request);if(!auth.ok)return controlDeskJson({ok:false,error:auth.error},auth.status,request);if(!hasControlDeskRole(auth,["platform_owner","installer"]))return controlDeskJson({ok:false,error:"Geri alma yetkiniz yok."},403,request);
  const jobId=(await params).id;const body=await request.json().catch(()=>({})) as Record<string,unknown>;const expectedStatus=String(body.expectedStatus||"healthcheck_failed");if(!/^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$/.test(jobId)||!/^[a-z_]{3,40}$/.test(expectedStatus))return controlDeskJson({ok:false,error:"Geçersiz geri alma isteği."},400,request);
  await ensureCommerceLicenseTables(auth.env);const {getDb}=await import("../../../../../../../db");const db=getDb();const [job]=await db.select().from(commerceInstallJobs).where(eq(commerceInstallJobs.jobId,jobId)).limit(1);if(!job)return controlDeskJson({ok:false,error:"Kurulum işi bulunamadı."},404,request);
  let artifact:Record<string,unknown>={};try{artifact=JSON.parse(job.artifactJson||"{}");}catch{}if(!artifact.deployment_id)return controlDeskJson({ok:false,error:"Geri alınabilecek deployment kaydı yok."},409,request);
  artifact.expected_status=expectedStatus;artifact.rollback_requested=true;const now=new Date().toISOString();await db.update(commerceInstallJobs).set({status:"ready",currentStep:"release_assigned",artifactJson:JSON.stringify(artifact),completedAt:"",updatedAt:now}).where(eq(commerceInstallJobs.id,job.id));await db.insert(commerceInstallJobEvents).values({jobId,status:"ready",step:"rollback",safeCode:"rollback_requested",createdAt:now});await logAdminAction(db,{userEmail:auth.email,action:"control_desk_rollback_requested",entity:"commerce_install_job",entityId:jobId,details:JSON.stringify({expectedStatus})});return controlDeskJson({ok:true,jobId,status:"ready",step:"rollback"},202,request);
}
