import { and, desc, eq } from "drizzle-orm";
import { commerceLicenseInstallations, commerceModulePackages, customers } from "../../../../../../db/schema";
import { normalizeCommerceDomain, resolveCommerceInstallationCandidate, sha256, validCommerceIdentifier } from "../../../../../commerce-license-control-plane.mjs";
import { ensureCommerceLicenseTables } from "../../../../../local-d1-schema.mjs";
import { readRuntimeEnv } from "../../../../../runtime-env.mjs";

export const dynamic = "force-dynamic";
const PRODUCT = "avci-commerce";
const noStore = { "Cache-Control": "no-store", "Content-Type": "application/json; charset=utf-8" };
const respond = (value: Record<string, unknown>, status = 200) => new Response(JSON.stringify(value), { status, headers: noStore });

export async function POST(request: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const moduleKey = String(key || "").trim();
  if (!/^[A-Za-z][A-Za-z0-9-]*$/.test(moduleKey)) return respond({ ok: false, code: "invalid_module_key" }, 400);
  if (!(request.headers.get("content-type") ?? "").includes("application/json")) return respond({ ok: false, code: "content_type_required" }, 415);
  const length = Number(request.headers.get("content-length") ?? "0");
  if (length > 8192) return respond({ ok: false, code: "payload_too_large" }, 413);
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return respond({ ok: false, code: "invalid_json" }, 400); }
  const bearer = String(request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  const licenseKey = String(body.license_key ?? bearer).trim();
  const storeKey = String(body.store_key ?? "").trim();
  const installationId = String(body.installation_id ?? "").trim();
  const domain = normalizeCommerceDomain(body.domain ?? body.primary_domain);
  const hasStoreKey = Boolean(storeKey);
  const hasInstallationId = Boolean(installationId);
  const explicitIdentity = hasStoreKey && hasInstallationId;
  if (!licenseKey.startsWith("avc_live_") || hasStoreKey !== hasInstallationId || (explicitIdentity && (!validCommerceIdentifier(storeKey) || !validCommerceIdentifier(installationId))) || !domain) {
    return respond({ ok: false, code: "invalid_request" }, 400);
  }

  try {
    const [{ getDb }, env] = await Promise.all([import("../../../../../../db"), readRuntimeEnv()]);
    await ensureCommerceLicenseTables(env);
    const db = getDb();
    const tokenHash = await sha256(licenseKey);

    const candidates = explicitIdentity
      ? await db.select().from(commerceLicenseInstallations).where(and(eq(commerceLicenseInstallations.storeKey, storeKey), eq(commerceLicenseInstallations.installationId, installationId), eq(commerceLicenseInstallations.activationTokenHash, tokenHash), eq(commerceLicenseInstallations.product, PRODUCT))).limit(2)
      : await db.select().from(commerceLicenseInstallations).where(and(eq(commerceLicenseInstallations.activationTokenHash, tokenHash), eq(commerceLicenseInstallations.product, PRODUCT))).limit(3);
    const resolved = resolveCommerceInstallationCandidate(candidates, domain);
    if (resolved.outcome === "ambiguous") return respond({ ok: false, code: "license_ambiguous" }, 409);
    const installation = resolved.installation;
    const customer = installation ? (await db.select({ id: customers.id, status: customers.status }).from(customers).where(eq(customers.id, installation.customerId)).limit(1))[0] : undefined;
    const domainMatches = installation && normalizeCommerceDomain(installation.primaryDomain) === domain;
    if (!installation || !customer || customer.status !== "active" || !["active", "trial"].includes(installation.status) || !domainMatches) {
      return respond({ ok: false, code: "license_denied" }, 403);
    }
    if (new Date(installation.validUntil) <= new Date()) return respond({ ok: false, code: "license_expired" }, 403);

    const scopes: string[] = JSON.parse(installation.scopesJson || "[]");
    const [pkg] = await db.select().from(commerceModulePackages).where(eq(commerceModulePackages.moduleKey, moduleKey)).orderBy(desc(commerceModulePackages.createdAt)).limit(1);
    if (!pkg) return respond({ ok: false, code: "package_not_found" }, 404);
    if (!scopes.includes(pkg.licenseScope)) return respond({ ok: false, code: "module_not_entitled" }, 403);

    return respond({
      ok: true,
      format: "avci-commerce.module-package-download.v1",
      key: pkg.moduleKey,
      version: pkg.version,
      sha256: pkg.sha256,
      size_bytes: pkg.sizeBytes,
      content_base64: pkg.contentBase64,
    });
  } catch (cause) {
    console.error("Commerce module package download failed", cause);
    return respond({ ok: false, code: "module_package_service_unavailable" }, 503);
  }
}
