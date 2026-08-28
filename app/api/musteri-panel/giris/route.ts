import { eq } from "drizzle-orm";
import { customerPortalCredentials, customerPortalLoginAttempts, customers } from "../../../../db/schema";
import { clientAddress, loginAttemptKey } from "../../../admin-session.mjs";
import { verifyCustomerPassword } from "../../../customer-password.mjs";
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
    const password = String(form.get("password") ?? "");
    if (!email || password.length < 1 || password.length > 128) return redirectResponse(request, failPath(next, "hata"));

    await ensureCommerceLicenseTables(env);
    const { getDb } = await import("../../../../db");
    const db = getDb();
    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.email, email))
      .limit(1);

    const attemptKey = await loginAttemptKey(config.secret, email, clientAddress(request));
    const [attempt] = await db.select().from(customerPortalLoginAttempts).where(eq(customerPortalLoginAttempts.attemptKey, attemptKey)).limit(1);
    const now = new Date();
    const windowStart = new Date(attempt?.windowStart ?? "");
    const inWindow = Number.isFinite(windowStart.getTime()) && now.getTime() - windowStart.getTime() < 15 * 60 * 1000;
    if (attempt && inWindow && attempt.failCount >= 5) return redirectResponse(request, failPath(next, "hata"));

    const [credential] = customer
      ? await db.select().from(customerPortalCredentials).where(eq(customerPortalCredentials.customerId, customer.id)).limit(1)
      : [];
    const dummyHash = "pbkdf2-sha256$210000$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
    const passwordOk = await verifyCustomerPassword(password, credential?.passwordHash ?? dummyHash);
    if (!customer || !["active", "trial"].includes(customer.status) || !credential || !passwordOk) {
      const nextCount = inWindow ? Number(attempt?.failCount ?? 0) + 1 : 1;
      const startedAt = inWindow ? (attempt?.windowStart ?? now.toISOString()) : now.toISOString();
      await db.insert(customerPortalLoginAttempts).values({ attemptKey, failCount: nextCount, windowStart: startedAt, updatedAt: now.toISOString() })
        .onConflictDoUpdate({ target: customerPortalLoginAttempts.attemptKey, set: { failCount: nextCount, windowStart: startedAt, updatedAt: now.toISOString() } });
      return redirectResponse(request, failPath(next, "hata"));
    }
    await db.delete(customerPortalLoginAttempts).where(eq(customerPortalLoginAttempts.attemptKey, attemptKey));

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
