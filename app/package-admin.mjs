export const PACKAGE_FAMILY_OPTIONS = [
  { value: "eticaret", label: "E-Ticaret altyapısı" },
  { value: "b2b", label: "B2B / Pazaryeri" },
  { value: "eihracat", label: "E-İhracat" },
  { value: "ozel", label: "Özel yazılım" },
];

export const PACKAGE_STATUS_OPTIONS = [
  { value: "draft", label: "Taslak" },
  { value: "live", label: "Yayında" },
  { value: "archived", label: "Arşiv" },
];

const FAMILY_VALUES = new Set(PACKAGE_FAMILY_OPTIONS.map((item) => item.value));
const STATUS_VALUES = new Set(PACKAGE_STATUS_OPTIONS.map((item) => item.value));

function clean(value, maxLength) {
  return typeof value === "string" ? value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, maxLength) : "";
}

export function slugifyPackageName(value) {
  return clean(value, 80)
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function isPackageFamily(value) {
  return FAMILY_VALUES.has(value);
}

export function isPackageStatus(value) {
  return STATUS_VALUES.has(value);
}

export function packageFamilyLabel(value) {
  return PACKAGE_FAMILY_OPTIONS.find((item) => item.value === value)?.label ?? value;
}

export function packageStatusLabel(value) {
  return PACKAGE_STATUS_OPTIONS.find((item) => item.value === value)?.label ?? value;
}

export function parsePackageRecord(payload = {}) {
  const name = clean(payload.name, 80);
  const slug = slugifyPackageName(payload.slug || name);
  const family = FAMILY_VALUES.has(payload.family) ? payload.family : "eticaret";
  const summary = clean(payload.summary, 280);
  const features = typeof payload.features === "string"
    ? payload.features.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim().slice(0, 2000)
    : "";
  const priceNote = clean(payload.priceNote, 160);
  const sortOrder = Number.parseInt(String(payload.sortOrder ?? "0"), 10);
  const status = STATUS_VALUES.has(payload.status) ? payload.status : "draft";

  if (name.length < 2) return { ok: false, error: "Paket adını yazın." };
  if (!slug) return { ok: false, error: "Paket için kısa kod (slug) yazın." };

  // Omitted commercial fields stay omitted for older API clients (PATCH must not reset them).
  const terms = {};
  if (payload.salesType !== undefined) {
    if (!["otomatik", "teklif"].includes(payload.salesType)) return { ok: false, error: "Geçersiz satış tipi." };
    terms.salesType = payload.salesType;
  }
  for (const [key, max, label] of [["priceAmountKurus", 1000000000, "Kuruş tutarı"], ["licenseDurationDays", 36500, "Lisans süresi"]]) {
    if (payload[key] === undefined) continue;
    if (!/^(0|[1-9]\d*)$/.test(String(payload[key])) || !Number.isSafeInteger(Number(payload[key])) || Number(payload[key]) > max) {
      return { ok: false, error: `${label} sıfır veya izin verilen aralıkta bir tam sayı olmalı.` };
    }
    terms[key] = Number(payload[key]);
  }
  if (payload.priceIncludesVat !== undefined) {
    if (typeof payload.priceIncludesVat !== "boolean") return { ok: false, error: "KDV tercihi geçersiz." };
    terms.priceIncludesVat = payload.priceIncludesVat;
  }

  return {
    ok: true,
    value: {
      name,
      slug,
      family,
      summary,
      features,
      priceNote,
      ...terms,
      sortOrder: Number.isSafeInteger(sortOrder) ? Math.max(0, Math.min(sortOrder, 999)) : 0,
      status,
    },
  };
}
