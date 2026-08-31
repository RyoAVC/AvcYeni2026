import { DEFAULT_TOFY_POPUP, sanitizePopupHref } from "./tofy-exit.mjs";

export const DEFAULT_SITE_SETTINGS = {
  contactEmail: "info@avcieticaret.com",
  contactPhone: "0850 308 68 37",
  supportEmail: "info@avcieticaret.com",
  customerLoginEnabled: "on",
  demoPortalEnabled: "on",
  supportEnabled: "on",
  portalReady: "on",
  brandTitle: "AVCI",
  brandSubtitle: "E-TİCARET",
  showWordmark: "on",
  logoEnabled: "on",
  logoScale: "medium",
  footerTagline: "İşletmeler için yazılım, e-ticaret ve yapay zekâ çözümleri.",
  heroCtaPrimary: "Ücretsiz demo alın",
  heroCtaSecondary: "Yazılımları keşfedin",
  showLiveStrip: "on",
  showTrustStrip: "on",
  maintenanceMode: "off",
  platformStatus: "operational",
  platformStatusNote: "",
  tofyPopupEnabled: DEFAULT_TOFY_POPUP.enabled,
  tofyPopupTitle: DEFAULT_TOFY_POPUP.title,
  tofyPopupText: DEFAULT_TOFY_POPUP.text,
  tofyPopupButton: DEFAULT_TOFY_POPUP.button,
  tofyPopupHref: DEFAULT_TOFY_POPUP.href,
};

const SETTING_KEYS = Object.keys(DEFAULT_SITE_SETTINGS);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LOGO_SCALES = new Set(["small", "medium", "large"]);
const PLATFORM_STATUSES = new Set(["operational", "degraded", "maintenance"]);

function clean(value, maxLength) {
  return typeof value === "string" ? value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, maxLength) : "";
}

function switchValue(value, fallback = "on") {
  if (value === "off" || value === "on") return value;
  return fallback === "off" ? "off" : "on";
}

export function isSettingOn(value) {
  return value !== "off";
}

export function phoneHrefFromDisplay(value) {
  const digits = clean(value, 40).replace(/[^\d+]/g, "");
  if (!digits) return "+908503086837";
  if (digits.startsWith("+")) return digits.slice(0, 16);
  if (digits.startsWith("90")) return `+${digits}`.slice(0, 16);
  if (digits.startsWith("0") && digits.length >= 10) return `+90${digits.slice(1)}`.slice(0, 16);
  return `+${digits}`.slice(0, 16);
}

function pick(payload, key) {
  return payload && Object.hasOwn(payload, key) ? payload[key] : undefined;
}

