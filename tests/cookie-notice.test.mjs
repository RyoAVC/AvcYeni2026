import assert from "node:assert/strict";
import test from "node:test";
import {
  readCookieNoticeChoice,
  shouldHideCookieNotice,
  shouldRecordSiteVisit,
} from "../app/cookie-notice-choice.mjs";

test("cookie notice hides on admin and only records after accept", () => {
  assert.equal(readCookieNoticeChoice("1"), "accepted");
  assert.equal(readCookieNoticeChoice("0"), "declined");
  assert.equal(readCookieNoticeChoice(""), "");
  assert.equal(shouldHideCookieNotice("/yonetim/istatistik", ""), true);
  assert.equal(shouldHideCookieNotice("/", ""), false);
  assert.equal(shouldHideCookieNotice("/", "declined"), true);
  assert.equal(shouldRecordSiteVisit("/", "accepted"), true);
  assert.equal(shouldRecordSiteVisit("/", "declined"), false);
  assert.equal(shouldRecordSiteVisit("/", ""), false);
  assert.equal(shouldRecordSiteVisit("/yonetim", "accepted"), false);
});
