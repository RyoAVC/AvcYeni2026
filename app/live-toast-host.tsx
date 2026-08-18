import { asc, eq } from "drizzle-orm";
import { vitrineToasts } from "../db/schema";
import { LiveToast } from "./live-toast";

export async function LiveToastHost() {
  let items: Array<{ title: string; text: string }> = [];

  try {
    const { getDb } = await import("../db");
    const db = getDb();
    items = await db
      .select({
        title: vitrineToasts.title,
        text: vitrineToasts.text,
      })
      .from(vitrineToasts)
      .where(eq(vitrineToasts.status, "live"))
      .orderBy(asc(vitrineToasts.sortOrder), asc(vitrineToasts.id));
  } catch (cause) {
    console.error("Live toast host failed", cause);
    return null;
  }

  if (!items.length) return null;

  return <LiveToast items={items} />;
}
