import { withBasePath } from "../../base-path";
import {
  ADMIN_PANEL_PREVIEW_EMAIL,
  ADMIN_PANEL_PREVIEW_NAME,
  canUseAdminPanelPreview,
} from "../../admin-panel-preview.mjs";
import {
  adminSessionCookie,
  createAdminSessionToken,
  getAdminLoginConfig,
} from "../../admin-session.mjs";
import { readRuntimeEnv } from "../../runtime-env.mjs";

const ROBOTS_HEADERS = {
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
} as const;

function previewNotFound() {
  const html = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex, nofollow"><title>Önizleme kapalı</title></head><body><main><h1>Önizleme kapalı</h1><p>Bu gizli önizleme yolu şu an etkin değil.</p></main></body></html>`;
  return new Response(html, {
    status: 404,
    headers: {
      ...ROBOTS_HEADERS,
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}

function redirectToAdmin(request: Request, cookie: string) {
  const headers = new Headers({
    Location: new URL(withBasePath("/yonetim"), request.url).toString(),
    ...ROBOTS_HEADERS,
  });
  headers.append("Set-Cookie", cookie);
  return new Response(null, { status: 303, headers });
}

export async function GET(request: Request) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method Not Allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
  }

  const env = await readRuntimeEnv();
  if (!canUseAdminPanelPreview(request, env)) {
    return previewNotFound();
  }

  const config = getAdminLoginConfig(env);
  if (!config.ready) return previewNotFound();

  try {
    const token = await createAdminSessionToken(config.secret, {
      email: ADMIN_PANEL_PREVIEW_EMAIL,
      displayName: ADMIN_PANEL_PREVIEW_NAME,
    });
    const secure = new URL(request.url).protocol === "https:";
    return redirectToAdmin(request, adminSessionCookie(token, secure));
  } catch (cause) {
    console.error("Admin panel preview entry failed", cause);
    return previewNotFound();
  }
}

export async function HEAD(request: Request) {
  return GET(request);
}
