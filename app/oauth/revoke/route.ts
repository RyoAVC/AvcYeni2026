import { eq } from "drizzle-orm";
import { controlDeskSessions } from "../../../db/schema";
import { sha256Hex } from "../../control-desk-auth.mjs";
import { ensureCommerceLicenseTables } from "../../local-d1-schema.mjs";
import { readRuntimeEnv } from "../../runtime-env.mjs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})); const token = String(body.token || "");
  const env = await readRuntimeEnv(); await ensureCommerceLicenseTables(env); const { getDb } = await import("../../../db"); const db = getDb(); const now = new Date().toISOString();
  if (token) await db.update(controlDeskSessions).set({ revokedAt:now, updatedAt:now }).where(eq(controlDeskSessions.refreshTokenHash,await sha256Hex(token)));
  return new Response(null, { status:204, headers:{"Cache-Control":"no-store"} });
}
