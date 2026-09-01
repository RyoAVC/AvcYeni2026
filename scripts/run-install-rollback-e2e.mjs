// Real HTTP-level E2E for the module install/release/rollback pipeline, against an
// already-running local dev server (127.0.0.1:4115). Completes the gap left in FAZ 4:
// the PHP agent's own functions were proven separately (see AvciControlDesk/scripts/
// verify-install-agent-deployment.php); this script proves the Node control-plane API
// itself, end to end, over real HTTP, including the Ed25519-signed release assignment
// and the rollback-retriggers-execution behaviour.
//
// Preconditions (not automated here, since they require a server restart):
//   1. Local dev server running: npx vite --host 127.0.0.1 --port 4115 --strictPort
//   2. .dev.vars has CONTROL_DESK_API_TOKEN=acd_live_... and AVCI_RELEASE_PUBLIC_KEY=<base64url>
//      matching the RELEASE_PRIVATE_KEY_PKCS8 passed via env below.
//
// Seeds its own throwaway customer + license installation directly into the local D1
// sqlite file, runs the full protocol, then deletes everything it created.
import { DatabaseSync } from "node:sqlite";
import { sign as edSign } from "node:crypto";
import { readdirSync } from "node:fs";

const BASE = process.env.E2E_BASE_URL || "http://127.0.0.1:4115";
const ADMIN_TOKEN = process.env.CONTROL_DESK_API_TOKEN;
const RELEASE_PRIVATE_KEY_PKCS8 = process.env.AVCI_RELEASE_PRIVATE_KEY_PKCS8;
if (!ADMIN_TOKEN || !RELEASE_PRIVATE_KEY_PKCS8) {
  console.error("Set CONTROL_DESK_API_TOKEN and AVCI_RELEASE_PRIVATE_KEY_PKCS8 (matching .dev.vars's AVCI_RELEASE_PUBLIC_KEY) before running.");
  process.exit(2);
}

const d1Dir = ".wrangler/state/v3/d1/miniflare-D1DatabaseObject";
const d1File = readdirSync(d1Dir).find((name) => name.endsWith(".sqlite") && name !== "metadata.sqlite");
if (!d1File) { console.error(`No D1 database file found under ${d1Dir}. Is the dev server running?`); process.exit(2); }
const db = new DatabaseSync(`${d1Dir}/${d1File}`);

function b64urlToBuffer(value) { return Buffer.from(value.replace(/-/g, "+").replace(/_/g, "/"), "base64"); }
function signManifest(manifestObj) {
  const key = { key: b64urlToBuffer(RELEASE_PRIVATE_KEY_PKCS8), format: "der", type: "pkcs8" };
  return edSign(null, Buffer.from(JSON.stringify(manifestObj)), key).toString("base64url");
}
function signReleaseToken(release) {
  const key = { key: b64urlToBuffer(RELEASE_PRIVATE_KEY_PKCS8), format: "der", type: "pkcs8" };
  const payload = Buffer.from(JSON.stringify(release)).toString("base64url");
  return `${payload}.${edSign(null, Buffer.from(payload), key).toString("base64url")}`;
}

let passCount = 0, failCount = 0;
function assert(condition, message, extra) {
  if (condition) { console.log(`OK: ${message}`); passCount++; }
  else { console.error(`FAIL: ${message}`, extra ?? ""); failCount++; }
}

async function post(path, token, body) {
  const response = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
  return { status: response.status, json: await response.json().catch(() => ({})) };
}

function seed() {
  const now = new Date().toISOString();
  const validUntil = new Date(Date.now() + 365 * 86400000).toISOString();
  db.exec("BEGIN IMMEDIATE");
  try {
    const email = `e2e-${Date.now()}@example.test`;
    const cust = db.prepare("INSERT INTO customers(name,email,phone,status,created_by_email,created_at,updated_at) VALUES (?,?,'','active','e2e-seed',?,?)").run("E2E Test Customer", email, now, now);
    const customerId = Number(cust.lastInsertRowid);
    const storeKey = `e2e-test-store-${Date.now()}`;
    db.prepare("INSERT INTO commerce_license_installations(customer_id,store_key,installation_id,primary_domain,activation_token_hash,status,valid_until,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)")
      .run(customerId, storeKey, "installation-e2e-test-001", "e2e-test.example.test", "deadbeef".repeat(8), "active", validUntil, now, now);
    db.exec("COMMIT");
    const [license] = db.prepare("SELECT id FROM commerce_license_installations WHERE store_key=?").all(storeKey);
    return { customerId, licenseId: license.id, storeKey, email };
  } catch (error) { db.exec("ROLLBACK"); throw error; }
}

function cleanup({ licenseId, storeKey, email }) {
  db.exec("BEGIN IMMEDIATE");
  try {
    db.prepare("DELETE FROM commerce_install_job_events WHERE job_id IN (SELECT job_id FROM commerce_install_jobs WHERE license_id=?)").run(licenseId);
    db.prepare("DELETE FROM commerce_install_jobs WHERE license_id=?").run(licenseId);
    db.prepare("DELETE FROM commerce_license_installations WHERE store_key=?").run(storeKey);
    db.prepare("DELETE FROM customers WHERE email=?").run(email);
    db.exec("COMMIT");
  } catch (error) { db.exec("ROLLBACK"); throw error; }
}

