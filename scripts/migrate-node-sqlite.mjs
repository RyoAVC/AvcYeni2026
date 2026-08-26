import { mkdirSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";

const databasePath = process.env.AVCI_SQLITE_PATH?.trim();
if (!databasePath) throw new Error("AVCI_SQLITE_PATH is required");

mkdirSync(dirname(databasePath), { recursive: true });
const database = new DatabaseSync(databasePath);
database.exec("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;");
database.exec("CREATE TABLE IF NOT EXISTS __avci_migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL)");

const migrationDirectory = resolve(process.cwd(), "drizzle");
const files = readdirSync(migrationDirectory).filter((name) => /^\d+_.+\.sql$/.test(name)).sort();
const applied = new Set(database.prepare("SELECT name FROM __avci_migrations").all().map((row) => row.name));
// 0014, önceki elle adlandırılmış müşteri migrasyonunun Drizzle tarafından
// üretilmiş birebir kopyasıdır. Yeni kurulumlarda ikinci kez çalıştırılmaz.
const superseded = new Set(["0014_tiny_crystal.sql"]);

for (const name of files) {
  if (applied.has(name)) continue;
  if (superseded.has(name)) {
    database.prepare("INSERT INTO __avci_migrations (name, applied_at) VALUES (?, ?)").run(name, new Date().toISOString());
    console.log(`migration_superseded:${name}`);
    continue;
  }
  const sql = readFileSync(resolve(migrationDirectory, name), "utf8").replaceAll("--> statement-breakpoint", "");
  database.exec("BEGIN IMMEDIATE");
  try {
    database.exec(sql);
    database.prepare("INSERT INTO __avci_migrations (name, applied_at) VALUES (?, ?)").run(name, new Date().toISOString());
    database.exec("COMMIT");
    console.log(`migration_applied:${name}`);
  } catch (cause) {
    database.exec("ROLLBACK");
    throw cause;
  }
}

database.exec("PRAGMA optimize");
database.close();
console.log(`database_ready:${files.length}`);
