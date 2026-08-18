import { AVCAI_CHAT, AVCAI_FALLBACK, AVCAI_TOPICS } from "./avcai-knowledge.mjs";

const GREET =
  /\b(merhaba|selam|hey|hi|hello|naber|ne haber|nasil gidiyor|nasıl gidiyor|nasilsin|nasılsın|kimsin|kendini tanit|kendini tanıt)\b/;

export function foldAvcaiText(value) {
  return String(value ?? "")
    .toLocaleLowerCase("tr-TR")
    .replace(/[^\p{L}\p{N}\s-]+/gu, " ")
    .replace(/avca[iı]/g, "avcai")
    .replace(/\s+/g, " ")
    .trim();
}

function hasNeedle(hay, needle) {
  if (!needle) return false;
  if (needle.includes(" ")) return hay.includes(needle);
  return hay.split(" ").some((word) => word === needle || (needle.length >= 4 && word.startsWith(needle)));
}

function scoreTopic(hay, topic) {
  let score = 0;
  for (const keyword of topic.keywords) {
    const needle = foldAvcaiText(keyword);
    if (!hasNeedle(hay, needle)) continue;
    score += needle === "avcai" ? 5 : needle.length >= 10 ? 4 : needle.length >= 6 ? 3 : 2;
  }
  return score;
}

function fromTopic(topic) {
  return { topic: topic.id, reply: topic.answer, href: topic.href, label: topic.label };
}

function rankedTopics(hay) {
  return AVCAI_TOPICS
    .map((topic) => ({ topic, score: scoreTopic(hay, topic) }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score);
}

function firstSentences(text, count = 2) {
  const parts = String(text ?? "").match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
  return parts.slice(0, count).join(" ").trim();
}

function pathTopic(path) {
  const value = String(path ?? "").toLocaleLowerCase("tr-TR");
  if (value.startsWith("/paketler") || value.startsWith("/fiyatlandirma")) return "paket";
  if (value.startsWith("/entegrasyonlar")) return "entegrasyon";
  if (value.startsWith("/b2b-c2c")) return "b2b";
  if (value.startsWith("/e-ihracat")) return "eihracat";
  if (value.startsWith("/teklif")) return "teklif";
  if (value.startsWith("/destek")) return "destek";
  if (value.startsWith("/yapay-zeka") || value.startsWith("/avcai")) return "ai";
  if (value.startsWith("/cozum-senaryolari/peynir")) return "demo";
  return "";
}

function conversationalReply(question, primary, secondary) {
  const hay = foldAvcaiText(question);
  if (!secondary) return primary.answer;
  const first = firstSentences(primary.answer, 2);
  const second = firstSentences(secondary.answer, 2);
  const bridge = hay.includes(" ve ") || hay.includes("birlikte") ? "Birlikte düşününce" : "Bunun yanında";
  return `${first} ${bridge}, ${second.charAt(0).toLocaleLowerCase("tr-TR")}${second.slice(1)}`.slice(0, 700);
}

export function answerAvcai(question, options = {}) {
  const hay = foldAvcaiText(question);
  const history = Array.isArray(options.history) ? options.history : [];
  const context = typeof options.context === "string" ? options.context.trim().slice(0, 120) : "";
  const path = typeof options.path === "string" ? options.path : "/";
  if (hay.length < 2) {
    return { topic: "intro", reply: AVCAI_CHAT, href: "/yazilimlar", label: "Yazılımlar" };
  }

  if (hay === "avcı" || hay === "avc" || hay === "avci") {
    return fromTopic(AVCAI_TOPICS.find((topic) => topic.id === "nedir"));
  }
  if (hay === "avcai") {
    return fromTopic(AVCAI_TOPICS.find((topic) => topic.id === "ai"));
  }

  let ranked = rankedTopics(hay);
  const bestScore = ranked[0]?.score || 0;

  if (GREET.test(hay) && bestScore < 4) {
    return { topic: "intro", reply: AVCAI_CHAT, href: "/yazilimlar", label: "Yazılımlar" };
  }

  if (!ranked.length || bestScore < 2) {
    const recentUserText = history
      .filter((item) => item?.role === "user" && typeof item.text === "string")
      .slice(-3)
      .map((item) => item.text)
      .join(" ");
    ranked = rankedTopics(foldAvcaiText(`${recentUserText} ${question}`));
  }

  if (!ranked.length || ranked[0].score < 2) {
    const suggestedId = pathTopic(path);
    const suggested = AVCAI_TOPICS.find((topic) => topic.id === suggestedId);
    if (context) {
      return {
        topic: suggested?.id || "fallback",
        reply: `Şu an “${context}” bölümüne bakıyorsun. Buradaki konuyu ihtiyacına göre birlikte netleştirebiliriz. Ne yapmak istediğini bir cümleyle anlat; sana doğrudan ilgili adımı söyleyeyim.`,
        href: suggested?.href || AVCAI_FALLBACK.href,
        label: suggested?.label || AVCAI_FALLBACK.label,
      };
    }
    if (suggested) {
      return {
        ...fromTopic(suggested),
        reply: `${firstSentences(suggested.answer, 2)} Bu sayfada özellikle hangi kısmı netleştirelim?`,
      };
    }
    return {
      topic: "fallback",
      reply: AVCAI_FALLBACK.answer,
      href: AVCAI_FALLBACK.href,
      label: AVCAI_FALLBACK.label,
    };
  }

  const primary = ranked[0].topic;
  const secondary = ranked[1]?.score >= 2 && ranked[1].topic.id !== primary.id ? ranked[1].topic : null;
  return {
    ...fromTopic(primary),
    reply: conversationalReply(question, primary, secondary),
  };
}
