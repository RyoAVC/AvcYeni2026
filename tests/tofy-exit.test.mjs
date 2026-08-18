import assert from "node:assert/strict";
import test from "node:test";
import { shouldShowAvcai } from "../app/avcai-ui.mjs";
import { parseSiteSettings } from "../app/site-settings.mjs";
import {
  DEFAULT_TOFY_POPUP,
  isExitIntent,
  isMouseIdle,
  sanitizePopupHref,
  TOFY_IDLE_MS,
} from "../app/tofy-exit.mjs";

test("Tofy stays off admin and login, idle and exit intent stay strict", () => {
  assert.equal(shouldShowAvcai("/"), true);
  assert.equal(shouldShowAvcai("/yonetim"), false);
  assert.equal(shouldShowAvcai("/yonetim/ayarlar"), false);
  assert.equal(isMouseIdle(0, TOFY_IDLE_MS), true);
  assert.equal(isMouseIdle(Date.now(), Date.now() + 4000), false);
  assert.equal(isExitIntent(4, null), true);
  assert.equal(isExitIntent(80, null), false);
  assert.equal(isExitIntent(0, {}), false);
  assert.equal(sanitizePopupHref("/teklif"), "/teklif");
  assert.equal(sanitizePopupHref("https://evil.example"), DEFAULT_TOFY_POPUP.href);
});

test("panel can change Tofy exit popup copy", () => {
  const parsed = parseSiteSettings({
    tofyPopupTitle: "Hey kampanya",
    tofyPopupText: "Paketlerde bu hafta kurulum hediyesi var.",
    tofyPopupButton: "Kampanyayı gör",
    tofyPopupHref: "/paketler",
    tofyPopupEnabled: "off",
  });
  assert.equal(parsed.ok, true);
  assert.equal(parsed.value.tofyPopupEnabled, "off");
  assert.equal(parsed.value.tofyPopupTitle, "Hey kampanya");
  assert.equal(parsed.value.tofyPopupHref, "/paketler");
  assert.equal(parsed.value.contactEmail, "info@avcieticaret.com");
});
