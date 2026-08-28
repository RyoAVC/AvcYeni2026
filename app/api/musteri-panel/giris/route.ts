import { and, eq } from "drizzle-orm";
import { commerceLicenseInstallations, customers } from "../../../../db/schema";
import { sha256 } from "../../../commerce-license-control-plane.mjs";
import { canUseCustomerPortalLogin } from "../../../customer-portal-dev.mjs";
import { ensureCommerceLicenseTables } from "../../../local-d1-schema.mjs";
import { normalizeEmailAddress } from "../../../email-normalization.mjs";
import {
  readFormFields,
  readRuntimeEnv,
  redirectResponse,
  requestIsHttps,
} from "../../../form-post.mjs";
import { isSameRequestOrigin } from "../../../request-origin";
import {
  createCustomerSessionToken,
  customerSessionCookie,
  getCustomerPortalConfig,
  safeCustomerNextPath,
} from "../../../customer-session.mjs";

function failPath(next: string, reason: "hata" | "kapali" | "ayar") {
  const params = new URLSearchParams();
  if (next !== "/musteri-panel") params.set("next", next);
  params.set("durum", reason);
  return `/musteri-panel/giris?${params.toString()}`;
}

export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin");
    if (origin) {
      try {
        if (!isSameRequestOrigin(request, origin)) {
          return redirectResponse(request, failPath("/musteri-panel", "hata"));
        }
      } catch {
        return redirectResponse(request, failPath("/musteri-panel", "hata"));
      }
    }

    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.includes("application/x-www-form-urlencoded") && !contentType.includes("multipart/form-data")) {
      return redirectResponse(request, failPath("/musteri-panel", "hata"));
    }

    const form = await readFormFields(request);
    const next = safeCustomerNextPath(String(form.get("next") ?? "/musteri-panel"));
    if (String(form.get("website") ?? "").trim()) {
      return redirectResponse(request, failPath(next, "hata"));
    }

    const env = await readRuntimeEnv();
    if (!canUseCustomerPortalLogin(request, env)) {
      return redirectResponse(request, failPath(next, "kapali"));
    }

    const config = getCustomerPortalConfig(env);
    if (!config.ready) return redirectResponse(request, failPath(next, "ayar"));

    const email = normalizeEmailAddress(String(form.get("email") ?? ""));
    const licenseKey = String(form.get("license_key") ?? "").trim();
    if (!email || !licenseKey.startsWith("avc_live_")) return redirectResponse(request, failPath(next, "hata"));

    await ensureCommerceLicenseTables(env);
    const { getDb } = await import("../../../../db");
    const db = getDb();
    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.email, email))
      .limit(1);

    if (!customer || customer.status !== "active") {
      return redirectResponse(request, failPath(next, "hata"));
    }

    const tokenHash = await sha256(licenseKey);
    const [installation] = await db
      .select({ id: commerceLicenseInstallations.id, status: commerceLicenseInstallations.status, validUntil: commerceLicenseInstallations.validUntil })
      .from(commerceLicenseInstallations)
      .where(and(
        eq(commerceLicenseInstallations.customerId, customer.id),
        eq(commerceLicenseInstallations.activationTokenHash, tokenHash),
        eq(commerceLicenseInstallations.product, "avci-commerce"),
      ))
      .limit(1);
    const validUntil = new Date(installation?.validUntil ?? "");
    if (!installation || !["active", "trial"].includes(installation.status) || !Number.isFinite(validUntil.getTime()) || validUntil <= new Date()) {
      return redirectResponse(request, failPath(next, "hata"));
    }

    const token = await createCustomerSessionToken(config.secret, {
      customerId: customer.id,
      email: customer.email,
      displayName: customer.company || customer.name,
    });
    return redirectResponse(request, next, customerSessionCookie(token, requestIsHttps(request)));
  } catch (cause) {
    console.error("Customer portal login failed", cause);
    return redirectResponse(request, failPath("/musteri-panel", "hata"));
  }
}
