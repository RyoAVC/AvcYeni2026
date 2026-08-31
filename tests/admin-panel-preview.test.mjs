import assert from "node:assert/strict";
import test from "node:test";
import { canUseAdminPanelPreview, isAdminPanelPreviewEnabled } from "../app/admin-panel-preview.mjs";

test("admin panel preview stays off unless the local preview flag is set, and only on loopback", () => {
  const localRequest = new Request("http://127.0.0.1:4115/onizleme/yonetim-k7m2x9");
  const publicRequest = new Request("https://avcieticaret.com/onizleme/yonetim-k7m2x9");

  assert.equal(isAdminPanelPreviewEnabled({}), false);
  assert.equal(isAdminPanelPreviewEnabled({ ADMIN_PANEL_LOCAL_PREVIEW: "0" }), false);
  assert.equal(isAdminPanelPreviewEnabled({ ADMIN_PANEL_LOCAL_PREVIEW: "1" }), true);

  assert.equal(canUseAdminPanelPreview(localRequest, {}), false);
  assert.equal(canUseAdminPanelPreview(localRequest, { ADMIN_PANEL_LOCAL_PREVIEW: "1" }), true);
  assert.equal(canUseAdminPanelPreview(publicRequest, { ADMIN_PANEL_LOCAL_PREVIEW: "1" }), false);
});
