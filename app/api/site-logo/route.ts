import { eq } from "drizzle-orm";
import { siteAssets } from "../../../db/schema";
import { LOGO_KINDS, parseLogoKind } from "../../site-logo.mjs";

function decodeBase64(data: string) {
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function readLogo(kind: string) {
  const { getDb } = await import("../../../db");
  const db = getDb();
  const [row] = await db.select().from(siteAssets).where(eq(siteAssets.kind, kind)).limit(1);
  return row ?? null;
}

export async function GET(request: Request) {
  const kind = parseLogoKind(new URL(request.url).searchParams.get("kind") ?? "night");
  const fallbacks = kind === LOGO_KINDS.day
    ? [LOGO_KINDS.day, LOGO_KINDS.night, LOGO_KINDS.legacy]
    : [LOGO_KINDS.night, LOGO_KINDS.legacy];

  try {
    for (const candidate of fallbacks) {
      const row = await readLogo(candidate);
      if (!row) continue;
      return new Response(decodeBase64(row.data), {
        status: 200,
        headers: {
          "Content-Type": row.mime,
          "Cache-Control": "public, max-age=120",
        },
      });
    }
    return new Response(null, { status: 404, headers: { "Cache-Control": "no-store" } });
  } catch (cause) {
    console.error("Site logo read failed", cause);
    return new Response(null, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
