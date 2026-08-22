import { eq } from "drizzle-orm";
import { campaigns } from "../../../../../db/schema";
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
  const campaignId = Number(id);
  if (!campaignId || Number.isNaN(campaignId)) return json({ ok: false, error: "Geçersiz kampanya kimliği." }, 400);

  const requestFailure = validateAdminMutationRequest(request);
  if (requestFailure) return json({ ok: false, error: requestFailure.error }, requestFailure.status);

  const parsedPayload = await readAdminJsonObject(request);
  if (!parsedPayload.ok) return json({ ok: false, error: parsedPayload.error }, parsedPayload.status);

  const data = parsedPayload.value as Record<string, unknown>;
  const name = String(data.name || "").trim();
  if (!name) return json({ ok: false, error: "Kampanya adı zorunludur." }, 400);

  const type = String(data.type || "percentage");
  const discountValue = Number(data.discountValue) || 0;
  const minSpend = Number(data.minSpend) || 0;
  const targetType = String(data.targetType || "all");
  const status = data.status === "passive" ? "passive" : "active";
  const startsAt = String(data.startsAt || "");
  const endsAt = String(data.endsAt || "");

  try {
    const { getDb } = await import("../../../../../db");
    const db = getDb();
    const now = new Date().toISOString();

    await db.update(campaigns).set({
      name,
      type,
      discountValue,
      minSpend,
      targetType,
      status,
      startsAt,
      endsAt,
      updatedAt: now,
    }).where(eq(campaigns.id, campaignId));

    await logAdminAction(db, {
      userEmail: admin.user.email,
      action: "update",
      entity: "campaign",
      entityId: String(campaignId),
      details: `Kampanya güncellendi: ${name}`,
    });

    return json({ ok: true }, 200);
  } catch (cause) {
    console.error("Campaign update failed", cause);
    return json({ ok: false, error: "Kampanya güncellenemedi." }, 503);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminUser();
  if (!admin.user) return json({ ok: false, error: "Oturum açmanız gerekiyor." }, 401);
  if (!admin.authorized) return json({ ok: false, error: "Bu işlem için yetkiniz yok." }, 403);

  const { id } = await params;
  const campaignId = Number(id);
  if (!campaignId || Number.isNaN(campaignId)) return json({ ok: false, error: "Geçersiz kampanya kimliği." }, 400);

  try {
    const { getDb } = await import("../../../../../db");
    const db = getDb();
    await db.delete(campaigns).where(eq(campaigns.id, campaignId));
    await logAdminAction(db, {
      userEmail: admin.user.email,
      action: "delete",
      entity: "campaign",
      entityId: String(campaignId),
      details: "Kampanya silindi",
    });
    return json({ ok: true }, 200);
  } catch (cause) {
    console.error("Campaign delete failed", cause);
    return json({ ok: false, error: "Kampanya silinemedi." }, 503);
  }
}
