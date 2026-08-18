import { and, eq, ne, sql } from "drizzle-orm";
import { customers, supportTickets } from "../../../../../db/schema";
import { getAdminUser } from "../../../../admin-auth";
import { readAdminJsonObject, validateAdminMutationRequest } from "../../../../admin-request.mjs";
import { parseSupportTicketRecord, parseTicketOrderIdFromNote, ticketNoteOrderLikePattern } from "../../../../support-ticket-admin.mjs";

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
  if (!Number.isSafeInteger(id) || id < 1) return json({ ok: false, error: "Geçersiz kayıt numarası." }, 400);

  const parsedPayload = await readAdminJsonObject(request);
  if (!parsedPayload.ok) return json({ ok: false, error: parsedPayload.error }, parsedPayload.status);

  const parsed = parseSupportTicketRecord(parsedPayload.value);
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
    const [existing] = await db.select().from(supportTickets).where(eq(supportTickets.id, id)).limit(1);
    if (!existing) return json({ ok: false, error: "Destek kaydı bulunamadı." }, 404);
    if (existing.updatedAt !== expectedUpdatedAt) {
      return json({ ok: false, error: "Kayıt başka bir yönetici tarafından güncellendi. Sayfayı yenileyin." }, 409);
    }

    const [customer] = await db.select({ id: customers.id }).from(customers).where(eq(customers.id, parsed.value.customerId)).limit(1);
    if (!customer) return json({ ok: false, error: "Seçilen yazılım müşterisi bulunamadı." }, 400);

    const orderId = parseTicketOrderIdFromNote(parsed.value.note);
    const orderPattern = ticketNoteOrderLikePattern(orderId);
    if (orderPattern && parsed.value.status !== "closed") {
      const [duplicate] = await db.select({ id: supportTickets.id }).from(supportTickets).where(and(
        eq(supportTickets.customerId, parsed.value.customerId),
        ne(supportTickets.status, "closed"),
        ne(supportTickets.id, id),
        sql`${supportTickets.note} LIKE ${orderPattern} ESCAPE '\\'`,
      )).limit(1);
      if (duplicate) {
        return json({ ok: false, error: "Bu sipariş için açık destek kaydı zaten var.", id: duplicate.id }, 409);
      }
    }

    const existingTime = Date.parse(existing.updatedAt);
    const updatedAt = new Date(Math.max(Date.now(), Number.isFinite(existingTime) ? existingTime + 1 : 0)).toISOString();
    const updated = await db.update(supportTickets)
      .set({ ...parsed.value, updatedAt })
      .where(and(eq(supportTickets.id, id), eq(supportTickets.updatedAt, expectedUpdatedAt)))
      .returning({ id: supportTickets.id, updatedAt: supportTickets.updatedAt });

    if (!updated[0]) return json({ ok: false, error: "Kayıt başka bir yönetici tarafından güncellendi. Sayfayı yenileyin." }, 409);
    return json({ ok: true, id: updated[0].id, updatedAt: updated[0].updatedAt }, 200);
  } catch (cause) {
    console.error("Support ticket update failed", cause);
    return json({ ok: false, error: "Destek kaydı şu anda güncellenemedi." }, 503);
  }
}