export function parseSiteSettings(payload = {}, current = {}) {
  const base = { ...DEFAULT_SITE_SETTINGS, ...current };
  const contactEmail = clean(pick(payload, "contactEmail") ?? base.contactEmail, 80).toLowerCase();
  const contactPhone = clean(pick(payload, "contactPhone") ?? base.contactPhone, 40);
  const supportEmail = clean(pick(payload, "supportEmail") ?? base.supportEmail, 80).toLowerCase();
  const brandTitle = clean(pick(payload, "brandTitle") ?? base.brandTitle, 24) || DEFAULT_SITE_SETTINGS.brandTitle;
  const brandSubtitle = clean(pick(payload, "brandSubtitle") ?? base.brandSubtitle, 24) || DEFAULT_SITE_SETTINGS.brandSubtitle;
  const footerTagline = clean(pick(payload, "footerTagline") ?? base.footerTagline, 180) || DEFAULT_SITE_SETTINGS.footerTagline;
  const heroCtaPrimary = clean(pick(payload, "heroCtaPrimary") ?? base.heroCtaPrimary, 40) || DEFAULT_SITE_SETTINGS.heroCtaPrimary;
  const heroCtaSecondary = clean(pick(payload, "heroCtaSecondary") ?? base.heroCtaSecondary, 40) || DEFAULT_SITE_SETTINGS.heroCtaSecondary;
  const requestedScale = pick(payload, "logoScale") ?? base.logoScale;
  const requestedStatus = pick(payload, "platformStatus") ?? base.platformStatus;
  const platformStatusNote = clean(pick(payload, "platformStatusNote") ?? base.platformStatusNote, 220);

  if (!EMAIL_PATTERN.test(contactEmail)) return { ok: false, error: "Geçerli bir genel e-posta yazın." };
  if (contactPhone.length < 7) return { ok: false, error: "Telefon numarasını yazın." };
  if (!EMAIL_PATTERN.test(supportEmail)) return { ok: false, error: "Geçerli bir destek e-postası yazın." };

  return {
    ok: true,
    value: {
      contactEmail,
      contactPhone,
      supportEmail,
      customerLoginEnabled: switchValue(pick(payload, "customerLoginEnabled") ?? base.customerLoginEnabled),
      demoPortalEnabled: switchValue(pick(payload, "demoPortalEnabled") ?? base.demoPortalEnabled),
      supportEnabled: switchValue(pick(payload, "supportEnabled") ?? base.supportEnabled),
      portalReady: switchValue(pick(payload, "portalReady") ?? base.portalReady),
      brandTitle,
      brandSubtitle,
      showWordmark: switchValue(pick(payload, "showWordmark") ?? base.showWordmark),
      logoEnabled: switchValue(pick(payload, "logoEnabled") ?? base.logoEnabled),
      logoScale: LOGO_SCALES.has(requestedScale) ? requestedScale : "medium",
      footerTagline,
      heroCtaPrimary,
      heroCtaSecondary,
      showLiveStrip: switchValue(pick(payload, "showLiveStrip") ?? base.showLiveStrip),
      showTrustStrip: switchValue(pick(payload, "showTrustStrip") ?? base.showTrustStrip),
      maintenanceMode: switchValue(pick(payload, "maintenanceMode") ?? base.maintenanceMode, "off"),
      platformStatus: PLATFORM_STATUSES.has(requestedStatus) ? requestedStatus : "operational",
      platformStatusNote,
      tofyPopupEnabled: switchValue(pick(payload, "tofyPopupEnabled") ?? base.tofyPopupEnabled),
      tofyPopupTitle: clean(pick(payload, "tofyPopupTitle") ?? base.tofyPopupTitle, 60) || DEFAULT_TOFY_POPUP.title,
      tofyPopupText: clean(pick(payload, "tofyPopupText") ?? base.tofyPopupText, 240) || DEFAULT_TOFY_POPUP.text,
      tofyPopupButton: clean(pick(payload, "tofyPopupButton") ?? base.tofyPopupButton, 32) || DEFAULT_TOFY_POPUP.button,
      tofyPopupHref: sanitizePopupHref(pick(payload, "tofyPopupHref") ?? base.tofyPopupHref),
    },
  };
}

export function mergeSiteSettings(rows = []) {
  const map = { ...DEFAULT_SITE_SETTINGS };
  for (const row of rows) {
    if (row && SETTING_KEYS.includes(row.key) && typeof row.value === "string") {
      map[row.key] = row.value;
    }
  }
  return map;
}

