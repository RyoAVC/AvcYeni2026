import { eq } from "drizzle-orm";
import { packages } from "../../../../db/schema";
import { getAdminUser } from "../../../admin-auth";
import { readAdminJsonObject, validateAdminMutationRequest } from "../../../admin-request.mjs";
import { parsePackageRecord } from "../../../package-admin.mjs";

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

  const parsed = parsePackageRecord(parsedPayload.value);
  if (!parsed.ok) return json({ ok: false, error: parsed.error }, 400);

  try {
    const { getDb } = await import("../../../../db");
    const db = getDb();
    const [existing] = await db.select({ id: packages.id }).from(packages).where(eq(packages.slug, parsed.value.slug)).limit(1);
    if (existing) return json({ ok: false, error: "Bu kısa kod ile kayıtlı bir paket var." }, 409);

    const now = new Date().toISOString();
    const inserted = await db.insert(packages).values({
      ...parsed.value,
      createdAt: now,
      updatedAt: now,
    }).returning({ id: packages.id });

    return json({ ok: true, id: inserted[0]?.id }, 201);
  } catch (cause) {
    console.error("Package create failed", cause);
    return json({ ok: false, error: "Paket şu anda kaydedilemedi." }, 503);
  }
}
