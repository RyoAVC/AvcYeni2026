import { eq } from "drizzle-orm";
import { siteAssets } from "../../../../../db/schema";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isSafeInteger(id) || id < 1) return new Response(null, { status: 404 });
  try {
    const { getDb } = await import("../../../../../db");
    const [asset] = await getDb().select().from(siteAssets).where(eq(siteAssets.kind, `integration-logo-${id}`)).limit(1);
    if (!asset) return new Response(null, { status: 404 });
    return new Response(asset.data, { headers: { "Content-Type": asset.mime, "Cache-Control": "public, max-age=300" } });
  } catch { return new Response(null, { status: 404 }); }
}
