import { eq } from "drizzle-orm";
import { customers } from "../../../../db/schema";
import { canUseCustomerPortalLogin } from "../../../customer-portal-dev.mjs";
import { normalizeEmailAddress } from "../../../email-normalization.mjs";
import { isSameRequestOrigin } from "../../../request-origin";
import {
  createCustomerSessionToken,
  customerSessionCookie,
  getCustomerPortalConfig,
  safeCustomerNextPath,
} from "../../../customer-session.mjs";

function redirectTo(request: Request, path: string, cookie?: string) {
  const headers = new Headers({ Location: new URL(path, request.url).toString(), "Cache-Control": "no-store" });
  if (cookie) headers.append("Set-Cookie", cookie);
  return new Response(null, { status: 303, headers });
}

function failPath(next: string, reason: "hata" | "kapali" | "ayar") {
  const params = new URLSearchParams();
  if (next !== "/musteri-panel") params.set("next", next);
  params.set("durum", reason);
  return `/musteri-panel/giris?${params.toString()}`;
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (!isSameRequestOrigin(request, origin)) {
        return redirectTo(request, failPath("/musteri-panel", "hata"));
      }
    } catch {
      return redirectTo(request, failPath("/musteri-panel", "hata"));
    }
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/x-www-form-urlencoded") && !contentType.includes("multipart/form-data")) {
    return redirectTo(request, failPath("/musteri-panel", "hata"));
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return redirectTo(request, failPath("/musteri-panel", "hata"));
  }

  const next = safeCustomerNextPath(String(form.get("next") ?? "/musteri-panel"));
  if (String(form.get("website") ?? "").trim()) {
    return redirectTo(request, failPath(next, "hata"));
  }

  const { env } = await import("cloudflare:workers");
  if (!canUseCustomerPortalLogin(request, env as Record<string, unknown>)) {
    return redirectTo(request, failPath(next, "kapali"));
  }

  const config = getCustomerPortalConfig(env as Record<string, unknown>);
  if (!config.ready) return redirectTo(request, failPath(next, "ayar"));

  const email = normalizeEmailAddress(String(form.get("email") ?? ""));
  if (!email) return redirectTo(request, failPath(next, "hata"));

  try {
    const { getDb } = await import("../../../../db");
    const db = getDb();
    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.email, email))
      .limit(1);

    if (!customer || customer.status !== "active") {
      return redirectTo(request, failPath(next, "hata"));
    }

    const token = await createCustomerSessionToken(config.secret, {
      customerId: customer.id,
      email: customer.email,
      displayName: customer.company || customer.name,
    });
    return redirectTo(request, next, customerSessionCookie(token, new URL(request.url).protocol === "https:"));
  } catch (cause) {
    console.error("Customer portal login failed", cause);
    return redirectTo(request, failPath(next, "hata"));
  }
}
