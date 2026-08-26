import type { CSSProperties } from "react";
import type { CommerceHealthReport } from "./commerce-health";
import styles from "./demo-portal-success-center.module.css";

export function DemoPortalSuccessCenter({ report }: { report: CommerceHealthReport }) {
  const prioritySignal = [...report.signals].sort((left, right) => left.score - right.score)[0];
  const priorityMark = prioritySignal.label.split(" ").map((word) => word[0]).join("").slice(0, 2).toUpperCase();

  return (
    <section className={styles.center} aria-labelledby="success-center-title">
      <div className={styles.header}>
        <div>
          <span>MÜŞTERİ BAŞARI MERKEZİ</span>
          <h2 id="success-center-title">Ticaret sağlığı tek bakışta</h2>
          <p>Altyapıdan Tofy büyümesine kadar hesap durumundan otomatik hesaplanan salt okunur özet.</p>
        </div>
        <b>{report.signals.length} alan · {report.status}</b>
      </div>

      <div className={styles.layout}>
        <div className={styles.scoreCard}>
          <div className={styles.scoreRing} style={{ "--success-score": `${report.score * 3.6}deg` } as CSSProperties}>
            <span><strong>{report.score}</strong><small>/100</small></span>
          </div>
          <div className={styles.scoreCopy}>
            <small>GENEL BAŞARI SKORU</small>
            <strong>{report.status}</strong>
            <p>{report.summary}</p>
          </div>
        </div>

        <ul className={styles.signals} aria-label="Müşteri başarı alanları">
          {report.signals.map((signal) => (
            <li key={signal.id}>
              <div className={styles.signalHead}>
                <div><strong>{signal.label}</strong><span>{signal.note}</span></div>
                <b>{signal.status}</b>
              </div>
              <div className={styles.signalTrack} aria-label={`${signal.label} başarı puanı ${signal.score}`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={signal.score}>
                <span style={{ width: `${signal.score}%` }} />
              </div>
              <a href={`#${signal.target}`}>Bölümü incele <span aria-hidden="true">→</span></a>
            </li>
          ))}
        </ul>
      </div>

      <aside className={styles.priority}>
        <span className={styles.priorityMark} aria-hidden="true">{priorityMark}</span>
        <div>
          <small>ÖNERİLEN SONRAKİ HAMLE</small>
          <strong>{prioritySignal.label}: {prioritySignal.recommendation}</strong>
          <p>En düşük gelişim sinyali {prioritySignal.score}/100. İlgili bölümde ayrıntı ve sonraki adımları inceleyin.</p>
        </div>
        <a href={`#${prioritySignal.target}`}>Bölüme git <span aria-hidden="true">→</span></a>
      </aside>
    </section>
  );
}
