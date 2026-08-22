import { eq } from "drizzle-orm";
import { campaigns } from "../../../../db/schema";
import { getAdminUser } from "../../../admin-auth";
import { readAdminJsonObject, validateAdminMutationRequest } from "../../../admin-request.mjs";
import { logAdminAction } from "../../../audit-log.mjs";

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
    const { getDb } = await import("../../../../db");
    const db = getDb();
    const now = new Date().toISOString();

    const inserted = await db.insert(campaigns).values({
      name,
      type,
      discountValue,
      minSpend,
      targetType,
      status,
      startsAt,
      endsAt,
      createdAt: now,
      updatedAt: now,
    }).returning({ id: campaigns.id });

    await logAdminAction(db, {
      userEmail: admin.user.email,
      action: "create",
      entity: "campaign",
      entityId: String(inserted[0]?.id),
      details: `Kampanya oluşturuldu: ${name}`,
    });

    return json({ ok: true, id: inserted[0]?.id }, 201);
  } catch (cause) {
    console.error("Campaign create failed", cause);
    return json({ ok: false, error: "Kampanya kaydedilemedi." }, 503);
  }
}
