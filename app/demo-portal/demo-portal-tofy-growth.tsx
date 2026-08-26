import Link from "next/link";
import { TofyMark } from "../tofy-mark";
import styles from "./demo-portal-tofy-growth.module.css";
import { buildTofyOpportunityReport, type TofyOpportunityInput } from "./tofy-opportunity-engine";
import { DemoPortalTofyExperiment } from "./demo-portal-tofy-experiment";

const demoOpportunityInput: TofyOpportunityInput = {
  periodDays: 7,
  eligibleSessions: 1500,
  interactions: 186,
  complementaryAdds: 34,
  averageComplementaryValue: 1280,
  clickTargetRate: 15.5,
  attachTargetRate: 22,
  categories: [
    { name: "Cüzdan", eligibleSessions: 620, interactions: 91, complementaryAdds: 18, attributeCompleteness: 62 },
    { name: "Kartlık", eligibleSessions: 480, interactions: 58, complementaryAdds: 10, attributeCompleteness: 78 },
    { name: "Aksesuar", eligibleSessions: 400, interactions: 37, complementaryAdds: 6, attributeCompleteness: 86 },
  ],
};

const currency = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });

export function DemoPortalTofyGrowth({ input = demoOpportunityInput }: { input?: TofyOpportunityInput }) {
  const report = buildTofyOpportunityReport(input);

  return (
    <section className={styles.lab} aria-labelledby="tofy-growth-title">
      <header className={styles.header}>
        <div className={styles.identity}>
          <span className={styles.mark}><TofyMark /></span>
          <div>
            <small>TOFY BÜYÜME LABORATUVARI</small>
            <h3 id="tofy-growth-title">Öneriden gelire uzanan fırsat haritası</h3>
            <p>Tofy’nin mağaza etkileşimini, ürün keşfini ve çapraz satış potansiyelini tek görünümde okuyun.</p>
          </div>
        </div>
        <div className={styles.period}><span aria-hidden="true">↗</span><b>Son {input.periodDays} gün</b><small>örnek analiz</small></div>
      </header>

      <div className={styles.valueStrip} aria-label="Tofy fırsat özeti">
        <article className={styles.valueLead}>
          <small>TAHMİNİ EK POTANSİYEL</small>
          <strong>{currency.format(report.estimatedRevenuePotential)}</strong>
          <p>Hedef etkileşim oranına ulaşıldığında oluşabilecek demo dönem tahmini.</p>
        </article>
        <article><small>ETKİLEŞİM AÇIĞI</small><strong>+{report.estimatedAdditionalInteractions}</strong><p>hedefe kadar ek öneri etkileşimi</p></article>
        <article><small>EK SEPET FIRSATI</small><strong>+{report.estimatedAdditionalAdds}</strong><p>mevcut davranış oranıyla tahmin</p></article>
        <article><small>GÜÇLÜ KATEGORİ</small><strong>{report.topCategory}</strong><p>en yüksek etkileşim sinyali</p></article>
      </div>

      <div className={styles.workspace}>
        <section className={styles.funnelCard} aria-labelledby="tofy-funnel-title">
          <div className={styles.sectionHead}>
            <div><small>DÖNÜŞÜM AKIŞI</small><h4 id="tofy-funnel-title">Müşteri yolculuğu</h4></div>
            <b>%{report.clickRate.toLocaleString("tr-TR")} etkileşim</b>
          </div>
          <ol className={styles.funnel}>
            {report.funnel.map((step, index) => (
              <li key={step.label}>
                <span className={styles.step}>{String(index + 1).padStart(2, "0")}</span>
                <div className={styles.funnelCopy}><strong>{step.label}</strong><small>{step.note}</small></div>
                <b>{step.value}</b>
                <div className={styles.track} aria-label={`${step.label}: ${step.value}`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={step.share}>
                  <span style={{ width: `${step.share}%` }} />
                </div>
              </li>
            ))}
          </ol>
          <p className={styles.disclaimer}>Bu görünüm demo verisidir; gerçek gelir veya mağaza işlemi üretmez.</p>
        </section>

        <section className={styles.opportunityCard} aria-labelledby="tofy-opportunity-title">
          <div className={styles.sectionHead}>
            <div><small>AKILLI FIRSATLAR</small><h4 id="tofy-opportunity-title">Bu hafta ne geliştirilebilir?</h4></div>
            <b>{report.opportunities.length} dinamik sinyal</b>
          </div>
          <ul className={styles.opportunities}>
            {report.opportunities.map((item, index) => (
              <li key={item.id}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><strong>{item.title}</strong><p>{item.note}</p></div>
                <b data-status={item.status}>{item.status}</b>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <aside className={styles.nextMove}>
        <div>
          <small>TOFY ÖNERİSİ</small>
          <strong>İlk odak: {report.primaryOpportunity.target.toLocaleLowerCase("tr-TR")}.</strong>
          <p>{report.primaryOpportunity.note}</p>
        </div>
        <div className={styles.actions}>
          <a href="#sonraki">Aksiyon planını gör <span aria-hidden="true">→</span></a>
          <Link href="/yapay-zeka">Modül kataloğu</Link>
        </div>
      </aside>
      <DemoPortalTofyExperiment />
    </section>
  );
}
