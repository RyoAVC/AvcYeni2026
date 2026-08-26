import styles from "./demo-portal-commerce-bridge.module.css";

type CommerceBridgeProps = {
  commerceUrl: string;
};

const operationModules = [
  { index: "01", title: "Katalog", note: "Ürün, kategori, varyant ve dinamik nitelikler" },
  { index: "02", title: "Sipariş", note: "Sipariş, iade, müşteri ve teslimat operasyonu" },
  { index: "03", title: "Stok & fiyat", note: "Stok hareketi, kampanya, kupon ve fiyat yönetimi" },
  { index: "04", title: "Entegrasyon", note: "Ödeme, kargo, pazaryeri ve muhasebe bağlantıları" },
] as const;

export function DemoPortalCommerceBridge({ commerceUrl }: CommerceBridgeProps) {
  const external = commerceUrl.startsWith("http://") || commerceUrl.startsWith("https://");

  return (
    <section className={styles.bridge} aria-labelledby="commerce-bridge-title">
      <div className={styles.intro}>
        <span className={styles.eyebrow}>AVCI COMMERCE · MAĞAZA OPERASYONU</span>
        <h3 id="commerce-bridge-title">Günlük e-ticaret yönetimi ayrı ve güçlü bir merkezde</h3>
        <p>
          Bu portal Avcı ile hizmet, lisans ve altyapı ilişkinizi gösterir. Ürün, sipariş, stok ve
          kampanya operasyonları ise aynı lisans mimarisiyle çalışan Avcı Commerce panelinde yönetilir.
        </p>
        <div className={styles.actions}>
          <a href={commerceUrl} rel={external ? "noopener noreferrer" : undefined} target={external ? "_blank" : undefined}>
            Commerce demosunu aç <span aria-hidden="true">↗</span>
          </a>
          <span>Demo modunda veri değişikliği kapalıdır.</span>
        </div>
      </div>

      <div className={styles.surface} aria-label="Avcı Commerce operasyon modülleri">
        <div className={styles.surfaceHead}>
          <div>
            <small>MAĞAZA YÖNETİMİ</small>
            <strong>Tek panel · lisanslı modüller</strong>
          </div>
          <b>Bağlı sistem</b>
        </div>
        <ol className={styles.modules}>
          {operationModules.map((module) => (
            <li key={module.index}>
              <span>{module.index}</span>
              <div>
                <strong>{module.title}</strong>
                <small>{module.note}</small>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
