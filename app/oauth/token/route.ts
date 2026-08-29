import { and, eq, gt } from "drizzle-orm";
import { controlDeskOAuthCodes, controlDeskSessions } from "../../../db/schema";
import { sha256Hex } from "../../control-desk-auth.mjs";
import { ensureCommerceLicenseTables } from "../../local-d1-schema.mjs";
import { readRuntimeEnv } from "../../runtime-env.mjs";

export const dynamic = "force-dynamic";
const enc = new TextEncoder();
function random(prefix: string) { const b = new Uint8Array(32); crypto.getRandomValues(b); return prefix + btoa(String.fromCharCode(...b)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,""); }
async function challenge(verifier: string) { const b = new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(verifier))); return btoa(String.fromCharCode(...b)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,""); }
function json(body: object, status = 200) { return Response.json(body, { status, headers: { "Cache-Control": "no-store" } }); }

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return json({ ok:false, code:"invalid_json" }, 400);
  const env = await readRuntimeEnv(); await ensureCommerceLicenseTables(env); const { getDb } = await import("../../../db"); const db = getDb(); const now = new Date(); const nowIso = now.toISOString();
  if (body.grant_type === "authorization_code") {
    const code = String(body.code || ""), verifier = String(body.code_verifier || ""), redirectUri = String(body.redirect_uri || "");
    if (!code.startsWith("acd_code_") || !/^[A-Za-z0-9._~-]{43,128}$/.test(verifier)) return json({ ok:false, code:"invalid_grant" }, 400);
    const [record] = await db.select().from(controlDeskOAuthCodes).where(and(eq(controlDeskOAuthCodes.codeHash, await sha256Hex(code)), eq(controlDeskOAuthCodes.usedAt, ""), gt(controlDeskOAuthCodes.expiresAt, nowIso))).limit(1);
    if (!record || record.redirectUri !== redirectUri || await challenge(verifier) !== record.codeChallenge) return json({ ok:false, code:"invalid_grant" }, 400);
    const consumed=await db.update(controlDeskOAuthCodes).set({ usedAt: nowIso }).where(and(eq(controlDeskOAuthCodes.id, record.id), eq(controlDeskOAuthCodes.usedAt, ""))).returning({id:controlDeskOAuthCodes.id});
    if(!consumed[0])return json({ok:false,code:"invalid_grant"},400);
    const access = random("acd_access_"), refresh = random("acd_refresh_"), sessionId = crypto.randomUUID();
    await db.insert(controlDeskSessions).values({ sessionId, accessTokenHash: await sha256Hex(access), refreshTokenHash: await sha256Hex(refresh), actorType: record.actorType, actorEmail: record.actorEmail, displayName: record.displayName, customerId: record.customerId, rolesJson: record.rolesJson, scopesJson: record.scopesJson, deviceName: String(body.device_name || "Avcı Control Desk").slice(0,80), accessExpiresAt: new Date(now.getTime()+15*60_000).toISOString(), refreshExpiresAt: new Date(now.getTime()+30*86400_000).toISOString(), lastUsedAt: nowIso, createdAt: nowIso, updatedAt: nowIso });
    return json({ access_token:access, refresh_token:refresh, token_type:"Bearer", expires_in:900, session_id:sessionId });
  }
  if (body.grant_type === "refresh_token") {
    const supplied = String(body.refresh_token || "");
    const [session] = await db.select().from(controlDeskSessions).where(and(eq(controlDeskSessions.refreshTokenHash, await sha256Hex(supplied)), eq(controlDeskSessions.revokedAt,""), gt(controlDeskSessions.refreshExpiresAt,nowIso))).limit(1);
    if (!session) return json({ ok:false, code:"invalid_grant" }, 400);
    const access=random("acd_access_"), refresh=random("acd_refresh_");
    const rotated=await db.update(controlDeskSessions).set({ accessTokenHash:await sha256Hex(access), refreshTokenHash:await sha256Hex(refresh), accessExpiresAt:new Date(now.getTime()+15*60_000).toISOString(), refreshExpiresAt:new Date(now.getTime()+30*86400_000).toISOString(), lastUsedAt:nowIso, updatedAt:nowIso }).where(and(eq(controlDeskSessions.id,session.id),eq(controlDeskSessions.refreshTokenHash,await sha256Hex(supplied)))).returning({id:controlDeskSessions.id});
    if(!rotated[0])return json({ok:false,code:"invalid_grant"},400);
    return json({ access_token:access, refresh_token:refresh, token_type:"Bearer", expires_in:900, session_id:session.sessionId });
  }
  return json({ ok:false, code:"unsupported_grant_type" }, 400);
}
