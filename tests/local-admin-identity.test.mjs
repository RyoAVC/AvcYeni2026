import assert from "node:assert/strict";
import test from "node:test";
import {
  LOCAL_ADMIN_EMAIL,
  USER_EMAIL_HEADER,
  isLoopbackHostname,
  shouldApplyLocalAdminIdentity,
  withLocalAdminIdentity,
} from "../app/local-admin-identity.mjs";

test("local admin identity stays off unless the local bypass flag is set", () => {
  const localPublic = new Request("http://127.0.0.1:4115/");
  const localAdmin = new Request("http://127.0.0.1:4115/yonetim/basvurular");
  const publicRequest = new Request("https://avcieticaret.com/yonetim/basvurular");

  assert.equal(isLoopbackHostname("127.0.0.1"), true);
  assert.equal(isLoopbackHostname("localhost"), true);
  assert.equal(isLoopbackHostname("avcieticaret.com"), false);

  assert.equal(shouldApplyLocalAdminIdentity(localPublic, {}), false);
  assert.equal(shouldApplyLocalAdminIdentity(localPublic, { LOCAL_ADMIN_BYPASS: "0" }), false);
  assert.equal(shouldApplyLocalAdminIdentity(localPublic, { LOCAL_ADMIN_BYPASS: "1" }), true);
  assert.equal(shouldApplyLocalAdminIdentity(localAdmin, { LOCAL_ADMIN_BYPASS: "1" }), false);
  assert.equal(shouldApplyLocalAdminIdentity(publicRequest, { LOCAL_ADMIN_BYPASS: "1" }), false);

  const untouched = withLocalAdminIdentity(publicRequest, { LOCAL_ADMIN_BYPASS: "1" });
  assert.equal(untouched.headers.get(USER_EMAIL_HEADER), null);

  const injected = withLocalAdminIdentity(localPublic, { LOCAL_ADMIN_BYPASS: "1" });
  assert.equal(injected.headers.get(USER_EMAIL_HEADER), LOCAL_ADMIN_EMAIL);

  const skippedAdmin = withLocalAdminIdentity(localAdmin, { LOCAL_ADMIN_BYPASS: "1" });
  assert.equal(skippedAdmin.headers.get(USER_EMAIL_HEADER), null);

  const existing = new Request("http://127.0.0.1:4115/", {
    headers: { [USER_EMAIL_HEADER]: "existing@example.com" },
  });
  const preserved = withLocalAdminIdentity(existing, { LOCAL_ADMIN_BYPASS: "1" });
  assert.equal(preserved.headers.get(USER_EMAIL_HEADER), "existing@example.com");
});
