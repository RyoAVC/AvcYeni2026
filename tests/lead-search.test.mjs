import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import { escapeLeadLike, normalizeLeadSearch } from "../app/lead-search.mjs";

test("lead search treats SQLite wildcard characters as literal text", () => {
  assert.equal(normalizeLeadSearch("  Acme_\u0000  100%  "), "Acme_ 100%");
  assert.equal(normalizeLeadSearch(null), "");
  assert.equal(normalizeLeadSearch("x".repeat(100)).length, 80);
  assert.equal(escapeLeadLike("Acme_100%\\TR"), "Acme\\_100\\%\\\\TR");

  const db = new DatabaseSync(":memory:");
  db.exec("CREATE TABLE records (value TEXT NOT NULL)");
  db.prepare("INSERT INTO records (value) VALUES (?), (?)").run("Acme_100%", "AcmeX100Y");
  const literalPattern = `%${escapeLeadLike("Acme_100%")}%`;
  const matches = db.prepare("SELECT value FROM records WHERE value LIKE ? ESCAPE '\\'").all(literalPattern);
  assert.deepEqual(matches.map((row) => row.value), ["Acme_100%"]);
  db.close();
});
