import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync(
  new URL("../app/yonetim/lisanslar/page.tsx", import.meta.url),
  "utf8",
);
const client = readFileSync(
  new URL("../app/yonetim/lisanslar/license-center.tsx", import.meta.url),
  "utf8",
);
const nav = readFileSync(
  new URL("../app/yonetim/admin-shell.tsx", import.meta.url),
  "utf8",
);

test("admin navigation exposes the central license workspace", () => {
  assert.match(nav, /Lisans Yönetimi/);
  assert.match(nav, /\/yonetim\/lisanslar/);
});

test("license center joins domain modules integrations invoices and commercial terms", () => {
  for (const value of [
    "commerceLicenseInstallations",
    "customerModuleInstances",
    "customerIntegrationInstances",
    "softwareInvoices",
  ])
    assert.match(page, new RegExp(value));
  for (const value of [
    "Kalan süre",
    "Ödeme planı",
    "Ceza",
    "aktif modül",
    "aktif entegrasyon",
    "Lisans anahtarını kopyala",
  ])
    assert.match(client, new RegExp(value));
  for (const value of [
    "Lisans işlemleri",
    "Kurulum anahtarını yenile",
    "Süreyi uzat",
    "Lisansı kalıcı sil",
    "commerce-license-delete",
  ])
    assert.match(client, new RegExp(value));
});

test("license deletion is guarded by revocation activation history and domain confirmation", () => {
  const route = readFileSync(
    new URL(
      "../app/api/yonetim/musteriler/[id]/portal/route.ts",
      import.meta.url,
    ),
    "utf8",
  );
  for (const value of [
    "commerce-license-delete",
    "confirmation",
    'license.status !== "revoked"',
    "activationCount",
    "commerce_license_deleted",
  ])
    assert.ok(route.includes(value));
});
