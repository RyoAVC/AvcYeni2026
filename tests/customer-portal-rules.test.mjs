import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runPortalRules } from "../app/customer-portal-rules.mjs";

const base = { customer: { domainExpiresAt: "", hostingExpiresAt: "" }, thresholds: { sslWarningDays: 30, tofyClickThresholdBps: 1000, marketplaceSetupDays: 7 }, metrics: [], integrations: [], openTickets: 0, criticalTickets: 0, now: new Date("2026-08-23T12:00:00Z") };

test("portal rule engine returns a positive empty state source when no rule fires", () => {
  assert.deepEqual(runPortalRules(base), []);
});

test("support is prioritized and thresholds drive renewal, Tofy and marketplace rules", () => {
  const result = runPortalRules({ ...base, customer: { domainExpiresAt: "2026-09-01", hostingExpiresAt: "" }, metrics: [{ key: "tofy_click_rate_bps", value: 840 }], integrations: [{ id: 2, name: "Trendyol", category: "marketplace", status: "setup", publicMetadata: { setupStartedAt: "2026-08-01" } }], openTickets: 1 });
  assert.equal(result[0].id, "rule-open-support");
  assert.ok(result.some((item) => item.id.startsWith("rule-renewal")));
  assert.ok(result.some((item) => item.id === "rule-tofy-click"));
  assert.ok(result.some((item) => item.id === "rule-marketplace-2"));
});

test("changing admin thresholds changes rule output without changing rule logic", () => {
  const context = { ...base, customer: { domainExpiresAt: "2026-09-10", hostingExpiresAt: "" }, metrics: [{ key: "tofy_click_rate_bps", value: 1200 }] };
  assert.equal(runPortalRules(context).length, 1);
  assert.equal(runPortalRules({ ...context, thresholds: { ...context.thresholds, sslWarningDays: 10 } }).length, 0);
});

test("customer snapshot never selects the global integration secret config", () => {
  const source = readFileSync(new URL("../app/customer-portal-data.mjs", import.meta.url), "utf8");
  assert.doesNotMatch(source, /config\s*:\s*integrations\.config/u);
  for (const table of ["customerModuleInstances", "customerIntegrationInstances", "customerMetricSnapshots", "portalNotifications", "tofyExperiments", "customerPortalDocuments"]) {
    assert.match(source, new RegExp(`eq\\(${table}\\.customerId, customerId\\)`));
  }
});

test("local portal bootstrap upgrades assignment tables with licensed domains", () => {
  const source = readFileSync(new URL("../app/local-d1-schema.mjs", import.meta.url), "utf8");
  assert.match(source, /ALTER TABLE customer_module_instances ADD COLUMN target_domain/);
  assert.match(source, /ALTER TABLE customer_integration_instances ADD COLUMN target_domain/);
  assert.match(source, /const SCHEMA_GEN = 34/);
});
