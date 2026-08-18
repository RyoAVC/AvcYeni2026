import { eq } from "drizzle-orm";
import { customers } from "../../../../db/schema.ts";
import { isSameRequestOrigin } from "../../../request-origin";
import {
  DOMAIN_LOOKUP_MISS,
  lookupMatchesCustomer,
  parseDomainLookupRequest,
  presentDomainLookup,
} from "../../../domain-lookup.mjs";

function json(body: Record<string, unknown>, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase();
  if (contentType !== "application/json") return json({ ok: false, error: "Sorgu yalnızca JSON olarak gönderilebilir." }, 415);

  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (!isSameRequestOrigin(request, origin)) {
        return json({ ok: false, error: "Bu kaynaktan sorgu gönderilemez." }, 403);
      }
    } catch {
      return json({ ok: false, error: "Kaynak doğrulanamadı." }, 403);
    }
  }

  let payload: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > 8_192) return json({ ok: false, error: "Sorgu çok büyük." }, 413);
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return json({ ok: false, error: "Sorgu geçersiz." }, 400);
    payload = parsed as Record<string, unknown>;
  } catch {
    return json({ ok: false, error: "Sorgu okunamadı." }, 400);
  }

  if (typeof payload.website === "string" && payload.website.trim()) {
    return json({ ok: true, found: false, error: DOMAIN_LOOKUP_MISS });
  }

  const parsed = parseDomainLookupRequest(payload);
  if (!parsed.ok) return json({ ok: false, error: parsed.error }, 400);

  try {
    const { getDb } = await import("../../../../db/index.ts");
    const db = getDb();
    const [customer] = await db.select().from(customers).where(eq(customers.email, parsed.value.email)).limit(1);
    if (!lookupMatchesCustomer(customer, parsed.value.email, parsed.value.domain)) {
      return json({ ok: true, found: false, error: DOMAIN_LOOKUP_MISS });
    }
    return json(presentDomainLookup(customer));
  } catch (cause) {
    console.error("Domain lookup failed", cause);
    return json({ ok: false, error: "Sorgu şu anda çalışmıyor. Biraz sonra deneyin." }, 503);
  }
}
