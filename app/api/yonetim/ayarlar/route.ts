import { siteSettings } from "../../../../db/schema";
import { getAdminUser } from "../../../admin-auth";
import { readAdminJsonObject, validateAdminMutationRequest } from "../../../admin-request.mjs";
import { loadRawSiteSettings, parseSiteSettings } from "../../../site-settings.mjs";

function json(body: Record<string, unknown>, status: number) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: Request) {
  const admin = await getAdminUser();
  if (!admin.user) return json({ ok: false, error: "Oturum açmanız gerekiyor." }, 401);
  if (!admin.authorized) return json({ ok: false, error: "Bu işlem için yetkiniz yok." }, 403);

  const requestFailure = validateAdminMutationRequest(request);
  if (requestFailure) return json({ ok: false, error: requestFailure.error }, requestFailure.status);

  const parsedPayload = await readAdminJsonObject(request);
  if (!parsedPayload.ok) return json({ ok: false, error: parsedPayload.error }, parsedPayload.status);

  const current = await loadRawSiteSettings();
  const parsed = parseSiteSettings(parsedPayload.value, current);
  if (!parsed.ok) return json({ ok: false, error: parsed.error }, 400);

  try {
    const { getDb } = await import("../../../../db");
    const db = getDb();
    const now = new Date().toISOString();

    for (const [key, value] of Object.entries(parsed.value)) {
      await db
        .insert(siteSettings)
        .values({ key, value, updatedAt: now })
        .onConflictDoUpdate({
          target: siteSettings.key,
          set: { value, updatedAt: now },
        });
    }

    return json({ ok: true }, 200);
  } catch (cause) {
    console.error("Site settings update failed", cause);
    return json({ ok: false, error: "Ayarlar şu anda kaydedilemedi." }, 503);
  }
}
