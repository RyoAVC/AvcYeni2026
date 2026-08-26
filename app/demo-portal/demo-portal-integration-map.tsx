import { TofyMark } from "../tofy-mark";
import styles from "./demo-portal-integration-map.module.css";

export type PortalIntegration = {
  id: string;
  name: string;
  category: "Pazaryeri" | "Ödeme" | "Kargo" | "Yapay zekâ";
  status: "active" | "setup" | "attention";
  statusLabel: string;
  detail: string;
  signal: string;
  progress?: number;
  logoSrc?: string;
};

const demoIntegrations: PortalIntegration[] = [
  {
    id: "trendyol",
    name: "Trendyol",
    category: "Pazaryeri",
    status: "setup",
    statusLabel: "Kurulumda",
    detail: "Ürün ve stok eşleştirme",
    signal: "7/9 adım · örnek",
    progress: 78,
    logoSrc: "https://cdn.dsmcdn.com/web/logo/ty-web.svg",
  },
  {
    id: "hepsiburada",
    name: "Hepsiburada",
    category: "Pazaryeri",
    status: "setup",
    statusLabel: "Kurulumda",
    detail: "Kategori alanları eşleniyor",
    signal: "5/8 adım · örnek",
    progress: 63,
    logoSrc: "https://upload.wikimedia.org/wikipedia/commons/2/20/Hepsiburada_logo_official.svg",
  },
  {
    id: "paytr",
    name: "PayTR",
    category: "Ödeme",
    status: "active",
    statusLabel: "Bağlı",
    detail: "Ödeme akışı hazır",
    signal: "Son kontrol başarılı · örnek",
    logoSrc: "https://www.paytr.com/wp-content/uploads/logo-1.png",
  },
  {
    id: "yurtici",
    name: "Yurtiçi Kargo",
    category: "Kargo",
    status: "active",
    statusLabel: "Bağlı",
    detail: "Gönderi akışı hazır",
    signal: "Etiket servisi açık · örnek",
    logoSrc: "https://www.yurticikargo.com/web_files/yurtici-kargo/assets/img/logo.svg",
  },
  {
    id: "tofy",
    name: "Tofy Ajan V2",
    category: "Yapay zekâ",
    status: "active",
    statusLabel: "Aktif",
    detail: "Öneri ve çapraz satış",
    signal: "%12,4 etkileşim · örnek",
  },
];

const statusWeight = { active: 100, setup: 64, attention: 28 } as const;

export function DemoPortalIntegrationMap({ integrations = demoIntegrations }: { integrations?: PortalIntegration[] }) {
  const connected = integrations.filter((item) => item.status === "active").length;
  const setup = integrations.filter((item) => item.status === "setup").length;
  const attention = integrations.filter((item) => item.status === "attention").length;
  const health = integrations.length
    ? Math.round(integrations.reduce((total, item) => total + statusWeight[item.status], 0) / integrations.length)
    : 100;

  return (
    <section className={styles.shell} aria-labelledby="integration-map-title">
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>ENTEGRASYON KONTROL MERKEZİ</span>
          <h3 id="integration-map-title">Ticaret ağınız tek görünümde</h3>
          <p>Pazaryeri, ödeme, kargo ve Tofy bağlantılarının salt okunur demo durum haritası.</p>
        </div>
        <div className={styles.health} aria-label={`Entegrasyon sağlığı yüzde ${health}`}>
          <span>{health}</span>
          <div><strong>Ağ sağlığı</strong><small>{connected}/{integrations.length} bağlantı hazır</small></div>
        </div>
      </header>

      <div className={styles.summary} aria-label="Entegrasyon durum özeti">
        <span><i data-tone="active" /> <strong>{connected}</strong> bağlı</span>
        <span><i data-tone="setup" /> <strong>{setup}</strong> kurulumda</span>
        <span><i data-tone="attention" /> <strong>{attention}</strong> dikkat</span>
      </div>

      <div className={styles.map}>
        <div className={styles.core} aria-label="Avcı ticaret altyapısı merkez düğümü">
          <span className={styles.coreMark}>A</span>
          <div><small>MERKEZ</small><strong>Avcı Ticaret Çekirdeği</strong><p>Mağaza, sipariş ve katalog akışı</p></div>
          <b>Çalışıyor</b>
        </div>

        <ul className={styles.connections}>
          {integrations.map((item) => (
            <li className={styles.connection} data-status={item.status} key={item.id}>
              <div className={styles.connectionTop}>
                <span className={styles.connectionIcon} data-brand={item.id} aria-hidden="true">
                  {item.id === "tofy" ? (
                    <TofyMark />
                  ) : item.logoSrc ? (
                    <img src={item.logoSrc} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" />
                  ) : (
                    item.name.slice(0, 2).toLocaleUpperCase("tr-TR")
                  )}
                </span>
                <div><small>{item.category}</small><strong>{item.name}</strong></div>
                <b>{item.statusLabel}</b>
              </div>
              <p>{item.detail}</p>
              {typeof item.progress === "number" ? (
                <div className={styles.progress} role="progressbar" aria-label={`${item.name} kurulum ilerlemesi`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={item.progress}>
                  <span style={{ width: `${item.progress}%` }} />
                </div>
              ) : null}
              <small className={styles.signal}>{item.signal}</small>
            </li>
          ))}
        </ul>
      </div>

      <footer className={styles.footer}>
        <div><span aria-hidden="true">◎</span><p><strong>Sıradaki odak</strong>Pazaryeri kurulum adımlarını tamamlayarak stok akışını canlıya hazırlayın.</p></div>
        <a href="#sonraki">Aksiyon planına git <span aria-hidden="true">→</span></a>
      </footer>
    </section>
  );
}
