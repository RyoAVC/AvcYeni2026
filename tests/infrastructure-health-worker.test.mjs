import assert from "node:assert/strict";
import test from "node:test";
import { isPrivateAddress, nextMonitorState, validateMonitorTarget } from "../app/infrastructure-health-worker.mjs";
import { readFileSync } from "node:fs";

test("monitör yalnız kendi HTTPS domainini kabul eder", () => {
  assert.equal(validateMonitorTarget({ domain: "example.com", checkUrl: "https://example.com/" }).hostname, "example.com");
  assert.throws(() => validateMonitorTarget({ domain: "example.com", checkUrl: "http://example.com/" }));
  assert.throws(() => validateMonitorTarget({ domain: "example.com", checkUrl: "https://other.example/" }));
});

test("özel ve loopback IP adresleri engellenir", () => {
  for (const address of ["127.0.0.1", "10.0.0.1", "192.168.1.1", "172.16.0.1", "::1", "fd00::1"]) assert.equal(isPrivateAddress(address), true);
  assert.equal(isPrivateAddress("1.1.1.1"), false);
});

test("üçüncü ardışık hata tek olay açar", () => {
  const state = nextMonitorState({ status: "warning", consecutiveFailures: 2 }, { ok: false, sslExpiresAt: "" });
  assert.equal(state.status, "offline");
  assert.equal(state.consecutiveFailures, 3);
  assert.equal(state.shouldOpenIncident, true);
});

test("iyileşen monitör olayı çözer ve sayacı sıfırlar", () => {
  const state = nextMonitorState({ status: "offline", consecutiveFailures: 4 }, { ok: true, sslExpiresAt: "2030-01-01T00:00:00.000Z" }, new Date("2026-01-01T00:00:00.000Z"));
  assert.equal(state.status, "healthy");
  assert.equal(state.consecutiveFailures, 0);
  assert.equal(state.shouldResolveIncident, true);
});

test("zamanlanmış işçi sırrı yalnız header ile kullanır", () => {
  const route = readFileSync(new URL("../app/api/v1/control-desk/infrastructure/checks/route.ts", import.meta.url), "utf8");
  assert.match(route, /INFRASTRUCTURE_WORKER_SECRET/);
  assert.match(route, /x-avci-infrastructure-worker/);
  assert.match(route, /timingSafeEqual/);
  assert.doesNotMatch(route, /workerSecret[^\n]*controlDeskJson/);
});
