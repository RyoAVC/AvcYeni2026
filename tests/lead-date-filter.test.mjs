import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import { appendLeadDateParams, normalizeLeadDate, parseLeadDateRange } from "../app/lead-date-filter.mjs";

test("lead date filters validate calendar dates and preserve query parameters", () => {
  assert.equal(normalizeLeadDate("2026-08-12"), "2026-08-12");
  assert.equal(normalizeLeadDate("2026-02-29"), "");
  assert.equal(normalizeLeadDate("12.08.2026"), "");

  const range = parseLeadDateRange("2026-08-11", "2026-08-12");
  assert.deepEqual(range, {
    from: "2026-08-11",
    to: "2026-08-12",
    startInclusive: "2026-08-10T21:00:00.000Z",
    endExclusive: "2026-08-12T21:00:00.000Z",
    error: "",
    hasInput: true,
  });

  const params = appendLeadDateParams(new URLSearchParams("status=new"), range);
  assert.equal(params.toString(), "status=new&from=2026-08-11&to=2026-08-12");
  assert.match(parseLeadDateRange("2026-08-13", "2026-08-12").error, /sonra olamaz/);
  assert.match(parseLeadDateRange("invalid", "").error, /başlangıç tarihi/i);
});

test("lead date range includes the full Istanbul end date and excludes the next day", () => {
  const range = parseLeadDateRange("2026-08-12", "2026-08-12");
  const db = new DatabaseSync(":memory:");
  db.exec("CREATE TABLE leads (created_at TEXT NOT NULL)");
  const insert = db.prepare("INSERT INTO leads (created_at) VALUES (?)");
  insert.run("2026-08-11T20:59:59.999Z");
  insert.run("2026-08-11T21:00:00.000Z");
  insert.run("2026-08-12T20:59:59.999Z");
  insert.run("2026-08-12T21:00:00.000Z");

  const matches = db.prepare(
    "SELECT created_at FROM leads WHERE created_at >= ? AND created_at < ? ORDER BY created_at",
  ).all(range.startInclusive, range.endExclusive);

  assert.deepEqual(matches.map((row) => row.created_at), [
    "2026-08-11T21:00:00.000Z",
    "2026-08-12T20:59:59.999Z",
  ]);
  db.close();
});
