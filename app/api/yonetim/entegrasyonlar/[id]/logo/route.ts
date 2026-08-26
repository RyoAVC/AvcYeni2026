import { eq } from "drizzle-orm";
import { integrations, siteAssets } from "../../../../../../db/schema";
import { getAdminUser } from "../../../../../admin-auth";
import { validateAdminMultipartRequest } from "../../../../../admin-request.mjs";
import { parseLogoBytes } from "../../../../../site-logo.mjs";
import { logAdminAction } from "../../../../../audit-log.mjs";

const assetKind = (id: number) => `integration-logo-${id}`;
const json = (body: Record<string, unknown>, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const integrationId = Number((await params).id);
  if (!Number.isSafeInteger(integrationId) || integrationId < 1) return new Response(null, { status: 404 });
  try {
    const { getDb } = await import("../../../../../../db");
    const [asset] = await getDb().select().from(siteAssets).where(eq(siteAssets.kind, assetKind(integrationId))).limit(1);
    if (!asset) return new Response(null, { status: 404 });
    return new Response(asset.data, { headers: { "Content-Type": asset.mime, "Cache-Control": "public, max-age=300" } });
  } catch {
    return new Response(null, { status: 404 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminUser();
  if (!admin.user) return json({ ok: false, error: "Oturum açmanız gerekiyor." }, 401);
  if (!admin.authorized) return json({ ok: false, error: "Bu işlem için yetkiniz yok." }, 403);
  const failure = validateAdminMultipartRequest(request, 420_000);
  if (failure) return json({ ok: false, error: failure.error }, failure.status);
  const integrationId = Number((await params).id);
  if (!Number.isSafeInteger(integrationId) || integrationId < 1) return json({ ok: false, error: "Geçersiz entegrasyon." }, 400);

  const form = await request.formData().catch(() => null);
  const file = form?.get("logo");
  if (!(file instanceof File)) return json({ ok: false, error: "Logo dosyası seçin." }, 400);
  const parsed = parseLogoBytes(await file.arrayBuffer(), file.type);
  if (!parsed.ok) return json({ ok: false, error: parsed.error }, 400);

  try {
    const { getDb } = await import("../../../../../../db");
    const db = getDb();
    const [integration] = await db.select({ id: integrations.id }).from(integrations).where(eq(integrations.id, integrationId)).limit(1);
    if (!integration) return json({ ok: false, error: "Entegrasyon bulunamadı." }, 404);
    const now = new Date().toISOString();
    await db.insert(siteAssets).values({ kind: assetKind(integrationId), mime: parsed.mime, data: parsed.data, updatedAt: now })
      .onConflictDoUpdate({ target: siteAssets.kind, set: { mime: parsed.mime, data: parsed.data, updatedAt: now } });
    await logAdminAction(db, { userEmail: admin.user.email, action: "integration_logo_update", entity: "integration", entityId: String(integrationId), details: { mime: parsed.mime } });
    return json({ ok: true });
  } catch (cause) {
    console.error("Integration logo upload failed", cause);
    return json({ ok: false, error: "Logo kaydedilemedi." }, 503);
  }
}
