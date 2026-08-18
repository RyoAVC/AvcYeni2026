import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  AVCAI_REALTIME_MODEL,
  AVCAI_REALTIME_VOICE,
  buildRealtimeSession,
  openaiKey,
} from "../app/avcai-realtime.mjs";
import { POST } from "../app/api/avcai/realtime/token/route.ts";

test("AvcAI Realtime uses the requested model, natural voice and guarded prompt", () => {
  assert.equal(AVCAI_REALTIME_MODEL, "gpt-realtime-2.1");
  assert.equal(AVCAI_REALTIME_VOICE, "marin");
  assert.equal(openaiKey({}), "");
  assert.equal(openaiKey({ OPENAI_API_KEY: "short" }), "");

  const session = buildRealtimeSession({
    path: "/paketler",
    context: "Fiyatlar",
    history: [{ role: "user", text: "Paketleri anlat" }],
  });
  assert.equal(session.type, "realtime");
  assert.equal(session.model, "gpt-realtime-2.1");
  assert.equal(session.audio.output.voice, "marin");
  assert.equal(session.audio.input.turn_detection.type, "server_vad");
  assert.match(session.instructions, /Doğal ve akıcı Türkçe/);
  assert.match(session.instructions, /yalnızca X Firma/);
  assert.match(session.instructions, /Kullanıcı: Paketleri anlat/);
});

test("Realtime token route rejects unsafe requests and keeps the standard key server-side", async () => {
  const wrongType = await POST(new Request("https://localhost/api/avcai/realtime/token", {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: "{}",
  }));
  assert.equal(wrongType.status, 415);
  assert.match(wrongType.headers.get("cache-control") || "", /no-store/);

  const crossOrigin = await POST(new Request("https://localhost/api/avcai/realtime/token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "https://example.org" },
    body: "{}",
  }));
  assert.equal(crossOrigin.status, 403);

  const unavailable = await POST(new Request("https://localhost/api/avcai/realtime/token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "https://localhost" },
    body: "{}",
  }));
  assert.equal(unavailable.status, 503);
  const payload = await unavailable.json();
  assert.equal(payload.code, "REALTIME_UNAVAILABLE");
  assert.equal("OPENAI_API_KEY" in payload, false);
  assert.equal("key" in payload, false);

  const routeSource = await readFile(new URL("../app/api/avcai/realtime/token/route.ts", import.meta.url), "utf8");
  assert.match(routeSource, /\/v1\/realtime\/client_secrets/);
  assert.doesNotMatch(routeSource, /OPENAI_API_KEY\s*:/);
});

test("Mascot establishes WebRTC and cleans every live-call resource", async () => {
  const source = await readFile(new URL("../app/avcai-mascot.tsx", import.meta.url), "utf8");
  assert.match(source, /new RTCPeerConnection\(\)/);
  assert.match(source, /createDataChannel\("oai-events"\)/);
  assert.match(source, /realtime\/calls\?model=gpt-realtime-2\.1/);
  assert.match(source, /realtimeStreamRef\.current\?\.getTracks\(\)\.forEach\(\(track\) => track\.stop\(\)\)/);
  assert.match(source, /channel\?\.close\(\)/);
  assert.match(source, /peer\?\.close\(\)/);
  assert.match(source, /if \(await startRealtime\(\)\) return;\s+await startLegacyListen\(\)/);
});
