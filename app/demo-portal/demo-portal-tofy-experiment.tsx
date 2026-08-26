"use client";

import { useMemo, useState } from "react";
import { TofyMark } from "../tofy-mark";
import styles from "./demo-portal-tofy-experiment.module.css";

type ExperimentId = "copy" | "placement" | "bundle";

const experiments = [
  {
    id: "copy" as const,
    label: "Öneri metni",
    title: "Niyet odaklı mikro metin",
    description: "Genel öneri yerine müşterinin kullanım amacını yansıtan kısa bir çağrı kullanır.",
    variant: "Günlük kullanımına uygun modelleri karşılaştır",
    clickLift: 1.6,
    attachLift: 0.4,
  },
  {
    id: "placement" as const,
    label: "Sepet yerleşimi",
    title: "Karar anında görünür öneri",
    description: "Tamamlayıcı ürünü ürün keşfi ile sepet kararı arasındaki geçişte konumlandırır.",
    variant: "Bu ürünle birlikte tercih edilenleri göster",
    clickLift: 1.1,
    attachLift: 2.3,
  },
  {
    id: "bundle" as const,
    label: "Paket eşleşmesi",
    title: "Cüzdan + aksesuar paketi",
    description: "Güçlü kategori sinyallerinden tamamlayıcı ürün paketi oluşturur.",
    variant: "Cüzdanını tamamlayan aksesuar paketini incele",
    clickLift: 0.8,
    attachLift: 4.2,
  },
] as const;

const baseline = {
  eligibleSessions: 1500,
  interactions: 186,
  complementaryAdds: 34,
  clickRate: 12.4,
  averageComplementaryValue: 1280,
};

const currency = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });

export function DemoPortalTofyExperiment() {
  const [selectedId, setSelectedId] = useState<ExperimentId>("copy");
  const selected = experiments.find((experiment) => experiment.id === selectedId) ?? experiments[0];

  const projection = useMemo(() => {
    const baselineAttachRate = (baseline.complementaryAdds / baseline.interactions) * 100;
    const projectedClickRate = baseline.clickRate + selected.clickLift;
    const projectedInteractions = Math.round(baseline.eligibleSessions * (projectedClickRate / 100));
    const projectedAttachRate = baselineAttachRate + selected.attachLift;
    const projectedAdds = Math.round(projectedInteractions * (projectedAttachRate / 100));
    const extraInteractions = Math.max(0, projectedInteractions - baseline.interactions);
    const extraAdds = Math.max(0, projectedAdds - baseline.complementaryAdds);

    return {
      projectedClickRate,
      projectedAttachRate,
      projectedInteractions,
      projectedAdds,
      extraInteractions,
      extraAdds,
      potential: extraAdds * baseline.averageComplementaryValue,
    };
  }, [selected]);

  return (
    <section className={styles.lab} aria-labelledby="tofy-experiment-title">
      <header className={styles.header}>
        <div className={styles.identity}>
          <span className={styles.mark}><TofyMark /></span>
          <div><small>TOFY DENEY LABORATUVARI</small><h3 id="tofy-experiment-title">Yayınlamadan önce senaryoyu karşılaştır</h3><p>Bir büyüme fikrinin örnek metrikler üzerindeki tahmini etkisini güvenli demo alanında inceleyin.</p></div>
        </div>
        <span className={styles.demoBadge}>Salt demo · kayıt yok</span>
      </header>

      <div className={styles.workspace}>
        <aside className={styles.selector} aria-label="Tofy deney türleri">
          <small>DENEY TÜRÜ</small>
          <div role="group" aria-label="Deney senaryosu seçin">
            {experiments.map((experiment, index) => (
              <button aria-pressed={selectedId === experiment.id} key={experiment.id} onClick={() => setSelectedId(experiment.id)} type="button">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <span><strong>{experiment.label}</strong><small>{experiment.title}</small></span>
                <b aria-hidden="true">{selectedId === experiment.id ? "✓" : ""}</b>
              </button>
            ))}
          </div>
          <p>{selected.description}</p>
        </aside>

        <div className={styles.comparison}>
          <article className={styles.variantA}>
            <header><span>A</span><div><small>MEVCUT</small><strong>Kontrol görünümü</strong></div></header>
            <blockquote>“Benzer ürünlere göz atmak ister misiniz?”</blockquote>
            <dl><div><dt>Öneri tıklama</dt><dd>%{baseline.clickRate.toLocaleString("tr-TR")}</dd></div><div><dt>Tamamlayıcı ürün</dt><dd>{baseline.complementaryAdds}</dd></div></dl>
          </article>
          <div className={styles.vs} aria-hidden="true">VS</div>
          <article className={styles.variantB}>
            <header><span>B</span><div><small>ÖRNEK VARYANT</small><strong>{selected.title}</strong></div></header>
            <blockquote>“{selected.variant}”</blockquote>
            <dl><div><dt>Tahmini tıklama</dt><dd>%{projection.projectedClickRate.toLocaleString("tr-TR")}</dd></div><div><dt>Tahmini ekleme</dt><dd>{projection.projectedAdds}</dd></div></dl>
          </article>
        </div>
      </div>

      <div className={styles.result} aria-live="polite">
        <div><small>EK ETKİLEŞİM</small><strong>+{projection.extraInteractions}</strong><span>örnek oturum</span></div>
        <div><small>EK SEPET FIRSATI</small><strong>+{projection.extraAdds}</strong><span>örnek ekleme</span></div>
        <div className={styles.resultLead}><small>TAHMİNİ DÖNEM POTANSİYELİ</small><strong>{currency.format(projection.potential)}</strong><span>gelir garantisi değildir</span></div>
        <p>Hesaplama mevcut demo davranış oranlarının seçilen varsayımsal artışla devam edeceğini kabul eder; gerçek mağaza sonucu değildir.</p>
      </div>
    </section>
  );
}
