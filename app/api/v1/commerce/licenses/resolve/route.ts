import { and, eq, gte, sql } from "drizzle-orm";
import { commerceLicenseInstallations, commerceLicenseVerificationEvents, customers } from "../../../../../../db/schema";
import { issueCommerceLicense, normalizeCommerceDomain, sha256, signActivationResponse, validCommerceIdentifier } from "../../../../../commerce-license-control-plane.mjs";
import { ensureCommerceLicenseTables } from "../../../../../local-d1-schema.mjs";
import { readRuntimeEnv } from "../../../../../runtime-env.mjs";

export const dynamic = "force-dynamic";
const PRODUCT = "avci-commerce";
const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT = 20;
const noStore = { "Cache-Control": "no-store", "Content-Type": "application/json; charset=utf-8" };
const respond = (value: Record<string, unknown>, status = 200, extra: Record<string, string> = {}) => new Response(JSON.stringify(value), { status, headers: { ...noStore, ...extra } });
const ipOf = (request: Request) => String(request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "").split(",", 1)[0].trim().slice(0, 80);

export async function POST(request: Request) {
  if (!(request.headers.get("content-type") ?? "").includes("application/json")) return respond({ ok: false, code: "content_type_required" }, 415);
  const length = Number(request.headers.get("content-length") ?? "0");
  if (length > 8192) return respond({ ok: false, code: "payload_too_large" }, 413);
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return respond({ ok: false, code: "invalid_json" }, 400); }
  const bearer = String(request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  const licenseKey = String(body.license_key ?? body.activation_token ?? bearer).trim();
  const storeKey = String(body.store_key ?? "").trim();
  const installationId = String(body.installation_id ?? "").trim();
  const domain = normalizeCommerceDomain(body.domain ?? body.primary_domain);
  const product = String(body.product ?? PRODUCT).trim().toLowerCase();
  const commerceVersion = String(body.commerce_version ?? "").trim();
  if (!licenseKey.startsWith("avc_live_") || !validCommerceIdentifier(storeKey) || !validCommerceIdentifier(installationId) || !domain || product !== PRODUCT || (commerceVersion && !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(commerceVersion))) return respond({ ok: false, code: "invalid_request" }, 400);

  try {
    const [{ getDb }, env] = await Promise.all([import("../../../../../../db"), readRuntimeEnv()]);
    const privateKey = String(env.COMMERCE_LICENSE_PRIVATE_KEY_PKCS8 ?? "").trim();
    const publicKey = String(env.COMMERCE_LICENSE_PUBLIC_KEY ?? "").trim();
    const keyId = String(env.COMMERCE_LICENSE_KEY_ID ?? "avci-commerce-ed25519-v1").trim().slice(0, 80);
    if (!privateKey || !publicKey) return respond({ ok: false, code: "issuer_not_configured" }, 503);
    await ensureCommerceLicenseTables(env);
    const db = getDb();
    const tokenHash = await sha256(licenseKey);
    const requestHash = await sha256(`${tokenHash}|${product}|${storeKey}|${installationId}|${domain}`);
    const windowStart = new Date(Date.now() - RATE_WINDOW_MS).toISOString();
    const [rate] = await db.select({ total: sql<number>`count(*)` }).from(commerceLicenseVerificationEvents).where(and(eq(commerceLicenseVerificationEvents.requestHash, requestHash), gte(commerceLicenseVerificationEvents.createdAt, windowStart)));
    if (Number(rate?.total || 0) >= RATE_LIMIT) return respond({ ok: false, code: "rate_limited", retry_after: 900 }, 429, { "Retry-After": "900" });

    const [installation] = await db.select().from(commerceLicenseInstallations).where(and(eq(commerceLicenseInstallations.storeKey, storeKey), eq(commerceLicenseInstallations.installationId, installationId), eq(commerceLicenseInstallations.activationTokenHash, tokenHash), eq(commerceLicenseInstallations.product, product))).limit(1);
    const customer = installation ? (await db.select({ id: customers.id, status: customers.status, domainName: customers.domainName }).from(customers).where(eq(customers.id, installation.customerId)).limit(1))[0] : undefined;
    const customerDomain = normalizeCommerceDomain(customer?.domainName);
    const domainMatches = installation && normalizeCommerceDomain(installation.primaryDomain) === domain && (!customerDomain || customerDomain === domain);
    if (!installation || !customer || customer.status !== "active" || !["active", "trial"].includes(installation.status) || !domainMatches) {
      await db.insert(commerceLicenseVerificationEvents).values({ licenseId: installation?.id || 0, customerId: installation?.customerId || 0, requestHash, ipAddress: ipOf(request), outcome: "denied" });
      return respond({ ok: false, code: "license_denied" }, 403);
    }
    const now = new Date();
    const issuedAt = now.toISOString();
    const validUntil = new Date(installation.validUntil);
    if (!Number.isFinite(validUntil.getTime()) || validUntil <= now) {
      await db.insert(commerceLicenseVerificationEvents).values({ licenseId: installation.id, customerId: installation.customerId, requestHash, ipAddress: ipOf(request), outcome: "expired" });
      return respond({ ok: false, code: "license_expired" }, 403);
    }
    const modules = JSON.parse(installation.scopesJson || "[]");
    const limits = JSON.parse(installation.limitsJson || "{}");
    const entitlement = { product, customer_id: installation.customerId, store_key: storeKey, installation_id: installationId, domain, status: installation.status, plan: installation.plan, commerce_version: installation.commerceVersion, modules, limits, issued_at: issuedAt, expires_at: validUntil.toISOString(), key_id: keyId };
    const license = await issueCommerceLicense(entitlement, privateKey);
    const signature = license.split(".", 2)[1];
    await db.update(commerceLicenseInstallations).set({ activationCount: (installation.activationCount || 0) + 1, firstActivatedAt: installation.firstActivatedAt || issuedAt, lastSeenAt: issuedAt, lastSeenVersion: commerceVersion || installation.lastSeenVersion, updatedAt: issuedAt }).where(eq(commerceLicenseInstallations.id, installation.id));
    await db.insert(commerceLicenseVerificationEvents).values({ licenseId: installation.id, customerId: installation.customerId, requestHash, ipAddress: ipOf(request), outcome: "granted", createdAt: issuedAt });
    const responseValue = { ok: true, format: "avci-commerce-entitlement.v2", entitlement, license, signature, key_id: keyId, issued_at: issuedAt, expires_at: validUntil.toISOString(), public_key: publicKey };
    const responseBody = JSON.stringify(responseValue);
    return new Response(responseBody, { status: 200, headers: { ...noStore, "X-Avci-Activation-Signature": await signActivationResponse(responseBody, licenseKey) } });
  } catch (cause) {
    console.error("Commerce license resolution failed", cause);
    const message = cause instanceof Error ? cause.message.toLowerCase() : "";
    const code = message.includes("binding") || message.includes("database")
      ? "license_database_unavailable"
      : message.includes("no such table") || message.includes("no such column") || message.includes("duplicate column") || message.includes("pragma")
        ? "license_schema_unavailable"
        : message.includes("key") || message.includes("ed25519") || message.includes("pkcs8")
          ? "license_signer_unavailable"
          : "license_service_unavailable";
    return respond({ ok: false, code }, 503);
  }
}
