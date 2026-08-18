import assert from "node:assert/strict";
import test from "node:test";
import { parseSoftwareOrderRecord, isSameCatalogSoftwareOrder } from "../app/software-order-admin.mjs";

test("software order requires customer and matching catalog item", () => {
  const parsed = parseSoftwareOrderRecord({
    customerId: "3",
    kind: "package",
    packageId: "2",
    moduleId: "9",
    status: "active",
    priceNote: "Teklifle yazılır",
    note: "Kurulum notu",
  });
  assert.equal(parsed.ok, true);
  assert.equal(parsed.value.customerId, 3);
  assert.equal(parsed.value.packageId, 2);
  assert.equal(parsed.value.moduleId, null);
  assert.equal(parseSoftwareOrderRecord({ customerId: "1", kind: "package" }).ok, false);
  assert.equal(parseSoftwareOrderRecord({ customerId: "1", kind: "module", moduleId: "0" }).ok, false);
  assert.equal(parseSoftwareOrderRecord({ kind: "package", packageId: "1" }).ok, false);
});

test("same catalog software order ignores cancelled rows", () => {
  const incoming = { customerId: 4, kind: "package", packageId: 2, moduleId: null };
  assert.equal(isSameCatalogSoftwareOrder({ customerId: 4, kind: "package", packageId: 2, status: "active" }, incoming), true);
  assert.equal(isSameCatalogSoftwareOrder({ customerId: 4, kind: "package", packageId: 2, status: "draft" }, incoming), true);
  assert.equal(isSameCatalogSoftwareOrder({ customerId: 4, kind: "package", packageId: 2, status: "cancelled" }, incoming), false);
  assert.equal(isSameCatalogSoftwareOrder({ customerId: 4, kind: "package", packageId: 9, status: "active" }, incoming), false);
  assert.equal(isSameCatalogSoftwareOrder(
    { customerId: 4, kind: "module", moduleId: 3, status: "active" },
    { customerId: 4, kind: "module", moduleId: 3 },
  ), true);
});
