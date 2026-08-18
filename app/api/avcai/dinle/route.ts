import { isSameRequestOrigin } from "../../../request-origin";
import { hearAvcai } from "../../../avcai-llm.mjs";

function error(message, status = 400) {
  return Response.json(
    { ok: false, error: message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request) {
  try {
    return await handleDinlePost(request);
  } catch {
    return error("Konuşma okunamadı. Tekrar dene.", 500);
  }
}

async function handleDinlePost(request) {
  const contentType = request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase();
  if (contentType !== "application/json") return error("Ses yalnızca JSON olarak gönderilebilir.", 415);

  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (!isSameRequestOrigin(request, origin)) {
        return error("Bu kaynaktan ses gönderilemez.", 403);
      }
    } catch {
      return error("Kaynak doğrulanamadı.", 403);
    }
  }

  let payload;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > 1_800_000) return error("Kayıt çok uzun.", 413);
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return error("İstek geçersiz.");
    payload = parsed;
  } catch {
    return error("İstek okunamadı.");
  }

  const audio = typeof payload.audio === "string" ? payload.audio.trim() : "";
  const mime = typeof payload.mime === "string" ? payload.mime.trim() : "audio/webm";
  if (audio.length < 80) return error("Kayıt alınamadı.");

  let env = {};
  try {
    ({ env } = await import("cloudflare:workers"));
  } catch {
    env = {};
  }
  const text = await hearAvcai(audio, mime, env);
  if (!text) return error("Konuşma okunamadı. Tekrar dene.", 503);
  return Response.json({ ok: true, text }, { headers: { "Cache-Control": "no-store" } });
}
