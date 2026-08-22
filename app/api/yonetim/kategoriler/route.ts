import { eq } from "drizzle-orm";
import { categories } from "../../../../db/schema";
import { getAdminUser } from "../../../admin-auth";
import { readAdminJsonObject, validateAdminMutationRequest } from "../../../admin-request.mjs";
import { logAdminAction } from "../../../audit-log.mjs";
import { slugifyProduct } from "../../../product-admin.mjs";

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
  if (!name) return json({ ok: false, error: "Kategori adı zorunludur." }, 400);

  const slug = String(data.slug || "").trim() || slugifyProduct(name);
  const description = String(data.description || "").trim();
  const sortOrder = Number(data.sortOrder) || 0;
  const status = data.status === "passive" ? "passive" : "active";

  try {
    const { getDb } = await import("../../../../db");
    const db = getDb();

    const [existing] = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
    if (existing) return json({ ok: false, error: "Bu kısa kod ile kayıtlı bir kategori var." }, 409);

    const now = new Date().toISOString();
    const inserted = await db.insert(categories).values({
      name,
      slug,
      description,
      sortOrder,
      status,
      createdAt: now,
      updatedAt: now,
    }).returning({ id: categories.id });

    await logAdminAction(db, {
      userEmail: admin.user.email,
      action: "create",
      entity: "category",
      entityId: String(inserted[0]?.id),
      details: `Kategori eklendi: ${name}`,
    });

    return json({ ok: true, id: inserted[0]?.id }, 201);
  } catch (cause) {
    console.error("Category create failed", cause);
    return json({ ok: false, error: "Kategori kaydedilemedi." }, 503);
  }
}
