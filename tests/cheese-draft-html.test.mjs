import assert from "node:assert/strict";
import test from "node:test";

test("cheese scenario draft renders Avci demo storefront", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const runtimeEnv = {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  };
  const runtimeContext = { waitUntil() {}, passThroughOnException() {} };

  const response = await worker.fetch(
    new Request("https://localhost/cozum-senaryolari/peynir", { headers: { accept: "text/html" } }),
    runtimeEnv,
    runtimeContext,
  );
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /CANLI TASLAK/);
  assert.match(html, /Avcı peynir satmaz/);
  assert.match(html, /PYN-104/);
  assert.match(html, /AVCI REHBER/);
  assert.match(html, /Sepete ekle/);
  assert.match(html, /Tofy’ye sor/);
  assert.match(html, /İSTEĞE BAĞLI AI/);
  assert.match(html, /Soğuk kutu/);
  assert.match(html, /id="peynir-taslak"/);
  assert.match(html, /canonical" href="https:\/\/avcieticaret\.com\/cozum-senaryolari\/peynir/);
});
