import assert from "node:assert/strict";
import test from "node:test";
import { normalizeEmailAddress } from "../app/email-normalization.mjs";

test("email normalization is bounded and locale independent", () => {
  assert.equal(normalizeEmailAddress("  INFO@EXAMPLE.COM  "), "info@example.com");
  assert.equal(normalizeEmailAddress("I@EXAMPLE.COM"), "i@example.com");
  assert.notEqual(normalizeEmailAddress("I@EXAMPLE.COM"), "ı@example.com");
  assert.equal(normalizeEmailAddress("LONG@EXAMPLE.COM", 4), "long");
  assert.equal(normalizeEmailAddress(null), "");
  assert.equal(normalizeEmailAddress("A@B.COM", 0), "a@b.com");
});
