export type CommerceHealthInput = {
  infrastructure: {
    checks: readonly { healthy: boolean }[];
  };
  marketplace: {
    state: "active" | "setup" | "paused" | "error";
    setupAgeDays?: number;
  };
  support: {
    openCount: number;
    waitingCount: number;
  };
  tofy: {
    clickRate: number;
    targetRate: number;
  };
};

export type CommerceHealthSignal = {
  id: "infrastructure" | "marketplace" | "support" | "tofy";
  label: string;
  score: number;
  status: string;
  note: string;
  recommendation: string;
  target: "operasyon" | "altyapi" | "destek" | "tofy";
  weight: number;
};

export type CommerceHealthReport = {
  score: number;
  status: "Sağlıklı" | "Gelişiyor" | "Dikkat gerekli";
  summary: string;
  signals: readonly CommerceHealthSignal[];
};

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function evaluateInfrastructure(input: CommerceHealthInput): CommerceHealthSignal {
  const total = input.infrastructure.checks.length;
  const healthy = input.infrastructure.checks.filter((check) => check.healthy).length;
  const score = total ? clampScore((healthy / total) * 100) : 100;
  return {
    id: "infrastructure",
    label: "Altyapı sürekliliği",
    score,
    status: score >= 85 ? "Sağlıklı" : score >= 65 ? "İzleniyor" : "Kontrol gerekli",
    note: `${total} kontrolden ${healthy} tanesi sağlıklı`,
    recommendation: score >= 85 ? "Rutin kontrolleri sürdürün" : "Açık altyapı kontrolünü tamamlayın",
    target: "operasyon",
    weight: 0.25,
  };
}

function evaluateMarketplace(input: CommerceHealthInput): CommerceHealthSignal {
  const stateScores = { active: 100, setup: 62, paused: 42, error: 18 } as const;
  const score = stateScores[input.marketplace.state];
  const age = input.marketplace.setupAgeDays;
  const notes = {
    active: "Pazaryeri senkronu aktif",
    setup: `Pazaryeri kurulumu sürüyor${typeof age === "number" ? ` · ${age} gün` : ""}`,
    paused: "Pazaryeri senkronu duraklatıldı",
    error: "Pazaryeri bağlantısı müdahale bekliyor",
  } as const;
  return {
    id: "marketplace",
    label: "Kanal operasyonu",
    score,
    status: input.marketplace.state === "active" ? "Aktif" : input.marketplace.state === "setup" ? "Kurulumda" : "Dikkat",
    note: notes[input.marketplace.state],
    recommendation: input.marketplace.state === "active" ? "Kanal performansını izleyin" : "Pazaryeri kurulum adımını ilerletin",
    target: "altyapi",
    weight: 0.25,
  };
}

function evaluateSupport(input: CommerceHealthInput): CommerceHealthSignal {
  const issueLoad = input.support.openCount * 18 + input.support.waitingCount * 25;
  const score = clampScore(100 - issueLoad);
  return {
    id: "support",
    label: "Destek hazırlığı",
    score,
    status: score === 100 ? "Temiz" : score >= 70 ? "İzleniyor" : "Bekliyor",
    note: input.support.openCount || input.support.waitingCount
      ? `${input.support.openCount} açık · ${input.support.waitingCount} bekleyen talep`
      : "Açık veya bekleyen talep yok",
    recommendation: score === 100 ? "Destek kanalınız hazır" : "Bekleyen destek kaydını inceleyin",
    target: "destek",
    weight: 0.2,
  };
}

function evaluateTofy(input: CommerceHealthInput): CommerceHealthSignal {
  const targetRate = Math.max(1, input.tofy.targetRate);
  const score = clampScore((input.tofy.clickRate / targetRate) * 100);
  return {
    id: "tofy",
    label: "Tofy büyümesi",
    score,
    status: score >= 100 ? "Hedefte" : score >= 70 ? "Fırsat" : "Optimize edin",
    note: `%${input.tofy.clickRate.toLocaleString("tr-TR")} tıklama · hedef %${targetRate.toLocaleString("tr-TR")}`,
    recommendation: score >= 100 ? "Yeni kategori deneyini başlatın" : "Kategori önerilerini güçlendirin",
    target: "tofy",
    weight: 0.3,
  };
}

const evaluators = [evaluateInfrastructure, evaluateMarketplace, evaluateSupport, evaluateTofy] as const;

export function buildCommerceHealthReport(input: CommerceHealthInput): CommerceHealthReport {
  const signals = evaluators.map((evaluate) => evaluate(input));
  const score = clampScore(signals.reduce((total, signal) => total + signal.score * signal.weight, 0));
  const status = score >= 85 ? "Sağlıklı" : score >= 65 ? "Gelişiyor" : "Dikkat gerekli";
  const summary = score >= 85
    ? "Ticaret altyapısı sağlıklı; büyüme fırsatları izleniyor."
    : score >= 65
      ? "Temel yapı sağlam; öncelikli gelişim alanları bulunuyor."
      : "Kritik operasyon alanlarında planlı aksiyon gerekiyor.";
  return { score, status, summary, signals };
}
