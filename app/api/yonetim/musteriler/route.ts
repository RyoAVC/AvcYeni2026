import { and, eq, inArray } from "drizzle-orm";
import { customerPortalCredentials, customers, leadActivities, leads } from "../../../../db/schema";
import { getAdminUser } from "../../../admin-auth";
import { logAdminAction } from "../../../audit-log.mjs";
import { hashCustomerPassword, validateCustomerPassword } from "../../../customer-password.mjs";
import { readRuntimeEnv } from "../../../form-post.mjs";
import { ensureCommerceLicenseTables } from "../../../local-d1-schema.mjs";
import { readAdminJsonObject, validateAdminMutationRequest } from "../../../admin-request.mjs";
import { parseCustomerLeadId, parseCustomerRecord, shouldQualifyLeadOnCustomerCreate } from "../../../customer-record.mjs";

function json(body: Record<string, unknown>, status: number) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin.user) return json({ ok: false, error: "Oturum açmanız gerekiyor." }, 401);
  if (!admin.authorized) return json({ ok: false, error: "Bu işlem için yetkiniz yok." }, 403);

  const requestFailure = validateAdminMutationRequest(request);
  if (requestFailure) return json({ ok: false, error: requestFailure.error }, requestFailure.status);

  const parsedPayload = await readAdminJsonObject(request);
  if (!parsedPayload.ok) return json({ ok: false, error: parsedPayload.error }, parsedPayload.status);

  const parsed = parseCustomerRecord(parsedPayload.value);
  if (!parsed.ok) return json({ ok: false, error: parsed.error }, 400);
  const portalPassword = typeof parsedPayload.value.portalPassword === "string" ? parsedPayload.value.portalPassword : "";
  const passwordValidation = validateCustomerPassword(portalPassword);
  if (!passwordValidation.ok) return json({ ok: false, error: passwordValidation.error }, 400);
  const passwordHash = await hashCustomerPassword(portalPassword);

  try {
    await ensureCommerceLicenseTables(await readRuntimeEnv());
    const { getDb } = await import("../../../../db");
    const db = getDb();
    const [existing] = await db.select({ id: customers.id }).from(customers).where(eq(customers.email, parsed.value.email)).limit(1);
    if (existing) return json({ ok: false, error: "Bu e-posta ile kayıtlı bir yazılım müşterisi var." }, 409);

    const now = new Date().toISOString();
    const inserted = await db.insert(customers).values({
      ...parsed.value,
      createdByEmail: admin.user.email,
      createdAt: now,
      updatedAt: now,
    }).returning({ id: customers.id });
    const customerId = inserted[0]?.id;
    if (!customerId) throw new Error("Customer insert did not return an id.");
    try {
      await db.insert(customerPortalCredentials).values({
        customerId,
        passwordHash,
        passwordChangedAt: now,
        createdAt: now,
        updatedAt: now,
      });
    } catch (credentialCause) {
      await db.delete(customers).where(eq(customers.id, customerId));
      throw credentialCause;
    }
    await logAdminAction(db, { userEmail: admin.user.email, action: "customer_portal_password_created", entity: "customer", entityId: String(customerId), details: { customerId } });

    const leadId = parseCustomerLeadId(parsedPayload.value);
    if (leadId) {
      try {
        const [lead] = await db.select({ id: leads.id, status: leads.status }).from(leads).where(eq(leads.id, leadId)).limit(1);
        if (lead && shouldQualifyLeadOnCustomerCreate(lead.status)) {
          const updated = await db.update(leads)
            .set({ status: "qualified", updatedAt: now })
            .where(and(eq(leads.id, leadId), inArray(leads.status, ["new", "contacted"])))
            .returning({ id: leads.id, status: leads.status });
          if (updated[0]) {
            try {
              await db.insert(leadActivities).values({
                leadId,
                action: "status_changed",
                fromStatus: lead.status,
                toStatus: "qualified",
                actorEmail: admin.user.email,
                createdAt: now,
              });
            } catch (activityCause) {
              console.error("Lead qualify activity failed after customer create", activityCause);
            }
          }
        }
      } catch (leadCause) {
        console.error("Lead qualify after customer create failed", leadCause);
      }
    }

    return json({ ok: true, id: customerId }, 201);
  } catch (cause) {
    console.error("Customer create failed", cause);
    return json({ ok: false, error: "Müşteri şu anda kaydedilemedi." }, 503);
  }
}
