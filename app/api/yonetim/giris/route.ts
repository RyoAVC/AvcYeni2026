import { isSameRequestOrigin } from "../../../request-origin";
import { eq } from "drizzle-orm";
import { adminLoginAttempts } from "../../../../db/schema";
import { normalizeEmailAddress } from "../../../email-normalization.mjs";
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

function redirectTo(request: Request, path: string, cookie?: string) {
  const headers = new Headers({ Location: new URL(path, request.url).toString(), "Cache-Control": "no-store" });
  if (cookie) headers.append("Set-Cookie", cookie);
  return new Response(null, { status: 303, headers });
}

function failPath(next: string, reason: "hata" | "kilit" | "ayar") {
  const params = new URLSearchParams();
  if (next !== "/yonetim") params.set("next", next);
  params.set("durum", reason);
  return `/yonetim/giris?${params.toString()}`;
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (!isSameRequestOrigin(request, origin)) {
        return redirectTo(request, failPath("/yonetim", "hata"));
      }
    } catch {
      return redirectTo(request, failPath("/yonetim", "hata"));
    }
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/x-www-form-urlencoded") && !contentType.includes("multipart/form-data")) {
    return redirectTo(request, failPath("/yonetim", "hata"));
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return redirectTo(request, failPath("/yonetim", "hata"));
  }

  const next = safeAdminNextPath(String(form.get("next") ?? "/yonetim"));
  if (String(form.get("website") ?? "").trim()) {
    return redirectTo(request, failPath(next, "hata"));
  }

  const { env } = await import("cloudflare:workers");
  const config = getAdminLoginConfig(env as Record<string, unknown>);
  if (!config.ready) return redirectTo(request, failPath(next, "ayar"));

  const email = normalizeEmailAddress(String(form.get("email") ?? ""));
  const password = typeof form.get("password") === "string" ? String(form.get("password")) : "";
  const attemptKey = await loginAttemptKey(config.secret, email || "bos", clientAddress(request));
  const now = new Date();
  const nowIso = now.toISOString();

  try {
    const { getDb } = await import("../../../../db");
    const db = getDb();
    const [attempt] = await db.select().from(adminLoginAttempts).where(eq(adminLoginAttempts.attemptKey, attemptKey)).limit(1);
    const windowStart = attempt ? new Date(attempt.windowStart) : now;
    const inWindow = now.getTime() - windowStart.getTime() < ADMIN_LOGIN_WINDOW_MS;
    const failCount = inWindow ? Number(attempt?.failCount ?? 0) : 0;

    if (failCount >= ADMIN_LOGIN_MAX_FAILURES) {
      return redirectTo(request, failPath(next, "kilit"));
    }

    const emailOk = await secretsMatch(config.secret, email, config.email);
    const passwordOk = await secretsMatch(config.secret, password, config.password);
    if (!emailOk || !passwordOk) {
      await db
        .insert(adminLoginAttempts)
        .values({
          attemptKey,
          failCount: failCount + 1,
          windowStart: inWindow && attempt ? attempt.windowStart : nowIso,
          updatedAt: nowIso,
        })
        .onConflictDoUpdate({
          target: adminLoginAttempts.attemptKey,
          set: {
            failCount: failCount + 1,
            windowStart: inWindow && attempt ? attempt.windowStart : nowIso,
            updatedAt: nowIso,
          },
        });
      return redirectTo(request, failPath(next, failCount + 1 >= ADMIN_LOGIN_MAX_FAILURES ? "kilit" : "hata"));
    }

    if (attempt) {
      await db.delete(adminLoginAttempts).where(eq(adminLoginAttempts.attemptKey, attemptKey));
    }

    const token = await createAdminSessionToken(config.secret, {
      email: config.email,
      displayName: "Avcı Yönetici",
    });
    return redirectTo(request, next, adminSessionCookie(token, new URL(request.url).protocol === "https:"));
  } catch (cause) {
    console.error("Admin login failed", cause);
    return redirectTo(request, failPath(next, "hata"));
  }
}
