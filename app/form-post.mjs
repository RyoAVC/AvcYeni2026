import { withBasePath } from "./base-path";
import { publicRequestOrigin } from "./request-origin";

export async function readRuntimeEnv() {
  try {
    const mod = await import("cloudflare:workers");
    if (mod?.env && typeof mod.env === "object") return mod.env;
  } catch {
    /* vinext/node bazı ortamlarda dinamik import fırlatabiliyor */
  }
  return typeof process !== "undefined" ? process.env : {};
}

export function redirectResponse(request, path, cookie) {
  const target = withBasePath(path.startsWith("/") ? path : `/${path}`);
  const location = new URL(target, `${publicRequestOrigin(request)}/`).toString();
  const headers = new Headers({
    Location: location,
    "Cache-Control": "no-store",
  });
  if (cookie) headers.append("Set-Cookie", cookie);
  return new Response(null, { status: 303, headers });
}

export function requestIsHttps(request) {
  return publicRequestOrigin(request).startsWith("https:");
}

/** form-urlencoded / multipart gövdesini güvenli oku (formData kırılırsa text’e düş). */
export async function readFormFields(request) {
  const contentType = request.headers.get("content-type") ?? "";
  try {
    if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
      const form = await request.formData();
      const params = new URLSearchParams();
      for (const [key, value] of form.entries()) {
        if (typeof value === "string") params.append(key, value);
      }
      return params;
    }
  } catch {
    /* fall through */
  }

  try {
    const raw = await request.text();
    return new URLSearchParams(raw);
  } catch {
    return new URLSearchParams();
  }
}
