import { isSameRequestOrigin } from "../../../request-origin";
import { siteVisits } from "../../../../db/schema";
import {
  istanbulCalendarDay,
  isAutomatedVisitAgent,
  isVisitVisitorKey,
  normalizeVisitPath,
  normalizeVisitReferrerHost,
  readVisitVisitorKey,
  visitCookieHeader,
} from "../../../site-visit.mjs";

function empty() {
  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase();
  if (contentType !== "application/json") return empty();

  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (!isSameRequestOrigin(request, origin)) return empty();
    } catch {
      return empty();
    }
  }

  if (isAutomatedVisitAgent(request.headers.get("user-agent") ?? "")) return empty();

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > 2_048) return empty();

  let payload: { path?: unknown; referrerHost?: unknown };
  try {
    const rawPayload = await request.text();
    if (new TextEncoder().encode(rawPayload).byteLength > 2_048) return empty();
    const parsed = JSON.parse(rawPayload) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return empty();
    payload = parsed as { path?: unknown; referrerHost?: unknown };
  } catch {
    return empty();
  }

  const path = normalizeVisitPath(payload.path);
  if (!path) return empty();
  const referrerHost = normalizeVisitReferrerHost(payload.referrerHost);
  const existingKey = readVisitVisitorKey(request.headers.get("cookie") ?? "");
  const visitorKey = existingKey || crypto.randomUUID();
  if (!isVisitVisitorKey(visitorKey)) return empty();

  try {
    const { getDb } = await import("../../../../db");
    const db = getDb();
    const createdAt = new Date().toISOString();
    await db.insert(siteVisits).values({
      day: istanbulCalendarDay(),
      path,
      referrerHost,
      visitorKey,
      createdAt,
    });
  } catch (cause) {
    console.error("Site visit record failed", cause);
    return empty();
  }

  const headers = new Headers({ "Cache-Control": "no-store" });
  if (!existingKey) {
    headers.append("Set-Cookie", visitCookieHeader(visitorKey, new URL(request.url).protocol === "https:"));
  }
  return new Response(null, { status: 204, headers });
}
