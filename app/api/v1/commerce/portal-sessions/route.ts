import { and, eq } from "drizzle-orm";
import { commerceLicenseInstallations, commercePortalLoginCodes } from "../../../../../db/schema";
import { SITE_BASE_URL } from "../../../../base-path";
import { base64Url, normalizeCommerceDomain, sha256, signActivationResponse, validCommerceIdentifier } from "../../../../commerce-license-control-plane.mjs";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!(request.headers.get("content-type") ?? "").includes("application/json")) return Response.json({ ok: false, code: "content_type_required" }, { status: 415 });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return Response.json({ ok: false, code: "invalid_json" }, { status: 400 }); }
  const activationToken = String(request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  const storeKey = String(body.store_key ?? "").trim();
  const installationId = String(body.installation_id ?? "").trim();
  const domain = normalizeCommerceDomain(body.primary_domain);
  if (!activationToken.startsWith("avc_live_") || !validCommerceIdentifier(storeKey) || !validCommerceIdentifier(installationId) || !domain) return Response.json({ ok: false, code: "invalid_request" }, { status: 400 });
  try {
    const { getDb } = await import("../../../../../db");
    const db = getDb();
    const [installation] = await db.select().from(commerceLicenseInstallations).where(and(
      eq(commerceLicenseInstallations.storeKey, storeKey), eq(commerceLicenseInstallations.installationId, installationId),
      eq(commerceLicenseInstallations.activationTokenHash, await sha256(activationToken)),
    )).limit(1);
    if (!installation || installation.status !== "active" || normalizeCommerceDomain(installation.primaryDomain) !== domain || new Date(installation.validUntil) <= new Date()) return Response.json({ ok: false, code: "license_denied" }, { status: 403 });
    const code = `avc_portal_${base64Url(crypto.getRandomValues(new Uint8Array(32)))}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 120000).toISOString();
    await db.insert(commercePortalLoginCodes).values({ installationId: installation.id, customerId: installation.customerId, codeHash: await sha256(code), expiresAt, createdAt: now.toISOString() });
    const result = JSON.stringify({ ok: true, format: "avci-customer-portal-session.v1", login_url: `${SITE_BASE_URL}/api/v1/commerce/portal-sessions/consume?code=${encodeURIComponent(code)}`, expires_at: expiresAt });
    return new Response(result, { headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Avci-Activation-Signature": await signActivationResponse(result, activationToken) } });
  } catch (cause) {
    console.error("Commerce portal session creation failed", cause);
    return Response.json({ ok: false, code: "portal_session_unavailable" }, { status: 503 });
  }
}
