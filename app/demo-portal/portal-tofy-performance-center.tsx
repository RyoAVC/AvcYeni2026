import type { PortalTofySnapshot } from "../customer-portal-types";
import { TofyMark } from "../tofy-mark";
import styles from "./portal-tofy-performance-center.module.css";

function metricValue(value: number, unit: string) {
  return unit === "basis_points" ? `%${(value / 100).toLocaleString("tr-TR")}` : value.toLocaleString("tr-TR");
}

function deltaLabel(delta: number | null) {
  if (delta === null) return "Önceki dönem yok";
  if (delta === 0) return "Değişmedi";
  return `${delta > 0 ? "+" : ""}%${delta.toLocaleString("tr-TR")}`;
}

export function PortalTofyPerformanceCenter({ snapshot, mode }: { snapshot: PortalTofySnapshot; mode: "demo" | "customer" }) {
  const hasPerformance = snapshot.comparisons.length > 0;
  return (
    <section className={styles.center} aria-labelledby="portal-tofy-performance-title">
      <header className={styles.header}>
        <span className={styles.mark}><TofyMark /></span>
        <div><small>TOFY PERFORMANS MERKEZİ</small><h3 id="portal-tofy-performance-title">Öneri performansı ve ürün kalitesi</h3><p>Gösterimden sepete uzanan sinyalleri dönem karşılaştırmasıyla, ürün hazırlığını ise stok, fiyat ve nitelik kontrolleriyle okuyun.</p></div>
        <b>{mode === "demo" ? "Örnek veri" : "Salt okunur"}</b>
      </header>

      {hasPerformance ? (
        <div className={styles.metrics} aria-label="Tofy dönem performansı">
          {snapshot.comparisons.map((item) => (
            <article key={item.key}>
              <small>{item.label}</small>
              <strong>{metricValue(item.value, item.unit)}</strong>
              <span data-direction={item.direction}>{deltaLabel(item.deltaPercent)} <i>önceki döneme göre</i></span>
              <em>{item.periodStart && item.periodEnd ? `${item.periodStart} — ${item.periodEnd}` : "Son ölçüm"}</em>
            </article>
          ))}
        </div>
      ) : <div className={styles.empty}><strong>Performans ölçümü henüz oluşmadı</strong><p>Tofy etkileşim verisi geldiğinde gösterim, tıklama, sepete yönlendirme ve tamamlayıcı ürün karşılaştırmaları burada yer alır.</p></div>}

      <div className={styles.quality}>
        <div className={styles.qualityIntro}><small>ÖNERİ KALİTESİ</small><strong>{snapshot.quality.score === null ? "Kalite ölçümü bekleniyor" : `%${snapshot.quality.score} yayına hazır`}</strong><p>Eksik fiyat, stok dışı ürün ve zayıf nitelik sinyalleri öneri havuzundan ayrıştırılır.</p></div>
        {snapshot.quality.hasData ? <ul>
          <li data-tone="healthy"><span>Yayına hazır</span><strong>{snapshot.quality.ready.toLocaleString("tr-TR")}</strong></li>
          <li data-tone="watch"><span>Geliştirmeli</span><strong>{snapshot.quality.needsWork.toLocaleString("tr-TR")}</strong></li>
          <li data-tone="critical"><span>Engelli</span><strong>{snapshot.quality.blocked.toLocaleString("tr-TR")}</strong></li>
        </ul> : <div className={styles.qualityEmpty}>Ürün kalite snapshot’ı bulunmuyor.</div>}
      </div>

      <div className={styles.footer} role="note">
        <span>{snapshot.experiments.length ? `${snapshot.experiments.length} deney sonucu izleniyor` : "Aktif deney sonucu bulunmuyor"}</span>
        <small>{mode === "demo" ? "Tanıtım hesabı · tahminler garanti değildir" : "Veri kaynağı: müşteri metrik snapshot’ları"}</small>
      </div>
    </section>
  );
}
