import { eq } from "drizzle-orm";
import { getAdminUser } from "../../../../../admin-auth";
import { leadNotes, leads } from "../../../../../../db/schema";
import { readAdminJsonObject, validateAdminMutationRequest } from "../../../../../admin-request.mjs";

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

  const parsedPayload = await readAdminJsonObject(request);
  if (!parsedPayload.ok) return json({ ok: false, error: parsedPayload.error }, parsedPayload.status);
  const payload = parsedPayload.value as { content?: unknown; requestKey?: unknown };

  const content = typeof payload.content === "string" ? payload.content.trim() : "";
  if (content.length < 2) return json({ ok: false, error: "Not en az 2 karakter olmalıdır." }, 400);
  if (content.length > 2000) return json({ ok: false, error: "Not en fazla 2000 karakter olabilir." }, 400);
  const requestKey = typeof payload.requestKey === "string" ? payload.requestKey.trim().toLowerCase() : "";
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(requestKey)) {
    return json({ ok: false, error: "Not isteği doğrulanamadı. Tekrar deneyin." }, 400);
  }

  try {
    const { getDb } = await import("../../../../../../db");
    const db = getDb();
    const [lead] = await db.select({ id: leads.id }).from(leads).where(eq(leads.id, leadId)).limit(1);
    if (!lead) return json({ ok: false, error: "Başvuru bulunamadı." }, 404);

    const findExistingNote = () => db.select({ id: leadNotes.id, leadId: leadNotes.leadId, createdAt: leadNotes.createdAt })
      .from(leadNotes)
      .where(eq(leadNotes.requestKey, requestKey))
      .limit(1);
    const [existingNote] = await findExistingNote();
    if (existingNote) {
      if (existingNote.leadId !== leadId) return json({ ok: false, error: "Not isteği başka bir kayıtla eşleşiyor." }, 409);
      return json({ ok: true, note: existingNote, duplicate: true }, 200);
    }

    try {
      const [note] = await db.insert(leadNotes).values({
        leadId,
        content,
        authorEmail: admin.user.email,
        requestKey,
        createdAt: new Date().toISOString(),
      }).returning({ id: leadNotes.id, leadId: leadNotes.leadId, createdAt: leadNotes.createdAt });
      return json({ ok: true, note }, 201);
    } catch (insertCause) {
      const [duplicateNote] = await findExistingNote();
      if (duplicateNote && duplicateNote.leadId === leadId) return json({ ok: true, note: duplicateNote, duplicate: true }, 200);
      throw insertCause;
    }
  } catch (cause) {
    console.error("Lead note creation failed", cause);
    return json({ ok: false, error: "Not şu anda kaydedilemedi." }, 503);
  }
}
