import { and, eq, inArray } from "drizzle-orm";
import { customers, leadActivities, leads } from "../../../../../../db/schema";
import { getAdminUser } from "../../../../../admin-auth";
import { logAdminAction } from "../../../../../audit-log.mjs";
import { validateAdminMutationRequest } from "../../../../../admin-request.mjs";
import { customerDraftFromLead, shouldQualifyLeadOnCustomerCreate } from "../../../../../customer-record.mjs";
import { normalizeEmailAddress } from "../../../../../email-normalization.mjs";
import { normalizeLeadPhone } from "../../../../../lead-contact.mjs";
import { issueCustomerSetupToken } from "../../../../../customer-setup-tokens.mjs";
import { sendDemoInviteMail } from "../../../../../demo-invite-mail.mjs";
import { getPlatformDomainConfig } from "../../../../../platform-domain-config.mjs";
import { readRuntimeEnv } from "../../../../../runtime-env.mjs";

const TRIAL_DAYS = 7;
const TRIAL_MS = TRIAL_DAYS * 24 * 60 * 60 * 1000;

function json(body: Record<string, unknown>, status: number) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
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
    if (!email) return json({ ok: false, error: "Başvurunun e-postası geçersiz." }, 400);

    const now = Date.now();
    const nowIso = new Date(now).toISOString();
    const trialExpiresAt = new Date(now + TRIAL_MS).toISOString();

    const [existing] = await db.select({ id: customers.id, status: customers.status }).from(customers).where(eq(customers.email, email)).limit(1);
    let customerId: number;
    if (existing) {
      if (existing.status !== "trial") {
        return json({ ok: false, error: "Bu başvuru zaten bir yazılım müşterisine bağlı; demo daveti gönderilemez." }, 409);
      }
      customerId = existing.id;
      await db.update(customers).set({ trialExpiresAt, updatedAt: nowIso }).where(eq(customers.id, customerId));
    } else {
      const draft = customerDraftFromLead(lead, lead.id);
      const inserted = await db.insert(customers).values({
        ...draft,
        phoneNormalized: normalizeLeadPhone(draft.phone),
        trialExpiresAt,
        createdByEmail: admin.user.email,
        createdAt: nowIso,
        updatedAt: nowIso,
      }).returning({ id: customers.id });
      customerId = inserted[0]?.id ?? 0;
      if (!customerId) throw new Error("Customer insert did not return an id.");
    }

    const token = await issueCustomerSetupToken(db, { customerId, purpose: "demo_invite", ttlMs: TRIAL_MS, now });
    const activeOrigin = getPlatformDomainConfig(env).activeControlPlane;
    const setupUrl = `${activeOrigin}/musteri-panel/parola#${token}`;

    try {
      await sendDemoInviteMail({
        to: email,
        contactName: lead.name,
        companyName: lead.company,
        setupUrl,
        trialDays: TRIAL_DAYS,
        expectedOrigin: new URL(activeOrigin).origin,
      }, { env });
    } catch (mailCause) {
      if (!existing) {
        // Newly created trial customer with no delivered invite is useless; don't leave it orphaned.
        await db.delete(customers).where(eq(customers.id, customerId));
      }
      throw mailCause;
    }

    await logAdminAction(db, {
      userEmail: admin.user.email,
      action: existing ? "customer_demo_access_renewed" : "customer_demo_access_created",
      entity: "customer",
      entityId: String(customerId),
      details: { customerId, leadId, trialExpiresAt },
    });

    if (!existing && shouldQualifyLeadOnCustomerCreate(lead.status)) {
      try {
        const updated = await db.update(leads)
          .set({ status: "qualified", updatedAt: nowIso })
          .where(and(eq(leads.id, leadId), inArray(leads.status, ["new", "contacted"])))
          .returning({ id: leads.id });
        if (updated[0]) {
          await db.insert(leadActivities).values({
            leadId,
            action: "status_changed",
            fromStatus: lead.status,
            toStatus: "qualified",
            actorEmail: admin.user.email,
            createdAt: nowIso,
          });
        }
      } catch (leadCause) {
        console.error("Lead qualify after demo access create failed", leadCause);
      }
    }

    return json({ ok: true, customerId, trialExpiresAt }, existing ? 200 : 201);
  } catch (cause) {
    console.error("Demo access create failed", cause);
    return json({ ok: false, error: "Demo erişimi oluşturulamadı." }, 503);
  }
}
