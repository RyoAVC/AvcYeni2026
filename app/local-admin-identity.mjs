export const LOCAL_ADMIN_BYPASS_ENV = "LOCAL_ADMIN_BYPASS";
export const LOCAL_ADMIN_EMAIL = "local-admin@example.com";
export const LOCAL_ADMIN_NAME = "Yerel Test Yoneticisi";
export const USER_EMAIL_HEADER = "oai-authenticated-user-email";
export const USER_FULL_NAME_HEADER = "oai-authenticated-user-full-name";
export const USER_FULL_NAME_ENCODING_HEADER = "oai-authenticated-user-full-name-encoding";
const PERCENT_ENCODED_UTF8 = "percent-encoded-utf-8";

export function isLoopbackHostname(hostname) {
  return hostname === "127.0.0.1" || hostname === "localhost" || hostname === "[::1]";
}

export function isLocalAdminBypassEnabled(env) {
  return Boolean(env) && env[LOCAL_ADMIN_BYPASS_ENV] === "1";
}

function isAdminPath(pathname) {
  return pathname === "/yonetim"
    || pathname.startsWith("/yonetim/")
    || pathname === "/api/yonetim"
    || pathname.startsWith("/api/yonetim/");
}

export function shouldApplyLocalAdminIdentity(request, env) {
  if (!isLocalAdminBypassEnabled(env)) return false;
  try {
    const url = new URL(request.url);
    if (!isLoopbackHostname(url.hostname)) return false;
    if (isAdminPath(url.pathname)) return false;
    return true;
  } catch {
    return false;
  }
}

export function withLocalAdminIdentity(request, env) {
  if (!shouldApplyLocalAdminIdentity(request, env)) return request;
  if (request.headers.get(USER_EMAIL_HEADER)) return request;

  const headers = new Headers(request.headers);
  headers.set(USER_EMAIL_HEADER, LOCAL_ADMIN_EMAIL);
  headers.set(USER_FULL_NAME_HEADER, encodeURIComponent(LOCAL_ADMIN_NAME));
  headers.set(USER_FULL_NAME_ENCODING_HEADER, PERCENT_ENCODED_UTF8);
  return new Request(request, { headers });
}
