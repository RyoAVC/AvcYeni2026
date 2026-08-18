import { isSameRequestOrigin } from "../../request-origin";
import { and, eq, gte, or } from "drizzle-orm";
import { leads } from "../../../db/schema";
import { normalizeLeadAttribution } from "../../lead-attribution.mjs";
import { OFFER_INTERESTS } from "../../offer-options";
import { normalizeLeadPhone } from "../../lead-contact.mjs";
import { normalizeEmailAddress } from "../../email-normalization.mjs";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_INTERESTS = new Set<string>(OFFER_INTERESTS);

type LeadPayload = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  company?: unknown;
  interest?: unknown;
  message?: unknown;
  consent?: unknown;
  website?: unknown;
  utmSource?: unknown;
  utmMedium?: unknown;
  utmCampaign?: unknown;
  referrerHost?: unknown;
  landingPath?: unknown;
  requestKey?: unknown;
};

function clean(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function error(message: string, status = 400, extraHeaders?: HeadersInit) {
  const headers = new Headers(extraHeaders);
  headers.set("Cache-Control", "no-store");
  return Response.json(
    { ok: false, error: message },
    { status, headers },
  );
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase();
  if (contentType !== "application/json") return error("Form yalnızca JSON olarak gönderilebilir.", 415);

  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (!isSameRequestOrigin(request, origin)) {
        return error("Bu kaynaktan form gönderimine izin verilmiyor.", 403);
      }
    } catch {
      return error("Form kaynağı doğrulanamadı.", 403);
    }
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > 16_384) return error("Gönderilen form çok büyük.", 413);

  let payload: LeadPayload;
  try {
    const rawPayload = await request.text();
    if (new TextEncoder().encode(rawPayload).byteLength > 16_384) {
      return error("Gönderilen form çok büyük.", 413);
    }
    const parsed = JSON.parse(rawPayload) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return error("Form verisi geçersiz.");
    }
    payload = parsed as LeadPayload;
  } catch {
    return error("Form verisi okunamadı.");
  }

  if (clean(payload.website, 120)) {
    return Response.json({ ok: true }, { status: 201, headers: { "Cache-Control": "no-store" } });
  }

  const name = clean(payload.name, 100);
  const email = normalizeEmailAddress(payload.email, 180);
  const phone = clean(payload.phone, 30);
  const phoneNormalized = normalizeLeadPhone(phone);
  const company = clean(payload.company, 120);
  const interest = clean(payload.interest, 80);
  const message = clean(payload.message, 1_500);
  const { source, utmSource, utmMedium, utmCampaign, referrerHost, landingPath } = normalizeLeadAttribution(payload);

  if (name.length < 2) return error("Adınızı ve soyadınızı yazın.");
  if (!EMAIL_PATTERN.test(email)) return error("Geçerli bir e-posta adresi yazın.");
  if (phoneNormalized.length < 10) return error("Geçerli bir telefon numarası yazın.");
  if (!ALLOWED_INTERESTS.has(interest)) return error("İlgilendiğiniz çözümü seçin.");
  if (payload.consent !== true) return error("İletişim izni gereklidir.");
  const requestKey = clean(payload.requestKey, 36).toLocaleLowerCase("en-US");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(requestKey)) {
    return error("Form isteği doğrulanamadı. Lütfen tekrar deneyin.");
  }

  try {
    const { getDb } = await import("../../../db");
    const db = getDb();
    const existingRequest = await db.select({ id: leads.id }).from(leads).where(eq(leads.requestKey, requestKey)).limit(1);
    if (existingRequest.length) {
      return Response.json(
        { ok: true, message: "Talebiniz alındı. Ekibimiz en kısa sürede sizinle iletişime geçecek.", duplicate: true },
        { status: 200, headers: { "Cache-Control": "no-store" } },
      );
    }

    const twoMinutesAgo = new Date(Date.now() - 120_000).toISOString();
    const duplicate = await db
      .select({ id: leads.id })
      .from(leads)
      .where(and(or(eq(leads.email, email), eq(leads.phoneNormalized, phoneNormalized)), gte(leads.createdAt, twoMinutesAgo)))
      .limit(1);

    if (duplicate.length) {
      return error("Başvurunuz kısa süre önce alındı. Lütfen birkaç dakika bekleyin.", 429, { "Retry-After": "120" });
    }

    const createdAt = new Date().toISOString();
    try {
      await db.insert(leads).values({
        name,
        email,
        phone,
        phoneNormalized,
        company,
        interest,
        message,
        source,
        utmSource,
        utmMedium,
        utmCampaign,
        referrerHost,
        landingPath,
        requestKey,
        consentAt: createdAt,
        createdAt,
        updatedAt: createdAt,
      });
    } catch (insertCause) {
      const duplicateRequest = await db.select({ id: leads.id }).from(leads).where(eq(leads.requestKey, requestKey)).limit(1);
      if (!duplicateRequest.length) throw insertCause;
      return Response.json(
        { ok: true, message: "Talebiniz alındı. Ekibimiz en kısa sürede sizinle iletişime geçecek.", duplicate: true },
        { status: 200, headers: { "Cache-Control": "no-store" } },
      );
    }

    return Response.json(
      { ok: true, message: "Talebiniz alındı. Ekibimiz en kısa sürede sizinle iletişime geçecek." },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (cause) {
    console.error("Lead submission failed", cause);
    return error("Talebiniz şu anda kaydedilemedi. Lütfen telefon veya e-posta ile bize ulaşın.", 503);
  }
}
