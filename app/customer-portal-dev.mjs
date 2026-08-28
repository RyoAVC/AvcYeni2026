import { isLoopbackHostname, LOCAL_ADMIN_BYPASS_ENV } from "./local-admin-identity.mjs";

export const CUSTOMER_PORTAL_DEV_ENV = "CUSTOMER_PORTAL_DEV";

export function isCustomerPortalDevEnabled(env) {
  if (!env) return false;
  return env[CUSTOMER_PORTAL_DEV_ENV] === "1" || env[LOCAL_ADMIN_BYPASS_ENV] === "1";
}

export function canUseCustomerPortalLogin(request, env) {
  try {
    const url = new URL(request.url);
    if (isLoopbackHostname(url.hostname)) return isCustomerPortalDevEnabled(env);
    const forwardedProto = String(request.headers?.get?.("x-forwarded-proto") ?? "").split(",", 1)[0].trim().toLowerCase();
    return (url.protocol === "https:" || forwardedProto === "https") && env?.CUSTOMER_PORTAL_LIVE !== "0";
  } catch {
    return false;
  }
}

export function usesInternalCustomerPortal(env) {
  const licenseUrl = typeof env?.LICENSE_PORTAL_URL === "string" ? env.LICENSE_PORTAL_URL.trim() : "";
  return !licenseUrl && env?.CUSTOMER_PORTAL_LIVE !== "0";
}
