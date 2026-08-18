import assert from "node:assert/strict";
import test from "node:test";
import { parsePackageRecord, slugifyPackageName } from "../app/package-admin.mjs";

test("package record slugs names and rejects thin input", () => {
  const parsed = parsePackageRecord({
    name: "  Start  ",
    slug: "",
    family: "eticaret",
    summary: "Kontrollü başlangıç",
    features: "POS\nPazaryeri",
    priceNote: "Teklifle belirlenir",
    sortOrder: "10",
    status: "live",
  });
  assert.equal(parsed.ok, true);
  assert.equal(parsed.value.name, "Start");
  assert.equal(parsed.value.slug, "start");
  assert.equal(parsed.value.sortOrder, 10);
  assert.equal(parsed.value.status, "live");
  assert.equal(slugifyPackageName("Özel Yazılım"), "ozel-yazilim");
  assert.equal(parsePackageRecord({ name: "A" }).ok, false);
  assert.equal(parsePackageRecord({ name: "!!!" }).ok, false);
});
