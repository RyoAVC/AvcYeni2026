import { normalizeEmailAddress } from "../../../email-normalization.mjs";
import { isSameRequestOrigin } from "../../../request-origin";
import {
  readFormFields,
  readRuntimeEnv,
  redirectResponse,
  requestIsHttps,
} from "../../../form-post.mjs";
import {
  ADMIN_LOGIN_MAX_FAILURES,
  ADMIN_LOGIN_WINDOW_MS,
  adminSessionCookie,
  clientAddress,
  createAdminSessionToken,
  getAdminLoginConfig,
  loginAttemptKey,
  safeAdminNextPath,
  secretsMatch,
} from "../../../admin-session.mjs";

type LoginAttempt = { failCount: number; windowStart: number };
const loginAttempts = new Map<string, LoginAttempt>();

function failPath(next: string, reason: "hata" | "kilit" | "ayar") {
  const params = new URLSearchParams();
  if (next !== "/yonetim") params.set("next", next);
  params.set("durum", reason);
  return `/yonetim/giris?${params.toString()}`;
}

export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin");
    if (origin) {
      try {
        if (!isSameRequestOrigin(request, origin)) {
          return redirectResponse(request, failPath("/yonetim", "hata"));
        }
      } catch {
        return redirectResponse(request, failPath("/yonetim", "hata"));
      }
    }

    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.includes("application/x-www-form-urlencoded") && !contentType.includes("multipart/form-data")) {
      return redirectResponse(request, failPath("/yonetim", "hata"));
    }

    const form = await readFormFields(request);
    const next = safeAdminNextPath(String(form.get("next") ?? "/yonetim"));
    if (String(form.get("website") ?? "").trim()) {
      return redirectResponse(request, failPath(next, "hata"));
    }

    const env = await readRuntimeEnv();
    const config = getAdminLoginConfig(env);
    if (!config.ready) return redirectResponse(request, failPath(next, "ayar"));

    const email = normalizeEmailAddress(String(form.get("email") ?? ""));
    const password = typeof form.get("password") === "string" ? String(form.get("password")) : "";
    const attemptKey = await loginAttemptKey(config.secret, email || "bos", clientAddress(request));
    const now = Date.now();
    const attempt = loginAttempts.get(attemptKey);
    const windowStart = attempt?.windowStart ?? now;
    const inWindow = now - windowStart < ADMIN_LOGIN_WINDOW_MS;
    const failCount = inWindow ? Number(attempt?.failCount ?? 0) : 0;

    if (failCount >= ADMIN_LOGIN_MAX_FAILURES) {
      return redirectResponse(request, failPath(next, "kilit"));
    }

    const emailOk = await secretsMatch(config.secret, email, config.email);
    const passwordOk = await secretsMatch(config.secret, password, config.password);
    if (!emailOk || !passwordOk) {
      loginAttempts.set(attemptKey, {
        failCount: failCount + 1,
        windowStart: inWindow ? windowStart : now,
      });
      return redirectResponse(request, failPath(next, failCount + 1 >= ADMIN_LOGIN_MAX_FAILURES ? "kilit" : "hata"));
    }

    if (attempt) {
      loginAttempts.delete(attemptKey);
    }

    const token = await createAdminSessionToken(config.secret, {
      email: config.email,
      displayName: "Avcı Yönetici",
    });
    return redirectResponse(request, next, adminSessionCookie(token, requestIsHttps(request)));
  } catch (cause) {
    console.error("Admin login failed", cause);
    return redirectResponse(request, failPath("/yonetim", "hata"));
  }
}
