import { and, eq } from "drizzle-orm";
import { getAdminUser } from "../../../../admin-auth";
import { leadActivities, leads } from "../../../../../db/schema";
import { readAdminJsonObject, validateAdminMutationRequest } from "../../../../admin-request.mjs";
import { isLeadStatus } from "../../../../lead-statuses";

function json(body: Record<string, unknown>, status: number) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
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
  if (!Number.isSafeInteger(id) || id < 1) return json({ ok: false, error: "Geçersiz başvuru numarası." }, 400);

  const parsedPayload = await readAdminJsonObject(request);
  if (!parsedPayload.ok) return json({ ok: false, error: parsedPayload.error }, parsedPayload.status);
  const payload = parsedPayload.value as { status?: unknown; expectedUpdatedAt?: unknown };

  const status = typeof payload.status === "string" ? payload.status : "";
  if (!isLeadStatus(status)) return json({ ok: false, error: "Geçersiz başvuru durumu." }, 400);
  const expectedUpdatedAt = typeof payload.expectedUpdatedAt === "string" ? payload.expectedUpdatedAt.trim() : "";
  if (!expectedUpdatedAt || expectedUpdatedAt.length > 64) return json({ ok: false, error: "Kayıt sürümü doğrulanamadı. Sayfayı yenileyin." }, 400);

  try {
    const { getDb } = await import("../../../../../db");
    const db = getDb();
    const [existingLead] = await db
      .select({ id: leads.id, status: leads.status, updatedAt: leads.updatedAt })
      .from(leads)
      .where(eq(leads.id, id))
      .limit(1);
    if (!existingLead) return json({ ok: false, error: "Başvuru bulunamadı." }, 404);
    if (existingLead.updatedAt !== expectedUpdatedAt) {
      return json({
        ok: false,
        error: "Kayıt başka bir yönetici tarafından güncellendi. Güncel durum yüklendi.",
        current: existingLead,
      }, 409);
    }
    if (existingLead.status === status) return json({ ok: true, lead: existingLead }, 200);

    const existingTime = Date.parse(existingLead.updatedAt);
    const updatedAt = new Date(Math.max(Date.now(), Number.isFinite(existingTime) ? existingTime + 1 : 0)).toISOString();
    const updatedRows = await db.update(leads)
      .set({ status, updatedAt })
      .where(and(eq(leads.id, id), eq(leads.updatedAt, expectedUpdatedAt)))
      .returning({ id: leads.id, status: leads.status, updatedAt: leads.updatedAt });
    const updatedLead = updatedRows[0];
    if (!updatedLead) {
      const [current] = await db.select({ id: leads.id, status: leads.status, updatedAt: leads.updatedAt }).from(leads).where(eq(leads.id, id)).limit(1);
      return json({ ok: false, error: "Kayıt başka bir yönetici tarafından güncellendi. Güncel durum yüklendi.", current }, 409);
    }

    try {
      await db.insert(leadActivities).values({
        leadId: id,
        action: "status_changed",
        fromStatus: existingLead.status,
        toStatus: status,
        actorEmail: admin.user.email,
        createdAt: updatedAt,
      });
    } catch (activityCause) {
      await db.update(leads)
        .set({ status: existingLead.status, updatedAt: existingLead.updatedAt })
        .where(and(eq(leads.id, id), eq(leads.updatedAt, updatedAt)));
      throw activityCause;
    }
    return json({ ok: true, lead: updatedLead }, 200);
  } catch (cause) {
    console.error("Lead status update failed", cause);
    return json({ ok: false, error: "Durum şu anda güncellenemedi." }, 503);
  }
}
