import { and, eq } from "drizzle-orm";
import { commerceInstallJobEvents, commerceInstallJobs } from "../../../../../../db/schema";
import { logAdminAction } from "../../../../../audit-log.mjs";
import { authorizeControlDesk, controlDeskJson, hasControlDeskRole } from "../../../../../control-desk-auth.mjs";
import { ensureCommerceLicenseTables } from "../../../../../local-d1-schema.mjs";

function b64url(value:string){const padded=value.replace(/-/g,"+").replace(/_/g,"/")+"===".slice((value.length+3)%4);return Uint8Array.from(atob(padded),char=>char.charCodeAt(0));}
async function verifyManifest(env:Record<string,unknown>,manifest:Record<string,string>,signature:string){
  const encoded=String(env.AVCI_RELEASE_PUBLIC_KEY||"").trim();if(!encoded)return false;
  try{const key=await crypto.subtle.importKey("raw",b64url(encoded),{name:"Ed25519"},false,["verify"]);const payload=new TextEncoder().encode(JSON.stringify(manifest));return crypto.subtle.verify({name:"Ed25519"},key,b64url(signature),payload);}catch{return false;}
}
async function verifyReleaseToken(env:Record<string,unknown>,token:string){
  const parts=token.trim().split(".");if(parts.length!==2)return null;
  const encoded=String(env.AVCI_RELEASE_PUBLIC_KEY||"").trim();if(!encoded)return null;
  try{
    const key=await crypto.subtle.importKey("raw",b64url(encoded),{name:"Ed25519"},false,["verify"]);
    if(!await crypto.subtle.verify({name:"Ed25519"},key,b64url(parts[1]),new TextEncoder().encode(parts[0])))return null;
    const data=JSON.parse(new TextDecoder().decode(b64url(parts[0]))) as Record<string,unknown>;
    const url=String(data.artifact_url||"");
    if(!/^https:\/\/[a-z0-9.-]+\.avcieticaret\.com\//i.test(url)
      ||!/^[a-f0-9]{64}$/.test(String(data.artifact_sha256||"")))return null;
    return data;
  }catch{return null;}
}

export async function POST(request: Request) {
  const auth=await authorizeControlDesk(request);if(!auth.ok)return controlDeskJson({ok:false,error:auth.error},auth.status,request);
  if(!hasControlDeskRole(auth,["platform_owner","installer"]))return controlDeskJson({ok:false,error:"Sürüm atama yetkiniz yok."},403,request);
  const body=await request.json().catch(()=>null) as Record<string,unknown>|null;if(!body)return controlDeskJson({ok:false,error:"Geçersiz istek."},400,request);
  const jobId=String(body.jobId||""),deploymentId=String(body.deploymentId||""),version=String(body.version||""),treeSha256=String(body.treeSha256||""),signature=String(body.signature||""),signedReleaseManifest=String(body.signedReleaseManifest||"");
  if(!/^install-[0-9a-f-]{36}$/.test(jobId)||!/^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$/.test(deploymentId)||!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)||!/^[a-f0-9]{64}$/.test(treeSha256)||signature.length<40||signedReleaseManifest.length<80)return controlDeskJson({ok:false,error:"İmzalı sürüm manifesti eksik veya geçersiz."},400,request);
  const signedManifest={format:"avci-commerce.release-assignment.v1",deployment_id:deploymentId,expected_status:"staged",version,tree_sha256:treeSha256};
  if(!await verifyManifest(auth.env,signedManifest,signature))return controlDeskJson({ok:false,error:"Sürüm imzası doğrulanamadı."},403,request);
  const release=await verifyReleaseToken(auth.env,signedReleaseManifest);
  if(!release||String(release.version||"")!==version)return controlDeskJson({ok:false,error:"Artifact manifesti doğrulanamadı."},403,request);
  await ensureCommerceLicenseTables(auth.env);const {getDb}=await import("../../../../../../db");const db=getDb();const [job]=await db.select().from(commerceInstallJobs).where(and(eq(commerceInstallJobs.jobId,jobId),eq(commerceInstallJobs.status,"ready"),eq(commerceInstallJobs.currentStep,"awaiting_release"))).limit(1);
  if(!job)return controlDeskJson({ok:false,error:"Sürüm bekleyen kurulum işi bulunamadı."},409,request);
  const artifact={...signedManifest,signature,artifact_url:String(release.artifact_url),artifact_sha256:String(release.artifact_sha256),signed_release_manifest:signedReleaseManifest};const now=new Date().toISOString();
  await db.update(commerceInstallJobs).set({currentStep:"release_assigned",artifactJson:JSON.stringify(artifact),updatedAt:now}).where(eq(commerceInstallJobs.id,job.id));
  await db.insert(commerceInstallJobEvents).values({jobId,status:"ready",step:"release_assigned",safeCode:"signed_release_assigned",createdAt:now});
  await logAdminAction(db,{userEmail:auth.email,action:"control_desk_release_assigned",entity:"commerce_install_job",entityId:jobId,details:JSON.stringify({deploymentId,version,treeSha256})});
  return controlDeskJson({ok:true,format:"avci-control-desk.release-assigned.v1",jobId,status:"ready",step:"release_assigned"},200,request);
}
