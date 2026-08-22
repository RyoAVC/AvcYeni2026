import test from "node:test";
import assert from "node:assert/strict";
import { parseProductRecord, slugifyProduct, isProductStatus } from "../app/product-admin.mjs";

test("slugifyProduct converts Turkish characters and punctuation to clean slugs", () => {
  assert.equal(slugifyProduct("Avcı E-Ticaret Lisansı v2.0"), "avci-e-ticaret-lisansi-v2-0");
  assert.equal(slugifyProduct("Şık & Özel Çözümler"), "sik-ozel-cozumler");
});

test("isProductStatus validates active, draft, passive", () => {
  assert.equal(isProductStatus("active"), true);
  assert.equal(isProductStatus("draft"), true);
  assert.equal(isProductStatus("passive"), true);
  assert.equal(isProductStatus("deleted"), false);
});

test("parseProductRecord validates product name and numeric prices", () => {
  const invalid = parseProductRecord({ name: "" });
  assert.equal(invalid.ok, false);

  const valid = parseProductRecord({
    name: "Avcı Pro Lisans",
    sku: "AVC-001",
    price: 49990,
    vatRate: 20,
    stock: 50,
  });

  assert.equal(valid.ok, true);
  assert.equal(valid.value.slug, "avci-pro-lisans");
  assert.equal(valid.value.price, 49990);
  assert.equal(valid.value.stock, 50);
  assert.equal(valid.value.vatRate, 20);
});