export function presentSiteSettings(raw) {
  const settings = raw && typeof raw === "object" ? raw : DEFAULT_SITE_SETTINGS;
  return {
    contactEmail: settings.contactEmail || DEFAULT_SITE_SETTINGS.contactEmail,
    contactPhone: settings.contactPhone || DEFAULT_SITE_SETTINGS.contactPhone,
    contactPhoneHref: phoneHrefFromDisplay(settings.contactPhone || DEFAULT_SITE_SETTINGS.contactPhone),
    supportEmail: settings.supportEmail || DEFAULT_SITE_SETTINGS.supportEmail,
    customerLoginEnabled: isSettingOn(settings.customerLoginEnabled),
    demoPortalEnabled: isSettingOn(settings.demoPortalEnabled),
    supportEnabled: isSettingOn(settings.supportEnabled),
    portalReady: isSettingOn(settings.portalReady),
    brandTitle: settings.brandTitle || DEFAULT_SITE_SETTINGS.brandTitle,
    brandSubtitle: settings.brandSubtitle || DEFAULT_SITE_SETTINGS.brandSubtitle,
    showWordmark: isSettingOn(settings.showWordmark),
    logoEnabled: isSettingOn(settings.logoEnabled),
    logoScale: LOGO_SCALES.has(settings.logoScale) ? settings.logoScale : "medium",
    footerTagline: settings.footerTagline || DEFAULT_SITE_SETTINGS.footerTagline,
    heroCtaPrimary: settings.heroCtaPrimary || DEFAULT_SITE_SETTINGS.heroCtaPrimary,
    heroCtaSecondary: settings.heroCtaSecondary || DEFAULT_SITE_SETTINGS.heroCtaSecondary,
    showLiveStrip: isSettingOn(settings.showLiveStrip),
    showTrustStrip: isSettingOn(settings.showTrustStrip),
    maintenanceMode: isSettingOn(settings.maintenanceMode),
    platformStatus: PLATFORM_STATUSES.has(settings.platformStatus) ? settings.platformStatus : "operational",
    platformStatusNote: settings.platformStatusNote || "",
    tofyPopupEnabled: isSettingOn(settings.tofyPopupEnabled),
    tofyPopupTitle: settings.tofyPopupTitle || DEFAULT_TOFY_POPUP.title,
    tofyPopupText: settings.tofyPopupText || DEFAULT_TOFY_POPUP.text,
    tofyPopupButton: settings.tofyPopupButton || DEFAULT_TOFY_POPUP.button,
    tofyPopupHref: sanitizePopupHref(settings.tofyPopupHref || DEFAULT_TOFY_POPUP.href),
  };
}

export async function loadSiteSettings() {
  try {
    const { getDb } = await import("../db");
    const { siteSettings } = await import("../db/schema");
    const db = getDb();
    const rows = await db.select().from(siteSettings);
    return presentSiteSettings(mergeSiteSettings(rows));
  } catch (cause) {
    console.error("Site settings load failed", cause);
    return presentSiteSettings(DEFAULT_SITE_SETTINGS);
  }
}

export async function loadRawSiteSettings() {
  try {
    const { getDb } = await import("../db");
    const { siteSettings } = await import("../db/schema");
    const db = getDb();
    return mergeSiteSettings(await db.select().from(siteSettings));
  } catch {
    return { ...DEFAULT_SITE_SETTINGS };
  }
}

export async function loadPlatformStatusMeta() {
  try {
    const { getDb } = await import("../db");
    const { siteSettings } = await import("../db/schema");
    const { eq } = await import("drizzle-orm");
    const db = getDb();
    const [row] = await db.select().from(siteSettings).where(eq(siteSettings.key, "platformStatus")).limit(1);
    return { updatedAt: row?.updatedAt || null };
  } catch {
    return { updatedAt: null };
  }
}

function emptyLogo() {
  return { exists: false, updatedAt: "", uploaded: false };
}

export async function loadSiteLogoMetas() {
  const empty = { night: emptyLogo(), day: emptyLogo() };
  try {
    const { getDb } = await import("../db");
    const { siteAssets } = await import("../db/schema");
    const { inArray } = await import("drizzle-orm");
    const db = getDb();
    const rows = await db
      .select({ kind: siteAssets.kind, updatedAt: siteAssets.updatedAt })
      .from(siteAssets)
      .where(inArray(siteAssets.kind, ["logo", "logo-night", "logo-day"]));
    let night = emptyLogo();
    let day = emptyLogo();
    let legacy = emptyLogo();
    for (const row of rows) {
      if (row.kind === "logo-night") night = { exists: true, updatedAt: row.updatedAt, uploaded: true };
      if (row.kind === "logo-day") day = { exists: true, updatedAt: row.updatedAt, uploaded: true };
      if (row.kind === "logo") legacy = { exists: true, updatedAt: row.updatedAt, uploaded: true };
    }
    if (!night.exists && legacy.exists) night = { ...legacy, uploaded: true };
    if (!day.exists && night.exists) day = { ...night, uploaded: false };
    return { night, day };
  } catch {
    return empty;
  }
}

export async function loadSiteLogoMeta() {
  const logos = await loadSiteLogoMetas();
  return logos.night;
}

export async function hasSiteLogo() {
  const logo = await loadSiteLogoMeta();
  return logo.exists;
}
