export type TofyCategorySignal = {
  name: string;
  eligibleSessions: number;
  interactions: number;
  complementaryAdds: number;
  attributeCompleteness: number;
};

export type TofyOpportunityInput = {
  periodDays: number;
  eligibleSessions: number;
  interactions: number;
  complementaryAdds: number;
  averageComplementaryValue: number;
  clickTargetRate: number;
  attachTargetRate: number;
  categories: TofyCategorySignal[];
};

export type TofyOpportunity = {
  id: "catalog" | "engagement" | "cross-sell";
  title: string;
  status: "Öncelikli fırsat" | "Büyüme alanı" | "Sağlıklı";
  note: string;
  impact: number;
  target: string;
};

export type TofyOpportunityReport = {
  clickRate: number;
  attachRate: number;
  estimatedAdditionalInteractions: number;
  estimatedAdditionalAdds: number;
  estimatedRevenuePotential: number;
  topCategory: string;
  funnel: Array<{
    label: string;
    value: string;
    share: number;
    note: string;
  }>;
  opportunities: TofyOpportunity[];
  primaryOpportunity: TofyOpportunity;
};

const percent = (value: number) => Math.round(value * 10) / 10;
const clamp = (value: number) => Math.min(100, Math.max(0, Math.round(value)));
const safeRate = (value: number, total: number) => (total > 0 ? (value / total) * 100 : 0);

function evaluateCatalog(input: TofyOpportunityInput): TofyOpportunity {
  const weakest = [...input.categories].sort((a, b) => a.attributeCompleteness - b.attributeCompleteness)[0];
  const completeness = weakest?.attributeCompleteness ?? 100;
  const gap = Math.max(0, 100 - completeness);

  return {
    id: "catalog",
    title: `${weakest?.name ?? "Ürün"} katalog derinliği`,
    status: completeness < 70 ? "Öncelikli fırsat" : completeness < 88 ? "Büyüme alanı" : "Sağlıklı",
    note: completeness < 88
      ? `%${completeness} nitelik doluluğu ölçüldü. Renk, materyal ve kullanım amacı alanları öneri isabetini güçlendirebilir.`
      : `Ürün nitelikleri %${completeness} dolulukla öneri üretimi için sağlıklı görünüyor.`,
    impact: clamp(gap * 1.35),
    target: "Katalog niteliklerini zenginleştir",
  };
}

function evaluateEngagement(input: TofyOpportunityInput, clickRate: number): TofyOpportunity {
  const gap = Math.max(0, input.clickTargetRate - clickRate);
  return {
    id: "engagement",
    title: "Öneri etkileşimi",
    status: gap >= 3 ? "Öncelikli fırsat" : gap > 0 ? "Büyüme alanı" : "Sağlıklı",
    note: gap > 0
      ? `%${percent(clickRate)} mevcut oran, %${percent(input.clickTargetRate)} hedefin ${percent(gap)} puan altında. Öneri başlığı ve konum varyasyonları test edilebilir.`
      : `%${percent(clickRate)} etkileşim oranı tanımlı hedefi karşılıyor; başarılı yerleşim korunabilir.`,
    impact: clamp((gap / Math.max(1, input.clickTargetRate)) * 100),
    target: "Öneri görünümünü optimize et",
  };
}

function evaluateCrossSell(input: TofyOpportunityInput, attachRate: number): TofyOpportunity {
  const gap = Math.max(0, input.attachTargetRate - attachRate);
  return {
    id: "cross-sell",
    title: "Çapraz satış eşleşmeleri",
    status: gap >= 6 ? "Öncelikli fırsat" : gap > 0 ? "Büyüme alanı" : "Sağlıklı",
    note: gap > 0
      ? `%${percent(attachRate)} tamamlayıcı ürün oranı, %${percent(input.attachTargetRate)} hedefinin altında. Kemer ve anahtarlık paketleri öne çıkarılabilir.`
      : `%${percent(attachRate)} tamamlayıcı ürün oranı hedefi karşılıyor; güçlü eşleşmeler korunabilir.`,
    impact: clamp((gap / Math.max(1, input.attachTargetRate)) * 100),
    target: "Ürün eşleşmelerini gözden geçir",
  };
}

export function buildTofyOpportunityReport(input: TofyOpportunityInput): TofyOpportunityReport {
  const clickRate = percent(safeRate(input.interactions, input.eligibleSessions));
  const attachRate = percent(safeRate(input.complementaryAdds, input.interactions));
  const targetInteractions = Math.ceil(input.eligibleSessions * (input.clickTargetRate / 100));
  const estimatedAdditionalInteractions = Math.max(0, targetInteractions - input.interactions);
  const observedAttachRate = safeRate(input.complementaryAdds, input.interactions) / 100;
  const estimatedAdditionalAdds = Math.ceil(estimatedAdditionalInteractions * observedAttachRate);
  const estimatedRevenuePotential = estimatedAdditionalAdds * Math.max(0, input.averageComplementaryValue);
  const topCategory = [...input.categories].sort((a, b) => b.interactions - a.interactions)[0]?.name ?? "Ürün kataloğu";

  const opportunities = [
    evaluateCatalog(input),
    evaluateEngagement(input, clickRate),
    evaluateCrossSell(input, attachRate),
  ].sort((a, b) => b.impact - a.impact);

  return {
    clickRate,
    attachRate,
    estimatedAdditionalInteractions,
    estimatedAdditionalAdds,
    estimatedRevenuePotential,
    topCategory,
    funnel: [
      {
        label: "Öneriye uygun oturum",
        value: input.eligibleSessions.toLocaleString("tr-TR"),
        share: 100,
        note: `örnek · son ${input.periodDays} gün`,
      },
      {
        label: "Öneri etkileşimi",
        value: input.interactions.toLocaleString("tr-TR"),
        share: clamp((clickRate / Math.max(1, input.clickTargetRate)) * 100),
        note: `%${clickRate.toLocaleString("tr-TR")} tıklama`,
      },
      {
        label: "Tamamlayıcı ürün",
        value: input.complementaryAdds.toLocaleString("tr-TR"),
        share: clamp((attachRate / Math.max(1, input.attachTargetRate)) * 100),
        note: `%${attachRate.toLocaleString("tr-TR")} etkileşimden ekleme`,
      },
    ],
    opportunities,
    primaryOpportunity: opportunities[0],
  };
}
