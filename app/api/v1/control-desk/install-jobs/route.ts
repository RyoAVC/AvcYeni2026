import { and, eq, inArray } from "drizzle-orm";
import { commerceInstallJobEvents, commerceInstallJobs, commerceLicenseInstallations } from "../../../../../db/schema";
import { authorizeControlDesk, controlDeskJson, hasControlDeskRole } from "../../../../control-desk-auth.mjs";
import { logAdminAction } from "../../../../audit-log.mjs";
import { normalizeCommerceDomain, sha256 } from "../../../../commerce-license-control-plane.mjs";
import { ensureCommerceLicenseTables } from "../../../../local-d1-schema.mjs";

export const dynamic = "force-dynamic";

function randomToken(prefix: string, bytes = 30) {
  const value = new Uint8Array(bytes);
  crypto.getRandomValues(value);
  const encoded = btoa(String.fromCharCode(...value)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  return `${prefix}${encoded}`;
}

export async function POST(request: Request) {
  const auth = await authorizeControlDesk(request);
  if (!auth.ok) return controlDeskJson({ ok: false, error: auth.error }, auth.status);
  if (!hasControlDeskRole(auth,["platform_owner","installer","customer_owner"])) return controlDeskJson({ ok:false,error:"Kurulum başlatma yetkiniz yok." },403,request);
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return controlDeskJson({ ok: false, error: "Geçersiz istek." }, 400); }
  const licenseId = Number(body.licenseId);
  const domain = normalizeCommerceDomain(body.domain);
  const environment = body.environment === "staging" ? "staging" : "production";
  if (!Number.isSafeInteger(licenseId) || licenseId < 1 || !domain) return controlDeskJson({ ok: false, error: "Lisans ve geçerli hedef domain gerekli." }, 400);
  try {
    await ensureCommerceLicenseTables(auth.env);
    const { getDb } = await import("../../../../../db");
    const db = getDb();
    const [license] = await db.select().from(commerceLicenseInstallations).where(and(eq(commerceLicenseInstallations.id, licenseId), inArray(commerceLicenseInstallations.status, ["active", "trial"]))).limit(1);
    if (!license || normalizeCommerceDomain(license.primaryDomain) !== domain) return controlDeskJson({ ok: false, error: "Lisans hedef domain ile eşleşmiyor." }, 403);
    if (Number(auth.customerId||0) > 0 && license.customerId !== Number(auth.customerId)) return controlDeskJson({ ok:false,error:"Bu lisans başka bir müşteriye aittir." },403,request);
    const now = new Date();
    const activeRows = await db.select({ id: commerceInstallJobs.id, jobId: commerceInstallJobs.jobId, status: commerceInstallJobs.status, currentStep: commerceInstallJobs.currentStep, enrollmentExpiresAt: commerceInstallJobs.enrollmentExpiresAt }).from(commerceInstallJobs).where(and(eq(commerceInstallJobs.licenseId, licenseId), inArray(commerceInstallJobs.status, ["queued", "running", "ready"]))).limit(20);
    for (const job of activeRows) {
      const expiredEnrollment = job.status === "queued" && job.currentStep === "enrollment" && Date.parse(job.enrollmentExpiresAt) <= now.getTime();
      if (!expiredEnrollment) continue;
      await db.update(commerceInstallJobs).set({ status:"failed", currentStep:"enrollment_expired", updatedAt:now.toISOString() }).where(eq(commerceInstallJobs.id, job.id));
      await db.insert(commerceInstallJobEvents).values({ jobId:job.jobId, status:"failed", step:"enrollment_expired", safeCode:"enrollment_expired", createdAt:now.toISOString() });
    }
    const blocking = activeRows.some((job) => !(job.status === "queued" && job.currentStep === "enrollment" && Date.parse(job.enrollmentExpiresAt) <= now.getTime()));
    if (blocking) return controlDeskJson({ ok: false, error: "Bu kurulum için zaten açık bir iş var." }, 409);
    const enrollmentToken = randomToken("aci_enroll_");
    const jobId = `install-${crypto.randomUUID()}`;
    const expiresAt = new Date(now.getTime() + 30 * 60 * 1000).toISOString();
    await db.insert(commerceInstallJobs).values({
      jobId, licenseId, customerId: license.customerId, storeKey: license.storeKey,
      installationId: license.installationId, targetDomain: domain, environment,
      status: "queued", currentStep: "enrollment", enrollmentTokenHash: await sha256(enrollmentToken),
      enrollmentExpiresAt: expiresAt, createdAt: now.toISOString(), updatedAt: now.toISOString(),
    });
    await db.insert(commerceInstallJobEvents).values({ jobId, status: "queued", step: "enrollment", safeCode: "job_created", createdAt: now.toISOString() });
    await logAdminAction(db,{ userEmail:auth.email,action:"control_desk_install_created",entity:"commerce_install_job",entityId:jobId,details:JSON.stringify({ licenseId,customerId:license.customerId,domain,environment }) });
    const requestUrl = new URL(request.url);
    const apiMarker = "/api/v1/";
    const markerIndex = requestUrl.pathname.indexOf(apiMarker);
    const basePath = markerIndex >= 0 ? requestUrl.pathname.slice(0, markerIndex).replace(/\/$/, "") : "";
    const center = `${requestUrl.origin}${basePath}`;
    return controlDeskJson({
      ok: true, format: "avci-commerce.install-enrollment.v1", jobId, enrollmentToken, expiresAt,
      agentEndpoint: `${center}/api/v1/commerce/install-agent/jobs`,
      bootstrapCommand: `php avci-install-agent.php --endpoint=${center}/api/v1/commerce/install-agent/jobs --token=${enrollmentToken}`,
    }, 201);
  } catch (cause) {
    console.error("Control Desk install job create failed", cause);
    return controlDeskJson({ ok: false, error: "Kurulum işi oluşturulamadı." }, 503);
  }
}
