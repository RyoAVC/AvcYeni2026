export const TOFY_LISTEN_PAUSE_MS = 900;
export const TOFY_LISTEN_MAX_MS = 14000;

export function shouldShowAvcai(pathname) {
  const path = typeof pathname === "string" ? pathname : "";
  if (!path || path === "/api" || path.startsWith("/api/")) return false;
  if (path === "/yonetim" || path.startsWith("/yonetim/")) return false;
  if (path === "/en" || path.startsWith("/en/")) return false;
  if (path === "/musteri-girisi" || path === "/demo-portal" || path === "/musteri-panel" || path.startsWith("/musteri-panel/") || path === "/onizleme/musteri-portali-k7m2x9") return false;
  return true;
}

export function cleanAvcaiPath(value) {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw.startsWith("/")) return "/";
  return raw.slice(0, 120);
}

export function voiceChunks(text, max = 300) {
  const clipped = String(text ?? "").replace(/\s+/g, " ").trim();
  if (clipped.length < 8) return [];
  const sentences = [];
  let current = "";
  for (let index = 0; index < clipped.length; index += 1) {
    current += clipped[index];
    const end = ".!?".includes(clipped[index]);
    const spaceAfter = index === clipped.length - 1 || clipped[index + 1] === " ";
    if (!end || !spaceAfter) continue;
    sentences.push(current.trim());
    current = "";
    if (clipped[index + 1] === " ") index += 1;
  }
  if (current.trim()) sentences.push(current.trim());

  const chunks = [];
  let buffer = "";
  function pushPiece(piece) {
    if (!piece) return;
    if (piece.length <= max) {
      chunks.push(piece);
      return;
    }
    let part = "";
    for (const word of piece.split(" ")) {
      const next = part ? `${part} ${word}` : word;
      if (next.length > max && part) {
        chunks.push(part);
        part = word;
      } else {
        part = next;
      }
    }
    if (part) chunks.push(part);
  }
  for (const sentence of sentences) {
    const next = buffer ? `${buffer} ${sentence}` : sentence;
    if (next.length > max && buffer) {
      pushPiece(buffer);
      buffer = sentence;
    } else {
      buffer = next;
    }
  }
  if (buffer) pushPiece(buffer);
  return chunks.filter((chunk) => chunk.length >= 8);
}

export function voiceLine(text) {
  return voiceChunks(text).join(" ");
}

export function tofySpeechText(text) {
  return String(text ?? "")
    .replace(/\bAvcAI\b/giu, "Tofy")
    .replace(/\bAVCI?\s*E[- ]?Ticaret\b/giu, "Avcı E-Ticaret")
    .replace(/\bAVC\b/gu, "Avcı")
    .replace(/\bAI\b/gu, "yapay zekâ");
}

const DEFAULT_CUE = {
  id: "genel",
  nudge: "Takıldığın yeri yaz, bakayım.",
  hint: "Kişi tanıtım sitesinde. Zeki, somut ve insan gibi konuş. Omuz silkme yok; bilmiyorsan bile net sonraki adım ver.",
  chips: [],
};

export function pageCue(pathname) {
  const path = cleanAvcaiPath(pathname).toLocaleLowerCase("tr-TR");
  if (path === "/yonetim" || path.startsWith("/yonetim/")) {
    return {
      id: "personel",
      nudge: "Yönetim işlerinde buradayım.",
      hint: "Kişi doğrulanmış yönetim alanında olabilir. Yetkiyi yalnız sunucu belirler; gizli bilgi gösterme. Yönetici doğrulanmışsa müşteri gibi satış yapma, Avcı E-Ticaret personel yardımcısı olarak kısa ve operasyon odaklı konuş.",
      chips: [{ label: "Site durumu", text: "Site ve bakım durumu nasıl yönetilir?" }],
    };
  }
  if (path.startsWith("/paketler") || path.startsWith("/fiyatlandirma")) {
    return {
      id: "paket",
      nudge: "Paketlerde takıldıysan yaz, bakayım.",
      hint: "Kişi paket veya fiyat sayfasında. Kesin fiyat uydurma. Start/Scale farkını nedenleriyle anlat, teklife yönlendir.",
      chips: [{ label: "Start mı Scale mı?", text: "Start ve Scale farkı nedir?" }],
    };
  }
  if (path.startsWith("/teklif") || path.startsWith("/destek") || path.includes("#iletisim") || path.includes("#iletişim")) {
    return {
      id: "iletisim",
      nudge: "Formu şimdi doldurmana gerek yok. Yaz, buradayım.",
      hint: "Kişi iletişim/teklif/destek tarafında. Telefon-adres dökme. Form gittiyse bunu fark et ve tebrik et. Mesai beklemeden sohbet et. 7/24 dönüş vaat etme.",
      chips: [{ label: "Ne yazayım?", text: "Teklif formuna ne yazmalıyım?" }],
    };
  }
  if (path.startsWith("/cozum-senaryolari/peynir")) {
    return {
      id: "demo",
      nudge: "Demo mağazada kaybolduysan yaz.",
      hint: "Kişi peynir demo vitrininde. Avcı peynir satmaz; bu müşteri yazılımının örneğidir.",
      chips: [{ label: "Bu peynir satışı mı?", text: "Peynir demo mağazası nedir?" }],
    };
  }
  if (path.startsWith("/yazilimlar") || path.startsWith("/eticaret-altyapisi") || path.startsWith("/platform")) {
    return {
      id: "yazilim",
      nudge: "Altyapı tarafında bir yer mi karıştı?",
      hint: "Kişi yazılım/altyapı sayfasında. Avcı sağlayıcıdır, mağaza değildir.",
      chips: [{ label: "Ne satıyorsunuz?", text: "Avcı nedir, ne satar?" }],
    };
  }
  return DEFAULT_CUE;
}
