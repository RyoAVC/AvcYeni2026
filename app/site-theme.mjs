export const SITE_THEME_COOKIE = "avci_theme";
export const SITE_THEMES = new Set(["night", "day"]);

export function parseSiteTheme(value) {
  return value === "day" ? "day" : "night";
}

export function themeCookie(value) {
  return `${SITE_THEME_COOKIE}=${parseSiteTheme(value)}; Path=/; Max-Age=31536000; SameSite=Lax`;
}
