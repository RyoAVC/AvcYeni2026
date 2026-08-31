import { isLoopbackHostname } from "./local-admin-identity.mjs";

/** Gizli önizleme yolu — menüde yok, yalnızca URL ile erişilir. */
export const ADMIN_PANEL_PREVIEW_PATH = "/onizleme/yonetim-k7m2x9";
export const ADMIN_PANEL_PREVIEW_ENV = "ADMIN_PANEL_LOCAL_PREVIEW";
/** Yerel test kimliği; gerçek yönetici hesabı değil. */
export const ADMIN_PANEL_PREVIEW_EMAIL = "yerel-admin-onizleme@example.com";
export const ADMIN_PANEL_PREVIEW_NAME = "Yerel Admin Önizleme (test)";

export function isAdminPanelPreviewEnabled(env) {
  return Boolean(env) && env[ADMIN_PANEL_PREVIEW_ENV] === "1";
}

export function canUseAdminPanelPreview(request, env) {
  if (!isAdminPanelPreviewEnabled(env)) return false;
  try {
    return isLoopbackHostname(new URL(request.url).hostname);
  } catch {
    return false;
  }
}
