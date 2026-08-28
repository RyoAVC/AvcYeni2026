import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("../app/api/v1/commerce/licenses/resolve/route.ts", import.meta.url), "utf8");

test("resolve endpoint accepts the v2 installation contract and legacy aliases", () => {
  for (const field of ["license_key", "activation_token", "store_key", "installation_id", "domain", "primary_domain", "product"]) assert.match(source, new RegExp(field));
  assert.match(source, /product !== PRODUCT/);
  assert.match(source, /\["active", "trial"\]/);
  assert.match(source, /required_fields: \["license_key", "domain"\]/);
  assert.match(source, /optional_fields: \["store_key", "installation_id"/);
  assert.match(source, /hasStoreKey !== hasInstallationId/);
});

test("resolve endpoint exposes a safe browser-readable service contract", () => {
  assert.match(source, /export async function GET/);
  assert.match(source, /status: "ready"/);
  assert.match(source, /required_fields/);
  assert.doesNotMatch(source, /GET\(\)[\s\S]{0,500}privateKey/);
});

test("resolve endpoint binds tenant identity and returns signed entitlement metadata", () => {
  for (const check of ["customers.status", "installation.customerId", "installation.primaryDomain", "commerceLicenseInstallations.installationId", "commerceLicenseInstallations.storeKey"]) assert.match(source, new RegExp(check.replace(".", "\\.")));
  for (const field of ["signature", "key_id", "issued_at", "expires_at", "public_key"]) assert.match(source, new RegExp(field));
  assert.doesNotMatch(source, /activationTokenHash[^\n]*responseValue/);
  assert.match(source, /store_key: installation\.storeKey/);
  assert.match(source, /installation_id: installation\.installationId/);
  assert.match(source, /license_ambiguous/);
});

test("resolve endpoint records decisions and limits repeated activation", () => {
  assert.match(source, /RATE_LIMIT = 20/);
  assert.match(source, /commerceLicenseVerificationEvents/);
  assert.match(source, /rate_limited/);
  assert.match(source, /activationCount/);
});
