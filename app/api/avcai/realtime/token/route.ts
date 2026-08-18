import { isSameRequestOrigin } from "../../../../request-origin";
import { buildRealtimeSession, openaiKey } from "../../../../avcai-realtime.mjs";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

function error(message: string, status = 400, code = "INVALID_REQUEST") {
  return Response.json({ ok: false, error: message, code }, { status, headers: NO_STORE });
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase();
  if (contentType !== "application/json") return error("İstek yalnızca JSON olarak gönderilebilir.", 415);

  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (!isSameRequestOrigin(request, origin)) {
        return error("Bu kaynaktan canlı görüşme başlatılamaz.", 403);
      }
    } catch {
      return error("Kaynak doğrulanamadı.", 403);
    }
  }

  let payload: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > 8192) return error("İstek çok uzun.", 413);
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return error("İstek geçersiz.");
    payload = parsed as Record<string, unknown>;
  } catch {
    return error("İstek okunamadı.");
  }

  let env: Record<string, unknown> = {};
  try {
    ({ env } = await import("cloudflare:workers") as unknown as { env: Record<string, unknown> });
  } catch {
    env = {};
  }
  const key = openaiKey(env);
  if (!key) {
    return error("Canlı ses şu anda yapılandırılmamış; mevcut ses sistemi kullanılacak.", 503, "REALTIME_UNAVAILABLE");
  }

  const path = typeof payload.path === "string" ? payload.path : "/";
  let staff = false;
  if (path === "/yonetim" || path.startsWith("/yonetim/")) {
    try {
      const { getAdminUser } = await import("../../../../admin-auth.ts");
      const admin = await getAdminUser();
      staff = Boolean(admin.user && admin.authorized);
    } catch {
      staff = false;
    }
  }
  const session = buildRealtimeSession({
    path,
    context: typeof payload.context === "string" ? payload.context : "",
    history: Array.isArray(payload.history) ? payload.history : [],
    staff,
  });

  let upstream: Response;
  try {
    upstream = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ session }),
    });
  } catch {
    return error("Canlı ses hizmetine ulaşılamadı; mevcut ses sistemi kullanılacak.", 502, "REALTIME_UNAVAILABLE");
  }

  const data = await upstream.json().catch(() => null) as { value?: unknown; expires_at?: unknown } | null;
  if (!upstream.ok || typeof data?.value !== "string" || data.value.length < 20) {
    return error("Canlı ses başlatılamadı; mevcut ses sistemi kullanılacak.", 502, "REALTIME_UNAVAILABLE");
  }

  return Response.json(
    {
      ok: true,
      value: data.value,
      expiresAt: typeof data.expires_at === "number" ? data.expires_at : undefined,
      model: "gpt-realtime-2.1",
    },
    { headers: NO_STORE },
  );
}
