import { asc, eq } from "drizzle-orm";
import { vitrineToasts } from "../../../../../db/schema";

const FALLBACK_URL = "https://www.avcieticaret.com/";

export async function GET() {
  try {
    const { getDb } = await import("../../../../../db");
    const rows = await getDb()
      .select({
        id: vitrineToasts.id,
        title: vitrineToasts.title,
        text: vitrineToasts.text,
        sortOrder: vitrineToasts.sortOrder,
        updatedAt: vitrineToasts.updatedAt,
      })
      .from(vitrineToasts)
      .where(eq(vitrineToasts.status, "live"))
      .orderBy(asc(vitrineToasts.sortOrder), asc(vitrineToasts.id))
      .limit(8);

    return Response.json({
      schema: "avci-commerce-announcements/v1",
      generatedAt: new Date().toISOString(),
      items: rows.map((row) => ({
        id: `announcement-${row.id}`,
        eyebrow: row.title,
        title: row.text,
        action: "İncele",
        url: FALLBACK_URL,
        updatedAt: row.updatedAt,
      })),
    }, {
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
        "Content-Type": "application/json; charset=utf-8",
      },
    });
  } catch (cause) {
    console.error("Commerce announcements feed failed", cause);
    return Response.json({
      schema: "avci-commerce-announcements/v1",
      generatedAt: new Date().toISOString(),
      items: [],
    }, {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
