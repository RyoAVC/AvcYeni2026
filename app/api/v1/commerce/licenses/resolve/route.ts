import { and, eq } from "drizzle-orm";
import { commerceLicenseInstallations } from "../../../../../../db/schema";
import {
  issueCommerceLicense, normalizeCommerceDomain, sha256, signActivationResponse, validCommerceIdentifier,
} from "../../../../../commerce-license-control-plane.mjs";

export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store", "Content-Type": "application/json; charset=utf-8" };
const respond = (value: Record<string, unknown>, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(value), { status, headers: { ...noStore, ...extra } });

export async function POST(request: Request) {
  if (!(request.headers.get("content-type") ?? "").includes("application/json")) return respond({ ok: false, code: "content_type_required" }, 415);
  const length = Number(request.headers.get("content-length") ?? "0");
  if (length > 8192) return respond({ ok: false, code: "payload_too_large" }, 413);
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return respond({ ok: false, code: "invalid_json" }, 400); }
  const activationToken = String(request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  const storeKey = String(body.store_key ?? "").trim();
  const installationId = String(body.installation_id ?? "").trim();
  const domain = normalizeCommerceDomain(body.primary_domain);
  const commerceVersion = String(body.commerce_version ?? "").trim();
  if (!activationToken.startsWith("avc_live_") || !validCommerceIdentifier(storeKey) || !validCommerceIdentifier(installationId) || !domain || !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(commerceVersion)) {
    return respond({ ok: false, code: "invalid_request" }, 400);
  }

  try {
    const [{ env }, { getDb }, { ensureCommerceLicenseTables }] = await Promise.all([import("cloudflare:workers"), import("../../../../../../db"), import("../../../../../local-d1-schema.mjs")]);
    const privateKey = String((env as Record<string, unknown>).COMMERCE_LICENSE_PRIVATE_KEY_PKCS8 ?? "").trim();
    const publicKey = String((env as Record<string, unknown>).COMMERCE_LICENSE_PUBLIC_KEY ?? "").trim();
    if (!privateKey || !publicKey) return respond({ ok: false, code: "issuer_not_configured" }, 503);
    await ensureCommerceLicenseTables(env);
    const db = getDb();
    const tokenHash = await sha256(activationToken);
    const [installation] = await db.select().from(commerceLicenseInstallations).where(and(
      eq(commerceLicenseInstallations.storeKey, storeKey),
      eq(commerceLicenseInstallations.installationId, installationId),
      eq(commerceLicenseInstallations.activationTokenHash, tokenHash),
    )).limit(1);
    if (!installation || installation.status !== "active" || normalizeCommerceDomain(installation.primaryDomain) !== domain) {
      return respond({ ok: false, code: "license_denied" }, 403);
    }
    const now = new Date();
    const validUntil = new Date(installation.validUntil);
    if (!Number.isFinite(validUntil.getTime()) || validUntil <= now) return respond({ ok: false, code: "license_expired" }, 403);
    const scopes = JSON.parse(installation.scopesJson || "[]");
    const limits = JSON.parse(installation.limitsJson || "{}");
    const license = await issueCommerceLicense({
      store_key: storeKey, installation_id: installationId, plan: installation.plan,
      commerce_version: installation.commerceVersion, issued_at: now.toISOString(), valid_until: validUntil.toISOString(), scopes, limits,
    }, privateKey);
    await db.update(commerceLicenseInstallations).set({ lastSeenAt: now.toISOString(), lastSeenVersion: commerceVersion, updatedAt: now.toISOString() }).where(eq(commerceLicenseInstallations.id, installation.id));
    const responseBody = JSON.stringify({ ok: true, format: "avci-commerce-license.v1", license, public_key: publicKey, valid_until: validUntil.toISOString() });
    return new Response(responseBody, { status: 200, headers: { ...noStore, "X-Avci-Activation-Signature": await signActivationResponse(responseBody, activationToken) } });
  } catch (cause) {
    console.error("Commerce license resolution failed", cause);
    return respond({ ok: false, code: "license_service_unavailable" }, 503);
  }
}
