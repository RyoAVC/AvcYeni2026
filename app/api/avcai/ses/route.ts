import { isSameRequestOrigin } from "../../../request-origin";
import { speakAvcai } from "../../../avcai-llm.mjs";

const MAX_CHARS = 320;

function error(message, status = 400) {
  return Response.json(
    { ok: false, error: message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request) {
  try {
    return await handleSesPost(request);
  } catch {
    return error("Ses üretilemedi.", 500);
  }
}

async function handleSesPost(request) {
  const contentType = request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase();
  if (contentType !== "application/json") return error("Ses yalnızca JSON olarak istenebilir.", 415);

  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (!isSameRequestOrigin(request, origin)) {
        return error("Bu kaynaktan ses istenemez.", 403);
      }
    } catch {
      return error("Kaynak doğrulanamadı.", 403);
    }
  }

  let payload;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > 4096) return error("Metin çok uzun.", 413);
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return error("İstek geçersiz.");
    payload = parsed;
  } catch {
    return error("İstek okunamadı.");
  }

  const text = typeof payload.text === "string" ? payload.text.trim().slice(0, MAX_CHARS) : "";
  if (text.length < 8) return error("Okunacak metin yok.");

  let env = {};
  try {
    ({ env } = await import("cloudflare:workers"));
  } catch {
    env = {};
  }
  let audio = null;
  try {
    audio = await speakAvcai(text, env);
  } catch {
    audio = null;
  }
  if (!audio?.byteLength) return error("Ses şu an üretilemedi.", 503);

  const bytes = audio instanceof Uint8Array ? audio : new Uint8Array(audio);
  return new Response(bytes, {
    status: 200,
    headers: {
      "Content-Type": "audio/wav",
      "Cache-Control": "no-store",
    },
  });
}
