import { normalizeEmailAddress } from "./email-normalization.mjs";
import { normalizeLeadPhone } from "./lead-contact.mjs";
import { normalizeDomainName, parseExpiryDate } from "./domain-lookup.mjs";
const CUSTOMER_STATUSES = new Set(["active", "trial", "paused", "closed"]);

function isCustomerStatus(value) {
  return CUSTOMER_STATUSES.has(value);
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value, maxLength) {
  return typeof value === "string" ? value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, maxLength) : "";
}

export function parseCustomerRecord(payload = {}) {
  const name = clean(payload.name, 100);
  const email = normalizeEmailAddress(payload.email, 180);
  const phone = clean(payload.phone, 30);
  const phoneNormalized = normalizeLeadPhone(phone);
  const company = clean(payload.company, 120);
  const city = clean(payload.city, 80);
  const interest = clean(payload.interest, 120);
  const note = typeof payload.note === "string" ? payload.note.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim().slice(0, 2000) : "";
  const domainName = normalizeDomainName(payload.domainName);
  const requestedDomain = typeof payload.domainName === "string" ? payload.domainName.trim() : "";
  const domainExpiresAt = parseExpiryDate(payload.domainExpiresAt);
  const hostingExpiresAt = parseExpiryDate(payload.hostingExpiresAt);
  const status = typeof payload.status === "string" && isCustomerStatus(payload.status) ? payload.status : "active";

  if (name.length < 2) return { ok: false, error: "Ad soyad yazın." };
  if (!EMAIL_PATTERN.test(email)) return { ok: false, error: "Geçerli bir e-posta yazın." };
  if (phoneNormalized.length < 10) return { ok: false, error: "Geçerli bir telefon yazın." };
  if (requestedDomain && !domainName) return { ok: false, error: "Geçerli bir alan adı yazın." };
  if (payload.domainExpiresAt && !domainExpiresAt) return { ok: false, error: "Alan adı bitiş tarihini YYYY-AA-GG yazın." };
  if (payload.hostingExpiresAt && !hostingExpiresAt) return { ok: false, error: "Yayın / hosting bitiş tarihini YYYY-AA-GG yazın." };

  return {
    ok: true,
    value: { name, email, phone, phoneNormalized, company, city, interest, note, domainName, domainExpiresAt, hostingExpiresAt, status },
  };
}

export function customerDraftFromLead(lead = {}, leadId = 0) {
  const sourceId = Number.isSafeInteger(Number(leadId)) && Number(leadId) >= 1 ? Number(leadId) : 0;
  const prefix = sourceId
    ? `Teklif başvurusu #${sourceId} üzerinden aktarıldı.`
    : "Teklif başvurusundan aktarıldı.";
  const message = typeof lead.message === "string"
    ? lead.message.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim().slice(0, 1400)
    : "";
  const note = (message ? `${prefix}\n\n${message}` : prefix).slice(0, 2000);

  return {
    name: clean(lead.name, 100),
    email: typeof lead.email === "string" ? lead.email : "",
    phone: typeof lead.phone === "string" ? lead.phone : "",
    company: clean(lead.company, 120),
    city: "",
    interest: clean(lead.interest, 120),
    note,
    domainName: "",
    domainExpiresAt: "",
    hostingExpiresAt: "",
    status: "trial",
  };
}

export function parseCustomerLeadId(payload = {}) {
  const id = Number.parseInt(String(payload.leadId ?? ""), 10);
  return Number.isSafeInteger(id) && id >= 1 ? id : 0;
}

export function shouldQualifyLeadOnCustomerCreate(status) {
  return status === "new" || status === "contacted";
}

export function customerIdByNormalizedEmail(rows = []) {
  const map = new Map();
  for (const row of rows) {
    const email = normalizeEmailAddress(row?.email, 180);
    const id = Number.parseInt(String(row?.id ?? ""), 10);
    if (email && Number.isSafeInteger(id) && id >= 1 && !map.has(email)) map.set(email, id);
  }
  return map;
}

export function matchLeadToCustomerId(lead, byEmail) {
  const email = normalizeEmailAddress(lead?.email, 180);
  if (!email || !byEmail || typeof byEmail.get !== "function") return 0;
  return byEmail.get(email) || 0;
}
