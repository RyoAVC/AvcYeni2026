import assert from "node:assert/strict";
import test from "node:test";
import { parseVitrineSignalRecord, parseVitrineToastRecord, slugifyVitrineSignal } from "../app/vitrine-signal-admin.mjs";

test("vitrine signal slugs labels and rejects thin input", () => {
  const parsed = parseVitrineSignalRecord({
    label: "  Müşteri Çevrimiçi  ",
    slug: "",
    value: " 48 ",
    sortOrder: "10",
    status: "live",
  });
  assert.equal(parsed.ok, true);
  assert.equal(parsed.value.label, "Müşteri Çevrimiçi");
  assert.equal(parsed.value.slug, "musteri-cevrimici");
  assert.equal(parsed.value.value, "48");
  assert.equal(parsed.value.sortOrder, 10);
  assert.equal(parsed.value.status, "live");
  assert.equal(slugifyVitrineSignal("Yeni kayıt müşteri"), "yeni-kayit-musteri");
  assert.equal(parseVitrineSignalRecord({ label: "A", value: "1" }).ok, false);
  assert.equal(parseVitrineSignalRecord({ label: "Çevrimiçi", value: "" }).ok, false);
  assert.equal(parseVitrineSignalRecord({ label: "!!!" }).ok, false);
});

test("vitrine toast keeps title text and rejects thin input", () => {
  const parsed = parseVitrineToastRecord({
    title: "  B2B sipariş  ",
    slug: "",
    text: "  Bayi 14 kalem toplu sipariş geçti  ",
    sortOrder: "80",
    status: "live",
  });
  assert.equal(parsed.ok, true);
  assert.equal(parsed.value.title, "B2B sipariş");
  assert.equal(parsed.value.slug, "b2b-siparis");
  assert.equal(parsed.value.text, "Bayi 14 kalem toplu sipariş geçti");
  assert.equal(parseVitrineToastRecord({ title: "A", text: "abc" }).ok, false);
  assert.equal(parseVitrineToastRecord({ title: "Sipariş", text: "ab" }).ok, false);
});
