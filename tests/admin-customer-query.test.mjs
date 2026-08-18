import assert from "node:assert/strict";
import test from "node:test";
import { adminCustomerListHref, parseAdminCustomerId, parseAdminLeadId, parseAdminModuleId, parseAdminOrderId, parseAdminPackageId } from "../app/admin-customer-query.mjs";

test("admin customer query keeps only positive ids", () => {
  assert.equal(parseAdminCustomerId("12"), 12);
  assert.equal(parseAdminCustomerId(["8"]), 8);
  assert.equal(parseAdminCustomerId("0"), 0);
  assert.equal(parseAdminCustomerId("no"), 0);
  assert.equal(parseAdminLeadId("3"), 3);
});

test("admin order query keeps only positive ids", () => {
  assert.equal(parseAdminOrderId("4"), 4);
  assert.equal(parseAdminOrderId(["11"]), 11);
  assert.equal(parseAdminOrderId("0"), 0);
});

test("admin package and module query keep only positive ids", () => {
  assert.equal(parseAdminPackageId("9"), 9);
  assert.equal(parseAdminModuleId(["6"]), 6);
  assert.equal(parseAdminPackageId("0"), 0);
  assert.equal(parseAdminModuleId("no"), 0);
});

test("admin customer list href keeps musteri and skips empty filters", () => {
  assert.equal(adminCustomerListHref("/yonetim/siparisler", 0), "/yonetim/siparisler");
  assert.equal(adminCustomerListHref("/yonetim/siparisler", 7), "/yonetim/siparisler?musteri=7");
  assert.equal(
    adminCustomerListHref("/yonetim/faturalar", 3, { q: "start", status: "draft", page: 2 }),
    "/yonetim/faturalar?q=start&status=draft&page=2&musteri=3",
  );
  assert.equal(adminCustomerListHref("/yonetim/destek", 4, { status: "all", topic: "" }), "/yonetim/destek?musteri=4");
});

test("admin customer list href keeps catalog filters", () => {
  assert.equal(
    adminCustomerListHref("/yonetim/siparisler", 2, { paketId: 9, modulId: "" }),
    "/yonetim/siparisler?paketId=9&musteri=2",
  );
  assert.equal(
    adminCustomerListHref("/yonetim/faturalar", 0, { siparis: 8 }),
    "/yonetim/faturalar?siparis=8",
  );
  assert.equal(
    adminCustomerListHref("/yonetim/destek", 5, { siparis: 8 }),
    "/yonetim/destek?siparis=8&musteri=5",
  );
  assert.equal(
    adminCustomerListHref("/yonetim/musteriler", 0, { eksik: "siparis" }),
    "/yonetim/musteriler?eksik=siparis",
  );
  assert.equal(
    adminCustomerListHref("/yonetim/siparisler", 2, { eksik: "fatura" }),
    "/yonetim/siparisler?eksik=fatura&musteri=2",
  );
});
