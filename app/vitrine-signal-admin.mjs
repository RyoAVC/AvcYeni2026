export const VITRINE_SIGNAL_STATUS_OPTIONS = [
  { value: "live", label: "Açık — ana sayfada görünür" },
  { value: "hidden", label: "Kapalı — ana sayfada yok" },
];

export const VITRINE_TOAST_STATUS_OPTIONS = [
  { value: "live", label: "Açık — sitede kayar" },
  { value: "hidden", label: "Kapalı — sitede yok" },
];

const STATUS_VALUES = new Set(VITRINE_SIGNAL_STATUS_OPTIONS.map((item) => item.value));

function clean(value, maxLength) {
  return typeof value === "string" ? value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, maxLength) : "";
}

export function slugifyVitrineSignal(value) {
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

export function isVitrineSignalStatus(value) {
  return STATUS_VALUES.has(value);
}

export function vitrineSignalStatusLabel(value) {
  return VITRINE_SIGNAL_STATUS_OPTIONS.find((item) => item.value === value)?.label ?? value;
}

export function parseVitrineSignalRecord(payload = {}) {
  const label = clean(payload.label, 80);
  const slug = slugifyVitrineSignal(payload.slug || label);
  const value = clean(payload.value, 40);
  const sortOrder = Number.parseInt(String(payload.sortOrder ?? "0"), 10);
  const status = STATUS_VALUES.has(payload.status) ? payload.status : "hidden";

  if (label.length < 2) return { ok: false, error: "Şerit metnini yazın." };
  if (!slug) return { ok: false, error: "Kısa kod (slug) yazın." };
  if (!value) return { ok: false, error: "Gösterilecek sayıyı veya ifadeyi yazın." };

  return {
    ok: true,
    value: {
      label,
      slug,
      value,
      sortOrder: Number.isSafeInteger(sortOrder) ? Math.max(0, Math.min(sortOrder, 999)) : 0,
      status,
    },
  };
}

export function parseVitrineToastRecord(payload = {}) {
  const title = clean(payload.title, 60);
  const slug = slugifyVitrineSignal(payload.slug || title);
  const text = clean(payload.text, 160);
  const sortOrder = Number.parseInt(String(payload.sortOrder ?? "0"), 10);
  const status = STATUS_VALUES.has(payload.status) ? payload.status : "hidden";

  if (title.length < 2) return { ok: false, error: "Bildirim başlığını yazın." };
  if (!slug) return { ok: false, error: "Kısa kod (slug) yazın." };
  if (text.length < 4) return { ok: false, error: "Bildirim metnini yazın." };

  return {
    ok: true,
    value: {
      title,
      slug,
      text,
      sortOrder: Number.isSafeInteger(sortOrder) ? Math.max(0, Math.min(sortOrder, 999)) : 0,
      status,
    },
  };
}
