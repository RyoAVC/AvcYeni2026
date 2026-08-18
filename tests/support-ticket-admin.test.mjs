import assert from "node:assert/strict";
import test from "node:test";
import { parseSupportTicketRecord, ticketDraftFromOrder, parseTicketOrderIdFromNote, ticketNoteOrderLikePattern, ticketNoteLooksUnbound, TICKET_NOTE_ANY_ORDER_LIKE, isDuplicateOpenTicketForOrder } from "../app/support-ticket-admin.mjs";

test("support ticket requires customer and subject", () => {
  const parsed = parseSupportTicketRecord({
    customerId: "4",
    topic: "entegrasyon",
    subject: "  Trendyol stok  ",
    message: "Stok eşitlenmiyor",
    note: "İç not",
    status: "waiting",
  });
  assert.equal(parsed.ok, true);
  assert.equal(parsed.value.customerId, 4);
  assert.equal(parsed.value.subject, "Trendyol stok");
  assert.equal(parsed.value.status, "waiting");
  assert.equal(parseSupportTicketRecord({ customerId: "1", subject: "ab" }).ok, false);
  assert.equal(parseSupportTicketRecord({ subject: "Kurulum yardımı" }).ok, false);
});

test("ticket draft from package order uses lisans topic", () => {
  const draft = ticketDraftFromOrder(
    { id: 8, customerId: 3, kind: "package" },
    "Start",
  );
  assert.equal(draft.customerId, 3);
  assert.equal(draft.topic, "lisans");
  assert.equal(draft.status, "open");
  assert.equal(draft.subject, "Start destek kaydı");
  assert.match(draft.note, /Sipariş #8/);
  assert.match(draft.note, /e-posta/);
});

test("ticket draft from module order uses entegrasyon topic", () => {
  const draft = ticketDraftFromOrder(
    { id: 12, customerId: 4, kind: "module" },
    "Trendyol",
  );
  assert.equal(draft.topic, "entegrasyon");
  assert.equal(draft.subject, "Trendyol destek kaydı");
});

test("open ticket for the same order is a duplicate only while still open", () => {
  const note = "Sipariş #8 üzerinden açıldı. Müşteriye e-posta gitmez.";
  assert.equal(parseTicketOrderIdFromNote(note), 8);
  assert.equal(parseTicketOrderIdFromNote("Sipariş #80 üzerinden açıldı."), 80);
  assert.equal(parseTicketOrderIdFromNote("Bağlı sipariş yok"), 0);
  assert.equal(ticketNoteOrderLikePattern(8), "%Sipariş #8 %");
  const incoming = { customerId: 3, status: "open", note };
  assert.equal(ticketNoteLooksUnbound("Bağlı sipariş yok"), true);
  assert.equal(ticketNoteLooksUnbound("Sipariş #8 üzerinden açıldı."), false);
  assert.equal(TICKET_NOTE_ANY_ORDER_LIKE, "%Sipariş #%");
  assert.equal(isDuplicateOpenTicketForOrder({ customerId: 3, status: "open", note }, incoming), true);
  assert.equal(isDuplicateOpenTicketForOrder({ customerId: 3, status: "waiting", note }, incoming), true);
  assert.equal(isDuplicateOpenTicketForOrder({ customerId: 3, status: "closed", note }, incoming), false);
  assert.equal(isDuplicateOpenTicketForOrder({ customerId: 9, status: "open", note }, incoming), false);
  assert.equal(isDuplicateOpenTicketForOrder({ customerId: 3, status: "open", note: "Sipariş #9 üzerinden açıldı." }, incoming), false);
});
