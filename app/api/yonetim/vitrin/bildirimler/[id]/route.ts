import { and, eq, ne } from "drizzle-orm";
import { vitrineToasts } from "../../../../../../db/schema";
import { getAdminUser } from "../../../../../admin-auth";
import { readAdminJsonObject, validateAdminMutationRequest } from "../../../../../admin-request.mjs";
import { parseVitrineToastRecord } from "../../../../../vitrine-signal-admin.mjs";

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
  if (!Number.isSafeInteger(id) || id < 1) return json({ ok: false, error: "Geçersiz bildirim." }, 400);

  const parsedPayload = await readAdminJsonObject(request);
  if (!parsedPayload.ok) return json({ ok: false, error: parsedPayload.error }, parsedPayload.status);

  const parsed = parseVitrineToastRecord(parsedPayload.value);
  if (!parsed.ok) return json({ ok: false, error: parsed.error }, 400);

  const expectedUpdatedAt = typeof (parsedPayload.value as { expectedUpdatedAt?: unknown }).expectedUpdatedAt === "string"
    ? String((parsedPayload.value as { expectedUpdatedAt?: string }).expectedUpdatedAt).trim()
    : "";
  if (!expectedUpdatedAt || expectedUpdatedAt.length > 64) {
    return json({ ok: false, error: "Kayıt sürümü doğrulanamadı. Sayfayı yenileyin." }, 400);
  }

  try {
    const { getDb } = await import("../../../../../../db");
    const db = getDb();
    const [existing] = await db.select().from(vitrineToasts).where(eq(vitrineToasts.id, id)).limit(1);
    if (!existing) return json({ ok: false, error: "Bildirim bulunamadı." }, 404);
    if (existing.updatedAt !== expectedUpdatedAt) {
      return json({ ok: false, error: "Kayıt başka bir yönetici tarafından güncellendi. Sayfayı yenileyin." }, 409);
    }

    const [slugTaken] = await db
      .select({ id: vitrineToasts.id })
      .from(vitrineToasts)
      .where(and(eq(vitrineToasts.slug, parsed.value.slug), ne(vitrineToasts.id, id)))
      .limit(1);
    if (slugTaken) return json({ ok: false, error: "Bu kısa kod başka bir bildirimde kayıtlı." }, 409);

    const existingTime = Date.parse(existing.updatedAt);
    const updatedAt = new Date(Math.max(Date.now(), Number.isFinite(existingTime) ? existingTime + 1 : 0)).toISOString();
    const updated = await db.update(vitrineToasts)
      .set({ ...parsed.value, updatedAt })
      .where(and(eq(vitrineToasts.id, id), eq(vitrineToasts.updatedAt, expectedUpdatedAt)))
      .returning({ id: vitrineToasts.id, updatedAt: vitrineToasts.updatedAt });

    if (!updated[0]) return json({ ok: false, error: "Kayıt başka bir yönetici tarafından güncellendi. Sayfayı yenileyin." }, 409);
    return json({ ok: true, id: updated[0].id, updatedAt: updated[0].updatedAt }, 200);
  } catch (cause) {
    console.error("Vitrine toast update failed", cause);
    return json({ ok: false, error: "Bildirim şu anda güncellenemedi." }, 503);
  }
}
