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

test("module package metadata validates runtime and manifest", () => {
  const parsed = parseModuleRecord({ name: "Özel PHP Modülü", runtime: "php", version: "2.1.0", status: "offline", manifestJson: '{"permissions":["catalog:read"]}' });
  assert.equal(parsed.ok, true);
  assert.equal(parsed.value.runtime, "php");
  assert.equal(parsed.value.status, "offline");
  assert.match(parsed.value.manifestJson, /catalog:read/);
  assert.equal(parseModuleRecord({ name: "Bozuk Manifest", manifestJson: "{" }).ok, false);
});
