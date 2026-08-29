import test from "node:test";
import assert from "node:assert/strict";
import { getPlatformDomainConfig } from "../app/platform-domain-config.mjs";

test("domain gecisi varsayilan olarak gecici merkezde kalir", () => {
  const config = getPlatformDomainConfig({});
  assert.equal(config.stage, "temporary");
  assert.equal(config.activeControlPlane, "https://yeni.avcieticaret.com/v2");
  assert.equal(config.canonicalOrigin, "https://avcieticaret.com");
  assert.equal(config.canonicalStatus, "maintenance");
  assert.equal(config.automaticCutover, false);
});
test("ana domaine yalniz acik canonical ayariyla gecilir", () => {
  const config = getPlatformDomainConfig({ AVCI_DOMAIN_STAGE: "canonical" });
  assert.equal(config.activeControlPlane, "https://avcieticaret.com");
  assert.equal(config.canonicalStatus, "active");
});

test("guvensiz origin ayarlari kabul edilmez", () => {
  const config = getPlatformDomainConfig({
    AVCI_TEMPORARY_CONTROL_PLANE_ORIGIN: "http://example.test/v2",
    AVCI_CANONICAL_ORIGIN: "javascript:alert(1)",
  });
  assert.equal(config.temporaryControlPlane, "https://yeni.avcieticaret.com/v2");
  assert.equal(config.canonicalOrigin, "https://avcieticaret.com");
});
