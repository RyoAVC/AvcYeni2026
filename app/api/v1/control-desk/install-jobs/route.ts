import { and, eq, inArray } from "drizzle-orm";
import { commerceLicenseInstallations } from "../../../../../db/schema";
import { authorizeControlDesk, controlDeskJson, hasControlDeskRole } from "../../../../control-desk-auth.mjs";
import { logAdminAction } from "../../../../audit-log.mjs";
import { normalizeCommerceDomain } from "../../../../commerce-license-control-plane.mjs";
import { createInstallJob } from "../../../../commerce-install-job.mjs";
import { ensureCommerceLicenseTables } from "../../../../local-d1-schema.mjs";

export const dynamic = "force-dynamic";

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
    let jobId: string, enrollmentToken: string, expiresAt: string;
    try {
      ({ jobId, enrollmentToken, expiresAt } = await createInstallJob(db, { ...license, primaryDomain: domain }, environment));
    } catch (jobCause) {
      return controlDeskJson({ ok: false, error: jobCause instanceof Error ? jobCause.message : "Kurulum işi oluşturulamadı." }, 409);
    }
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
