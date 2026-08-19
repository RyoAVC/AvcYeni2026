import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { answerAvcai, foldAvcaiText } from "../app/avcai-answer.mjs";

test("AvcAI folds Turkish text and answers from the project record", () => {
  assert.equal(foldAvcaiText("  Avcı!  "), "avcı");
  assert.equal(foldAvcaiText("AvcAI"), "avcai");

  const intro = answerAvcai("merhaba");
  assert.equal(intro.topic, "intro");
  assert.match(intro.reply, /buradayım/);
  assert.doesNotMatch(intro.reply, /Paket, demo mağaza, fiyat veya yönetim paneli sorabilirsin/);

  const chat = answerAvcai("Ne haber, nasıl gidiyor?");
  assert.equal(chat.topic, "intro");
  assert.match(chat.reply, /sesli sorabilirsin/);

  const who = answerAvcai("Avcı nedir, ne satar?");
  assert.equal(who.topic, "nedir");
  assert.match(who.reply, /e-ticaret sitesi/);
  assert.doesNotMatch(who.reply, /peynir satarız/);

  const cheese = answerAvcai("Peynir demo mağazası nedir?");
  assert.equal(cheese.topic, "demo");
  assert.match(cheese.reply, /Avcı peynir satmaz/);
  assert.equal(cheese.href, "/cozum-senaryolari/peynir");

  const admin = answerAvcai("Yönetim panelinde stok ve kasa var mı?");
  assert.equal(admin.topic, "iki-katman");
  assert.match(admin.reply, /butik kasası kurulmaz/);

  const price = answerAvcai("Fiyat ne kadar?");
  assert.equal(price.topic, "fiyat");
  assert.match(price.reply, /hazır fiyat/);
  assert.doesNotMatch(price.reply, /49\.999/);

  const when = answerAvcai("Kaç günde biter?");
  assert.equal(when.topic, "sure");
  assert.match(when.reply, /vaat edilmez/);

  const ai = answerAvcai("AvcAI nedir?");
  assert.equal(ai.topic, "ai");
  assert.match(ai.reply, /yapay zekâ modeli satıcısı değildir/);

  const contact = answerAvcai("iletişim bilgileriniz nedir?");
  assert.equal(contact.topic, "teklif");
  assert.match(contact.reply, /Formu şimdi doldurmana gerek yok/);
  assert.doesNotMatch(contact.reply, /buyurun/i);

  const fallback = answerAvcai("Yarın yağmur yağacak mı?");
  assert.equal(fallback.topic, "fallback");
  assert.equal(fallback.href, "/teklif");

  const combined = answerAvcai("Paket ve fiyatı birlikte anlatır mısın?");
  assert.match(combined.reply, /Start, Scale ve Enterprise/);
  assert.match(combined.reply, /hazır fiyat/);

  const followUp = answerAvcai("Peki bu bana uygun mu?", {
    history: [{ role: "user", text: "Start paketiyle ilgileniyorum" }],
    path: "/paketler",
  });
  assert.equal(followUp.topic, "paket");

  const contextual = answerAvcai("Burayı anlamadım", {
    path: "/platform",
    context: "Sipariş ve teslimat akışı",
  });
  assert.match(contextual.reply, /Sipariş ve teslimat akışı/);
});

