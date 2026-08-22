const VISITOR_KEY_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const ISTANBUL_OFFSET_MS = 3 * 60 * 60 * 1000;
const BLOCKED_PREFIXES = [
  "/yonetim",
  "/api",
  "/_next",
  "/_vite",
  "/signin-with-chatgpt",
  "/signout-with-chatgpt",
  "/callback",
  "/musteri-portali",
  "/musteri-panel",
  "/onizleme/musteri-portali-k7m2x9",
];

export const SITE_VISIT_COOKIE = "avci_vid";
export const SITE_VISIT_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export function istanbulCalendarDay(now = new Date()) {
  return new Date(now.getTime() + ISTANBUL_OFFSET_MS).toISOString().slice(0, 10);
}

export function addCalendarDays(day, amount) {
  const [year, month, date] = String(day).split("-").map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, date + Number(amount)));
  return shifted.toISOString().slice(0, 10);
}

export function lastIstanbulDays(count, now = new Date()) {
  const today = istanbulCalendarDay(now);
  const days = [];
  for (let index = count - 1; index >= 0; index -= 1) {
    days.push(addCalendarDays(today, -index));
  }
  return days;
}

export function normalizeVisitPath(value) {
  if (typeof value !== "string") return "";
  const raw = value.trim().split(/[?#]/, 1)[0];
  if (!raw.startsWith("/") || raw.includes("\\") || raw.includes("//") || raw.length > 180) return "";
  if (!/^\/[A-Za-z0-9/_-]*$/.test(raw)) return "";
  const path = raw.replace(/\/+$/, "") || "/";
  if (path.includes(".")) return "";
  if (BLOCKED_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) return "";
  return path;
}

export function normalizeVisitReferrerHost(value) {
  if (typeof value !== "string") return "";
  const host = value.trim().toLocaleLowerCase("en-US").slice(0, 120);
  return /^[a-z0-9.-]+$/.test(host) ? host : "";
}

export function isVisitVisitorKey(value) {
  return typeof value === "string" && VISITOR_KEY_PATTERN.test(value);
}

export function isAutomatedVisitAgent(userAgent) {
  if (typeof userAgent !== "string" || !userAgent.trim()) return false;
  return /bot|crawl|spider|slurp|lighthouse|headless|preview/i.test(userAgent);
}

export function readVisitVisitorKey(cookieHeader) {
  if (typeof cookieHeader !== "string" || !cookieHeader) return "";
  const match = cookieHeader.match(/(?:^|;\s*)avci_vid=([^;]+)/);
  const value = match?.[1] ? decodeURIComponent(match[1]).trim() : "";
  return isVisitVisitorKey(value) ? value : "";
}

export function visitCookieHeader(visitorKey, secure) {
  const parts = [
    `${SITE_VISIT_COOKIE}=${visitorKey}`,
    "Path=/",
    `Max-Age=${SITE_VISIT_COOKIE_MAX_AGE}`,
    "SameSite=Lax",
    "HttpOnly",
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}
