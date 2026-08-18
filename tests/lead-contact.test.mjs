import assert from "node:assert/strict";
import test from "node:test";
import { normalizeLeadPhone } from "../app/lead-contact.mjs";

test("lead phone normalization detects equivalent Turkish formats", () => {
  const expected = "905365995040";
  assert.equal(normalizeLeadPhone("+90 536 599 50 40"), expected);
  assert.equal(normalizeLeadPhone("0090 (536) 599-50-40"), expected);
  assert.equal(normalizeLeadPhone("0536 599 50 40"), expected);
  assert.equal(normalizeLeadPhone("5365995040"), expected);
  assert.equal(normalizeLeadPhone("+1 (415) 555-0123"), "14155550123");
  assert.equal(normalizeLeadPhone(null), "");
});
