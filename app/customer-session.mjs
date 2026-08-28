import { safeRelativeReturnPath } from "./auth-return-path.mjs";
import { normalizeEmailAddress } from "./email-normalization.mjs";
import { runtimeEnvValue } from "./runtime-env.mjs";
import {
  base64UrlToBytes,
  bytesToBase64Url,
  equalBytes,
  hmacSha256,
  readNamedCookie,
} from "./admin-session.mjs";

export const CUSTOMER_SESSION_COOKIE = "avci_customer";
export const CUSTOMER_SESSION_MAX_AGE = 60 * 60 * 8;
const encoder = new TextEncoder();

export function getCustomerPortalConfig(env) {
  const secret =
    runtimeEnvValue(env, "CUSTOMER_SESSION_SECRET") ||
    runtimeEnvValue(env, "ADMIN_SESSION_SECRET");
  return {
    secret,
    ready: secret.length >= 32,
  };
}

export function safeCustomerNextPath(value) {
  const path = safeRelativeReturnPath(value);
  if (!path.startsWith("/musteri-panel")) return "/musteri-panel";
  if (path === "/musteri-panel/giris" || path.startsWith("/musteri-panel/giris?")) return "/musteri-panel";
  return path;
}

export function customerLoginPath(returnTo) {
  const next = safeCustomerNextPath(returnTo);
  return next === "/musteri-panel"
    ? "/musteri-panel/giris"
    : `/musteri-panel/giris?next=${encodeURIComponent(next)}`;
}

export async function createCustomerSessionToken(secret, { customerId, email, displayName, now = Date.now() }) {
  const payload = bytesToBase64Url(encoder.encode(JSON.stringify({
    c: customerId,
    e: normalizeEmailAddress(email),
    n: String(displayName || email).slice(0, 80),
    iat: Math.floor(now / 1000),
    exp: Math.floor(now / 1000) + CUSTOMER_SESSION_MAX_AGE,
    jti: crypto.randomUUID(),
  })));
  const signature = bytesToBase64Url(await hmacSha256(secret, payload));
  return `v1.${payload}.${signature}`;
}

export async function readCustomerSessionToken(secret, token) {
  if (typeof token !== "string" || !secret) return null;
  const [version, payload, signature] = token.split(".");
  if (version !== "v1" || !payload || !signature) return null;
  const expected = await hmacSha256(secret, payload);
  const given = base64UrlToBytes(signature);
  if (!given || !equalBytes(expected, given)) return null;
  const raw = base64UrlToBytes(payload);
  if (!raw) return null;
  try {
    const data = JSON.parse(new TextDecoder().decode(raw));
    if (!data || typeof data !== "object") return null;
    if (typeof data.e !== "string" || typeof data.n !== "string" || !Number.isFinite(data.exp) || !Number.isFinite(data.c)) {
      return null;
    }
    if (data.exp * 1000 <= Date.now()) return null;
    const email = normalizeEmailAddress(data.e);
    const customerId = Number(data.c);
    if (!email || !Number.isSafeInteger(customerId) || customerId < 1) return null;
    return { customerId, email, displayName: data.n.slice(0, 80) };
  } catch {
    return null;
  }
}

export function customerSessionCookie(token, secure) {
  const parts = [
    `${CUSTOMER_SESSION_COOKIE}=${encodeURIComponent(token)}`,
    "Path=/",
    `Max-Age=${CUSTOMER_SESSION_MAX_AGE}`,
    "SameSite=Lax",
    "HttpOnly",
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export function clearCustomerSessionCookie(secure) {
  const parts = [
    `${CUSTOMER_SESSION_COOKIE}=`,
    "Path=/",
    "Max-Age=0",
    "SameSite=Lax",
    "HttpOnly",
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export { readNamedCookie };
