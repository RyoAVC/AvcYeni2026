import { and, eq, gt } from "drizzle-orm";
import { controlDeskSessions } from "../db/schema";
import { readRuntimeEnv } from "./runtime-env.mjs";

const encoder = new TextEncoder();
export const CONTROL_DESK_ROLES = ["platform_owner", "support_operator", "installer", "customer_owner", "customer_viewer"];

export async function sha256Hex(value) {
  const bytes = new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(String(value))));
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function sameBytes(left, right) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left[index] ^ right[index];
  return difference === 0;
}

function parseList(value) {
  try { const parsed = JSON.parse(String(value || "[]")); return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : []; }
  catch { return []; }
}

export function hasControlDeskRole(auth, allowed) {
  return Boolean(auth?.ok && auth.roles?.some((role) => allowed.includes(role)));
}

export async function authorizeControlDesk(request) {
  const env = await readRuntimeEnv();
  const supplied = String(request.headers.get("authorization") ?? "")
    .replace(/^Bearer\s+/i, "")
    .trim();
  if (!supplied) return { ok: false, status: 401, error: "Control Desk oturumu gerekli." };

  if (supplied.startsWith("acd_access_")) {
    try {
      const { getDb } = await import("../db");
      const db = getDb();
      const now = new Date().toISOString();
      const [session] = await db.select().from(controlDeskSessions).where(and(
        eq(controlDeskSessions.accessTokenHash, await sha256Hex(supplied)),
        eq(controlDeskSessions.revokedAt, ""),
        gt(controlDeskSessions.accessExpiresAt, now),
      )).limit(1);
      if (!session) return { ok: false, status: 401, error: "Oturum süresi dolmuş veya iptal edilmiş." };
      await db.update(controlDeskSessions).set({ lastUsedAt: now, updatedAt: now }).where(eq(controlDeskSessions.id, session.id));
      return { ok: true, env, legacy: false, sessionId: session.sessionId, actorType: session.actorType, email: session.actorEmail, displayName: session.displayName, customerId: session.customerId || 0, roles: parseList(session.rolesJson).filter((role) => CONTROL_DESK_ROLES.includes(role)), scopes: parseList(session.scopesJson) };
    } catch (cause) {
      console.error("Control Desk OAuth authorization failed", cause);
      return { ok: false, status: 503, error: "Oturum doğrulama servisi kullanılamıyor." };
    }
  }

  const expected = String(env.CONTROL_DESK_API_TOKEN ?? "").trim();
  if (!expected || !expected.startsWith("acd_live_") || !supplied.startsWith("acd_live_")) {
    return { ok: false, status: expected ? 401 : 503, error: expected ? "Geçersiz Control Desk oturumu." : "Control Desk API yapılandırılmamış." };
  }
  const [actualHash, expectedHash] = await Promise.all([sha256Hex(supplied), sha256Hex(expected)]);
  if (!sameBytes(encoder.encode(actualHash), encoder.encode(expectedHash))) return { ok: false, status: 401, error: "Geçersiz Control Desk oturumu." };
  return { ok: true, env, legacy: true, actorType: "staff", email: "legacy-control-desk", displayName: "Avcı Control Desk", customerId: 0, roles: ["platform_owner"], scopes: ["*"] };
}

export function controlDeskJson(body, status = 200, request) {
  const requestId = request?.headers?.get?.("x-request-id")?.slice(0, 96) || crypto.randomUUID();
  return Response.json({ ...body, request_id: requestId, api_version: "v1", server_time: new Date().toISOString() }, { status, headers: { "Cache-Control": "no-store", "X-Request-Id": requestId } });
}
