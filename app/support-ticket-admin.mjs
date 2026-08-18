export const TICKET_TOPIC_OPTIONS = [
  { value: "kurulum", label: "Kurulum" },
  { value: "lisans", label: "Lisans / paket" },
  { value: "entegrasyon", label: "Modül / entegrasyon" },
  { value: "diger", label: "Diğer" },
];

export const TICKET_STATUS_OPTIONS = [
  { value: "open", label: "Açık" },
  { value: "waiting", label: "Yanıt bekliyor" },
  { value: "closed", label: "Kapandı" },
];

const TOPIC_VALUES = new Set(TICKET_TOPIC_OPTIONS.map((item) => item.value));
const STATUS_VALUES = new Set(TICKET_STATUS_OPTIONS.map((item) => item.value));

function clean(value, maxLength) {
  return typeof value === "string" ? value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, maxLength) : "";
}

function parseId(value) {
  const id = Number.parseInt(String(value ?? ""), 10);
  return Number.isSafeInteger(id) && id >= 1 ? id : 0;
}

export function isTicketTopic(value) {
  return TOPIC_VALUES.has(value);
}

export function isTicketStatus(value) {
  return STATUS_VALUES.has(value);
}

export function ticketTopicLabel(value) {
  return TICKET_TOPIC_OPTIONS.find((item) => item.value === value)?.label ?? value;
}

export function ticketStatusLabel(value) {
  return TICKET_STATUS_OPTIONS.find((item) => item.value === value)?.label ?? value;
}

export function parseSupportTicketRecord(payload = {}) {
  const customerId = parseId(payload.customerId);
  const topic = TOPIC_VALUES.has(payload.topic) ? payload.topic : "diger";
  const subject = clean(payload.subject, 140);
  const message = typeof payload.message === "string"
    ? payload.message.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim().slice(0, 4000)
    : "";
  const note = typeof payload.note === "string"
    ? payload.note.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim().slice(0, 2000)
    : "";
  const status = STATUS_VALUES.has(payload.status) ? payload.status : "open";

  if (!customerId) return { ok: false, error: "Yazılım müşterisini seçin." };
  if (subject.length < 3) return { ok: false, error: "Konuyu yazın." };

  return {
    ok: true,
    value: { customerId, topic, subject, message, note, status },
  };
}

export function ticketDraftFromOrder(order = {}, label = "") {
  const customerId = parseId(order.customerId);
  const orderId = parseId(order.id);
  const itemLabel = clean(label || "Yazılım lisansı", 80) || "Yazılım lisansı";
  const topic = order.kind === "module" ? "entegrasyon" : "lisans";
  const subject = clean(`${itemLabel} destek kaydı`, 140);

  return {
    customerId,
    topic,
    subject: subject.length >= 3 ? subject : "Yazılım destek kaydı",
    message: "",
    note: orderId
      ? `Sipariş #${orderId} üzerinden açıldı. Müşteriye e-posta gitmez.`
      : "Siparişten taslak açıldı. Müşteriye e-posta gitmez.",
    status: "open",
  };
}

export function parseTicketOrderIdFromNote(note) {
  const match = String(note ?? "").match(/Sipariş #(\d+)(?:\s|[.,;:)\]-]|$)/);
  const id = Number.parseInt(match?.[1] || "", 10);
  return Number.isSafeInteger(id) && id >= 1 ? id : 0;
}

export function ticketNoteOrderLikePattern(orderId) {
  const id = parseId(orderId);
  return id ? `%Sipariş #${id} %` : "";
}

export const TICKET_NOTE_ANY_ORDER_LIKE = "%Sipariş #%";

export function ticketNoteLooksUnbound(note) {
  return parseTicketOrderIdFromNote(note) < 1;
}

export function isOpenSupportTicketStatus(status) {
  return status === "open" || status === "waiting";
}

export function isDuplicateOpenTicketForOrder(existing = {}, incoming = {}) {
  if (!isOpenSupportTicketStatus(existing.status)) return false;
  if (!isOpenSupportTicketStatus(incoming.status || "open")) return false;
  const orderId = parseTicketOrderIdFromNote(incoming.note);
  if (!orderId) return false;
  if (parseId(existing.customerId) !== parseId(incoming.customerId)) return false;
  return parseTicketOrderIdFromNote(existing.note) === orderId;
}