async function main() {
  const seeded = seed();
  try {
    const create = await post("/api/v1/control-desk/install-jobs", ADMIN_TOKEN, { licenseId: seeded.licenseId, domain: "e2e-test.example.test", environment: "staging" });
    assert(create.status === 201 && create.json.ok, "install job created (201)", create);
    const { jobId, enrollmentToken } = create.json;
    assert(typeof jobId === "string" && jobId.startsWith("install-"), "jobId looks right", jobId);
    assert(typeof enrollmentToken === "string" && enrollmentToken.startsWith("aci_enroll_"), "enrollment token issued", enrollmentToken);

    const claim = await post("/api/v1/commerce/install-agent/jobs", enrollmentToken, { action: "claim", agent_id: "e2e-agent-001", agent_version: "0.3.0" });
    assert(claim.status === 200 && claim.json.task?.action === "preflight", "agent claim -> preflight task", claim.json);
    const agentToken = claim.json.agent_token;

    const preflightReport = await post("/api/v1/commerce/install-agent/jobs", agentToken, { action: "report", step: "preflight", agent_id: "e2e-agent-001", agent_version: "0.3.0", job_id: jobId, result: { passed: true, code: "preflight_ok" } });
    assert(preflightReport.status === 200 && preflightReport.json.status === "ready", "preflight report -> job ready (awaiting_release)", preflightReport.json);

    const deploymentId = "deploy-e2e-0001", version = "1.0.1", treeSha256 = "a".repeat(64);
    const manifest = { format: "avci-commerce.release-assignment.v1", deployment_id: deploymentId, expected_status: "staged", version, tree_sha256: treeSha256 };
    const release = { version, minimum_version: "1.0.0", channel: "pilot", rollout_percent: 100, artifact_url: "https://updates.avcieticaret.com/commerce/e2e-1.0.1.zip", artifact_sha256: "b".repeat(64) };
    const signedReleaseManifest = signReleaseToken(release);
    const assign = await post("/api/v1/control-desk/releases/assign", ADMIN_TOKEN, { jobId, deploymentId, version, treeSha256, signature: signManifest(manifest), signedReleaseManifest });
    assert(assign.status === 200 && assign.json.step === "release_assigned", "signed release assigned", assign.json);

    const poll1 = await post("/api/v1/commerce/install-agent/jobs", agentToken, { action: "poll", agent_id: "e2e-agent-001", agent_version: "0.3.0", job_id: jobId });
    assert(poll1.status === 200 && poll1.json.task?.action === "execute_deployment" && poll1.json.task?.deployment_id === deploymentId, "poll -> execute_deployment task with correct deployment id", poll1.json);
    assert(poll1.json.task?.artifact_url === release.artifact_url && poll1.json.task?.artifact_sha256 === release.artifact_sha256 && poll1.json.task?.signed_release_manifest === signedReleaseManifest, "poll carries the verified artifact contract", poll1.json);

    const deployReport = await post("/api/v1/commerce/install-agent/jobs", agentToken, { action: "report", step: "deployment", agent_id: "e2e-agent-001", agent_version: "0.3.0", job_id: jobId, result: { passed: true, code: "deployment_complete" } });
    assert(deployReport.status === 200 && deployReport.json.status === "complete", "deployment report -> job complete", deployReport.json);

    const rollback = await post(`/api/v1/control-desk/install-jobs/${jobId}/rollback`, ADMIN_TOKEN, { expectedStatus: "healthcheck_failed" });
    assert(rollback.status === 202 && rollback.json.status === "ready" && rollback.json.step === "rollback", "rollback accepted, job reset to ready/release_assigned", rollback.json);

    const poll2 = await post("/api/v1/commerce/install-agent/jobs", agentToken, { action: "poll", agent_id: "e2e-agent-001", agent_version: "0.3.0", job_id: jobId });
    assert(poll2.status === 200 && poll2.json.task?.action === "execute_deployment" && poll2.json.task?.deployment_id === deploymentId, "post-rollback poll -> execute_deployment re-triggered for same deployment", poll2.json);
    assert(poll2.json.task?.expected_status === "healthcheck_failed", "post-rollback task carries the rollback's expected_status", poll2.json);

    const rollbackReport = await post("/api/v1/commerce/install-agent/jobs", agentToken, { action: "report", step: "deployment", agent_id: "e2e-agent-001", agent_version: "0.3.0", job_id: jobId, result: { passed: false, code: "deployment_rolled_back" } });
    assert(rollbackReport.status === 200 && rollbackReport.json.status === "failed", "rollback outcome reported (job ends failed = rolled back, not silently 'complete')", rollbackReport.json);

    const staleClaim = await post("/api/v1/commerce/install-agent/jobs", enrollmentToken, { action: "claim", agent_id: "intruder-agent", agent_version: "0.2.0" });
    assert(staleClaim.status === 409 && staleClaim.json.code === "job_already_claimed", "a second agent cannot hijack an already-claimed job", staleClaim.json);
  } finally {
    cleanup(seeded);
  }
  console.log(`\n${passCount} passed, ${failCount} failed`);
  process.exitCode = failCount > 0 ? 1 : 0;
}

main().catch((error) => { console.error("E2E script crashed:", error); process.exitCode = 1; });
