import assert from "node:assert/strict";
import test from "node:test";
import { parseSoftwareInvoiceRecord, invoiceDraftFromOrder, isDuplicateDraftInvoice } from "../app/software-invoice-admin.mjs";

test("software invoice requires customer and title", () => {
  const parsed = parseSoftwareInvoiceRecord({
    customerId: "2",
    orderId: "5",
    title: "  Start kurulum  ",
    amountNote: "12.000 TL + KDV",
    status: "sent",
    note: "Havale bekleniyor",
  });
  assert.equal(parsed.ok, true);
  assert.equal(parsed.value.customerId, 2);
  assert.equal(parsed.value.orderId, 5);
  assert.equal(parsed.value.title, "Start kurulum");
  assert.equal(parseSoftwareInvoiceRecord({ customerId: "1", orderId: "9", title: "ab" }).ok, false);
  assert.equal(parseSoftwareInvoiceRecord({ title: "Start kurulum" }).ok, false);
  assert.equal(parseSoftwareInvoiceRecord({ customerId: "1", title: "Start kurulum", orderId: "" }).value.orderId, null);
});

test("invoice draft from order copies package label and price note", () => {
  const draft = invoiceDraftFromOrder(
    { id: 8, customerId: 3, priceNote: "49.999 TL örnek band (teklif değildir)" },
    "Start",
  );
  assert.equal(draft.customerId, 3);
  assert.equal(draft.orderId, 8);
  assert.equal(draft.status, "draft");
  assert.equal(draft.title, "Start tahsil kaydı");
  assert.match(draft.amountNote, /49\.999 TL/);
  assert.match(draft.note, /e-Fatura/);
});

test("duplicate draft invoice is only the second open draft for the same order", () => {
  const incoming = { orderId: 8, status: "draft" };
  assert.equal(isDuplicateDraftInvoice({ orderId: 8, status: "draft" }, incoming), true);
  assert.equal(isDuplicateDraftInvoice({ orderId: 8, status: "sent" }, incoming), false);
  assert.equal(isDuplicateDraftInvoice({ orderId: 8, status: "cancelled" }, incoming), false);
  assert.equal(isDuplicateDraftInvoice({ orderId: 3, status: "draft" }, incoming), false);
  assert.equal(isDuplicateDraftInvoice({ orderId: 8, status: "draft" }, { orderId: 8, status: "paid" }), false);
});
