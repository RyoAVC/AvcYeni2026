import assert from "node:assert/strict";
import test from "node:test";
import { hashCustomerPassword, validateCustomerPassword, verifyCustomerPassword } from "../app/customer-password.mjs";

test("customer password policy rejects weak values", () => {
  assert.equal(validateCustomerPassword("short").ok, false);
  assert.equal(validateCustomerPassword("yalnizkucukharf123").ok, false);
  assert.equal(validateCustomerPassword("GuvenliPanel2026").ok, true);
});

test("customer password stores only a salted PBKDF2 digest", async () => {
  const password = "GuvenliPanel2026";
  const encoded = await hashCustomerPassword(password);
  assert.match(encoded, /^pbkdf2-sha256\$210000\$/);
  assert.equal(encoded.includes(password), false);
  assert.equal(await verifyCustomerPassword(password, encoded), true);
  assert.equal(await verifyCustomerPassword("GuvenliPanel2027", encoded), false);
  assert.notEqual(await hashCustomerPassword(password), encoded);
});
