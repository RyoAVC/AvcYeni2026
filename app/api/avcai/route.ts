import { isSameRequestOrigin } from "../../request-origin";
import { replyAvcai } from "../../avcai-llm.mjs";
import { executeTofyPersonnelCommand } from "../../tofy-personnel-command.ts";
import { getAdminUser } from "../../admin-auth.ts";

const MAX_CHARS = 400;

function error(message, status = 400) {
  return Response.json(
    { ok: false, error: message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

function cleanHistory(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(-8).flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const role = item.role === "avcai" ? "avcai" : item.role === "user" ? "user" : "";
    const text = typeof item.text === "string" ? item.text.trim().slice(0, MAX_CHARS) : "";
    if (!role || text.length < 2) return [];
    return [{ role, text }];
  });
}

export async function POST(request) {
  try {
    return await handleAvcaiPost(request);
  } catch {
    return error("Yanıt alınamadı.", 500);
  }
}

async function handleAvcaiPost(request) {
  const contentType = request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase();
  if (contentType !== "application/json") return error("Soru yalnızca JSON olarak gönderilebilir.", 415);

  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (!isSameRequestOrigin(request, origin)) {
        return error("Bu kaynaktan soru gönderilemez.", 403);
      }
    } catch {
      return error("Kaynak doğrulanamadı.", 403);
    }
  }

  let payload;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > 8192) return error("Soru çok uzun.", 413);
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return error("Soru geçersiz.");
    payload = parsed;
  } catch {
    return error("Soru okunamadı.");
  }

  const message = typeof payload.message === "string" ? payload.message.trim().slice(0, MAX_CHARS) : "";
  if (message.length < 2) return error("Kısa bir soru yazın.");

  const personnel = await executeTofyPersonnelCommand(message);
  if (personnel.handled) {
    return Response.json(
      { source: "personnel", ...personnel, ok: true, authorized: personnel.ok },
      { status: 200, headers: { "Cache-Control": "private, no-store" } },
    );
  }

  let env = {};
  try {
    ({ env } = await import("cloudflare:workers"));
  } catch {
    env = {};
  }
  const context = typeof payload.context === "string" ? payload.context.replace(/\s+/g, " ").trim().slice(0, 120) : "";
  const path = typeof payload.path === "string" ? payload.path : "/";
  let staff = false;
  if (path === "/yonetim" || path.startsWith("/yonetim/")) {
    try {
      const admin = await getAdminUser();
      staff = Boolean(admin.user && admin.authorized);
    } catch {
      staff = false;
    }
  }
  const result = await replyAvcai(message, env, cleanHistory(payload.history), path, context, staff);
  return Response.json(
    { ok: true, ...result },
    { headers: { "Cache-Control": "no-store" } },
  );
}
