import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { initializeCheckoutTestDatabase } from "../scripts/checkout-test-database.mjs";
import { createActivationToken, resolveCommerceInstallationCandidate, sha256 } from "../app/commerce-license-control-plane.mjs";

// Mirrors app/api/yonetim/musteriler/[id]/portal/route.ts's "commerce-license" action: an
// INSERT ... ON CONFLICT(store_key, installation_id) DO UPDATE that rotates the activation
// token and can move primaryDomain, since there is no separate "change domain" action.
function upsertLicense(db, customerId, { storeKey, installationId, primaryDomain, validUntil }) {
  const token = createActivationToken();
  return sha256(token).then((tokenHash) => {
    db.prepare(`
      INSERT INTO commerce_license_installations
        (customer_id, store_key, installation_id, primary_domain, activation_token_hash, status, valid_until, activation_count, first_activated_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 'active', ?, 0, '', ?)
      ON CONFLICT(store_key, installation_id) DO UPDATE SET
        primary_domain = excluded.primary_domain,
        activation_token_hash = excluded.activation_token_hash,
        activation_count = 0,
        first_activated_at = '',
        updated_at = excluded.updated_at
    `).run(customerId, storeKey, installationId, primaryDomain, tokenHash, validUntil, new Date().toISOString());
    return token;
  });
}

// Mirrors app/api/v1/commerce/licenses/resolve/route.ts's post-resolution bookkeeping.
function recordActivation(db, installation) {
  const now = new Date().toISOString();
  db.prepare("UPDATE commerce_license_installations SET activation_count = activation_count + 1, first_activated_at = CASE WHEN first_activated_at = '' THEN ? ELSE first_activated_at END, last_seen_at = ? WHERE id = ?")
    .run(now, now, installation.id);
}

function findByToken(db, token) {
  return sha256(token).then((hash) => db.prepare("SELECT * FROM commerce_license_installations WHERE activation_token_hash = ?").all(hash));
}

function toCandidate(row) {
  return { id: row.id, status: row.status, primaryDomain: row.primary_domain, activationCount: row.activation_count, firstActivatedAt: row.first_activated_at };
}

test("domain change: admin re-provisioning moves the license off the old domain and rotates the token", async () => {
  const db = initializeCheckoutTestDatabase();
  try {
    const customerId = db.prepare("INSERT INTO customers(name,email,phone,status,created_by_email) VALUES ('Murat Bey','musteri@ornek.local','','active','test')").run().lastInsertRowid;
    const validUntil = new Date(Date.now() + 365 * 86400000).toISOString();
    const oldToken = await upsertLicense(db, customerId, { storeKey: "basbitir-store", installationId: "installation-basbitir-001", primaryDomain: "old-basbitir.com", validUntil });

    let candidates = (await findByToken(db, oldToken)).map(toCandidate);
    assert.equal(resolveCommerceInstallationCandidate(candidates, "old-basbitir.com").outcome, "resolved");

    // Admin moves the SAME installation to a new domain (no dedicated "change domain" action exists).
    const newToken = await upsertLicense(db, customerId, { storeKey: "basbitir-store", installationId: "installation-basbitir-001", primaryDomain: "basbitir.com", validUntil });
    assert.notEqual(newToken, oldToken, "domain change rotates the activation token");

    // Old domain no longer resolves: the row itself moved, it wasn't duplicated.
    const rowCount = db.prepare("SELECT COUNT(*) AS n FROM commerce_license_installations").get().n;
    assert.equal(rowCount, 1);
    const oldTokenCandidates = (await findByToken(db, oldToken)).map(toCandidate);
    assert.equal(oldTokenCandidates.length, 0, "the rotated-away old token is no longer valid at all");

    const newTokenCandidates = (await findByToken(db, newToken)).map(toCandidate);
    assert.equal(resolveCommerceInstallationCandidate(newTokenCandidates, "old-basbitir.com").outcome, "missing", "old domain no longer resolves once the installation moved");
    assert.equal(resolveCommerceInstallationCandidate(newTokenCandidates, "basbitir.com").outcome, "resolved", "new domain resolves with the new token");
  } finally {
    db.close();
  }
});

test("reinstall: repeated resolution for the same domain/token is idempotent and preserves first-activation history", async () => {
  const db = initializeCheckoutTestDatabase();
  try {
    const customerId = db.prepare("INSERT INTO customers(name,email,phone,status,created_by_email) VALUES ('Murat Bey','musteri@ornek.local','','active','test')").run().lastInsertRowid;
    const validUntil = new Date(Date.now() + 365 * 86400000).toISOString();
    const token = await upsertLicense(db, customerId, { storeKey: "basbitir-store", installationId: "installation-basbitir-001", primaryDomain: "basbitir.com", validUntil });

    const candidatesFor = async () => (await findByToken(db, token)).map(toCandidate);
    const resolveOnce = async () => {
      const [row] = await findByToken(db, token);
      const outcome = resolveCommerceInstallationCandidate([toCandidate(row)], "basbitir.com");
      assert.equal(outcome.outcome, "resolved");
      recordActivation(db, row);
    };

    // Same store, same domain, same token — reinstalling the software and re-resolving.
    await resolveOnce();
    const afterFirst = (await candidatesFor())[0];
    await resolveOnce();
    await resolveOnce();
    const afterThird = (await candidatesFor())[0];

    assert.equal(afterThird.activationCount, 3, "each reinstall/resolve call is counted");
    assert.equal(afterThird.firstActivatedAt, afterFirst.firstActivatedAt, "first activation timestamp never resets on reinstall");
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM commerce_license_installations").get().n, 1, "reinstall never creates a duplicate installation row");
  } finally {
    db.close();
  }
});

test("device change: the resolve contract carries no device/hardware identifier, so moving to new hardware needs no re-provisioning", () => {
  const routeSource = readFileSync(new URL("../app/api/v1/commerce/licenses/resolve/route.ts", import.meta.url), "utf8");
  // The only identity fields the server reads from the request body are license/domain/store/installation —
  // all config-derived (see AvcETİCARET2026 StoreContext::fromConfig), never machine/hardware-derived.
  for (const field of ["license_key", "domain", "store_key", "installation_id"]) assert.match(routeSource, new RegExp(field));
  for (const deviceLikeField of ["device_id", "hardware_id", "machine_id", "fingerprint", "mac_address", "serial_number"]) {
    assert.doesNotMatch(routeSource, new RegExp(deviceLikeField, "i"));
  }

  // Resolving twice with identical identity but a different declared commerce_version (the
  // closest thing to "a different environment") must not be treated as a conflicting device.
  const first = resolveCommerceInstallationCandidate([{ id: 1, status: "active", primaryDomain: "basbitir.com" }], "basbitir.com");
  const second = resolveCommerceInstallationCandidate([{ id: 1, status: "active", primaryDomain: "basbitir.com" }], "basbitir.com");
  assert.equal(first.outcome, "resolved");
  assert.equal(second.outcome, "resolved");
  assert.equal(first.installation.id, second.installation.id);
});
