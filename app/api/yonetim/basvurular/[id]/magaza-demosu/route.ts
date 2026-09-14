import { and, eq, inArray } from "drizzle-orm";
import { commerceLicenseInstallations, customers, leads } from "../../../../../../db/schema";
import { getAdminUser } from "../../../../../admin-auth";
import { logAdminAction } from "../../../../../audit-log.mjs";
import { validateAdminMutationRequest } from "../../../../../admin-request.mjs";
import { createActivationToken, sha256 } from "../../../../../commerce-license-control-plane.mjs";
import { createInstallJob } from "../../../../../commerce-install-job.mjs";
import { normalizeEmailAddress } from "../../../../../email-normalization.mjs";
import { getPlatformDomainConfig } from "../../../../../platform-domain-config.mjs";
import { readRuntimeEnv } from "../../../../../runtime-env.mjs";

const TRIAL_DAYS = 7;

function json(body: Record<string, unknown>, status: number) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

function slugify(value: string): string {
  return String(value || "")
    .toLowerCase()
    .replaceAll("ğ", "g").replaceAll("ü", "u").replaceAll("ş", "s")
    .replaceAll("ı", "i").replaceAll("ö", "o").replaceAll("ç", "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await getAdminUser();
  if (!admin.user) return json({ ok: false, error: "Oturum açmanız gerekiyor." }, 401);
  if (!admin.authorized) return json({ ok: false, error: "Bu işlem için yetkiniz yok." }, 403);

  const requestFailure = validateAdminMutationRequest(request);
  if (requestFailure) return json({ ok: false, error: requestFailure.error }, requestFailure.status);

  const { id: idParam } = await context.params;
  const leadId = Number(idParam);
  if (!Number.isSafeInteger(leadId) || leadId < 1) return json({ ok: false, error: "Geçersiz başvuru numarası." }, 400);

  try {
    const env = await readRuntimeEnv();
    const { getDb } = await import("../../../../../../db");
    const db = getDb();

    const [lead] = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
    if (!lead) return json({ ok: false, error: "Başvuru bulunamadı." }, 404);

    const email = normalizeEmailAddress(lead.email, 180);
    const [customer] = email ? await db.select().from(customers).where(eq(customers.email, email)).limit(1) : [];
    if (!customer) {
      return json({ ok: false, error: "Önce bu başvuru için demo erişimi (müşteri kaydı) oluşturun." }, 409);
    }

    const [existingLicense] = await db
      .select()
      .from(commerceLicenseInstallations)
      .where(and(eq(commerceLicenseInstallations.customerId, customer.id), inArray(commerceLicenseInstallations.status, ["trial", "active"])))
      .limit(1);

    const now = Date.now();
    const nowIso = new Date(now).toISOString();
    const primaryDomain = `demo-${leadId}.avcieticaret.com`;
    let license = existingLicense;
    let activationToken = "";

    if (!license) {
      const slug = slugify(customer.company || customer.name) || `musteri-${customer.id}`;
      const storeKey = `${slug}-demo-${leadId}`.slice(0, 90);
      const installationId = `${storeKey}-install-001`.slice(0, 90);
      activationToken = createActivationToken();
      const validUntil = new Date(now + TRIAL_DAYS * 24 * 60 * 60 * 1000).toISOString();
      const inserted = await db.insert(commerceLicenseInstallations).values({
        customerId: customer.id,
        storeKey,
        installationId,
        primaryDomain,
        plan: "start",
        activationTokenHash: await sha256(activationToken),
        status: "trial",
        validUntil,
        billingCycle: "annual",
        paymentStatus: "pending",
        createdAt: nowIso,
        updatedAt: nowIso,
      }).returning();
      license = inserted[0];
    }
    if (!license) throw new Error("License insert did not return a row.");

    let jobResult: { jobId: string; enrollmentToken: string; expiresAt: string };
    try {
      jobResult = await createInstallJob(db, license, "production");
    } catch (jobCause) {
      return json({ ok: false, error: jobCause instanceof Error ? jobCause.message : "Kurulum işi oluşturulamadı." }, 409);
    }

    const activeOrigin = getPlatformDomainConfig(env).activeControlPlane;
    const agentEndpoint = `${activeOrigin}/api/v1/commerce/install-agent/jobs`;
    const bootstrapCommand = `php avci-install-agent.php --endpoint=${agentEndpoint} --token=${jobResult.enrollmentToken}`;

    await logAdminAction(db, {
      userEmail: admin.user.email,
      action: existingLicense ? "commerce_demo_install_job_renewed" : "commerce_demo_license_created",
      entity: "commerce_license_installation",
      entityId: String(license.id),
      details: { licenseId: license.id, leadId, customerId: customer.id, primaryDomain, jobId: jobResult.jobId },
    });

    return json({
      ok: true,
      primaryDomain,
      storeKey: license.storeKey,
      installationId: license.installationId,
      // Only ever returned once — only the hash is persisted. Not logged above.
      activationToken: activationToken || null,
      jobId: jobResult.jobId,
      enrollmentToken: jobResult.enrollmentToken,
      enrollmentExpiresAt: jobResult.expiresAt,
      bootstrapCommand,
    }, existingLicense ? 200 : 201);
  } catch (cause) {
    console.error("Demo store license/install job create failed", cause);
    return json({ ok: false, error: "Mağaza demosu oluşturulamadı." }, 503);
  }
}
