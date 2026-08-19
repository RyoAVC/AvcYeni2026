import type { Metadata } from "next";
import Link from "next/link";
import { HeaderCtaCluster } from "../header-cta-cluster";
import { SiteBrand } from "../site-brand";
import { loadSiteSettings } from "../site-settings.mjs";

export const metadata: Metadata = {
  title: "Müşteri Merkezi ve Portal Kapsamı | Avcı E-Ticaret",
  description: "Avcı müşteri girişinin neyi gösterdiğini, demo sınırını, yönetim kaydını ve şifrenin bu sitede yazılmadığını inceleyin.",
  alternates: { canonical: "/musteri-merkezi" },
};

const currentCapabilities = [
  { number: "01", title: "Demo görünümü", text: "Örnek lisans ve fatura satırları Start / Scale / Enterprise çerçevesinden gelir. Yönetimdeki gerçek müşteri burada açılmaz." },
  { number: "02", title: "Yönetim kaydı", text: "Yazılım müşterisi, sipariş, destek ve tahsil taslağı Avcı yönetimindedir. Mağaza kasası değildir." },
  { number: "03", title: "Şifre sınırı", text: "Bu tanıtım sitesi müşteri parolası, kart veya e-Fatura işlemez. Ayrı lisans platformu bağlandıysa geçiş oraya gider." },
  { number: "04", title: "Destek kanalı", text: "Hesap onayı ve erişim talebi destek e-postası veya sitedeki teklif formuyla yürür." },
];

const processBoundary = [
  ["Örnek lisans / fatura görünümü", "Demo portalda incelenir"],
  ["Yazılım müşterisi, sipariş, tahsil taslağı", "Avcı yönetiminde tutulur"],
  ["Ayrı lisans platformu oturumu", "Bağlandıysa orada; bu sitede şifre yok"],
  ["Proje aşamaları ve teslim takvimi", "Şu anda proje iletişimiyle yürütülür"],
  ["Sözleşme ve ek dokümanlar", "Şu anda yetkili iletişim kanalıyla paylaşılır"],
  ["Alan adı, hosting ve yenileme işlemleri", "Hizmet kapsamı ve sorumlu tarafla birlikte izlenir"],
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
        <p>Müşteri girişi bu tanıtım sitesinde parola toplamaz. Demo örnek veridir. Yönetimdeki yazılım müşterisi kaydı ayrıdır. Lisans platformu bağlandıysa geçiş oraya gider.</p>
      </section>

      <section className="portal-capabilities" id="portal-kapsami">
        <div><span className="kicker">BUGÜN PORTALDA</span><h2>Görünen kapsam<br />açık ve sınırlı.</h2><p>Demo örnek satır gösterir. Yönetimdeki gerçek müşteri burada açılmaz. Şifre bu sitede yazılmaz; ayrı platform bağlandıysa geçiş oraya gider.</p></div>
        <div>{currentCapabilities.map((item) => <article key={item.number}><span>{item.number}</span><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
      </section>

      <section className="portal-security">
        <div><span className="kicker kicker-light">GÜVENLİ GEÇİŞ</span><h2>Parola bu siteden<br />geçmez.</h2><p>Giriş bilgisi bu tanıtım sitesinde işlenmez. Lisans platformu adresi bağlandıysa /musteri-portali oraya yönlendirir; bağlanmadıysa hazırlanıyor uyarısı görünür.</p></div>
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

      <aside className="scope-note"><strong>Gizlilik sınırı</strong><p>Müşteri portalı ham lisans anahtarını göstermez. Bu tanıtım sitesi müşteri parolası, lisans anahtarı veya ödeme bilgisi istemez ve saklamaz.</p></aside>

      <section className="portal-actions"><div><span className="kicker kicker-light">HESABINIZA DEVAM EDİN</span><h2>Görünümü inceleyin<br />veya destek isteyin.</h2><p>Şifre bu sitede yazılmaz. Hesap açılışı ayrı sayfadadır. Örnek görünüm için demoyu kullanın.</p></div><div>{settings.customerLoginEnabled && <Link className="button button-primary" href="/musteri-girisi">Müşteri girişine gidin</Link>}<Link className="button button-ghost" href="/musteri-hesap">Hesap ve şifre</Link>{settings.demoPortalEnabled && <Link className="button button-ghost" href="/demo-portal">Demo portalı inceleyin</Link>}<Link className="button button-ghost" href="/proje-sureci">Proje süreci</Link>{settings.supportEnabled && <Link className="button button-ghost" href="/destek">Destek merkezine gidin</Link>}</div></section>
    </main>
  );
}
