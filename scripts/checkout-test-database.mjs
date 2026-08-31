import { readFileSync, readdirSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
export function initializeCheckoutTestDatabase(path = ":memory:") {
  const db = new DatabaseSync(path);
  // This initializer must never be used on a populated database.
  if (db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().length) { db.close(); throw new Error("Test DB must be empty"); }
  db.exec("PRAGMA foreign_keys=ON; CREATE TABLE checkout_test_guard(key TEXT PRIMARY KEY,value TEXT NOT NULL); INSERT INTO checkout_test_guard VALUES('purpose','isolated-checkout-test');");
  for (const file of readdirSync(new URL("../drizzle/",import.meta.url)).filter(x=>/^\d+_.+\.sql$/.test(x)).sort()) {
    if(file === "0014_tiny_crystal.sql") continue;
    db.exec(readFileSync(new URL(`../drizzle/${file}`,import.meta.url),"utf8").replaceAll("--> statement-breakpoint",""));
  }
  // Explicit test fixtures, not production defaults. No existing package is overwritten.
  db.prepare("INSERT INTO packages(name,slug,sales_type,price_amount_kurus,price_includes_vat,license_duration_days,status) VALUES ('Start','start','otomatik',4999900,1,30,'live'),('Scale','scale','otomatik',7499900,1,90,'live'),('Enterprise','enterprise','teklif',0,1,0,'live')").run();
  return db;
}
