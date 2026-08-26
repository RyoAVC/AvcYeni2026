import styles from "./demo-portal-intelligence.module.css";

type SmartNotice = {
  title: string;
  text: string;
  when: string;
  tone: "info" | "live" | "watch";
  target: string;
  category: string;
};

const noticePriority = { watch: 3, live: 2, info: 1 } as const;

export function DemoPortalSmartNotifications({ notices }: { notices: readonly SmartNotice[] }) {
  const ordered = [...notices].sort((a, b) => noticePriority[b.tone] - noticePriority[a.tone]);
  const attentionCount = notices.filter((notice) => notice.tone === "watch").length;

  return (
    <section className={styles.noticeCenter} aria-labelledby="smart-notice-title">
      <header className={styles.sectionHeader}>
        <div><small>AKILLI BİLDİRİM MERKEZİ</small><h2 id="smart-notice-title">Önceliği sistem belirlesin</h2><p>Hesap sinyallerini önem sırasına göre gruplayan salt okunur demo merkezi.</p></div>
        <div className={styles.headerMetric}><strong>{notices.length}</strong><span>toplam sinyal</span><small>{attentionCount} takip gerektiriyor</small></div>
      </header>
      <div className={styles.noticeToolbar}>
        <span><i data-tone="watch" /> Takip</span><span><i data-tone="live" /> Güncelleme</span><span><i data-tone="info" /> Bilgi</span>
        <b>Önceliğe göre sıralandı</b>
      </div>
      <ol className={styles.smartNotices}>
        {ordered.map((notice, index) => (
          <li data-tone={notice.tone} key={notice.title}>
            <span className={styles.noticeIndex}>{String(index + 1).padStart(2, "0")}</span>
            <div className={styles.noticeCopy}><small>{notice.category}</small><strong>{notice.title}</strong><p>{notice.text}</p></div>
            <div className={styles.noticeMeta}><time>{notice.when}</time><a href={notice.target}>İlgili bölüme git <span aria-hidden="true">→</span></a></div>
          </li>
        ))}
      </ol>
      <p className={styles.demoNote}>Demo bildirimleridir; e-posta göndermez, okunma veya müşteri işlemi kaydetmez.</p>
    </section>
  );
}

type PortalModule = {
  name: string;
  status: string;
  note: string;
  category: string;
  capability: string;
  coverage: number;
};

export function DemoPortalModulePortfolio({ modules }: { modules: readonly PortalModule[] }) {
  const active = modules.filter((module) => module.status === "Aktif").length;

  return (
    <section className={styles.modulePortfolio} aria-labelledby="module-portfolio-title">
      <header className={styles.sectionHeader}>
        <div><small>MODÜL PORTFÖYÜ</small><h2 id="module-portfolio-title">Altyapınız büyüdükçe genişleyen yapı</h2><p>Aktif, kurulumda ve geliştirilebilir modülleri tek portföy görünümünde izleyin.</p></div>
        <div className={styles.headerMetric}><strong>{active}/{modules.length}</strong><span>aktif modül</span><small>örnek hesap kapsamı</small></div>
      </header>
      <ul className={styles.moduleGrid}>
        {modules.map((module, index) => (
          <li data-status={module.status === "Aktif" ? "active" : "setup"} key={module.name}>
            <div className={styles.moduleTop}><span>{String(index + 1).padStart(2, "0")}</span><small>{module.category}</small><b>{module.status}</b></div>
            <strong>{module.name}</strong><p>{module.capability}</p>
            <div className={styles.moduleCoverage}><span><i style={{ width: `${module.coverage}%` }} /></span><small>%{module.coverage} kapsam</small></div>
            <em>{module.note}</em>
          </li>
        ))}
      </ul>
    </section>
  );
}

type WeeklyMetric = { label: string; value: string; note: string; trend: "up" | "steady" | "watch"; points: readonly number[] };

