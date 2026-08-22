import { and, eq, ne } from "drizzle-orm";
import { products } from "../../../../../db/schema";
import { getAdminUser } from "../../../../admin-auth";
import { readAdminJsonObject, validateAdminMutationRequest } from "../../../../admin-request.mjs";
import { parseProductRecord } from "../../../../product-admin.mjs";
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

  const requestFailure = validateAdminMutationRequest(request);
  if (requestFailure) return json({ ok: false, error: requestFailure.error }, requestFailure.status);

  const parsedPayload = await readAdminJsonObject(request);
  if (!parsedPayload.ok) return json({ ok: false, error: parsedPayload.error }, parsedPayload.status);

  const { id } = await params;
  const productId = Number(id);
  if (!productId || Number.isNaN(productId)) {
    return json({ ok: false, error: "Geçersiz ürün kimliği." }, 400);
  }

  const parsed = parseProductRecord(parsedPayload.value);
  if (!parsed.ok) return json({ ok: false, error: parsed.error }, 400);

  try {
    const { getDb } = await import("../../../../../db");
    const db = getDb();
    const [existing] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
    if (!existing) return json({ ok: false, error: "Ürün bulunamadı." }, 404);

    const [slugConflict] = await db
      .select({ id: products.id })
      .from(products)
      .where(and(eq(products.slug, parsed.value.slug), ne(products.id, productId)))
      .limit(1);

    if (slugConflict) {
      return json({ ok: false, error: "Bu kısa kod (slug) başka bir üründe kullanılıyor." }, 409);
    }

    const now = new Date().toISOString();
    await db
      .update(products)
      .set({
        ...parsed.value,
        updatedAt: now,
      })
      .where(eq(products.id, productId));

    await logAdminAction(db, {
      userEmail: admin.user.email,
      action: "update",
      entity: "product",
      entityId: String(productId),
      details: `Ürün güncellendi: ${parsed.value.name}`,
    });

    return json({ ok: true, id: productId }, 200);
  } catch (cause) {
    console.error("Product update failed", cause);
    return json({ ok: false, error: "Ürün şu anda güncellenemedi." }, 503);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminUser();
  if (!admin.user) return json({ ok: false, error: "Oturum açmanız gerekiyor." }, 401);
  if (!admin.authorized) return json({ ok: false, error: "Bu işlem için yetkiniz yok." }, 403);

  const requestFailure = validateAdminMutationRequest(request);
  if (requestFailure) return json({ ok: false, error: requestFailure.error }, requestFailure.status);

  const { id } = await params;
  const productId = Number(id);
  if (!productId || Number.isNaN(productId)) {
    return json({ ok: false, error: "Geçersiz ürün kimliği." }, 400);
  }

  try {
    const { getDb } = await import("../../../../../db");
    const db = getDb();
    const [existing] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
    if (!existing) return json({ ok: false, error: "Ürün bulunamadı." }, 404);

    await db.delete(products).where(eq(products.id, productId));

    await logAdminAction(db, {
      userEmail: admin.user.email,
      action: "delete",
      entity: "product",
      entityId: String(productId),
      details: `Ürün silindi: ${existing.name}`,
    });

    return json({ ok: true }, 200);
  } catch (cause) {
    console.error("Product delete failed", cause);
    return json({ ok: false, error: "Ürün silinemedi." }, 503);
  }
}
