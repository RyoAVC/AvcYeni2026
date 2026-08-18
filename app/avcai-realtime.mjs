import { buildAvcaiSystemPrompt } from "./avcai-llm.mjs";
import { cleanAvcaiPath } from "./avcai-ui.mjs";

export const AVCAI_REALTIME_MODEL = "gpt-realtime-2.1";
export const AVCAI_REALTIME_VOICE = "marin";

export function openaiKey(env) {
  const bindingValue = typeof env?.OPENAI_API_KEY === "string" ? env.OPENAI_API_KEY.trim() : "";
  const processValue = typeof process !== "undefined" && typeof process.env?.OPENAI_API_KEY === "string"
    ? process.env.OPENAI_API_KEY.trim()
    : "";
  const value = bindingValue || processValue;
  return value.length > 20 ? value : "";
}

export function buildRealtimeSession({ path = "/", context = "", history = [], staff = false } = {}) {
  const safePath = cleanAvcaiPath(path);
  const safeContext = String(context ?? "").replace(/\s+/g, " ").trim().slice(0, 120);
  const conversation = Array.isArray(history)
    ? history.slice(-8).flatMap((item) => {
        const role = item?.role === "avcai" ? "Tofy" : item?.role === "user" ? "Kullanıcı" : "";
        const text = typeof item?.text === "string" ? item.text.replace(/\s+/g, " ").trim().slice(0, 400) : "";
        return role && text.length >= 2 ? [`${role}: ${text}`] : [];
      }).join("\n")
    : "";

  const instructions = [
    buildAvcaiSystemPrompt(safePath, safeContext, staff),
    "Bu canlı bir Türkçe sesli görüşmedir. Kısa, doğal ve sıcak konuş; kişinin sözünü kesme. Avcı E-Ticaret adını her zaman 'Avcı E-Ticaret' diye telaffuz et; AVC harflerini ayrı ayrı okuma.",
    "Yanıt verirken web sitesindeki kayıtlı bilgilerle sınırlı kal. Aynı sektörden şirket adı verme; örnek gerekiyorsa yalnızca X Firma de.",
    conversation ? `Yakın konuşma özeti:\n${conversation}` : "",
  ].filter(Boolean).join("\n");

  return {
    type: "realtime",
    model: AVCAI_REALTIME_MODEL,
    instructions,
    audio: {
      input: {
        transcription: { model: "gpt-4o-mini-transcribe", language: "tr" },
        turn_detection: {
          type: "server_vad",
          create_response: true,
          interrupt_response: true,
          prefix_padding_ms: 300,
          silence_duration_ms: 650,
        },
      },
      output: { voice: AVCAI_REALTIME_VOICE },
    },
  };
}
