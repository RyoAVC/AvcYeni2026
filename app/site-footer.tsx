import Link from "next/link";
import { loadSiteSettings } from "./site-settings.mjs";
import { SiteBrand } from "./site-brand";

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
          <SiteBrand className="brand footer-brand footer-logo-link" label="Avcı E-Ticaret ana sayfa" />
          <p>{settings.footerTagline}</p>
          <a className="footer-email" href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>
          <div className="footer-scope" aria-label="Avcı E-Ticaret çözüm kapsamı">
            <span>E-Ticaret Altyapısı</span><span>Modüler Yazılım</span><span>Entegrasyon</span>
          </div>
        </div>

        <nav className="footer-links" aria-label="Alt menü">
          <div><strong>Platform</strong><Link href="/eticaret-altyapisi">E-Ticaret Altyapısı</Link><Link href="/vitrin-tasarim">Vitrin Tasarımı</Link><Link href="/kampanya-fiyat">Kampanya & Fiyat</Link><Link href="/stok-operasyon">Stok Operasyonu</Link><Link href="/entegrasyonlar">Entegrasyonlar</Link><Link href="/yapay-zeka">AI Modülleri</Link></div>
          <div><strong>Satış Modelleri</strong><Link href="/b2b-c2c">B2B & Bayi</Link><Link href="/pazaryeri-kanallari">Pazaryeri Kanalları</Link><Link href="/odeme-kargo">Ödeme & Kargo</Link><Link href="/iade-iptal">İade & İptal</Link><Link href="/e-ihracat">E-İhracat</Link><Link href="/seo-gorunurluk">Teknik SEO</Link></div>
          <div><strong>Planlama</strong><Link href="/paketler">Paketler</Link><Link href="/proje-sureci">Proje Süreci</Link><Link href="/ortam-ayrimi">Ortam Ayrımı</Link><Link href="/eposta-teslim">E-posta Teslim</Link><Link href="/alan-adi-hosting">Alan Adı & Hosting</Link><Link href="/hizmetler">Kurulum Hizmetleri</Link></div>
          <div><strong>Rehberler</strong><Link href="/kaynaklar">Kaynaklar</Link><Link href="/yazilimlar">Yazılım Ailesi</Link><Link href="/gizlilik">Gizlilik & KVKK</Link><Link href="/magaza-kvkk">Mağaza KVKK</Link><Link href="/destek">Destek</Link><Link href="/teklif">Demo ve Teklif</Link></div>
          <div><strong>Destek & Kurumsal</strong><Link href="/musteri-merkezi">Müşteri Merkezi</Link><Link href="/musteri-hesap">Hesap ve Şifre</Link><Link href="/oturum-politika">Oturum Politikası</Link><Link href="/veri-sahipligi">Veri Sahipliği</Link><Link href="/guvenlik">Güvenlik</Link><Link href="/gizlilik">Gizlilik</Link></div>
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