export function DemoPortalWeeklyReport({ metrics }: { metrics: readonly WeeklyMetric[] }) {
  return (
    <section className={styles.weeklyReport} aria-labelledby="weekly-report-title">
      <header className={styles.sectionHeader}>
        <div><small>HAFTALIK YÖNETİCİ RAPORU</small><h2 id="weekly-report-title">Bu hafta ticarette ne değişti?</h2><p>Operasyon, Tofy ve altyapı sinyallerinin yönetici seviyesinde örnek özeti.</p></div>
        <div className={styles.periodBadge}><span aria-hidden="true">↗</span><strong>Son 7 gün</strong><small>demo dönem</small></div>
      </header>
      <ul className={styles.weeklyGrid}>
        {metrics.map((metric) => (
          <li data-trend={metric.trend} key={metric.label}>
            <div><small>{metric.label}</small><strong>{metric.value}</strong><p>{metric.note}</p></div>
            <span className={styles.spark} aria-hidden="true">
              {metric.points.map((point, index) => <i key={`${metric.label}-${index}`} style={{ height: `${Math.max(12, point)}%` }} />)}
            </span>
          </li>
        ))}
      </ul>
      <footer className={styles.reportFooter}><div><small>YÖNETİCİ NOTU</small><strong>Altyapı stabil; en güçlü büyüme alanı Tofy öneri etkileşimi.</strong></div><a href="#tofy">Tofy analizine git <span aria-hidden="true">→</span></a></footer>
    </section>
  );
}

type SlaMetric = { label: string; value: string; target: string; score: number; tone: "healthy" | "watch" };

export function DemoPortalSlaCenter({ metrics }: { metrics: readonly SlaMetric[] }) {
  const average = Math.round(metrics.reduce((sum, metric) => sum + metric.score, 0) / Math.max(1, metrics.length));
  return (
    <section className={styles.slaCenter} aria-labelledby="sla-center-title">
      <header className={styles.sectionHeader}>
        <div><small>HİZMET SAĞLIĞI</small><h3 id="sla-center-title">Destek ve SLA görünümü</h3><p>Yanıt, çözüm ve erişilebilirlik hedeflerinin salt okunur örnek takibi.</p></div>
        <div className={styles.slaScore}><strong>{average}</strong><span>hizmet puanı</span></div>
      </header>
      <ul className={styles.slaGrid}>
        {metrics.map((metric) => (
          <li data-tone={metric.tone} key={metric.label}>
            <small>{metric.label}</small><strong>{metric.value}</strong><span>{metric.target}</span>
            <div role="progressbar" aria-label={`${metric.label} puanı`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={metric.score}><i style={{ width: `${metric.score}%` }} /></div>
          </li>
        ))}
      </ul>
      <div className={styles.slaFooter}><span aria-hidden="true">✓</span><p><strong>Açık kritik kayıt yok</strong>Örnek hesapta hizmet hedeflerini aşan kritik destek sinyali bulunmuyor.</p></div>
    </section>
  );
}

type BenchmarkMetric = { label: string; current: number; target: number; unit: string; note: string };

export function DemoPortalCommerceBenchmark({ metrics }: { metrics: readonly BenchmarkMetric[] }) {
  const overall = Math.round(metrics.reduce((sum, metric) => sum + Math.min(100, (metric.current / metric.target) * 100), 0) / Math.max(1, metrics.length));
  return (
    <section className={styles.benchmark} aria-labelledby="benchmark-title">
      <header className={styles.sectionHeader}>
        <div><small>HEDEF BAZLI KARŞILAŞTIRMA</small><h3 id="benchmark-title">Mağaza kendi hedeflerine karşı</h3><p>Sektör ortalaması değil; demo hesap için tanımlanan iç hedeflerle karşılaştırma.</p></div>
        <div className={styles.benchmarkScore}><span>{overall}</span><div><strong>Hedef uyumu</strong><small>4 sinyalin bileşkesi</small></div></div>
      </header>
      <ul className={styles.benchmarkList}>
        {metrics.map((metric) => {
          const ratio = Math.min(100, Math.round((metric.current / metric.target) * 100));
          return (
            <li key={metric.label}>
              <div><strong>{metric.label}</strong><small>{metric.note}</small></div>
              <div className={styles.benchmarkValues}><b>{metric.current.toLocaleString("tr-TR")}{metric.unit}</b><span>hedef {metric.target.toLocaleString("tr-TR")}{metric.unit}</span></div>
              <div className={styles.benchmarkTrack} role="progressbar" aria-label={`${metric.label} hedef uyumu`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={ratio}><i style={{ width: `${ratio}%` }} /></div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
