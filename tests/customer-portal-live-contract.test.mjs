import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { canUseCustomerPortalLogin, usesInternalCustomerPortal } from "../app/customer-portal-dev.mjs";

const route = readFileSync(new URL("../app/api/musteri-panel/giris/route.ts", import.meta.url), "utf8");
const form = readFileSync(new URL("../app/musteri-panel/giris/customer-portal-login-form.tsx", import.meta.url), "utf8");
const layout = readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8");
const demoPortal = readFileSync(new URL("../app/demo-portal/page.tsx", import.meta.url), "utf8");

test("live customer login opens only on HTTPS and can be explicitly disabled", () => {
  assert.equal(canUseCustomerPortalLogin(new Request("https://yeni.avcieticaret.com/v2/musteri-panel/giris"), {}), true);
  assert.equal(canUseCustomerPortalLogin(new Request("http://yeni.avcieticaret.com/v2/musteri-panel/giris"), {}), false);
  assert.equal(canUseCustomerPortalLogin(new Request("http://127.0.0.1:4121/v2/musteri-panel/giris", { headers: { "x-forwarded-proto": "https", host: "yeni.avcieticaret.com" } }), {}), false);
  assert.equal(canUseCustomerPortalLogin(new Request("http://yeni.avcieticaret.com/v2/musteri-panel/giris", { headers: { "x-forwarded-proto": "https" } }), {}), true);
  assert.equal(canUseCustomerPortalLogin(new Request("https://yeni.avcieticaret.com/v2/musteri-panel/giris"), { CUSTOMER_PORTAL_LIVE: "0" }), false);
  assert.equal(usesInternalCustomerPortal({}), true);
  assert.equal(usesInternalCustomerPortal({ LICENSE_PORTAL_URL: "https://license.example" }), false);
});

test("customer login requires an active Avci Commerce license, not email alone", () => {
  assert.match(form, /name="license_key"/);
  assert.match(form, /type="password"/);
  assert.match(route, /sha256\(licenseKey\)/);
  assert.match(route, /commerceLicenseInstallations\.customerId/);
  assert.match(route, /commerceLicenseInstallations\.activationTokenHash/);
  assert.match(route, /\["active", "trial"\]/);
  assert.match(route, /validUntil <= new Date\(\)/);
});

test("public pages receive the shared footer and demo header has no trust badge", () => {
  assert.match(layout, /<SiteFooter \/>/);
  assert.doesNotMatch(demoPortal, /DemoPortalTrustBadge/);
});
