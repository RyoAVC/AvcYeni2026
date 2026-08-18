import { and, eq, ne } from "drizzle-orm";
import { customers, softwareInvoices, softwareOrders } from "../../../../../db/schema";
import { getAdminUser } from "../../../../admin-auth";
import { readAdminJsonObject, validateAdminMutationRequest } from "../../../../admin-request.mjs";
import { parseSoftwareInvoiceRecord } from "../../../../software-invoice-admin.mjs";

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
  if (!Number.isSafeInteger(id) || id < 1) return json({ ok: false, error: "Geçersiz fatura numarası." }, 400);

  const parsedPayload = await readAdminJsonObject(request);
  if (!parsedPayload.ok) return json({ ok: false, error: parsedPayload.error }, parsedPayload.status);

  const parsed = parseSoftwareInvoiceRecord(parsedPayload.value);
  if (!parsed.ok) return json({ ok: false, error: parsed.error }, 400);

  const expectedUpdatedAt = typeof (parsedPayload.value as { expectedUpdatedAt?: unknown }).expectedUpdatedAt === "string"
    ? String((parsedPayload.value as { expectedUpdatedAt?: string }).expectedUpdatedAt).trim()
    : "";
  if (!expectedUpdatedAt || expectedUpdatedAt.length > 64) {
    return json({ ok: false, error: "Kayıt sürümü doğrulanamadı. Sayfayı yenileyin." }, 400);
  }

  try {
    const { getDb } = await import("../../../../../db");
    const db = getDb();
    const [existing] = await db.select().from(softwareInvoices).where(eq(softwareInvoices.id, id)).limit(1);
    if (!existing) return json({ ok: false, error: "Fatura bulunamadı." }, 404);
    if (existing.updatedAt !== expectedUpdatedAt) {
      return json({ ok: false, error: "Kayıt başka bir yönetici tarafından güncellendi. Sayfayı yenileyin." }, 409);
    }

    const [customer] = await db.select({ id: customers.id }).from(customers).where(eq(customers.id, parsed.value.customerId)).limit(1);
    if (!customer) return json({ ok: false, error: "Seçilen yazılım müşterisi bulunamadı." }, 400);

    if (parsed.value.orderId) {
      const [order] = await db.select().from(softwareOrders).where(eq(softwareOrders.id, parsed.value.orderId)).limit(1);
      if (!order) return json({ ok: false, error: "Seçilen yazılım siparişi bulunamadı." }, 400);
      if (order.customerId !== parsed.value.customerId) {
        return json({ ok: false, error: "Sipariş bu müşteriye ait değil." }, 400);
      }
      if (parsed.value.status === "draft") {
        const [duplicate] = await db.select({ id: softwareInvoices.id }).from(softwareInvoices).where(and(
          eq(softwareInvoices.orderId, parsed.value.orderId),
          eq(softwareInvoices.status, "draft"),
          ne(softwareInvoices.id, id),
        )).limit(1);
        if (duplicate) {
          return json({ ok: false, error: "Bu sipariş için taslak fatura zaten var.", id: duplicate.id }, 409);
        }
      }
    }

    const existingTime = Date.parse(existing.updatedAt);
    const updatedAt = new Date(Math.max(Date.now(), Number.isFinite(existingTime) ? existingTime + 1 : 0)).toISOString();
    const updated = await db.update(softwareInvoices)
      .set({ ...parsed.value, updatedAt })
      .where(and(eq(softwareInvoices.id, id), eq(softwareInvoices.updatedAt, expectedUpdatedAt)))
      .returning({ id: softwareInvoices.id, updatedAt: softwareInvoices.updatedAt });

    if (!updated[0]) return json({ ok: false, error: "Kayıt başka bir yönetici tarafından güncellendi. Sayfayı yenileyin." }, 409);
    return json({ ok: true, id: updated[0].id, updatedAt: updated[0].updatedAt }, 200);
  } catch (cause) {
    console.error("Software invoice update failed", cause);
    return json({ ok: false, error: "Fatura şu anda güncellenemedi." }, 503);
  }
}
