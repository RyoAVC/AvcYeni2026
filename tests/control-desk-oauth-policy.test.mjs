import assert from "node:assert/strict";
import test from "node:test";

import {
  CONTROL_DESK_REDIRECT_URIS,
  validControlDeskRedirect,
  validPkceChallenge,
} from "../app/oauth-policy.mjs";

test("masaüstü ve mobil uygulama geri dönüş adresleri tam eşleşmeyle kabul edilir", () => {
  assert.deepEqual(CONTROL_DESK_REDIRECT_URIS, [
    "avcicontrol://auth/callback",
    "avcicommerce://auth/callback",
  ]);
  assert.equal(validControlDeskRedirect("avcicontrol://auth/callback"), true);
  assert.equal(validControlDeskRedirect("avcicommerce://auth/callback"), true);
});

test("web, wildcard ve benzer görünümlü geri dönüş adresleri reddedilir", () => {
  assert.equal(validControlDeskRedirect("https://evil.example/auth/callback"), false);
  assert.equal(validControlDeskRedirect("avcicommerce://auth/callback/extra"), false);
  assert.equal(validControlDeskRedirect("avcicommerce://auth/callback?next=evil"), false);
  assert.equal(validControlDeskRedirect("AVCICOMMERCE://auth/callback"), false);
});

test("PKCE yalnız S256 için geçerli base64url uzunluğunu kabul eder", () => {
  assert.equal(validPkceChallenge("a".repeat(43)), true);
  assert.equal(validPkceChallenge("a".repeat(42)), false);
  assert.equal(validPkceChallenge(`${"a".repeat(42)}+`), false);
});
