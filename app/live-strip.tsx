import { asc, eq } from "drizzle-orm";
import { vitrineSignals } from "../db/schema";
import { LiveStripPulse } from "./live-strip-pulse";

export async function LiveStrip() {
  let items: Array<{ id: number; label: string; value: string }> = [];

  try {
    const { getDb } = await import("../db");
    const db = getDb();
    items = await db
      .select({
        id: vitrineSignals.id,
        label: vitrineSignals.label,
        value: vitrineSignals.value,
      })
      .from(vitrineSignals)
      .where(eq(vitrineSignals.status, "live"))
      .orderBy(asc(vitrineSignals.sortOrder), asc(vitrineSignals.id));
  } catch (cause) {
    console.error("Live strip failed", cause);
    return null;
  }

  if (!items.length) return null;

  return <LiveStripPulse items={items} />;
}
