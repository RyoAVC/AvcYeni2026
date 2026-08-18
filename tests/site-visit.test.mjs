import assert from "node:assert/strict";
import test from "node:test";
import {
  addCalendarDays,
  istanbulCalendarDay,
  lastIstanbulDays,
  normalizeVisitPath,
  normalizeVisitReferrerHost,
  isAutomatedVisitAgent,
  isVisitVisitorKey,
  readVisitVisitorKey,
} from "../app/site-visit.mjs";

test("visit paths keep public pages and drop admin or files", () => {
  assert.equal(normalizeVisitPath("/"), "/");
  assert.equal(normalizeVisitPath("/eticaret-altyapisi?x=1"), "/eticaret-altyapisi");
  assert.equal(normalizeVisitPath("/yonetim"), "");
  assert.equal(normalizeVisitPath("/yonetim/istatistik"), "");
  assert.equal(normalizeVisitPath("/api/istatistik/ziyaret"), "");
  assert.equal(normalizeVisitPath("/favicon.svg"), "");
  assert.equal(normalizeVisitPath("https://evil.example/"), "");
});

test("visit helpers keep istanbul days and visitor cookies honest", () => {
  const now = new Date("2026-08-15T10:00:00.000Z");
  assert.equal(istanbulCalendarDay(now), "2026-08-15");
  assert.equal(addCalendarDays("2026-08-15", -1), "2026-08-14");
  assert.deepEqual(lastIstanbulDays(3, now), ["2026-08-13", "2026-08-14", "2026-08-15"]);
  assert.equal(normalizeVisitReferrerHost("Google.com"), "google.com");
  assert.equal(normalizeVisitReferrerHost("not a host"), "");
  assert.equal(isAutomatedVisitAgent("Mozilla/5.0"), false);
  assert.equal(isAutomatedVisitAgent("Googlebot/2.1"), true);
  assert.equal(isVisitVisitorKey("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"), true);
  assert.equal(isVisitVisitorKey("nope"), false);
  assert.equal(readVisitVisitorKey("avci_vid=aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa; other=1"), "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
});
