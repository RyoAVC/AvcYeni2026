import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";

function readMigration(name) {
  return readFileSync(new URL(`../drizzle/${name}`, import.meta.url), "utf8")
    .replaceAll("--> statement-breakpoint", "");
}

test("lead migrations preserve rows and create the update timestamp", () => {
  const db = new DatabaseSync(":memory:");
  db.exec("PRAGMA foreign_keys = ON");
  db.exec(readMigration("0000_glorious_scorpion.sql"));
  db.prepare(`
    INSERT INTO leads (name, email, phone, interest, consent_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run("Test Kullanıcı", "test@example.com", "05550000000", "E-Ticaret altyapısı", "2026-08-11T10:00:00.000Z", "2026-08-11T10:00:00.000Z");

  db.exec(readMigration("0001_fast_bishop.sql"));
  db.exec(readMigration("0002_majestic_frank_castle.sql"));
  db.exec(readMigration("0003_daily_lord_tyger.sql"));
  db.exec(readMigration("0004_light_mach_iv.sql"));
  db.exec(readMigration("0005_glorious_switch.sql"));
  db.exec(readMigration("0006_mysterious_la_nuit.sql"));
  db.exec(readMigration("0007_normal_skullbuster.sql"));
  db.exec(readMigration("0008_mixed_wallop.sql"));
  db.exec(readMigration("0009_fat_krista_starr.sql"));
  db.exec(readMigration("0010_remarkable_spacker_dave.sql"));

  const row = db.prepare("SELECT created_at, updated_at, source, utm_source, utm_medium, utm_campaign, referrer_host, landing_path, phone_normalized FROM leads WHERE email = ?").get("test@example.com");
  assert.equal(row.created_at, "2026-08-11T10:00:00.000Z");
  assert.equal(row.updated_at, "2026-08-11T10:00:00.000Z");
  assert.equal(row.source, "direct");
  assert.equal(row.utm_source, "");
  assert.equal(row.referrer_host, "");
  assert.equal(row.landing_path, "");
  assert.equal(row.phone_normalized, "905550000000");

  db.prepare(`
    UPDATE leads
    SET source = ?, utm_source = ?, utm_medium = ?, utm_campaign = ?, referrer_host = ?, landing_path = ?
    WHERE id = ?
  `).run("google", "google", "cpc", "yaz-kampanyasi", "google.com", "/", 1);
  const attribution = db.prepare("SELECT source, utm_source, utm_medium, utm_campaign, referrer_host, landing_path, updated_at FROM leads WHERE id = ?").get(1);
  assert.equal(attribution.source, "google");
  assert.equal(attribution.utm_source, "google");
  assert.equal(attribution.utm_medium, "cpc");
  assert.equal(attribution.utm_campaign, "yaz-kampanyasi");
  assert.equal(attribution.referrer_host, "google.com");
  assert.equal(attribution.landing_path, "/");

  const initialRevision = attribution.updated_at;
  const firstStatusUpdate = db.prepare("UPDATE leads SET status = ?, updated_at = ? WHERE id = ? AND updated_at = ?")
    .run("contacted", "2026-08-11T10:01:00.000Z", 1, initialRevision);
  const staleStatusUpdate = db.prepare("UPDATE leads SET status = ?, updated_at = ? WHERE id = ? AND updated_at = ?")
    .run("qualified", "2026-08-11T10:02:00.000Z", 1, initialRevision);
  assert.equal(firstStatusUpdate.changes, 1);
  assert.equal(staleStatusUpdate.changes, 0);
  assert.equal(db.prepare("SELECT status FROM leads WHERE id = ?").get(1).status, "contacted");

  const columns = db.prepare("PRAGMA table_info(leads)").all();
  assert.ok(columns.some((column) => column.name === "updated_at" && column.notnull === 1));
  const indexes = db.prepare("PRAGMA index_list(leads)").all();
  assert.ok(indexes.some((index) => index.name === "idx_leads_email_created_at"));
  assert.ok(indexes.some((index) => index.name === "idx_leads_status_created_at"));
  assert.ok(indexes.some((index) => index.name === "idx_leads_source_created_at"));
  assert.ok(indexes.some((index) => index.name === "idx_leads_interest_created_at"));
  assert.ok(indexes.some((index) => index.name === "idx_leads_request_key" && index.unique === 1));
  assert.ok(indexes.some((index) => index.name === "idx_leads_phone_normalized_created_at"));
  const queryPlan = db.prepare("EXPLAIN QUERY PLAN SELECT * FROM leads WHERE status = ? ORDER BY created_at DESC").all("new");
  assert.ok(queryPlan.some((step) => String(step.detail).includes("idx_leads_status_created_at")));
  const sourcePlan = db.prepare("EXPLAIN QUERY PLAN SELECT * FROM leads WHERE source = ? ORDER BY created_at DESC").all("google");
  assert.ok(sourcePlan.some((step) => String(step.detail).includes("idx_leads_source_created_at")));
  const interestPlan = db.prepare("EXPLAIN QUERY PLAN SELECT * FROM leads WHERE interest = ? ORDER BY created_at DESC").all("E-Ticaret altyapısı");
  assert.ok(interestPlan.some((step) => String(step.detail).includes("idx_leads_interest_created_at")));
  db.prepare("UPDATE leads SET request_key = ? WHERE id = ?").run("123e4567-e89b-42d3-a456-426614174001", 1);
  assert.throws(() => db.prepare(`
    INSERT INTO leads (name, email, phone, interest, request_key, consent_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run("Tekrar Kullanıcı", "tekrar@example.com", "05550000001", "SEO ve görünürlük", "123e4567-e89b-42d3-a456-426614174001", "2026-08-11T10:30:00.000Z", "2026-08-11T10:30:00.000Z", "2026-08-11T10:30:00.000Z"), /UNIQUE constraint failed/);
  assert.equal(db.prepare("SELECT count(*) AS count FROM leads WHERE request_key = ?").get("123e4567-e89b-42d3-a456-426614174001").count, 1);
  const phonePlan = db.prepare("EXPLAIN QUERY PLAN SELECT * FROM leads WHERE phone_normalized = ? ORDER BY created_at DESC").all("905550000000");
  assert.ok(phonePlan.some((step) => String(step.detail).includes("idx_leads_phone_normalized_created_at")));

  db.prepare(`
    INSERT INTO lead_activities (lead_id, from_status, to_status, actor_email, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(1, "new", "contacted", "admin@example.com", "2026-08-11T11:00:00.000Z");
  const activity = db.prepare("SELECT from_status, to_status, actor_email FROM lead_activities WHERE lead_id = ?").get(1);
  assert.equal(activity.from_status, "new");
  assert.equal(activity.to_status, "contacted");
  assert.equal(activity.actor_email, "admin@example.com");
  const activityPlan = db.prepare("EXPLAIN QUERY PLAN SELECT * FROM lead_activities WHERE lead_id = ? ORDER BY created_at DESC").all(1);
  assert.ok(activityPlan.some((step) => String(step.detail).includes("idx_lead_activities_lead_created_at")));

  db.prepare(`
    INSERT INTO lead_notes (lead_id, content, author_email, created_at)
    VALUES (?, ?, ?, ?)
  `).run(1, "Müşteri yarın aranacak.", "admin@example.com", "2026-08-11T11:30:00.000Z");
  const note = db.prepare("SELECT content, author_email FROM lead_notes WHERE lead_id = ?").get(1);
  assert.equal(note.content, "Müşteri yarın aranacak.");
  assert.equal(note.author_email, "admin@example.com");
  const notePlan = db.prepare("EXPLAIN QUERY PLAN SELECT * FROM lead_notes WHERE lead_id = ? ORDER BY created_at DESC").all(1);
  assert.ok(notePlan.some((step) => String(step.detail).includes("idx_lead_notes_lead_created_at")));
  const noteIndexes = db.prepare("PRAGMA index_list(lead_notes)").all();
  assert.ok(noteIndexes.some((index) => index.name === "idx_lead_notes_request_key" && index.unique === 1));
  db.prepare(`
    INSERT INTO lead_notes (lead_id, content, author_email, request_key, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(1, "Tek sefer kaydedilecek not.", "admin@example.com", "123e4567-e89b-42d3-a456-426614174000", "2026-08-11T11:31:00.000Z");
  assert.throws(() => db.prepare(`
    INSERT INTO lead_notes (lead_id, content, author_email, request_key, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(1, "Yinelenen not.", "admin@example.com", "123e4567-e89b-42d3-a456-426614174000", "2026-08-11T11:32:00.000Z"), /UNIQUE constraint failed/);
  assert.equal(db.prepare("SELECT count(*) AS count FROM lead_notes WHERE request_key = ?").get("123e4567-e89b-42d3-a456-426614174000").count, 1);
  db.prepare("DELETE FROM leads WHERE id = ?").run(1);
  assert.equal(db.prepare("SELECT count(*) AS count FROM lead_activities").get().count, 0);
  assert.equal(db.prepare("SELECT count(*) AS count FROM lead_notes").get().count, 0);
  db.close();
});
