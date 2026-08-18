import { isSameRequestOrigin } from "../../../request-origin";
import { executeTofyPersonnelCommand } from "../../../tofy-personnel-command.ts";

const HEADERS = { "Cache-Control": "private, no-store" };

function json(body: Record<string, unknown>, status: number) {
  return Response.json(body, { status, headers: HEADERS });
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase();
  if (contentType !== "application/json") return json({ ok: false, error: "İstek yalnızca JSON olabilir." }, 415);
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (!isSameRequestOrigin(request, origin)) {
        return json({ ok: false, error: "Bu kaynaktan personel komutu gönderilemez." }, 403);
      }
    } catch {
      return json({ ok: false, error: "Kaynak doğrulanamadı." }, 403);
    }
  }

  let message = "";
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > 1024) return json({ ok: false, error: "Komut çok uzun." }, 413);
    const payload = JSON.parse(raw);
    message = typeof payload?.message === "string" ? payload.message.slice(0, 120) : "";
  } catch {
    return json({ ok: false, error: "Komut okunamadı." }, 400);
  }

  const result = await executeTofyPersonnelCommand(message);
  if (!result.handled) return json({ ok: false, error: "Personel komutu bulunamadı." }, 400);
  return json({ ok: result.ok, ...result }, result.status);
}
