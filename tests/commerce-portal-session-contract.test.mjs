import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

test("Commerce portal handoff is one-time, short lived and server authenticated", () => {
  const createRoute = read("../app/api/v1/commerce/portal-sessions/route.ts");
  const consumeRoute = read("../app/api/v1/commerce/portal-sessions/consume/route.ts");
  assert.match(createRoute, /authorization/i);
  assert.match(createRoute, /120000/);
  assert.match(createRoute, /activationTokenHash/);
  assert.match(consumeRoute, /usedAt/);
  assert.match(consumeRoute, /createCustomerSessionToken/);
  assert.match(consumeRoute, /Set-Cookie/);
});
