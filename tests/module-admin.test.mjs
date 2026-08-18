import assert from "node:assert/strict";
import test from "node:test";
import { parseModuleRecord, slugifyModuleName } from "../app/module-admin.mjs";

test("module record slugs names and rejects thin input", () => {
  const parsed = parseModuleRecord({
    name: "  Trendyol  ",
    slug: "",
    category: "pazaryeri",
    summary: "Pazaryeri eklentisi",
    features: "Stok\nSipariş",
    priceNote: "Teklifle yazılır",
    sortOrder: "10",
    status: "live",
  });
  assert.equal(parsed.ok, true);
  assert.equal(parsed.value.name, "Trendyol");
  assert.equal(parsed.value.slug, "trendyol");
  assert.equal(parsed.value.category, "pazaryeri");
  assert.equal(parsed.value.sortOrder, 10);
  assert.equal(slugifyModuleName("Yurtiçi Kargo"), "yurtici-kargo");
  assert.equal(parseModuleRecord({ name: "A" }).ok, false);
  assert.equal(parseModuleRecord({ name: "!!!" }).ok, false);
});
