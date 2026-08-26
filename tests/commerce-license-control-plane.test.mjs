import test from "node:test";
import assert from "node:assert/strict";
import { generateKeyPairSync, verify } from "node:crypto";
import {
  createActivationToken, decodeBase64Url, issueCommerceLicense, normalizeCommerceDomain, parseLimits, parseScopes, sha256,
} from "../app/commerce-license-control-plane.mjs";

test("activation token is random, hashable and never a raw database key", async () => {
  const first = createActivationToken();
  const second = createActivationToken();
  assert.match(first, /^avc_live_[A-Za-z0-9_-]{40,}$/);
  assert.notEqual(first, second);
  assert.notEqual(await sha256(first), first);
});

test("license issuer produces the Commerce Ed25519 token contract", async () => {
  const { privateKey, publicKey } = generateKeyPairSync("ed25519");
  const privatePkcs8 = privateKey.export({ format: "der", type: "pkcs8" }).toString("base64url");
  const payload = { store_key: "basbitir-store", installation_id: "installation-basbitir-001", plan: "scale", commerce_version: "1.0.0", issued_at: "2026-08-26T00:00:00.000Z", valid_until: "2027-08-26T00:00:00.000Z", scopes: ["core.catalog"], limits: {} };
  const token = await issueCommerceLicense(payload, privatePkcs8);
  const [encodedPayload, encodedSignature] = token.split(".");
  assert.deepEqual(JSON.parse(Buffer.from(decodeBase64Url(encodedPayload)).toString("utf8")), payload);
  assert.equal(verify(null, Buffer.from(encodedPayload), publicKey, Buffer.from(decodeBase64Url(encodedSignature))), true);
});

test("domain, scopes and limits normalize without inventing entitlements", () => {
  assert.equal(normalizeCommerceDomain("https://www.basbitir.com/admin"), "basbitir.com");
  assert.deepEqual(parseScopes("core.catalog, addon.tofy core.catalog !!!"), ["addon.tofy", "core.catalog"]);
  assert.deepEqual(parseLimits('{"tofy.events":1000}'), { "tofy.events": 1000 });
  assert.throws(() => parseLimits('{"tofy.events":-1}'));
});
