import { and, eq, ne } from "drizzle-orm";
import { customers, modules, packages, softwareOrders } from "../../../../../db/schema";
import { getAdminUser } from "../../../../admin-auth";
import { readAdminJsonObject, validateAdminMutationRequest } from "../../../../admin-request.mjs";
import { parseSoftwareOrderRecord } from "../../../../software-order-admin.mjs";

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
  if (!Number.isSafeInteger(id) || id < 1) return json({ ok: false, error: "Geçersiz sipariş numarası." }, 400);

  const parsedPayload = await readAdminJsonObject(request);
  if (!parsedPayload.ok) return json({ ok: false, error: parsedPayload.error }, parsedPayload.status);

  const parsed = parseSoftwareOrderRecord(parsedPayload.value);
  if (!parsed.ok) return json({ ok: false, error: parsed.error }, 400);

  const expectedUpdatedAt = typeof (parsedPayload.value as { expectedUpdatedAt?: unknown }).expectedUpdatedAt === "string"
    ? String((parsedPayload.value as { expectedUpdatedAt?: string }).expectedUpdatedAt).trim()
    : "";
  if (!expectedUpdatedAt || expectedUpdatedAt.length > 64) {
    return json({ ok: false, error: "Kayıt sürümü doğrulanamadı. Sayfayı yenileyin." }, 400);
  }

  try {
    const { getDb } = await import("../../../../../db");
    const db = getDb();
    const [existing] = await db.select().from(softwareOrders).where(eq(softwareOrders.id, id)).limit(1);
    if (!existing) return json({ ok: false, error: "Sipariş bulunamadı." }, 404);
    if (existing.updatedAt !== expectedUpdatedAt) {
      return json({ ok: false, error: "Kayıt başka bir yönetici tarafından güncellendi. Sayfayı yenileyin." }, 409);
    }

    const [customer] = await db.select({ id: customers.id }).from(customers).where(eq(customers.id, parsed.value.customerId)).limit(1);
    if (!customer) return json({ ok: false, error: "Seçilen yazılım müşterisi bulunamadı." }, 400);

    if (parsed.value.kind === "package" && parsed.value.packageId) {
      const [item] = await db.select({ id: packages.id }).from(packages).where(eq(packages.id, parsed.value.packageId)).limit(1);
      if (!item) return json({ ok: false, error: "Seçilen paket bulunamadı." }, 400);
    }
    if (parsed.value.kind === "module" && parsed.value.moduleId) {
      const [item] = await db.select({ id: modules.id }).from(modules).where(eq(modules.id, parsed.value.moduleId)).limit(1);
      if (!item) return json({ ok: false, error: "Seçilen modül bulunamadı." }, 400);
    }

    const duplicateWhere = parsed.value.kind === "module"
      ? and(
        eq(softwareOrders.customerId, parsed.value.customerId),
        eq(softwareOrders.kind, "module"),
        eq(softwareOrders.moduleId, parsed.value.moduleId),
        ne(softwareOrders.status, "cancelled"),
        ne(softwareOrders.id, id),
      )
      : and(
        eq(softwareOrders.customerId, parsed.value.customerId),
        eq(softwareOrders.kind, "package"),
        eq(softwareOrders.packageId, parsed.value.packageId),
        ne(softwareOrders.status, "cancelled"),
        ne(softwareOrders.id, id),
      );
    const [duplicate] = await db.select({ id: softwareOrders.id }).from(softwareOrders).where(duplicateWhere).limit(1);
    if (duplicate) {
      return json({ ok: false, error: "Bu işletmede aynı paket veya modül için açık sipariş zaten var.", id: duplicate.id }, 409);
    }

    const existingTime = Date.parse(existing.updatedAt);
    const updatedAt = new Date(Math.max(Date.now(), Number.isFinite(existingTime) ? existingTime + 1 : 0)).toISOString();
    const updated = await db.update(softwareOrders)
      .set({ ...parsed.value, updatedAt })
      .where(and(eq(softwareOrders.id, id), eq(softwareOrders.updatedAt, expectedUpdatedAt)))
      .returning({ id: softwareOrders.id, updatedAt: softwareOrders.updatedAt });

    if (!updated[0]) return json({ ok: false, error: "Kayıt başka bir yönetici tarafından güncellendi. Sayfayı yenileyin." }, 409);
    return json({ ok: true, id: updated[0].id, updatedAt: updated[0].updatedAt }, 200);
  } catch (cause) {
    console.error("Software order update failed", cause);
    return json({ ok: false, error: "Sipariş şu anda güncellenemedi." }, 503);
  }
}
