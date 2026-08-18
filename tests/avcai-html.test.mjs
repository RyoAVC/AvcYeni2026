import assert from "node:assert/strict";
import test from "node:test";

test("Tofy page introduces the assistant and answers from the same origin", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const runtimeEnv = {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  };
  const runtimeContext = { waitUntil() {}, passThroughOnException() {} };

  const pageResponse = await worker.fetch(
    new Request("https://localhost/avcai", { headers: { accept: "text/html" } }),
    runtimeEnv,
    runtimeContext,
  );
  assert.equal(pageResponse.status, 200);
  const html = await pageResponse.text();
  assert.match(html, /TOFY · SESLİ ASİSTAN/);
  assert.match(html, /Avcı sistemini/);
  assert.match(html, /Tofy’yi Avcı E-Ticaret geliştirdi/);
  assert.match(html, /id="avcai-sohbet"/);
  assert.match(html, /Avcı E-Ticaret peynir, kıyafet veya mobilya satmaz/);
  assert.match(html, /canonical" href="https:\/\/avcieticaret\.com\/avcai/);
  assert.doesNotMatch(html, /OpenAI|ChatGPT API|speechSynthesis/);

  const answerResponse = await worker.fetch(
    new Request("https://localhost/api/avcai", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "https://localhost" },
      body: JSON.stringify({ message: "Avcı nedir, ne satar?" }),
    }),
    runtimeEnv,
    runtimeContext,
  );
  assert.equal(answerResponse.status, 200);
  const payload = await answerResponse.json();
  assert.equal(payload.ok, true);
  assert.equal(payload.topic, "nedir");
  assert.equal(payload.source, "local");
  assert.match(payload.reply, /e-ticaret sitesi/);

  const blocked = await worker.fetch(
    new Request("https://localhost/api/avcai", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "https://evil.example" },
      body: JSON.stringify({ message: "Avcı nedir?" }),
    }),
    runtimeEnv,
    runtimeContext,
  );
  assert.equal(blocked.status, 403);

  const voiceBlocked = await worker.fetch(
    new Request("https://localhost/api/avcai/ses", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "https://evil.example" },
      body: JSON.stringify({ text: "Avcı e-ticaret altyapısı satar." }),
    }),
    runtimeEnv,
    runtimeContext,
  );
  assert.equal(voiceBlocked.status, 403);
});
