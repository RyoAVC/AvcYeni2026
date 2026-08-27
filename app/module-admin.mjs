export const MODULE_CATEGORY_OPTIONS = [
  { value: "pazaryeri", label: "Pazaryeri" },
  { value: "odeme", label: "Ödeme" },
  { value: "kargo", label: "Kargo" },
  { value: "erp", label: "ERP / Muhasebe" },
  { value: "ai", label: "AI eklentisi" },
  { value: "commerce", label: "Commerce / Sektörel" },
  { value: "ozel", label: "Özel geliştirme" },
];

export const MODULE_STATUS_OPTIONS = [
  { value: "draft", label: "Taslak" },
  { value: "live", label: "Yayında" },
  { value: "offline", label: "Çevrimdışı" },
  { value: "archived", label: "Arşiv" },
];

export const MODULE_RUNTIME_OPTIONS = [
  { value: "node", label: "Node.js" },
  { value: "php", label: "PHP" },
  { value: "browser", label: "Tarayıcı / JavaScript" },
  { value: "service", label: "Harici servis / API" },
];

const CATEGORY_VALUES = new Set(MODULE_CATEGORY_OPTIONS.map((item) => item.value));
const STATUS_VALUES = new Set(MODULE_STATUS_OPTIONS.map((item) => item.value));

function clean(value, maxLength) {
  return typeof value === "string" ? value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, maxLength) : "";
}

export function slugifyModuleName(value) {
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

export function isModuleCategory(value) {
  return CATEGORY_VALUES.has(value);
}

export function isModuleStatus(value) {
  return STATUS_VALUES.has(value);
}

export function moduleCategoryLabel(value) {
  return MODULE_CATEGORY_OPTIONS.find((item) => item.value === value)?.label ?? value;
}

export function moduleStatusLabel(value) {
  return MODULE_STATUS_OPTIONS.find((item) => item.value === value)?.label ?? value;
}

export function parseModuleRecord(payload = {}) {
  const name = clean(payload.name, 80);
  const slug = slugifyModuleName(payload.slug || name);
  const category = CATEGORY_VALUES.has(payload.category) ? payload.category : "pazaryeri";
  const summary = clean(payload.summary, 280);
  const features = typeof payload.features === "string"
    ? payload.features.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim().slice(0, 2000)
    : "";
  const priceNote = clean(payload.priceNote, 160);
  const sortOrder = Number.parseInt(String(payload.sortOrder ?? "0"), 10);
  const status = STATUS_VALUES.has(payload.status) ? payload.status : "draft";
  const runtime = MODULE_RUNTIME_OPTIONS.some((item) => item.value === payload.runtime) ? payload.runtime : "node";
  const version = clean(payload.version, 32) || "1.0.0";
  const packageUrl = clean(payload.packageUrl, 500);
  const packageChecksum = clean(payload.packageChecksum, 128);
  const entrypoint = clean(payload.entrypoint, 180);
  const installStatus = ["not_installed", "ready", "installed", "failed"].includes(payload.installStatus) ? payload.installStatus : "not_installed";
  let manifestJson = typeof payload.manifestJson === "string" ? payload.manifestJson.trim().slice(0, 12000) : "{}";
  try {
    manifestJson = JSON.stringify(JSON.parse(manifestJson || "{}"), null, 2);
  } catch {
    return { ok: false, error: "Manifest alanı geçerli JSON olmalıdır." };
  }

  if (name.length < 2) return { ok: false, error: "Modül adını yazın." };
  if (!slug) return { ok: false, error: "Modül için kısa kod (slug) yazın." };
  if (packageUrl && !/^https:\/\//i.test(packageUrl)) return { ok: false, error: "Paket adresi HTTPS ile başlamalıdır." };
  if (packageChecksum && !/^[a-f0-9]{64}$/i.test(packageChecksum)) return { ok: false, error: "SHA-256 özeti 64 haneli olmalıdır." };
  if (entrypoint.includes("..") || entrypoint.startsWith("/")) return { ok: false, error: "Başlangıç dosyası paket içindeki göreli bir yol olmalıdır." };

  return {
    ok: true,
    value: {
      name,
      slug,
      category,
      summary,
      features,
      priceNote,
      sortOrder: Number.isSafeInteger(sortOrder) ? Math.max(0, Math.min(sortOrder, 999)) : 0,
      status,
      runtime,
      version,
      packageUrl,
      packageChecksum,
      entrypoint,
      manifestJson,
      installStatus,
    },
  };
}
