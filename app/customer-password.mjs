import { base64UrlToBytes, bytesToBase64Url, equalBytes } from "./admin-session.mjs";

export const CUSTOMER_PASSWORD_MIN_LENGTH = 12;
export const CUSTOMER_PASSWORD_MAX_LENGTH = 128;
export const CUSTOMER_PASSWORD_ITERATIONS = 210000;

const encoder = new TextEncoder();

export function validateCustomerPassword(password) {
  if (typeof password !== "string" || password.length < CUSTOMER_PASSWORD_MIN_LENGTH) {
    return { ok: false, error: `Panel parolası en az ${CUSTOMER_PASSWORD_MIN_LENGTH} karakter olmalı.` };
  }
  if (password.length > CUSTOMER_PASSWORD_MAX_LENGTH) return { ok: false, error: "Panel parolası çok uzun." };
  if (!/[a-zçğıöşü]/u.test(password) || !/[A-ZÇĞİÖŞÜ]/u.test(password) || !/\d/u.test(password)) {
    return { ok: false, error: "Panel parolası küçük harf, büyük harf ve rakam içermeli." };
  }
  return { ok: true };
}

async function derive(password, salt, iterations) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  return new Uint8Array(await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    key,
    256,
  ));
}

export async function hashCustomerPassword(password) {
  const validation = validateCustomerPassword(password);
  if (!validation.ok) throw new Error(validation.error);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const digest = await derive(password, salt, CUSTOMER_PASSWORD_ITERATIONS);
  return `pbkdf2-sha256$${CUSTOMER_PASSWORD_ITERATIONS}$${bytesToBase64Url(salt)}$${bytesToBase64Url(digest)}`;
}

export async function verifyCustomerPassword(password, encoded) {
  if (typeof password !== "string" || typeof encoded !== "string") return false;
  const [algorithm, iterationsRaw, saltRaw, digestRaw] = encoded.split("$");
  const iterations = Number(iterationsRaw);
  const salt = base64UrlToBytes(saltRaw);
  const expected = base64UrlToBytes(digestRaw);
  if (algorithm !== "pbkdf2-sha256" || !Number.isSafeInteger(iterations) || iterations < 100000 || iterations > 1000000 || !salt || !expected) return false;
  return equalBytes(await derive(password, salt, iterations), expected);
}
