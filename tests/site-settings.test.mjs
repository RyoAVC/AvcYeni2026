import assert from "node:assert/strict";
import test from "node:test";
import { parseSiteSettings, phoneHrefFromDisplay, presentSiteSettings } from "../app/site-settings.mjs";

test("site settings accept corporate contact and reject thin email", () => {
  const parsed = parseSiteSettings({
    contactEmail: "  Info@AvciEticaret.com  ",
    contactPhone: "0850 308 68 37",
    supportEmail: "destek@avcieticaret.com",
    customerLoginEnabled: "off",
    demoPortalEnabled: "on",
    supportEnabled: "off",
    portalReady: "off",
    maintenanceMode: "on",
  });
  assert.equal(parsed.ok, true);
  assert.equal(parsed.value.contactEmail, "info@avcieticaret.com");
  assert.equal(parsed.value.customerLoginEnabled, "off");
  assert.equal(parsed.value.supportEnabled, "off");
  assert.equal(parsed.value.maintenanceMode, "on");
  assert.equal(parseSiteSettings({ contactEmail: "yok", contactPhone: "0850 308 68 37", supportEmail: "a@b.com" }).ok, false);
  assert.equal(phoneHrefFromDisplay("0850 308 68 37"), "+908503086837");
  assert.equal(presentSiteSettings(parsed.value).customerLoginEnabled, false);
  assert.equal(presentSiteSettings(parsed.value).maintenanceMode, true);
});

test("partial editor save keeps current contact and design values", () => {
  const current = parseSiteSettings({
    contactEmail: "info@avcieticaret.com",
    contactPhone: "0850 308 68 37",
    supportEmail: "info@avcieticaret.com",
    brandTitle: "AVCI",
    footerTagline: "Eski cümle",
  });
  assert.equal(current.ok, true);
  const edited = parseSiteSettings({
    heroCtaPrimary: "Demo isteyin",
    showLiveStrip: "off",
    footerTagline: "Yeni footer cümlesi",
  }, current.value);
  assert.equal(edited.ok, true);
  assert.equal(edited.value.contactEmail, "info@avcieticaret.com");
  assert.equal(edited.value.brandTitle, "AVCI");
  assert.equal(edited.value.heroCtaPrimary, "Demo isteyin");
  assert.equal(edited.value.showLiveStrip, "off");
  assert.equal(edited.value.footerTagline, "Yeni footer cümlesi");
});
