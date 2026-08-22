/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";
import { withLocalAdminIdentity } from "../app/local-admin-identity.mjs";
import { usesInternalCustomerPortal } from "../app/customer-portal-dev.mjs";
import { ensureCustomerPortalPreviewData, ensureLocalD1Schema } from "../app/local-d1-schema.mjs";
import { mergeRuntimeEnv } from "../app/runtime-env.mjs";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  LICENSE_PORTAL_URL?: string;
  CUSTOMER_PORTAL_DEV?: string;
  CUSTOMER_PORTAL_PREVIEW?: string;
  CUSTOMER_SESSION_SECRET?: string;
  LOCAL_ADMIN_BYPASS?: string;
  ADMIN_EMAILS?: string;
  ADMIN_LOGIN_EMAIL?: string;
  ADMIN_LOGIN_PASSWORD?: string;
  ADMIN_SESSION_SECRET?: string;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

function customerPortalLoginUrl(value: string | undefined) {
  if (!value) return null;
  try {
    const portal = new URL(value);
    const isLocal = portal.hostname === "localhost" || portal.hostname === "127.0.0.1" || portal.hostname === "[::1]";
    if ((portal.protocol !== "https:" && !(portal.protocol === "http:" && isLocal)) || portal.username || portal.password) return null;
    return new URL("/giris", portal.origin).toString();
  } catch {
    return null;
  }
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

const SECURITY_HEADERS = {
  "Content-Security-Policy": [
    "default-src 'self'",
    "base-uri 'self'",
    "connect-src 'self' https://api.openai.com",
    "font-src 'self' data:",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "img-src 'self' data: blob:",
    "object-src 'none'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
  ].join("; "),
  "Cross-Origin-Opener-Policy": "same-origin",
  "Permissions-Policy": "camera=(), microphone=(self), geolocation=(), payment=(), usb=()",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
} as const;

function secure(response: Response, request: Request) {
  const secured = new Response(response.body, response);
  const requestUrl = new URL(request.url);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    secured.headers.set(name, value);
  }
  if (isPrivateResponsePath(requestUrl.pathname)) {
    secured.headers.set("Cache-Control", "private, no-store");
  }
  if (isNonIndexableResponsePath(requestUrl.pathname)) {
    secured.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }
  if (requestUrl.protocol === "https:") {
    secured.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  return secured;
}

function isPrivateResponsePath(pathname: string) {
  return pathname === "/musteri-portali"
    || pathname === "/musteri-panel"
    || pathname.startsWith("/musteri-panel/")
    || pathname === "/onizleme/musteri-portali-k7m2x9"
    || pathname === "/signin-with-chatgpt"
    || pathname === "/signout-with-chatgpt"
    || pathname === "/callback"
    || pathname === "/yonetim"
    || pathname.startsWith("/yonetim/")
    || pathname === "/api/yonetim"
    || pathname.startsWith("/api/yonetim/")
    || pathname === "/api/istatistik"
    || pathname.startsWith("/api/istatistik/");
}

function isNonIndexableResponsePath(pathname: string) {
  return isPrivateResponsePath(pathname)
    || pathname === "/api"
    || pathname.startsWith("/api/")
    || pathname === "/musteri-girisi"
    || pathname === "/musteri-panel"
    || pathname.startsWith("/musteri-panel/")
    || pathname === "/onizleme/musteri-portali-k7m2x9"
    || pathname === "/demo-portal";
}

async function isMaintenanceMode(env: Env) {
  try {
    const row = await env.DB.prepare("SELECT value FROM site_settings WHERE key = ? LIMIT 1")
      .bind("maintenanceMode")
      .first<{ value?: string }>();
    return row?.value === "on";
  } catch {
    return false;
  }
}

function isPublicDocumentRequest(request: Request, pathname: string) {
  if (request.method !== "GET" && request.method !== "HEAD") return false;
  if (pathname === "/yonetim" || pathname.startsWith("/yonetim/")) return false;
  if (pathname === "/api" || pathname.startsWith("/api/")) return false;
  return (request.headers.get("accept") || "").toLowerCase().includes("text/html");
}

function maintenanceResponse(request: Request) {
  const html = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Avcı E-Ticaret · Kısa bir bakımdayız</title><meta name="robots" content="noindex,nofollow"><style>:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;min-height:100dvh;display:grid;place-items:center;padding:24px;background:#07131c;color:#eefbf7;font-family:system-ui,-apple-system,Segoe UI,sans-serif}.card{width:min(620px,100%);padding:clamp(28px,6vw,58px);border:1px solid #2b514d;border-radius:28px;background:linear-gradient(145deg,#0c2028,#0a171e);box-shadow:0 28px 80px #0008}.mark{display:inline-grid;place-items:center;width:54px;height:54px;border-radius:18px;background:#5ce1c1;color:#07131c;font-weight:900;font-size:24px}small{display:block;margin-top:24px;color:#78d8c2;letter-spacing:.16em;font-weight:800}h1{margin:12px 0 14px;font-size:clamp(34px,8vw,62px);line-height:.98}p{margin:0;color:#b8cfca;font-size:clamp(16px,3vw,20px);line-height:1.65}</style></head><body><main class="card"><span class="mark">A</span><small>AVCI E-TİCARET</small><h1>Kısa bir bakımdayız.</h1><p>Sistemi daha iyi hâle getirmek için çalışıyoruz. Biraz sonra yeniden buradayız.</p></main></body></html>`;
  return new Response(request.method === "HEAD" ? null : html, {
    status: 503,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
      "Retry-After": "900",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
    },
  });
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const runtimeEnv = mergeRuntimeEnv(env) as Env;

    if (url.pathname === "/musteri-portali") {
      if (request.method !== "GET" && request.method !== "HEAD") {
        return secure(new Response("Method Not Allowed", { status: 405, headers: { Allow: "GET, HEAD" } }), request);
      }
      const destination = usesInternalCustomerPortal(runtimeEnv)
        ? new URL("/musteri-panel/giris", request.url).toString()
        : (customerPortalLoginUrl(env.LICENSE_PORTAL_URL)
          ?? new URL("/musteri-girisi?durum=hazirlaniyor", request.url).toString());
      return secure(Response.redirect(destination, 302), request);
    }

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      const imageResponse = await handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
      return secure(imageResponse, request);
    }

    await ensureLocalD1Schema(runtimeEnv);
    await ensureCustomerPortalPreviewData(runtimeEnv);
    if (isPublicDocumentRequest(request, url.pathname) && await isMaintenanceMode(runtimeEnv)) {
      return secure(maintenanceResponse(request), request);
    }
    const incoming = withLocalAdminIdentity(request, runtimeEnv);
    const response = await handler.fetch(incoming, runtimeEnv as Env, ctx);
    return secure(response, request);
  },
};

export default worker;
