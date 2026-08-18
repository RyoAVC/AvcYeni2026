import { eq } from "drizzle-orm";
import { siteAssets } from "../../../../db/schema";
import { getAdminUser } from "../../../admin-auth";
import { validateAdminMultipartRequest, validateAdminOrigin } from "../../../admin-request.mjs";
import { LOGO_KINDS, parseLogoBytes, parseLogoKind } from "../../../site-logo.mjs";

function json(body: Record<string, unknown>, status: number) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin.user) return json({ ok: false, error: "Oturum açmanız gerekiyor." }, 401);
  if (!admin.authorized) return json({ ok: false, error: "Bu işlem için yetkiniz yok." }, 403);

  const requestFailure = validateAdminMultipartRequest(request);
  if (requestFailure) return json({ ok: false, error: requestFailure.error }, requestFailure.status);

  let file: File | null = null;
  let kind = LOGO_KINDS.night;
  try {
    const form = await request.formData();
    const uploaded = form.get("logo");
    file = uploaded instanceof File ? uploaded : null;
    kind = parseLogoKind(String(form.get("kind") ?? "night"));
  } catch {
    return json({ ok: false, error: "Logo dosyası okunamadı." }, 400);
  }

  if (!file) return json({ ok: false, error: "Logo dosyası seçin." }, 400);

  const parsed = parseLogoBytes(await file.arrayBuffer(), file.type);
  if (!parsed.ok) return json({ ok: false, error: parsed.error }, 400);

  try {
    const { getDb } = await import("../../../../db");
    const db = getDb();
    const now = new Date().toISOString();
    await db
      .insert(siteAssets)
      .values({ kind, mime: parsed.mime, data: parsed.data, updatedAt: now })
      .onConflictDoUpdate({
        target: siteAssets.kind,
        set: { mime: parsed.mime, data: parsed.data, updatedAt: now },
      });
    return json({ ok: true, kind }, 200);
  } catch (cause) {
    console.error("Site logo upload failed", cause);
    return json({ ok: false, error: "Logo şu anda kaydedilemedi." }, 503);
  }
}

export async function DELETE(request: Request) {
  const admin = await getAdminUser();
  if (!admin.user) return json({ ok: false, error: "Oturum açmanız gerekiyor." }, 401);
  if (!admin.authorized) return json({ ok: false, error: "Bu işlem için yetkiniz yok." }, 403);

  const originFailure = validateAdminOrigin(request);
  if (originFailure) return json({ ok: false, error: originFailure.error }, originFailure.status);

  const kind = parseLogoKind(new URL(request.url).searchParams.get("kind") ?? "night");

  try {
    const { getDb } = await import("../../../../db");
    const db = getDb();
    await db.delete(siteAssets).where(eq(siteAssets.kind, kind));
    if (kind === LOGO_KINDS.night) {
      await db.delete(siteAssets).where(eq(siteAssets.kind, LOGO_KINDS.legacy));
    }
    return json({ ok: true, kind }, 200);
  } catch (cause) {
    console.error("Site logo delete failed", cause);
    return json({ ok: false, error: "Logo şu anda çıkarılamadı." }, 503);
  }
}
