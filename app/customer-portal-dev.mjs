import { isLoopbackHostname, LOCAL_ADMIN_BYPASS_ENV } from "./local-admin-identity.mjs";

export const CUSTOMER_PORTAL_DEV_ENV = "CUSTOMER_PORTAL_DEV";

export function isCustomerPortalDevEnabled(env) {
  if (!env) return false;
  return env[CUSTOMER_PORTAL_DEV_ENV] === "1" || env[LOCAL_ADMIN_BYPASS_ENV] === "1";
}

export function canUseCustomerPortalLogin(request, env) {
  if (!isCustomerPortalDevEnabled(env)) return false;
  try {
    return isLoopbackHostname(new URL(request.url).hostname);
  } catch {
    return false;
  }
}

export function usesInternalCustomerPortal(env) {
  if (!isCustomerPortalDevEnabled(env)) return false;
  const licenseUrl = typeof env?.LICENSE_PORTAL_URL === "string" ? env.LICENSE_PORTAL_URL.trim() : "";
  return !licenseUrl;
}
