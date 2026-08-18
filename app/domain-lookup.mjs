import { normalizeEmailAddress } from "./email-normalization.mjs";

export const DOMAIN_LOOKUP_MISS = "Bu alan adı Avcı müşteri kaydında yok. Yalnız bizde kayıtlı müşteri envanteri sorgulanır.";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeDomainName(value) {
  let raw = String(value ?? "").trim().toLocaleLowerCase("en-US");
  raw = raw.replace(/^https?:\/\//, "").replace(/^www\./, "");
  raw = raw.split("/")[0].split("?")[0].split("#")[0].split(":")[0];
  raw = raw.replace(/^\.+|\.+$/g, "");
  if (!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/.test(raw)) return "";
  return raw.slice(0, 80);
}

export function parseExpiryDate(value) {
  const raw = String(value ?? "").trim().slice(0, 10);
  if (!raw) return "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return "";
  const [year, month, day] = raw.split("-").map((part) => Number(part));
  const stamp = Date.UTC(year, month - 1, day, 9, 0, 0);
  const date = new Date(stamp);
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return "";
  return raw;
}

export function daysUntilDate(isoDate, now = Date.now()) {
  const stamp = Date.parse(`${isoDate}T12:00:00+03:00`);
  if (!Number.isFinite(stamp)) return null;
  return Math.round((stamp - now) / 86_400_000);
}

export function urgencyFromDays(...values) {
  const known = values.filter((value) => typeof value === "number");
  if (!known.length) return "unknown";
  const soonest = Math.min(...known);
  if (soonest < 0) return "expired";
  if (soonest <= 14) return "soon";
  if (soonest <= 45) return "watch";
  return "ok";
}

export function parseDomainLookupRequest(payload = {}) {
  const email = normalizeEmailAddress(payload.email, 180);
  const domain = normalizeDomainName(payload.domain);
  if (!EMAIL_PATTERN.test(email)) return { ok: false, error: "Kayıtlı müşteri e-postasını yazın." };
  if (!domain) return { ok: false, error: "Alan adını yazın." };
  return { ok: true, value: { email, domain } };
}

export function lookupMatchesCustomer(customer, email, domain) {
  if (!customer || customer.status === "closed") return false;
  return customer.email === email && normalizeDomainName(customer.domainName) === domain;
}

export function presentDomainLookup(customer, now = Date.now()) {
  if (!customer?.domainName) {
    return { ok: false, found: false, error: DOMAIN_LOOKUP_MISS };
  }
  const domainDaysLeft = customer.domainExpiresAt ? daysUntilDate(customer.domainExpiresAt, now) : null;
  const hostingDaysLeft = customer.hostingExpiresAt ? daysUntilDate(customer.hostingExpiresAt, now) : null;
  return {
    ok: true,
    found: true,
    domain: customer.domainName,
    company: customer.company || "",
    domainExpiresAt: customer.domainExpiresAt || "",
    hostingExpiresAt: customer.hostingExpiresAt || "",
    domainDaysLeft,
    hostingDaysLeft,
    urgency: urgencyFromDays(domainDaysLeft, hostingDaysLeft),
  };
}