test("AvcAI local reply and mascot visibility stay honest without a paid API", async () => {
  const { buildAvcaiSystemPrompt, cleanAvcaiReply, replyAvcai, pcmToWav } = await import("../app/avcai-llm.mjs");
  const { pageCue, shouldShowAvcai, TOFY_LISTEN_PAUSE_MS, tofySpeechText, voiceChunks, voiceLine } = await import("../app/avcai-ui.mjs");
  const local = await replyAvcai("Avcı nedir, ne satar?", {});
  assert.equal(local.source, "local");
  assert.equal(local.voice, true);
  assert.match(local.reply, /e-ticaret sitesi/);
  assert.doesNotMatch(local.reply, /Hipotenüs|Ticimax|ikas|T-?Soft|IdeaSoft/i);
  assert.equal(cleanAvcaiReply("Ticimax ve ikas örneği"), "X Firma ve X Firma örneği");
  assert.match(buildAvcaiSystemPrompt("/", "Paket karşılaştırması"), /yalnızca 'X Firma'/);
  assert.match(buildAvcaiSystemPrompt("/", "Paket karşılaştırması"), /Paket karşılaştırması/);
  const wav = pcmToWav(new Uint8Array([1, 2, 3, 4]));
  assert.equal(wav.byteLength, 48);
  assert.equal(shouldShowAvcai("/"), true);
  assert.equal(shouldShowAvcai("/yonetim"), false);
  assert.equal(shouldShowAvcai("/yonetim/giris"), false);
  assert.equal(shouldShowAvcai("/en"), false);
  assert.equal(TOFY_LISTEN_PAUSE_MS, 900);
  assert.equal(pageCue("/paketler").id, "paket");
  assert.match(pageCue("/teklif").nudge, /Formu/);
  assert.equal(voiceLine("İyiyim, buradayım. Paket mi?"), "İyiyim, buradayım. Paket mi?");
  assert.equal(tofySpeechText("AVC E-Ticaret ve AvcAI"), "Avcı E-Ticaret ve Tofy");
  const spoken = voiceChunks("Avcı mağaza değildir. Altyapı satar. Teklif formuna yaz. Net fiyat orada çıkar.");
  assert.equal(spoken.join(" ").includes("Net fiyat orada çıkar."), true);
  assert.equal(spoken.some((chunk) => chunk.endsWith("değildir.") || chunk.includes("mağaza değildir")), true);

  const mascotSource = await readFile(new URL("../app/avcai-mascot.tsx", import.meta.url), "utf8");
  assert.match(mascotSource, /rec\.continuous = true/);
  assert.match(mascotSource, /TOFY_LISTEN_MAX_MS/);
  assert.match(mascotSource, /TOFY_LISTEN_PAUSE_MS/);
  assert.match(mascotSource, /fetchVoiceChunk/);
  assert.match(mascotSource, /keepAliveRef/);
  assert.match(mascotSource, /finishListen\(true\)/);
  assert.match(mascotSource, /Yanıt sesi açık/);
  assert.match(mascotSource, /readApiJson/);
  assert.match(mascotSource, /Mikrofon izni kapalı/);
  assert.match(mascotSource, /recRestartRef/);
  assert.doesNotMatch(mascotSource, /speechSynthesis\.speak/);
  assert.doesNotMatch(mascotSource, /playBrowserVoice/);
  assert.match(mascotSource, /avcai-tool-icon/);
  assert.match(mascotSource, /pointermove/);
  assert.match(mascotSource, /TOFY_IDLE_LINE/);
  assert.match(mascotSource, /mouseleave/);
  assert.match(mascotSource, /tofy-exit/);
  assert.match(mascotSource, /pendingAskRef/);
  assert.match(mascotSource, /Seni dinliyorum/);
  assert.match(mascotSource, /context: pageContext/);
  assert.match(mascotSource, /finishListen\(true\)/);
  assert.match(mascotSource, /startVoiceClip/);
  assert.match(mascotSource, /Sesli soru/);
  assert.match(mascotSource, /VoiceClip/);

  const llmSource = await readFile(new URL("../app/avcai-llm.mjs", import.meta.url), "utf8");
  assert.match(llmSource, /TTS_MODELS = \["gemini-3.1-flash-tts-preview", "gemini-2.5-flash-preview-tts"\]/);
  assert.match(llmSource, /fetchTimed/);
  assert.match(llmSource, /, 12000\)/);
  assert.match(llmSource, /voiceName: "Kore"/);
  assert.match(llmSource, /geminiTtsSkipUntil/);
  assert.match(llmSource, /translate_tts/);
  assert.doesNotMatch(mascotSource, /Promise\.reject/);
});

test("AvcAI uses OpenAI Responses for ordinary written conversation when configured", async () => {
  const { replyAvcai } = await import("../app/avcai-llm.mjs");
  const originalFetch = globalThis.fetch;
  let requestBody = null;
  globalThis.fetch = async (url, options) => {
    assert.equal(url, "https://api.openai.com/v1/responses");
    requestBody = JSON.parse(options.body);
    return Response.json({
      model: "gpt-5.6-2026-08-07",
      output: [{ type: "message", content: [{ type: "output_text", text: "İhtiyacını birlikte netleştirelim; satış yaptığın kanalları söylemen yeterli." }] }],
    });
  };

  try {
    const result = await replyAvcai(
      "Bana uygun altyapıyı nasıl seçerim?",
      { OPENAI_API_KEY: "test-openai-key-that-is-long-enough" },
      [{ role: "user", text: "İki pazaryerinde satış yapıyorum." }],
      "/paketler",
      "Paket karşılaştırması",
    );
    assert.equal(result.source, "openai");
    assert.equal(result.provider, "openai");
    assert.equal(result.model, "gpt-5.6-2026-08-07");
    assert.match(result.reply, /birlikte netleştirelim/);
    assert.equal(requestBody.model, "gpt-5.6");
    assert.equal(requestBody.store, false);
    assert.match(requestBody.instructions, /Doğal ve akıcı Türkçe/);
    assert.deepEqual(requestBody.input.map((item) => item.role), ["user", "user"]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
