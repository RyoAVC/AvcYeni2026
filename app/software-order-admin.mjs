export const SOFTWARE_ORDER_KIND_OPTIONS = [
  { value: "package", label: "Paket" },
  { value: "module", label: "Modül" },
];

export const SOFTWARE_ORDER_STATUS_OPTIONS = [
  { value: "draft", label: "Taslak" },
  { value: "active", label: "Aktif" },
  { value: "paused", label: "Askıda" },
  { value: "cancelled", label: "İptal" },
];

const KIND_VALUES = new Set(SOFTWARE_ORDER_KIND_OPTIONS.map((item) => item.value));
const STATUS_VALUES = new Set(SOFTWARE_ORDER_STATUS_OPTIONS.map((item) => item.value));

function clean(value, maxLength) {
  return typeof value === "string" ? value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, maxLength) : "";
}

function parseId(value) {
  const id = Number.parseInt(String(value ?? ""), 10);
  return Number.isSafeInteger(id) && id >= 1 ? id : 0;
}

export function isSoftwareOrderKind(value) {
  return KIND_VALUES.has(value);
}

export function isSoftwareOrderStatus(value) {
  return STATUS_VALUES.has(value);
}

export function softwareOrderKindLabel(value) {
  return SOFTWARE_ORDER_KIND_OPTIONS.find((item) => item.value === value)?.label ?? value;
}

export function softwareOrderStatusLabel(value) {
  return SOFTWARE_ORDER_STATUS_OPTIONS.find((item) => item.value === value)?.label ?? value;
}

export function parseSoftwareOrderRecord(payload = {}) {
  const customerId = parseId(payload.customerId);
  const kind = KIND_VALUES.has(payload.kind) ? payload.kind : "";
  const packageId = parseId(payload.packageId);
  const moduleId = parseId(payload.moduleId);
  const status = STATUS_VALUES.has(payload.status) ? payload.status : "draft";
  const priceNote = clean(payload.priceNote, 160);
  const note = typeof payload.note === "string"
    ? payload.note.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim().slice(0, 2000)
    : "";

  if (!customerId) return { ok: false, error: "Yazılım müşterisini seçin." };
  if (!kind) return { ok: false, error: "Paket veya modül seçin." };
  if (kind === "package" && !packageId) return { ok: false, error: "Paketi seçin." };
  if (kind === "module" && !moduleId) return { ok: false, error: "Modülü seçin." };

  return {
    ok: true,
    value: {
      customerId,
      kind,
      packageId: kind === "package" ? packageId : null,
      moduleId: kind === "module" ? moduleId : null,
      status,
      priceNote,
      note,
    },
  };
}

export function isActiveSoftwareOrderStatus(value) {
  return value === "draft" || value === "active" || value === "paused";
}

export function isSameCatalogSoftwareOrder(existing = {}, incoming = {}) {
  if (parseId(existing.customerId) !== parseId(incoming.customerId)) return false;
  if (existing.kind !== incoming.kind) return false;
  if (!isActiveSoftwareOrderStatus(existing.status)) return false;
  if (incoming.kind === "package") return parseId(existing.packageId) === parseId(incoming.packageId) && parseId(incoming.packageId) >= 1;
  if (incoming.kind === "module") return parseId(existing.moduleId) === parseId(incoming.moduleId) && parseId(incoming.moduleId) >= 1;
  return false;
}
