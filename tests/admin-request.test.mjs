import assert from "node:assert/strict";
import test from "node:test";
import { readAdminJsonObject, validateAdminMutationRequest } from "../app/admin-request.mjs";

test("admin mutations enforce same-origin bounded JSON objects", async () => {
  const validRequest = new Request("https://avcieticaret.com/api/yonetim/test", {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8", origin: "https://avcieticaret.com" },
    body: JSON.stringify({ status: "contacted" }),
  });
  assert.equal(validateAdminMutationRequest(validRequest), null);
  assert.deepEqual(await readAdminJsonObject(validRequest), { ok: true, value: { status: "contacted" } });

  const wrongType = new Request("https://avcieticaret.com/api/yonetim/test", {
    method: "POST",
    headers: { "content-type": "text/plain" },
    body: "status=contacted",
  });
  assert.equal(validateAdminMutationRequest(wrongType)?.status, 415);

  const foreignOrigin = new Request("https://avcieticaret.com/api/yonetim/test", {
    method: "POST",
    headers: { "content-type": "application/json", origin: "https://attacker.example" },
    body: "{}",
  });
  assert.equal(validateAdminMutationRequest(foreignOrigin)?.status, 403);

  const declaredOversize = new Request("https://avcieticaret.com/api/yonetim/test", {
    method: "POST",
    headers: { "content-type": "application/json", "content-length": "9000" },
    body: "{}",
  });
  assert.equal(validateAdminMutationRequest(declaredOversize)?.status, 413);

  const actualOversize = new Request("https://avcieticaret.com/api/yonetim/test", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ content: "ü".repeat(5_000) }),
  });
  assert.equal((await readAdminJsonObject(actualOversize)).status, 413);

  for (const body of ["[]", "null", "not-json"]) {
    const invalidShape = new Request("https://avcieticaret.com/api/yonetim/test", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
    });
    assert.equal((await readAdminJsonObject(invalidShape)).status, 400);
  }
});
