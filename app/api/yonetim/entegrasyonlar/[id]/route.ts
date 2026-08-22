import { eq } from "drizzle-orm";
import { integrations } from "../../../../../db/schema";
import { getAdminUser } from "../../../../admin-auth";
import { readAdminJsonObject, validateAdminMutationRequest } from "../../../../admin-request.mjs";
import { logAdminAction } from "../../../../audit-log.mjs";

function json(body: Record<string, unknown>, status: number) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminUser();
  if (!admin.user) return json({ ok: false, error: "Oturum açmanız gerekiyor." }, 401);
  if (!admin.authorized) return json({ ok: false, error: "Bu işlem için yetkiniz yok." }, 403);

  const { id } = await params;
  const integrationId = Number(id);
  if (!integrationId || Number.isNaN(integrationId)) return json({ ok: false, error: "Geçersiz entegrasyon kimliği." }, 400);

  const requestFailure = validateAdminMutationRequest(request);
  if (requestFailure) return json({ ok: false, error: requestFailure.error }, requestFailure.status);

  const parsedPayload = await readAdminJsonObject(request);
  if (!parsedPayload.ok) return json({ ok: false, error: parsedPayload.error }, parsedPayload.status);

  const data = parsedPayload.value as Record<string, unknown>;
  const status = String(data.status || "passive");
  const config = typeof data.config === "object" ? JSON.stringify(data.config) : String(data.config || "{}");

  try {
    const { getDb } = await import("../../../../../db");
    const db = getDb();
    const now = new Date().toISOString();

    await db.update(integrations).set({
      status,
      config,
      lastSyncAt: now,
      updatedAt: now,
    }).where(eq(integrations.id, integrationId));

    await logAdminAction(db, {
      userEmail: admin.user.email,
      action: "update",
      entity: "integration",
      entityId: String(integrationId),
      details: `Entegrasyon ayarları güncellendi (${status})`,
    });

    return json({ ok: true }, 200);
  } catch (cause) {
    console.error("Integration update failed", cause);
    return json({ ok: false, error: "Entegrasyon güncellenemedi." }, 503);
  }
}
