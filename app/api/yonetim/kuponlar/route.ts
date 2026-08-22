import { eq } from "drizzle-orm";
import { coupons } from "../../../../db/schema";
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
  const code = String(data.code || "").trim().toUpperCase();
  if (!code || code.length < 3) return json({ ok: false, error: "Kupon kodu en az 3 karakter olmalıdır." }, 400);

  const type = String(data.type || "percentage");
  const discountValue = Number(data.discountValue) || 0;
  const minSpend = Number(data.minSpend) || 0;
  const maxDiscount = Number(data.maxDiscount) || 0;
  const usageLimit = Number(data.usageLimit) || 100;
  const status = data.status === "passive" ? "passive" : "active";
  const startsAt = String(data.startsAt || "");
  const endsAt = String(data.endsAt || "");

  try {
    const { getDb } = await import("../../../../db");
    const db = getDb();

    const [existing] = await db.select().from(coupons).where(eq(coupons.code, code)).limit(1);
    if (existing) return json({ ok: false, error: "Bu kupon kodu zaten tanımlanmış." }, 409);

    const now = new Date().toISOString();
    const inserted = await db.insert(coupons).values({
      code,
      type,
      discountValue,
      minSpend,
      maxDiscount,
      usageLimit,
      usedCount: 0,
      status,
      startsAt,
      endsAt,
      createdAt: now,
      updatedAt: now,
    }).returning({ id: coupons.id });

    await logAdminAction(db, {
      userEmail: admin.user.email,
      action: "create",
      entity: "coupon",
      entityId: String(inserted[0]?.id),
      details: `Kupon kodu oluşturuldu: ${code}`,
    });

    return json({ ok: true, id: inserted[0]?.id }, 201);
  } catch (cause) {
    console.error("Coupon create failed", cause);
    return json({ ok: false, error: "Kupon kaydedilemedi." }, 503);
  }
}
