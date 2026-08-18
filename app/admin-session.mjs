import { safeRelativeReturnPath } from "./auth-return-path.mjs";
import { normalizeEmailAddress } from "./email-normalization.mjs";

export const ADMIN_SESSION_COOKIE = "avci_admin";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 12;
export const ADMIN_LOGIN_WINDOW_MS = 15 * 60 * 1000;
export const ADMIN_LOGIN_MAX_FAILURES = 5;
const encoder = new TextEncoder();

export function bytesToBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

export function base64UrlToBytes(value) {
  if (typeof value !== "string" || !value) return null;
  try {
    const padded = value.replaceAll("-", "+").replaceAll("_", "/");
    const binary = atob(padded);
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
  } catch {
    return null;
  }
}

export function equalBytes(left, right) {
  if (!(left instanceof Uint8Array) || !(right instanceof Uint8Array) || left.length !== right.length) return false;
  let diff = 0;
  for (let index = 0; index < left.length; index += 1) diff |= left[index] ^ right[index];
  return diff === 0;
}

export async function hmacSha256(secret, message) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(message)));
}

export async function secretsMatch(secret, given, expected) {
  if (typeof given !== "string" || typeof expected !== "string" || !secret) return false;
  const [left, right] = await Promise.all([
    hmacSha256(secret, `pwd|${given}`),
    hmacSha256(secret, `pwd|${expected}`),
  ]);
  return equalBytes(left, right);
}

export function readNamedCookie(cookieHeader, name) {
  if (typeof cookieHeader !== "string" || !cookieHeader) return "";
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  if (!match?.[1]) return "";
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return "";
  }
}

export function safeAdminNextPath(value) {
  const path = safeRelativeReturnPath(value);
  if (!path.startsWith("/yonetim")) return "/yonetim";
  if (path === "/yonetim/giris" || path.startsWith("/yonetim/giris?")) return "/yonetim";
  return path;
}

export function adminLoginPath(returnTo) {
  const next = safeAdminNextPath(returnTo);
  return next === "/yonetim" ? "/yonetim/giris" : `/yonetim/giris?next=${encodeURIComponent(next)}`;
}

export function clientAddress(request) {
  const cf = request.headers.get("cf-connecting-ip")?.trim();
  if (cf) return cf.slice(0, 64);
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (forwarded) return forwarded.slice(0, 64);
  return "local";
}

export async function loginAttemptKey(secret, email, address) {
  const digest = await hmacSha256(secret, `attempt|${normalizeEmailAddress(email)}|${address}`);
  return bytesToBase64Url(digest);
}

export async function createAdminSessionToken(secret, { email, displayName, now = Date.now() }) {
  const payload = bytesToBase64Url(encoder.encode(JSON.stringify({
    e: normalizeEmailAddress(email),
    n: String(displayName || email).slice(0, 80),
    iat: Math.floor(now / 1000),
    exp: Math.floor(now / 1000) + ADMIN_SESSION_MAX_AGE,
    jti: crypto.randomUUID(),
  })));
  const signature = bytesToBase64Url(await hmacSha256(secret, payload));
  return `v1.${payload}.${signature}`;
}

export async function readAdminSessionToken(secret, token) {
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
    if (typeof data.e !== "string" || typeof data.n !== "string" || !Number.isFinite(data.exp)) return null;
    if (data.exp * 1000 <= Date.now()) return null;
    const email = normalizeEmailAddress(data.e);
    if (!email) return null;
    return { email, displayName: data.n.slice(0, 80) };
  } catch {
    return null;
  }
}

export function adminSessionCookie(token, secure) {
  const parts = [
    `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(token)}`,
    "Path=/",
    `Max-Age=${ADMIN_SESSION_MAX_AGE}`,
    "SameSite=Lax",
    "HttpOnly",
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export function clearAdminSessionCookie(secure) {
  const parts = [
    `${ADMIN_SESSION_COOKIE}=`,
    "Path=/",
    "Max-Age=0",
    "SameSite=Lax",
    "HttpOnly",
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export function isLocalAdminHost(host) {
  const value = String(host ?? "").split(":")[0].trim().toLowerCase();
  return value === "127.0.0.1" || value === "localhost" || value === "[::1]";
}

export function localAdminPrefillEmail(env, host) {
  if (!isLocalAdminHost(host)) return "";
  return getAdminLoginConfig(env).email;
}

export function getAdminLoginConfig(env) {
  const email = normalizeEmailAddress(typeof env?.ADMIN_LOGIN_EMAIL === "string" ? env.ADMIN_LOGIN_EMAIL : "");
  const password = typeof env?.ADMIN_LOGIN_PASSWORD === "string" ? env.ADMIN_LOGIN_PASSWORD : "";
  const secret = typeof env?.ADMIN_SESSION_SECRET === "string" ? env.ADMIN_SESSION_SECRET.trim() : "";
  return {
    email,
    password,
    secret,
    ready: Boolean(email && password.length >= 10 && secret.length >= 32),
  };
}
