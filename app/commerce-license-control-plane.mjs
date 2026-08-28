const encoder = new TextEncoder();

export function base64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function decodeBase64Url(value) {
  if (typeof value !== "string" || !/^[A-Za-z0-9_-]+$/.test(value)) throw new Error("invalid_base64url");
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - value.length % 4) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

export async function sha256(value) {
  return base64Url(new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value))));
}

export function createActivationToken() {
  return `avc_live_${base64Url(crypto.getRandomValues(new Uint8Array(32)))}`;
}

export function normalizeCommerceDomain(value) {
  const raw = String(value ?? "").trim().toLowerCase().replace(/^https?:\/\//, "").split("/", 1)[0].replace(/:\d+$/, "").replace(/^www\./, "");
  if (raw === "localhost" || /^\d{1,3}(?:\.\d{1,3}){3}$/.test(raw)) return raw;
  return /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(raw) ? raw : "";
}

export function validCommerceIdentifier(value) {
  return /^[a-z0-9][a-z0-9._-]{2,95}$/.test(String(value ?? ""));
}

export function resolveCommerceInstallationCandidate(candidates, domain) {
  const normalizedDomain = normalizeCommerceDomain(domain);
  const matches = (Array.isArray(candidates) ? candidates : []).filter((candidate) =>
    ["active", "trial"].includes(String(candidate?.status ?? ""))
    && normalizeCommerceDomain(candidate?.primaryDomain) === normalizedDomain
  );
  if (matches.length === 0) return { outcome: "missing", installation: null };
  if (matches.length > 1) return { outcome: "ambiguous", installation: null };
  return { outcome: "resolved", installation: matches[0] };
}

export function parseScopes(value) {
  const entries = Array.isArray(value) ? value : String(value ?? "").split(/[\s,]+/);
  return [...new Set(entries.map((item) => String(item).trim()).filter((item) => /^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/.test(item)))].sort();
}

export function parseLimits(value) {
  const input = typeof value === "string" ? JSON.parse(value || "{}") : value;
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("invalid_limits");
  const limits = {};
  for (const [key, amount] of Object.entries(input)) {
    if (!/^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/.test(key) || !Number.isSafeInteger(amount) || amount < 0) throw new Error("invalid_limits");
    limits[key] = amount;
  }
  return limits;
}

export async function issueCommerceLicense(payload, privateKeyPkcs8) {
  const encodedPayload = base64Url(encoder.encode(JSON.stringify(payload)));
  const key = await crypto.subtle.importKey("pkcs8", decodeBase64Url(privateKeyPkcs8), { name: "Ed25519" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("Ed25519", key, encoder.encode(encodedPayload));
  return `${encodedPayload}.${base64Url(new Uint8Array(signature))}`;
}

export async function signActivationResponse(body, activationToken) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(activationToken), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return base64Url(new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(body))));
}
