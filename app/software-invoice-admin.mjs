export const INVOICE_STATUS_OPTIONS = [
  { value: "draft", label: "Taslak" },
  { value: "sent", label: "Gönderildi" },
  { value: "paid", label: "Ödendi" },
  { value: "cancelled", label: "İptal" },
];

const STATUS_VALUES = new Set(INVOICE_STATUS_OPTIONS.map((item) => item.value));

function clean(value, maxLength) {
  return typeof value === "string" ? value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, maxLength) : "";
}

function parseId(value) {
  const id = Number.parseInt(String(value ?? ""), 10);
  return Number.isSafeInteger(id) && id >= 1 ? id : 0;
}

export function isInvoiceStatus(value) {
  return STATUS_VALUES.has(value);
}

export function invoiceStatusLabel(value) {
  return INVOICE_STATUS_OPTIONS.find((item) => item.value === value)?.label ?? value;
}

export function parseSoftwareInvoiceRecord(payload = {}) {
  const customerId = parseId(payload.customerId);
  const orderId = parseId(payload.orderId);
  const title = clean(payload.title, 140);
  const amountNote = clean(payload.amountNote, 80);
  const note = typeof payload.note === "string"
    ? payload.note.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim().slice(0, 2000)
    : "";
  const status = STATUS_VALUES.has(payload.status) ? payload.status : "draft";

  if (!customerId) return { ok: false, error: "Yazılım müşterisini seçin." };
  if (title.length < 3) return { ok: false, error: "Fatura başlığını yazın." };

  return {
    ok: true,
    value: {
      customerId,
      orderId: orderId || null,
      title,
      amountNote,
      note,
      status,
    },
  };
}

export function invoiceDraftFromOrder(order = {}, label = "") {
  const customerId = parseId(order.customerId);
  const orderId = parseId(order.id);
  const itemLabel = clean(label || "Yazılım lisansı", 80) || "Yazılım lisansı";
  const title = clean(`${itemLabel} tahsil kaydı`, 140);
  const amountNote = clean(order.priceNote, 80);

  return {
    customerId,
    orderId: orderId || null,
    title: title.length >= 3 ? title : "Yazılım tahsil kaydı",
    amountNote,
    status: "draft",
    note: "Siparişten taslak açıldı. e-Fatura üretilmez; kart çekilmez.",
  };
}

export function isDuplicateDraftInvoice(existing = {}, incoming = {}) {
  const orderId = parseId(incoming.orderId);
  if (!orderId) return false;
  if (parseId(existing.orderId) !== orderId) return false;
  const incomingStatus = STATUS_VALUES.has(incoming.status) ? incoming.status : "draft";
  return existing.status === "draft" && incomingStatus === "draft";
}
