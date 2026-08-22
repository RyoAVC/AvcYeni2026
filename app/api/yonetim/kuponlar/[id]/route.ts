import { and, eq, ne } from "drizzle-orm";
import { coupons } from "../../../../../db/schema";
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
  const couponId = Number(id);
  if (!couponId || Number.isNaN(couponId)) return json({ ok: false, error: "Geçersiz kupon kimliği." }, 400);

  const requestFailure = validateAdminMutationRequest(request);
  if (requestFailure) return json({ ok: false, error: requestFailure.error }, requestFailure.status);

  const parsedPayload = await readAdminJsonObject(request);
  if (!parsedPayload.ok) return json({ ok: false, error: parsedPayload.error }, parsedPayload.status);

  const data = parsedPayload.value as Record<string, unknown>;
  const code = String(data.code || "").trim().toUpperCase();
  if (!code) return json({ ok: false, error: "Kupon kodu zorunludur." }, 400);

  const type = String(data.type || "percentage");
  const discountValue = Number(data.discountValue) || 0;
  const minSpend = Number(data.minSpend) || 0;
  const maxDiscount = Number(data.maxDiscount) || 0;
  const usageLimit = Number(data.usageLimit) || 100;
  const status = data.status === "passive" ? "passive" : "active";
  const startsAt = String(data.startsAt || "");
  const endsAt = String(data.endsAt || "");

  try {
    const { getDb } = await import("../../../../../db");
    const db = getDb();

    const [existing] = await db.select().from(coupons).where(eq(coupons.id, couponId)).limit(1);
    if (!existing) return json({ ok: false, error: "Kupon bulunamadı." }, 404);

    const [conflict] = await db
      .select({ id: coupons.id })
      .from(coupons)
      .where(and(eq(coupons.code, code), ne(coupons.id, couponId)))
      .limit(1);
    if (conflict) return json({ ok: false, error: "Bu kupon kodu başka bir kuponda kullanılıyor." }, 409);

    const now = new Date().toISOString();
    await db.update(coupons).set({
      code,
      type,
      discountValue,
      minSpend,
      maxDiscount,
      usageLimit,
      status,
      startsAt,
      endsAt,
      updatedAt: now,
    }).where(eq(coupons.id, couponId));

    await logAdminAction(db, {
      userEmail: admin.user.email,
      action: "update",
      entity: "coupon",
      entityId: String(couponId),
      details: `Kupon güncellendi: ${code}`,
    });

    return json({ ok: true }, 200);
  } catch (cause) {
    console.error("Coupon update failed", cause);
    return json({ ok: false, error: "Kupon güncellenemedi." }, 503);
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
  const couponId = Number(id);
  if (!couponId || Number.isNaN(couponId)) return json({ ok: false, error: "Geçersiz kupon kimliği." }, 400);

  try {
    const { getDb } = await import("../../../../../db");
    const db = getDb();
    await db.delete(coupons).where(eq(coupons.id, couponId));
    await logAdminAction(db, {
      userEmail: admin.user.email,
      action: "delete",
      entity: "coupon",
      entityId: String(couponId),
      details: "Kupon silindi",
    });
    return json({ ok: true }, 200);
  } catch (cause) {
    console.error("Coupon delete failed", cause);
    return json({ ok: false, error: "Kupon silinemedi." }, 503);
  }
}
