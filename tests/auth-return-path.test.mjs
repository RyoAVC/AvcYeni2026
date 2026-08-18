import assert from "node:assert/strict";
import test from "node:test";
import { chatGPTSignInPath, chatGPTSignOutPath, safeRelativeReturnPath } from "../app/auth-return-path.mjs";

test("authentication return paths stay on local non-auth routes", () => {
  assert.equal(safeRelativeReturnPath("/yonetim/basvurular?status=new#basvurular"), "/yonetim/basvurular?status=new#basvurular");
  assert.equal(safeRelativeReturnPath("https://evil.example/path"), "/");
  assert.equal(safeRelativeReturnPath("//evil.example/path"), "/");
  assert.equal(safeRelativeReturnPath("/\\evil.example/path"), "/");
  assert.equal(safeRelativeReturnPath("/signin-with-chatgpt?return_to=/yonetim"), "/");
  assert.equal(safeRelativeReturnPath("/signout-with-chatgpt"), "/");
  assert.equal(safeRelativeReturnPath("/callback#token"), "/");
  assert.equal(safeRelativeReturnPath("/yonetim/%2e%2e/callback"), "/");
  assert.equal(safeRelativeReturnPath(null), "/");

  assert.equal(
    chatGPTSignInPath("/yonetim/basvurular?status=new"),
    "/signin-with-chatgpt?return_to=%2Fyonetim%2Fbasvurular%3Fstatus%3Dnew",
  );
  assert.equal(chatGPTSignOutPath("https://evil.example"), "/signout-with-chatgpt?return_to=%2F");
});
