import { and, eq, ne } from "drizzle-orm";
import { brands } from "../../../../../db/schema";
import { getAdminUser } from "../../../../admin-auth";
import { readAdminJsonObject, validateAdminMutationRequest } from "../../../../admin-request.mjs";
import { logAdminAction } from "../../../../audit-log.mjs";
import { slugifyProduct } from "../../../../product-admin.mjs";

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

  const { id } = await params;
  const brandId = Number(id);
  if (!brandId || Number.isNaN(brandId)) return json({ ok: false, error: "Geçersiz marka kimliği." }, 400);

  const parsedPayload = await readAdminJsonObject(request);
  if (!parsedPayload.ok) return json({ ok: false, error: parsedPayload.error }, parsedPayload.status);

  const data = parsedPayload.value as Record<string, unknown>;
  const name = String(data.name || "").trim();
  if (!name) return json({ ok: false, error: "Marka adı zorunludur." }, 400);

  const slug = String(data.slug || "").trim() || slugifyProduct(name);
  const website = String(data.website || "").trim();
  const description = String(data.description || "").trim();
  const sortOrder = Number(data.sortOrder) || 0;
  const status = data.status === "passive" ? "passive" : "active";

  try {
    const { getDb } = await import("../../../../../db");
    const db = getDb();

    const [existing] = await db.select().from(brands).where(eq(brands.id, brandId)).limit(1);
    if (!existing) return json({ ok: false, error: "Marka bulunamadı." }, 404);

    const [conflict] = await db
      .select({ id: brands.id })
      .from(brands)
      .where(and(eq(brands.slug, slug), ne(brands.id, brandId)))
      .limit(1);
    if (conflict) return json({ ok: false, error: "Bu kısa kod başka bir markada kullanılıyor." }, 409);

    const now = new Date().toISOString();
    await db.update(brands).set({
      name,
      slug,
      website,
      description,
      sortOrder,
      status,
      updatedAt: now,
    }).where(eq(brands.id, brandId));

    await logAdminAction(db, {
      userEmail: admin.user.email,
      action: "update",
      entity: "brand",
      entityId: String(brandId),
      details: `Marka güncellendi: ${name}`,
    });

    return json({ ok: true }, 200);
  } catch (cause) {
    console.error("Brand update failed", cause);
    return json({ ok: false, error: "Marka güncellenemedi." }, 503);
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
  const brandId = Number(id);
  if (!brandId || Number.isNaN(brandId)) return json({ ok: false, error: "Geçersiz marka kimliği." }, 400);

  try {
    const { getDb } = await import("../../../../../db");
    const db = getDb();
    await db.delete(brands).where(eq(brands.id, brandId));
    await logAdminAction(db, {
      userEmail: admin.user.email,
      action: "delete",
      entity: "brand",
      entityId: String(brandId),
      details: "Marka silindi",
    });
    return json({ ok: true }, 200);
  } catch (cause) {
    console.error("Brand delete failed", cause);
    return json({ ok: false, error: "Marka silinemedi." }, 503);
  }
}
