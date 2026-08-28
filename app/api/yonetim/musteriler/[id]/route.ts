import { and, eq, ne } from "drizzle-orm";
import { customerPortalCredentials, customers } from "../../../../../db/schema";
import { getAdminUser } from "../../../../admin-auth";
import { logAdminAction } from "../../../../audit-log.mjs";
import { hashCustomerPassword, validateCustomerPassword } from "../../../../customer-password.mjs";
import { readRuntimeEnv } from "../../../../form-post.mjs";
import { ensureCommerceLicenseTables } from "../../../../local-d1-schema.mjs";
import { readAdminJsonObject, validateAdminMutationRequest } from "../../../../admin-request.mjs";
import { parseCustomerRecord } from "../../../../customer-record.mjs";

function json(body: Record<string, unknown>, status: number) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminUser();
  if (!admin.user) return json({ ok: false, error: "Oturum açmanız gerekiyor." }, 401);
  if (!admin.authorized) return json({ ok: false, error: "Bu işlem için yetkiniz yok." }, 403);

  const requestFailure = validateAdminMutationRequest(request);
  if (requestFailure) return json({ ok: false, error: requestFailure.error }, requestFailure.status);

  const { id: idParam } = await context.params;
  const id = Number(idParam);
  if (!Number.isSafeInteger(id) || id < 1) return json({ ok: false, error: "Geçersiz müşteri numarası." }, 400);

  const parsedPayload = await readAdminJsonObject(request);
  if (!parsedPayload.ok) return json({ ok: false, error: parsedPayload.error }, parsedPayload.status);

  const parsed = parseCustomerRecord(parsedPayload.value);
  if (!parsed.ok) return json({ ok: false, error: parsed.error }, 400);
  const portalPassword = typeof parsedPayload.value.portalPassword === "string" ? parsedPayload.value.portalPassword : "";
  if (portalPassword) {
    const passwordValidation = validateCustomerPassword(portalPassword);
    if (!passwordValidation.ok) return json({ ok: false, error: passwordValidation.error }, 400);
  }

  const expectedUpdatedAt = typeof (parsedPayload.value as { expectedUpdatedAt?: unknown }).expectedUpdatedAt === "string"
    ? String((parsedPayload.value as { expectedUpdatedAt?: string }).expectedUpdatedAt).trim()
    : "";
  if (!expectedUpdatedAt || expectedUpdatedAt.length > 64) {
    return json({ ok: false, error: "Kayıt sürümü doğrulanamadı. Sayfayı yenileyin." }, 400);
  }

  try {
    await ensureCommerceLicenseTables(await readRuntimeEnv());
    const { getDb } = await import("../../../../../db");
    const db = getDb();
    const [existing] = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
    if (!existing) return json({ ok: false, error: "Müşteri bulunamadı." }, 404);
    if (existing.updatedAt !== expectedUpdatedAt) {
      return json({ ok: false, error: "Kayıt başka bir yönetici tarafından güncellendi. Sayfayı yenileyin." }, 409);
    }

    const [emailTaken] = await db
      .select({ id: customers.id })
      .from(customers)
      .where(and(eq(customers.email, parsed.value.email), ne(customers.id, id)))
      .limit(1);
    if (emailTaken) return json({ ok: false, error: "Bu e-posta başka bir yazılım müşterisinde kayıtlı." }, 409);

    const existingTime = Date.parse(existing.updatedAt);
    const updatedAt = new Date(Math.max(Date.now(), Number.isFinite(existingTime) ? existingTime + 1 : 0)).toISOString();
    const updated = await db.update(customers)
      .set({ ...parsed.value, updatedAt })
      .where(and(eq(customers.id, id), eq(customers.updatedAt, expectedUpdatedAt)))
      .returning({ id: customers.id, updatedAt: customers.updatedAt });

    if (!updated[0]) return json({ ok: false, error: "Kayıt başka bir yönetici tarafından güncellendi. Sayfayı yenileyin." }, 409);
    if (portalPassword) {
      const passwordHash = await hashCustomerPassword(portalPassword);
      await db.insert(customerPortalCredentials).values({ customerId: id, passwordHash, passwordChangedAt: updatedAt, createdAt: updatedAt, updatedAt })
        .onConflictDoUpdate({ target: customerPortalCredentials.customerId, set: { passwordHash, passwordChangedAt: updatedAt, updatedAt } });
      await logAdminAction(db, { userEmail: admin.user.email, action: "customer_portal_password_reset", entity: "customer", entityId: String(id), details: { customerId: id } });
    }
    return json({ ok: true, id: updated[0].id, updatedAt: updated[0].updatedAt }, 200);
  } catch (cause) {
    console.error("Customer update failed", cause);
    return json({ ok: false, error: "Müşteri şu anda güncellenemedi." }, 503);
  }
}
