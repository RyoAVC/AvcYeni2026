export const COOKIE_NOTICE_KEY = "avci_cookie_ok";
export const COOKIE_NOTICE_ACCEPTED = "1";
export const COOKIE_NOTICE_DECLINED = "0";

export function readCookieNoticeChoice(value) {
  if (value === COOKIE_NOTICE_ACCEPTED) return "accepted";
  if (value === COOKIE_NOTICE_DECLINED) return "declined";
  return "";
}

export function isAdminPath(pathname) {
  const path = typeof pathname === "string" ? pathname : "";
  return path === "/yonetim" || path.startsWith("/yonetim/") || path === "/api" || path.startsWith("/api/");
}

export function shouldHideCookieNotice(pathname, choice) {
  if (isAdminPath(pathname)) return true;
  return choice === "accepted" || choice === "declined";
}

export function shouldRecordSiteVisit(pathname, choice) {
  if (isAdminPath(pathname)) return false;
  return choice === "accepted";
}
