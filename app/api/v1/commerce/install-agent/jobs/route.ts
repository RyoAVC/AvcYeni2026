import { and, eq } from "drizzle-orm";
import { commerceInstallJobEvents, commerceInstallJobs } from "../../../../../../db/schema";
import { sha256, signActivationResponse } from "../../../../../commerce-license-control-plane.mjs";
import { ensureCommerceLicenseTables } from "../../../../../local-d1-schema.mjs";
import { readRuntimeEnv } from "../../../../../runtime-env.mjs";

export const dynamic = "force-dynamic";
const respond = async (body: Record<string, unknown>, status: number, token = "") => {
  const raw = JSON.stringify(body);
  const headers: Record<string, string> = { "Cache-Control": "no-store", "Content-Type": "application/json; charset=utf-8" };
  if (token) headers["X-Avci-Agent-Signature"] = await signActivationResponse(raw, token);
  return new Response(raw, { status, headers });
};
const validAgent = (value: unknown) => /^[A-Za-z0-9][A-Za-z0-9._:-]{5,95}$/.test(String(value ?? ""));
function randomToken(prefix: string) { const value=new Uint8Array(32);crypto.getRandomValues(value);return prefix+btoa(String.fromCharCode(...value)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,""); }

export async function POST(request: Request) {
  if (!(request.headers.get("content-type") ?? "").includes("application/json")) return respond({ ok: false, code: "content_type_required" }, 415);
  const token = String(request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  if ((!token.startsWith("aci_enroll_") && !token.startsWith("aci_agent_")) || token.length > 160) return respond({ ok: false, code: "agent_unauthorized" }, 401);
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return respond({ ok: false, code: "invalid_json" }, 400); }
  const action = String(body.action ?? "claim");
  const agentId = String(body.agent_id ?? "").trim();
  const agentVersion = String(body.agent_version ?? "").trim().slice(0, 40);
  if (!validAgent(agentId)) return respond({ ok: false, code: "invalid_agent" }, 400, token);
  try {
    const env = await readRuntimeEnv();
    await ensureCommerceLicenseTables(env);
    const { getDb } = await import("../../../../../../db");
    const db = getDb();
    const tokenHash=await sha256(token);
    const [job] = token.startsWith("aci_enroll_")
      ? await db.select().from(commerceInstallJobs).where(eq(commerceInstallJobs.enrollmentTokenHash, tokenHash)).limit(1)
      : await db.select().from(commerceInstallJobs).where(eq(commerceInstallJobs.agentTokenHash, tokenHash)).limit(1);
    if (!job) return respond({ ok: false, code: "agent_session_invalid" }, 403, token);
    if (token.startsWith("aci_enroll_") && new Date(job.enrollmentExpiresAt) <= new Date()) return respond({ ok: false, code: "enrollment_expired" }, 403, token);
    if (token.startsWith("aci_agent_") && (!job.agentTokenExpiresAt || new Date(job.agentTokenExpiresAt) <= new Date())) return respond({ ok:false,code:"agent_session_expired" },403,token);
    const now = new Date().toISOString();
    if (action === "claim") {
      if (job.agentId && job.agentId !== agentId) return respond({ ok: false, code: "job_already_claimed" }, 409, token);
      if (!["queued", "running"].includes(job.status)) return respond({ ok: false, code: "job_not_claimable" }, 409, token);
      const agentToken=randomToken("aci_agent_");
      await db.update(commerceInstallJobs).set({ status: "running", currentStep: "preflight", agentId, agentVersion, agentTokenHash:await sha256(agentToken), agentTokenExpiresAt:new Date(Date.now()+30*86400_000).toISOString(), claimedAt: job.claimedAt || now, updatedAt: now }).where(and(eq(commerceInstallJobs.id, job.id), eq(commerceInstallJobs.enrollmentTokenHash, job.enrollmentTokenHash)));
      await db.insert(commerceInstallJobEvents).values({ jobId: job.jobId, status: "running", step: "preflight", safeCode: "agent_claimed", createdAt: now });
      return respond({ ok: true, format: "avci-commerce.install-task.v1", job_id: job.jobId, agent_token:agentToken, task: { action: "preflight", domain: job.targetDomain, environment: job.environment, required_php: "8.2.0", required_extensions: ["pdo", "json", "openssl"], minimum_free_mb: 512 } }, 200, token);
    }
    if (action === "poll") {
      if (job.agentId !== agentId) return respond({ok:false,code:"job_not_owned"},409,token);
      if (job.status === "ready" && job.currentStep === "release_assigned") {
        let artifact:Record<string,unknown>={};try{artifact=JSON.parse(job.artifactJson||"{}");}catch{}
        return respond({ok:true,format:"avci-commerce.install-task.v1",job_id:job.jobId,task:{action:"execute_deployment",deployment_id:String(artifact.deployment_id||""),expected_status:String(artifact.expected_status||"staged")}},200,token);
      }
      return respond({ok:true,format:"avci-commerce.install-task.v1",job_id:job.jobId,task:{action:"wait",retry_after:15},status:job.status,step:job.currentStep},200,token);
    }
    if (action === "report") {
      const reportedStep=String(body.step||"preflight");
      const acceptableStatus=reportedStep==="deployment"?(job.status==="ready"&&job.currentStep==="release_assigned"):job.status==="running";
      if (job.agentId !== agentId || !acceptableStatus) return respond({ ok: false, code: "job_not_owned" }, 409, token);
      const result = body.result && typeof body.result === "object" ? body.result as Record<string, unknown> : {};
      const passed = result.passed === true;
      const safeCode = String(result.code ?? (passed ? "preflight_ok" : "preflight_failed")).replace(/[^a-z0-9_.-]/gi, "_").slice(0, 80);
      const status = passed ? (reportedStep==="deployment"?"complete":"ready") : "failed";
      const step = passed ? (reportedStep==="deployment"?"complete":"awaiting_release") : reportedStep;
      await db.update(commerceInstallJobs).set({ status, currentStep: step, safeSummary: safeCode, completedAt: passed ? "" : now, updatedAt: now }).where(and(eq(commerceInstallJobs.id, job.id), eq(commerceInstallJobs.agentId, agentId)));
      await db.insert(commerceInstallJobEvents).values({ jobId: job.jobId, status, step, safeCode, createdAt: now });
      return respond({ ok: true, format: "avci-commerce.install-report.v1", job_id: job.jobId, status, next: passed ? "signed_release_assignment" : "manual_review" }, 200, token);
    }
    return respond({ ok: false, code: "unsupported_action" }, 400, token);
  } catch (cause) {
    console.error("Commerce install agent job failed", cause);
    return respond({ ok: false, code: "agent_service_unavailable" }, 503, token);
  }
}
