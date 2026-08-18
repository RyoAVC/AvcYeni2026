import { and, eq } from "drizzle-orm";
import { customers, softwareInvoices, softwareOrders } from "../../../../db/schema";
import { getAdminUser } from "../../../admin-auth";
import { readAdminJsonObject, validateAdminMutationRequest } from "../../../admin-request.mjs";
import { parseSoftwareInvoiceRecord } from "../../../software-invoice-admin.mjs";

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

  const parsed = parseSoftwareInvoiceRecord(parsedPayload.value);
  if (!parsed.ok) return json({ ok: false, error: parsed.error }, 400);

  try {
    const { getDb } = await import("../../../../db");
    const db = getDb();
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
        )).limit(1);
        if (duplicate) {
          return json({ ok: false, error: "Bu sipariş için taslak fatura zaten var.", id: duplicate.id }, 409);
        }
      }
    }

    const now = new Date().toISOString();
    const inserted = await db.insert(softwareInvoices).values({
      ...parsed.value,
      createdByEmail: admin.user.email,
      createdAt: now,
      updatedAt: now,
    }).returning({ id: softwareInvoices.id });

    return json({ ok: true, id: inserted[0]?.id }, 201);
  } catch (cause) {
    console.error("Software invoice create failed", cause);
    return json({ ok: false, error: "Fatura şu anda kaydedilemedi." }, 503);
  }
}
