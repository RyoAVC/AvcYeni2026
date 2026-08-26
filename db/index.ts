import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

let runtimeEnv: Record<string, unknown>;
const sqlitePath = typeof process !== "undefined" ? process.env.AVCI_SQLITE_PATH?.trim() : "";
if (sqlitePath) {
  const { createNodeD1Database } = await import("../app/node-sqlite-d1.mjs");
  runtimeEnv = { ...process.env, DB: await createNodeD1Database(sqlitePath) };
} else {
  const cloudflare = await import("cloudflare:workers");
  runtimeEnv = cloudflare.env as Record<string, unknown>;
}

export function getDb() {
  if (!runtimeEnv.DB) {
    throw new Error(
      "Cloudflare D1 binding `DB` is unavailable. Set the `d1` field in .openai/hosting.json to `DB` or let your control plane inject the real binding values before using the database."
    );
  }

  return drizzle(runtimeEnv.DB as Parameters<typeof drizzle>[0], { schema });
}
