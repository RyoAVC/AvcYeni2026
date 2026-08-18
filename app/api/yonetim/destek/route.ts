import { and, eq, ne, sql } from "drizzle-orm";
import { customers, supportTickets } from "../../../../db/schema";
import { getAdminUser } from "../../../admin-auth";
import { readAdminJsonObject, validateAdminMutationRequest } from "../../../admin-request.mjs";
import { parseSupportTicketRecord, parseTicketOrderIdFromNote, ticketNoteOrderLikePattern } from "../../../support-ticket-admin.mjs";

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

  const parsed = parseSupportTicketRecord(parsedPayload.value);
  if (!parsed.ok) return json({ ok: false, error: parsed.error }, 400);

  try {
    const { getDb } = await import("../../../../db");
    const db = getDb();
    const [customer] = await db.select({ id: customers.id }).from(customers).where(eq(customers.id, parsed.value.customerId)).limit(1);
    if (!customer) return json({ ok: false, error: "Seçilen yazılım müşterisi bulunamadı." }, 400);

    const orderId = parseTicketOrderIdFromNote(parsed.value.note);
    const orderPattern = ticketNoteOrderLikePattern(orderId);
    if (orderPattern && parsed.value.status !== "closed") {
      const [duplicate] = await db.select({ id: supportTickets.id }).from(supportTickets).where(and(
        eq(supportTickets.customerId, parsed.value.customerId),
        ne(supportTickets.status, "closed"),
        sql`${supportTickets.note} LIKE ${orderPattern} ESCAPE '\\'`,
      )).limit(1);
      if (duplicate) {
        return json({ ok: false, error: "Bu sipariş için açık destek kaydı zaten var.", id: duplicate.id }, 409);
      }
    }

    const now = new Date().toISOString();
    const inserted = await db.insert(supportTickets).values({
      ...parsed.value,
      createdByEmail: admin.user.email,
      createdAt: now,
      updatedAt: now,
    }).returning({ id: supportTickets.id });

    return json({ ok: true, id: inserted[0]?.id }, 201);
  } catch (cause) {
    console.error("Support ticket create failed", cause);
    return json({ ok: false, error: "Destek kaydı şu anda açılamadı." }, 503);
  }
}
