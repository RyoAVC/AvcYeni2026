import { and, desc, eq } from "drizzle-orm";
import { controlDeskAppReleases } from "../../../../../db/schema";
import { ensureCommerceLicenseTables } from "../../../../local-d1-schema.mjs";
import { readRuntimeEnv } from "../../../../runtime-env.mjs";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const channel = new URL(request.url).searchParams.get("channel") === "pilot" ? "pilot" : "stable";
  try {
    const env = await readRuntimeEnv();
    await ensureCommerceLicenseTables(env);
    const { getDb } = await import("../../../../../db");
    const rows = await getDb().select().from(controlDeskAppReleases).where(and(
      eq(controlDeskAppReleases.channel, channel),
      eq(controlDeskAppReleases.status, "published"),
      eq(controlDeskAppReleases.signatureStatus, "verified"),
    )).orderBy(desc(controlDeskAppReleases.publishedAt)).limit(30);
    const latest = new Map<string, typeof rows[number]>();
    for (const row of rows) if (!latest.has(row.platform)) latest.set(row.platform, row);
    return Response.json({
      ok: true,
      format: "avci-control-desk.download-catalog.v1",
      channel,
      releases: [...latest.values()].map((row) => ({
        platform: row.platform, architecture: row.architecture, version: row.version,
        fileUrl: row.fileUrl, sha256: row.sha256, sizeBytes: row.sizeBytes,
        manifestUrl: row.manifestUrl, signerSubject: row.signerSubject,
        releaseNotes: row.releaseNotes, publishedAt: row.publishedAt,
      })),
      serverTime: new Date().toISOString(),
    }, { headers: { "cache-control": "public, max-age=60, s-maxage=300", "x-content-type-options": "nosniff" } });
  } catch (cause) {
    console.error("Control Desk download catalog failed", cause);
    return Response.json({ ok: false, error: "İndirme kataloğu şu anda alınamadı." }, { status: 503 });
  }
}
