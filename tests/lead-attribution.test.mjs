import assert from "node:assert/strict";
import test from "node:test";
import { normalizeLeadAttribution } from "../app/lead-attribution.mjs";

test("lead attribution minimizes and validates campaign context", () => {
  assert.deepEqual(normalizeLeadAttribution({}), {
    source: "direct",
    utmSource: "",
    utmMedium: "",
    utmCampaign: "",
    referrerHost: "",
    landingPath: "",
  });

  assert.deepEqual(normalizeLeadAttribution({
    utmSource: " google ",
    utmMedium: "cpc",
    utmCampaign: "yaz-kampanyasi",
    referrerHost: "Example.COM",
    landingPath: "/paketler?email=private@example.com#form",
  }), {
    source: "google",
    utmSource: "google",
    utmMedium: "cpc",
    utmCampaign: "yaz-kampanyasi",
    referrerHost: "example.com",
    landingPath: "/paketler",
  });

  const unsafe = normalizeLeadAttribution({
    referrerHost: "evil.example/<script>",
    landingPath: "https://evil.example/landing",
  });
  assert.equal(unsafe.source, "direct");
  assert.equal(unsafe.referrerHost, "");
  assert.equal(unsafe.landingPath, "");
});
