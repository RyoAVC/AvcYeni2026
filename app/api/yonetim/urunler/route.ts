import { eq } from "drizzle-orm";
import { products } from "../../../../db/schema";
import { getAdminUser } from "../../../admin-auth";
import { readAdminJsonObject, validateAdminMutationRequest } from "../../../admin-request.mjs";
import { parseProductRecord } from "../../../product-admin.mjs";
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

  const parsed = parseProductRecord(parsedPayload.value);
  if (!parsed.ok) return json({ ok: false, error: parsed.error }, 400);

  try {
    const { getDb } = await import("../../../../db");
    const db = getDb();
    const [existing] = await db.select({ id: products.id }).from(products).where(eq(products.slug, parsed.value.slug)).limit(1);
    if (existing) return json({ ok: false, error: "Bu kısa kod (slug) ile kayıtlı bir ürün zaten var." }, 409);

    const now = new Date().toISOString();
    const inserted = await db.insert(products).values({
      ...parsed.value,
      createdAt: now,
      updatedAt: now,
    }).returning({ id: products.id });

    const newId = inserted[0]?.id;
    await logAdminAction(db, {
      userEmail: admin.user.email,
      action: "create",
      entity: "product",
      entityId: String(newId),
      details: `Yeni ürün oluşturuldu: ${parsed.value.name}`,
    });

    return json({ ok: true, id: newId }, 201);
  } catch (cause) {
    console.error("Product create failed", cause);
    return json({ ok: false, error: "Ürün şu anda kaydedilemedi." }, 503);
  }
}
