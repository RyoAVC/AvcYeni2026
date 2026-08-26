import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";

const migration = (name) => readFileSync(new URL(`../drizzle/${name}`, import.meta.url), "utf8").replaceAll("--> statement-breakpoint", "");

test("portal product migration creates tenant-scoped tables and indexes", () => {
  const db = new DatabaseSync(":memory:");
  db.exec(migration("0013_customers.sql"));
  db.exec(migration("0018_support_tickets.sql"));
  db.exec(migration("0026_legal_franklin_storm.sql"));
  const tables = new Set(db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all().map((row) => row.name));
  for (const name of ["customer_module_instances", "customer_integration_instances", "customer_metric_snapshots", "portal_notifications", "customer_portal_profiles", "tofy_experiments", "customer_portal_documents"]) assert.ok(tables.has(name), name);
  const columns = db.prepare("PRAGMA table_info(support_tickets)").all().map((column) => column.name);
  assert.ok(columns.includes("priority"));
  const plan = db.prepare("EXPLAIN QUERY PLAN SELECT * FROM portal_notifications WHERE customer_id = ? AND status = ? ORDER BY visible_at").all(1, "active");
  assert.ok(plan.some((row) => String(row.detail).includes("idx_portal_notifications_visible")));
  db.close();
});
