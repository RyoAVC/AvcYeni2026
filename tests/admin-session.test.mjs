import assert from "node:assert/strict";
import test from "node:test";
import {
  adminLoginPath,
  createAdminSessionToken,
  equalBytes,
  isLocalAdminHost,
  localAdminPrefillEmail,
  readAdminSessionToken,
  safeAdminNextPath,
  secretsMatch,
} from "../app/admin-session.mjs";

const SECRET = "a".repeat(32);

test("admin next path stays inside /yonetim", () => {
  assert.equal(safeAdminNextPath("/yonetim/istatistik"), "/yonetim/istatistik");
  assert.equal(safeAdminNextPath("/yonetim/giris"), "/yonetim");
  assert.equal(safeAdminNextPath("https://evil.example/"), "/yonetim");
  assert.equal(safeAdminNextPath("/"), "/yonetim");
  assert.equal(adminLoginPath("/yonetim/basvurular"), "/yonetim/giris?next=%2Fyonetim%2Fbasvurular");
});

test("admin session token verifies and expires", async () => {
  const token = await createAdminSessionToken(SECRET, { email: "Yonetim@Avci.local", displayName: "Avcı Yönetici" });
  const session = await readAdminSessionToken(SECRET, token);
  assert.equal(session?.email, "yonetim@avci.local");
  assert.equal(await readAdminSessionToken("b".repeat(32), token), null);
  assert.equal(await readAdminSessionToken(SECRET, "v1.tampered.sig"), null);
});

test("password compare does not accept a near miss", async () => {
  assert.equal(await secretsMatch(SECRET, "ornek-sifre-10", "ornek-sifre-10"), true);
  assert.equal(await secretsMatch(SECRET, "ornek-sifre-11", "ornek-sifre-10"), false);
  assert.equal(equalBytes(new Uint8Array([1, 2]), new Uint8Array([1, 2])), true);
  assert.equal(equalBytes(new Uint8Array([1, 2]), new Uint8Array([1, 3])), false);
});

test("local login prefill is only for localhost and never uses a remote host", () => {
  assert.equal(isLocalAdminHost("127.0.0.1:4115"), true);
  assert.equal(isLocalAdminHost("localhost"), true);
  assert.equal(isLocalAdminHost("avcieticaret.com"), false);
  assert.equal(localAdminPrefillEmail({ ADMIN_LOGIN_EMAIL: "yonetim@avci.local" }, "127.0.0.1:4115"), "yonetim@avci.local");
  assert.equal(localAdminPrefillEmail({ ADMIN_LOGIN_EMAIL: "yonetim@avci.local" }, "avcieticaret.com"), "");
});
