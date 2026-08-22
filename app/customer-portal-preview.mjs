import { isLoopbackHostname } from "./local-admin-identity.mjs";
import { isCustomerPortalDevEnabled } from "./customer-portal-dev.mjs";
import { isCustomerPortalPreviewRuntimeEnabled } from "./runtime-env.mjs";

/** Gizli önizleme yolu — menüde yok, yalnızca URL ile erişilir. */
export const CUSTOMER_PORTAL_PREVIEW_PATH = "/onizleme/musteri-portali-k7m2x9";
export const CUSTOMER_PORTAL_PREVIEW_ENV = "CUSTOMER_PORTAL_PREVIEW";
export const CUSTOMER_PORTAL_LIVE_PREVIEW_HOSTS = new Set(["yeni.avcieticaret.com"]);

/** Yerel seed müşteri; gerçek müşteri verisi değil. */
export const CUSTOMER_PORTAL_PREVIEW_EMAIL = "musteri@ornek.local";

export function customerPortalPreviewPath() {
  return CUSTOMER_PORTAL_PREVIEW_PATH;
}

export function isCustomerPortalPreviewEnabled(env) {
  return Boolean(env) && isCustomerPortalPreviewRuntimeEnabled(env);
}

export function isLiveCustomerPortalPreviewHost(hostname) {
  return CUSTOMER_PORTAL_LIVE_PREVIEW_HOSTS.has(String(hostname || "").toLowerCase());
}

export function canUseCustomerPortalPreview(request, env) {
  if (isCustomerPortalPreviewEnabled(env)) return true;
  if (isCustomerPortalDevEnabled(env)) {
    try {
      return isLoopbackHostname(new URL(request.url).hostname);
    } catch {
      return false;
    }
  }
  try {
    return isLiveCustomerPortalPreviewHost(new URL(request.url).hostname);
  } catch {
    return false;
  }
}
