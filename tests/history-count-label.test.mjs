import assert from "node:assert/strict";
import test from "node:test";
import { historyCountLabel } from "../app/history-count-label.mjs";

test("limited admin histories disclose the visible and total row counts", () => {
  assert.equal(historyCountLabel(0, 0, "not"), "0 not");
  assert.equal(historyCountLabel(12, 12, "not"), "12 not");
  assert.equal(historyCountLabel(100, 138, "not"), "Son 100 / 138 not");
  assert.equal(historyCountLabel(100, 245, "durum değişikliği"), "Son 100 / 245 durum değişikliği");
  assert.equal(historyCountLabel(-1, 4, "not"), "Son 0 / 4 not");
  assert.equal(historyCountLabel(8, 4, "not"), "8 not");
});
