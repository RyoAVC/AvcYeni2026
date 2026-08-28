import type { Metadata } from "next";
import Link from "next/link";
import { HeaderCtaCluster } from "../header-cta-cluster";
import { SiteBrand } from "../site-brand";
import { loadSiteSettings } from "../site-settings.mjs";

export const metadata: Metadata = {
  title: "Müşteri Merkezi ve Portal Kapsamı | Avcı E-Ticaret",
  description: "Avcı müşteri panelinde lisans, fatura, modül, entegrasyon, destek ve güvenli hesap erişiminin kapsamını inceleyin.",
  alternates: { canonical: "/musteri-merkezi" },
};

const currentCapabilities = [
  { number: "01", title: "Gerçek müşteri paneli", text: "Müşteri yalnız kendi lisans, paket, modül, entegrasyon, fatura, destek ve sistem sağlığı kayıtlarını görür." },
  { number: "02", title: "Yönetim kaydı", text: "Avcı yönetimi müşteri hesabını, lisans kapsamını ve panel erişimini yönetir. Bu ekran mağaza sipariş paneli değildir." },
  { number: "03", title: "Güvenli parola", text: "Panel parolası güvenli özet olarak saklanır. Yönetim mevcut parolayı okuyamaz; gerektiğinde yeni parola üretir." },
  { number: "04", title: "Destek kanalı", text: "Hesap onayı, erişim ve parola sıfırlama talepleri müşteri kaydı doğrulanarak destek üzerinden yürür." },
];

const processBoundary = [
  ["Lisans, paket ve aktif modüller", "Gerçek müşteri panelinde salt okunur gösterilir"],
  ["Fatura ve ödeme durumu", "Avcı yönetimindeki müşteriye ait kayıtlar gösterilir"],
  ["Panel oturumu", "Kayıtlı e-posta ve güvenli panel parolasıyla açılır"],
  ["Destek ve bildirimler", "Yalnız müşteriye ait gerçek kayıtlar gösterilir"],
  ["Teslim ve dokümanlar", "Müşteriye atanmış bağlantılar panelde gösterilir"],
  ["Mağaza sipariş ve stok yönetimi", "Avcı Commerce mağaza panelinde ayrı yürütülür"],
];

export const dynamic = "force-dynamic";

export default async function CustomerCenterPage() {
  const settings = await loadSiteSettings();

  return (
    <main className="catalog-page customer-center-page">
      <a className="skip-link" href="#portal-kapsami">Portal kapsamına geç</a>
      <header className="catalog-header">
        <SiteBrand />
        <nav aria-label="Sayfa menüsü"><Link href="/yazilimlar">Yazılımlar</Link><Link href="/musteri-hesap">Hesap & Şifre</Link><Link href="/erisim-denetim">Erişim</Link><Link className="active" href="/musteri-merkezi">Müşteri Merkezi</Link></nav>
        {settings.customerLoginEnabled ? <HeaderCtaCluster><Link className="header-cta" href="/musteri-girisi">Müşteri girişi</Link></HeaderCtaCluster> : settings.supportEnabled ? <HeaderCtaCluster><Link className="header-cta" href="/destek">Destek</Link></HeaderCtaCluster> : <HeaderCtaCluster><Link className="header-cta" href="/teklif">Teklif</Link></HeaderCtaCluster>}
      </header>

      <section className="catalog-hero customer-center-hero">
        <div><span className="kicker kicker-light">MÜŞTERİ MERKEZİ</span><h1>Lisans ve finansal<br /><em>kayıtlarınıza güvenli erişim.</em></h1></div>
        <p>Avcı E‑Ticaret müşterileri kendilerine özel hesapla lisans, modül, fatura, destek ve altyapı durumlarını görür. Mağazanın sipariş ve stok yönetimi Avcı Commerce panelinde ayrı kalır.</p>
      </section>

      <section className="portal-capabilities" id="portal-kapsami">
        <div><span className="kicker">MÜŞTERİ PORTALI</span><h2>Hesabınıza ait kayıtlar<br />tek merkezde.</h2><p>Gerçek panel yalnız oturum açan müşterinin kayıtlarını gösterir. Demo portal, sistemi satın almadan önce incelemek için ayrı tutulur.</p></div>
        <div>{currentCapabilities.map((item) => <article key={item.number}><span>{item.number}</span><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
      </section>

      <section className="portal-security">
        <div><span className="kicker kicker-light">GÜVENLİ GEÇİŞ</span><h2>Her müşteri yalnız<br />kendi hesabını görür.</h2><p>Giriş, kayıtlı e-posta ve müşteri için oluşturulan panel parolasıyla doğrulanır. Parola düz metin tutulmaz; oturum ve müşteri ayrımı sunucu tarafında korunur.</p></div>
        <ol>
          <li><span>01</span><div><strong>Yazılım müşterisi</strong><p>Siteden gelen teklif, yönetimdeki işletme kartına çevrilir.</p></div></li>
          <li><span>02</span><div><strong>Paket siparişi</strong><p>Start / Scale / Enterprise veya modül kaydı Avcı işidir; mağaza sepeti değildir.</p></div></li>
          <li><span>03</span><div><strong>İç tahsil ve destek</strong><p>Fatura taslağı ve destek kaydı yönetimdedir. e-Fatura veya e-posta otomatik gitmez.</p></div></li>
          <li><span>04</span><div><strong>Demo ayrı durur</strong><p>Örnek portal yönetimdeki gerçek satırları göstermez.</p></div></li>
        </ol>
      </section>

      <section className="portal-boundary">
        <div><span className="kicker">SÜREÇ SINIRI</span><h2>Portal neyi gösterir,<br />hangi süreç nasıl yürür?</h2><p>Henüz portalda bulunmayan bir özelliği varmış gibi göstermiyoruz. Bu işlemler, ilgili hizmet kapsamı ve yetkili iletişim kanalı üzerinden yürütülür.</p></div>
        <div>{processBoundary.map(([item, status]) => <article key={item}><strong>{item}</strong><span>{status}</span></article>)}</div>
      </section>

      <aside className="scope-note"><strong>Gizlilik sınırı</strong><p>Müşteri portalı ham lisans anahtarını, gizli entegrasyon anahtarlarını veya kart bilgisini göstermez. Panel parolası yalnız güvenli özet olarak saklanır.</p></aside>

      <section className="portal-actions"><div><span className="kicker kicker-light">HESABINIZA DEVAM EDİN</span><h2>Panelinize girin<br />veya erişim desteği alın.</h2><p>Aktif müşteriyseniz e-posta ve panel parolanızla giriş yapın. Parolanızı unuttuysanız güvenli sıfırlama talebi oluşturun.</p></div><div>{settings.customerLoginEnabled && <Link className="button button-primary" href="/musteri-panel/giris">Müşteri paneline giriş yap</Link>}<Link className="button button-ghost" href="/musteri-hesap#sifre">Hesap ve parola</Link>{settings.demoPortalEnabled && <Link className="button button-ghost" href="/demo-portal">Demo portalı inceleyin</Link>}{settings.supportEnabled && <Link className="button button-ghost" href="/destek">Erişim desteği alın</Link>}</div></section>
    </main>
  );
}
