import Link from "next/link";
import { loadSiteSettings } from "./site-settings.mjs";
import { withBasePath } from "./base-path";

export async function SiteFooter() {
  const settings = await loadSiteSettings();

  return (
    <footer className="site-footer">
      <section className="footer-contact-panel" aria-labelledby="footer-contact-title">
        <div>
          <span>PROJENİZ İÇİN İLK ADIM</span>
          <h2 id="footer-contact-title">Doğru altyapıyı birlikte netleştirelim.</h2>
          <p>Mağaza, kanal ve operasyon ihtiyacınızı anlatın; kapsamı ürün, kurulum ve ek bağlantılar olarak ayıralım.</p>
        </div>
        <div className="footer-contact-actions">
          <a href={`tel:${settings.contactPhoneHref}`}><small>Satış ve proje hattı</small><strong>{settings.contactPhone}</strong></a>
          <Link href="/teklif">Projenizi anlatın <span>→</span></Link>
        </div>
      </section>

      <div className="footer-main">
        <div className="footer-intro">
          <a className="footer-logo-link" href="#top" aria-label="Avcı E-Ticaret sayfa başı">
            <img src={withBasePath("/brand/avci-logo-dark-transparent.png")} width="1024" height="234" alt="Avcı E-Ticaret" />
          </a>
          <p>{settings.footerTagline}</p>
          <a className="footer-email" href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>
          <div className="footer-scope" aria-label="Avcı E-Ticaret çözüm kapsamı">
            <span>E-Ticaret Altyapısı</span><span>Modüler Yazılım</span><span>Entegrasyon</span>
          </div>
        </div>

        <nav className="footer-links" aria-label="Alt menü">
          <div><strong>Platform</strong><Link href="/eticaret-altyapisi">E-Ticaret Altyapısı</Link><Link href="/platform">Platform Mimarisi</Link><Link href="/yazilimlar">Yazılım Ailesi</Link><Link href="/ozel-yazilim">Özel Modül</Link><Link href="/entegrasyonlar">Entegrasyonlar</Link><Link href="/yapay-zeka">AI Modülleri</Link></div>
          <div><strong>Satış Modelleri</strong><Link href="/b2b-c2c">B2B & Bayi</Link><Link href="/b2b-c2c">C2C Pazaryeri</Link><Link href="/e-ihracat">E-İhracat</Link><Link href="/mobil-sektorel">Mobil Uygulama</Link><Link href="/mobil-sektorel#sektorel">Sektörel Yazılım</Link></div>
          <div><strong>Planlama</strong><Link href="/paketler">Paketler</Link><Link href="/fiyatlandirma">Fiyatlandırma</Link><Link href="/proje-sureci">Proje Süreci</Link><Link href="/alan-adi-hosting">Alan Adı & Hosting</Link><Link href="/hizmetler">Kurulum Hizmetleri</Link></div>
          <div><strong>Rehberler</strong><Link href="/kaynaklar">Kaynaklar</Link><Link href="/cozum-senaryolari">Çözüm Senaryoları</Link><Link href="/referanslar">Referanslar</Link><Link href="/bayi-partner">Bayi & Partner</Link><Link href="/teklif">Demo ve Teklif</Link></div>
          <div><strong>Destek & Kurumsal</strong><Link href="/musteri-merkezi">Müşteri Merkezi</Link>{settings.supportEnabled && <Link href="/destek">Destek Merkezi</Link>}{settings.customerLoginEnabled && <Link href="/musteri-girisi">Müşteri Girişi</Link>}<Link href="/guvenlik">Güvenlik</Link><Link href="/gizlilik">Gizlilik & KVKK</Link><a href={`mailto:${settings.contactEmail}`}>İletişim</a></div>
        </nav>
      </div>

      <div className="footer-bottom">
        <small>© 2026 Avcı E-Ticaret. Tüm hakları saklıdır.</small>
        <p>Altyapı, modül ve entegrasyon kapsamı teklifte ayrı ayrı belirtilir.</p>
        <div><Link href="/en" hrefLang="en">English</Link><Link href="/yonetim/basvurular">Yönetim</Link><a href="#top">Yukarı dön ↑</a></div>
      </div>
    </footer>
  );
}
