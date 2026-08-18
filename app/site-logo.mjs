export const MAX_LOGO_BYTES = 220_000;

export const LOGO_KINDS = {
  night: "logo-night",
  day: "logo-day",
  legacy: "logo",
};

/** Gece (koyu zemin) = beyaz logo; gündüz (açık zemin) = koyu logo. */
export const STATIC_BRAND_LOGOS = {
  night: "/brand/avci-logo-light-transparent.png",
  day: "/brand/avci-logo-dark-transparent.png",
};

export function brandLogoSrc(theme, meta) {
  const kind = theme === "day" ? "day" : "night";
  if (meta?.exists && meta.updatedAt) {
    return `/api/site-logo?kind=${kind}&v=${encodeURIComponent(meta.updatedAt)}`;
  }
  return STATIC_BRAND_LOGOS[kind];
}

export function parseLogoKind(value) {
  const raw = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (raw === "day" || raw === "gunduz" || raw === "logo-day") return LOGO_KINDS.day;
  return LOGO_KINDS.night;
}

const ALLOWED = {
  "image/png": [0x89, 0x50, 0x4e, 0x47],
  "image/jpeg": [0xff, 0xd8, 0xff],
  "image/webp": [0x52, 0x49, 0x46, 0x46],
};

function startsWith(bytes, signature) {
  return signature.every((part, index) => bytes[index] === part);
}

export function inspectLogoUpload(file) {
  if (!file || typeof file.arrayBuffer !== "function") {
    return { ok: false, error: "Logo dosyası seçin." };
  }
  return { ok: true };
}

export function parseLogoBytes(buffer, declaredType = "") {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  if (!bytes.byteLength) return { ok: false, error: "Logo dosyası boş." };
  if (bytes.byteLength > MAX_LOGO_BYTES) return { ok: false, error: "Logo en fazla 220 KB olabilir." };

  const type = String(declaredType).split(";", 1)[0].trim().toLowerCase();
  if (type === "image/svg+xml") {
    const text = new TextDecoder("utf-8").decode(bytes);
    if (/<script|on\w+\s*=|javascript:/i.test(text)) {
      return { ok: false, error: "Bu SVG güvenlik nedeniyle kabul edilmedi." };
    }
    if (!/<svg[\s>]/i.test(text)) return { ok: false, error: "Geçerli bir SVG yükleyin." };
    return { ok: true, mime: "image/svg+xml", data: Buffer.from(bytes).toString("base64") };
  }

  const mime = ALLOWED[type] ? type
    : startsWith(bytes, ALLOWED["image/png"]) ? "image/png"
    : startsWith(bytes, ALLOWED["image/jpeg"]) ? "image/jpeg"
    : startsWith(bytes, ALLOWED["image/webp"]) ? "image/webp"
    : "";
  if (!mime || !startsWith(bytes, ALLOWED[mime])) {
    return { ok: false, error: "PNG, JPG, WebP veya SVG yükleyin." };
  }
  return { ok: true, mime, data: Buffer.from(bytes).toString("base64") };
}
