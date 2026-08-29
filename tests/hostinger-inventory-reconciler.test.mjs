import assert from "node:assert/strict";
import test from "node:test";
import { buildActiveLicenseDomainIndex, reconcileHostingerWebsites } from "../app/hostinger-inventory-reconciler.mjs";

test("yalnız aktif ve deneme lisansları domain indeksine girer", () => {
  const index = buildActiveLicenseDomainIndex([
    { customerId: 1, primaryDomain: "HTTPS://Shop.Example.com/", status: "active" },
    { customerId: 2, primaryDomain: "expired.example.com", status: "expired" },
  ]);
  assert.equal(index.get("shop.example.com").customerId, 1);
  assert.equal(index.has("expired.example.com"), false);
});

test("Hostinger sitesi yalnız birebir aktif lisans domainiyle eşleşir", () => {
  const result = reconcileHostingerWebsites(
    [{ domain: "shop.example.com" }, { domain: "other.example.com" }],
    [{ customerId: 7, primaryDomain: "shop.example.com", status: "trial" }],
  );
  assert.equal(result.matched.length, 1);
  assert.equal(result.matched[0].license.customerId, 7);
  assert.deepEqual(result.unmatched, [{ domain: "other.example.com", reason: "no_active_license" }]);
});

test("aynı domain farklı müşterilerdeyse otomatik atama yapılmaz", () => {
  const result = reconcileHostingerWebsites([{ domain: "shared.example.com" }], [
    { customerId: 1, primaryDomain: "shared.example.com", status: "active" },
    { customerId: 2, primaryDomain: "shared.example.com", status: "trial" },
  ]);
  assert.equal(result.matched.length, 0);
  assert.deepEqual(result.ambiguous, [{ domain: "shared.example.com", reason: "multiple_customers" }]);
});
