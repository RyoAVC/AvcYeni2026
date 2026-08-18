import assert from "node:assert/strict";
import test from "node:test";
import {
  clampLeadPage,
  getLeadTotalPages,
  LEAD_PAGE_SIZE,
  parseLeadPage,
} from "../app/lead-pagination.mjs";

test("lead pagination validates and clamps requested pages", () => {
  assert.equal(LEAD_PAGE_SIZE, 30);
  assert.equal(parseLeadPage(undefined), 1);
  assert.equal(parseLeadPage(""), 1);
  assert.equal(parseLeadPage("0"), 1);
  assert.equal(parseLeadPage("-2"), 1);
  assert.equal(parseLeadPage("2abc"), 1);
  assert.equal(parseLeadPage("2"), 2);
  assert.equal(parseLeadPage("9007199254740992"), 1);

  assert.equal(getLeadTotalPages(0), 1);
  assert.equal(getLeadTotalPages(30), 1);
  assert.equal(getLeadTotalPages(31), 2);
  assert.equal(getLeadTotalPages(61, 20), 4);

  assert.equal(clampLeadPage(999, 31), 2);
  assert.equal(clampLeadPage(2, 31), 2);
  assert.equal(clampLeadPage(0, 31), 1);
  assert.equal(clampLeadPage(4, 0), 1);
});
