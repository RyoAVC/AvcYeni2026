import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { parsePackageRecord } from "../app/package-admin.mjs";
import { checkoutTerms } from "../app/package-checkout-terms.mjs";

test("commercial fields validate strictly without resetting omitted PATCH fields", () => {
  for (const value of [-1, 1.2, "1e3", "100 TL", null, true, "", 1000000001]) {
    assert.equal(parsePackageRecord({ name: "Start", priceAmountKurus: value }).ok, false);
  }
  assert.equal(parsePackageRecord({ name: "Start", priceIncludesVat: "false" }).ok, false);
  assert.equal(parsePackageRecord({ name: "Start", salesType: "auto" }).ok, false);
  assert.equal(parsePackageRecord({ name: "Start", licenseDurationDays: 36501 }).ok, false);
  assert.equal("priceAmountKurus" in parsePackageRecord({ name: "Start" }).value, false);
  const parsed = parsePackageRecord({ name: "Start", priceAmountKurus: "4999900", salesType: "otomatik", priceIncludesVat: true, licenseDurationDays: "365" });
  assert.equal(parsed.value.priceAmountKurus, 4999900);
  assert.equal(parsed.value.licenseDurationDays, 365);
});

test("checkout ignores priceNote and refuses incomplete / quote / exclusive-VAT packages", () => {
  const item = { status: "live", salesType: "otomatik", priceAmountKurus: 12000, priceIncludesVat: true, licenseDurationDays: 90, priceNote: "1 TL" };
  assert.deepEqual(checkoutTerms(item), { amountKurus: 12000, currency: "TL", durationDays: 90 });
  for (const change of [{ salesType: "teklif" }, { status: "draft" }, { priceAmountKurus: 0 }, { priceIncludesVat: false }, { licenseDurationDays: 0 }]) assert.throws(() => checkoutTerms({ ...item, ...change }));
});

test("0048 migration runs on isolated SQLite, keeps enterprise manual, enforces constraints", () => {
  const db = new DatabaseSync(":memory:");
  try {
    db.exec("CREATE TABLE packages (id INTEGER PRIMARY KEY, slug TEXT); INSERT INTO packages VALUES (1,'start'),(2,'scale'),(3,'enterprise');");
    db.exec(readFileSync(new URL("../drizzle/0048_package_checkout_terms.sql", import.meta.url), "utf8"));
    const rows = db.prepare("SELECT * FROM packages ORDER BY id").all();
    assert.equal(rows[0].price_amount_kurus, 4999900);
    assert.equal(rows[1].price_amount_kurus, 7499900);
    assert.equal(rows[2].sales_type, "teklif");
    assert.equal(rows[0].license_duration_days, 0);
    assert.throws(() => db.exec("UPDATE packages SET price_amount_kurus = -1"));
    assert.throws(() => db.exec("UPDATE packages SET price_amount_kurus = 1.5"));
    assert.throws(() => db.exec("UPDATE packages SET sales_type = 'bad'"));
  } finally { db.close(); }
});
