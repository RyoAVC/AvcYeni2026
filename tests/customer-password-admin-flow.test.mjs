import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { generateCustomerPortalPassword } from "../app/customer-password-generator.mjs";
import { validateCustomerPassword } from "../app/customer-password.mjs";

test("generated customer portal password satisfies the server policy", () => {
  const values = new Set(Array.from({ length: 20 }, () => generateCustomerPortalPassword()));
  assert.equal(values.size, 20);
  for (const value of values) assert.equal(validateCustomerPassword(value).ok, true);
});

test("new customer flow keeps credentials visible once before navigation", () => {
  const source = readFileSync(new URL("../app/yonetim/musteriler/customer-form.tsx", import.meta.url), "utf8");
  assert.match(source, /mode !== "create".*generateCustomerPortalPassword/s);
  assert.match(source, /setCreatedCustomer/);
  assert.match(source, /Erişim bilgilerini kopyala/);
  assert.match(source, /güvenlik nedeniyle tekrar görüntülenmez/);
});
