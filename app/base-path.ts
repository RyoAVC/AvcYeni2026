const configuredBasePath = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");

export const APP_BASE_PATH = configuredBasePath;

export function withBasePath(path: string) {
  if (!configuredBasePath || !path.startsWith("/") || path.startsWith("//")) return path;
  if (path === configuredBasePath || path.startsWith(`${configuredBasePath}/`)) return path;
  return `${configuredBasePath}${path}`;
}

export const SITE_ORIGIN = (process.env.NEXT_PUBLIC_SITE_ORIGIN || "https://avcieticaret.com").replace(/\/$/, "");
export const SITE_BASE_URL = `${SITE_ORIGIN}${APP_BASE_PATH}`;
