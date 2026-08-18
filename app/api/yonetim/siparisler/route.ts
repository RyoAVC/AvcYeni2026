import { and, eq, ne } from "drizzle-orm";
import { customers, modules, packages, softwareOrders } from "../../../../db/schema";
import { getAdminUser } from "../../../admin-auth";
import { readAdminJsonObject, validateAdminMutationRequest } from "../../../admin-request.mjs";
import { parseSoftwareOrderRecord } from "../../../software-order-admin.mjs";

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

  const parsed = parseSoftwareOrderRecord(parsedPayload.value);
  if (!parsed.ok) return json({ ok: false, error: parsed.error }, 400);

  try {
    const { getDb } = await import("../../../../db");
    const db = getDb();
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
      )
      : and(
        eq(softwareOrders.customerId, parsed.value.customerId),
        eq(softwareOrders.kind, "package"),
        eq(softwareOrders.packageId, parsed.value.packageId),
        ne(softwareOrders.status, "cancelled"),
      );
    const [duplicate] = await db.select({ id: softwareOrders.id }).from(softwareOrders).where(duplicateWhere).limit(1);
    if (duplicate) {
      return json({ ok: false, error: "Bu işletmede aynı paket veya modül için açık sipariş zaten var.", id: duplicate.id }, 409);
    }

    const now = new Date().toISOString();
    const inserted = await db.insert(softwareOrders).values({
      ...parsed.value,
      createdByEmail: admin.user.email,
      createdAt: now,
      updatedAt: now,
    }).returning({ id: softwareOrders.id });

    return json({ ok: true, id: inserted[0]?.id }, 201);
  } catch (cause) {
    console.error("Software order create failed", cause);
    return json({ ok: false, error: "Sipariş şu anda kaydedilemedi." }, 503);
  }
}
