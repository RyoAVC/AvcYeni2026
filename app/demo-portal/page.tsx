import type { Metadata } from "next";
import Link from "next/link";
import { HeaderCtaCluster } from "../header-cta-cluster";
import { SiteBrand } from "../site-brand";
import { loadSiteSettings } from "../site-settings.mjs";
import { PACKAGE_SCOPE_DETAILS, packageScopeTitle } from "../package-scope-details";

export const metadata: Metadata = {
  title: "Demo Müşteri Portalı | Avcı E-Ticaret",
  description: "AVC müşteri portalı görünümünü örnek verilerle inceleyin.",
  alternates: { canonical: "/demo-portal" },
  robots: { index: false, follow: false },
};

const licenses = PACKAGE_SCOPE_DETAILS.map((item) => [
  "AVC E-Ticaret",
  packageScopeTitle(item.id),
  "Örnek görünüm",
  `${item.salePrice} örnek band`,
]);

const invoices = PACKAGE_SCOPE_DETAILS.map((item) => [
  `${packageScopeTitle(item.id)} örnek band`,
  "Lisans çerçevesi",
  "Taslak görünüm",
  item.salePrice,
]);

export const dynamic = "force-dynamic";

export default async function DemoPortalPage() {
  const settings = await loadSiteSettings();
  if (!settings.demoPortalEnabled) {
    return (
      <main className="demo-portal-page">
        <header className="demo-portal-header"><SiteBrand subtitle="DEMO PORTAL" /><div><span>KAPALI</span><HeaderCtaCluster><Link href="/">Ana sayfa</Link></HeaderCtaCluster></div></header>
        <section className="demo-portal-hero" id="demo-ozeti"><div><span className="kicker">DEMO PORTAL</span><h1>Örnek portal<br /><em>şu anda kapalı.</em></h1><p>Yönetim bu vitrini kapattı. Gerçek lisans hesabınız varsa müşteri girişini kullanın.</p></div><aside><small>DURUM</small><strong>Kapalı</strong><span>örnek veri yok</span>{settings.customerLoginEnabled ? <Link className="button button-primary" href="/musteri-girisi">Müşteri girişi</Link> : <Link className="button button-primary" href="/">Ana sayfaya dön</Link>}</aside></section>
      </main>
    );
  }

  return (
    <main className="demo-portal-page">
      <a className="skip-link" href="#demo-ozeti">Demo özetine geç</a>
      <header className="demo-portal-header"><SiteBrand subtitle="DEMO PORTAL" /><div><span>ÖRNEK VERİ</span><HeaderCtaCluster><Link href="/musteri-girisi">Gerçek girişe dön</Link></HeaderCtaCluster></div></header>
      <section className="demo-portal-hero" id="demo-ozeti"><div><span className="kicker">GÜVENLİ DEMO OTURUMU</span><h1>Portal görünümünü<br /><em>gerçek hesap olmadan</em> inceleyin.</h1><p>Bu ekran yalnız test amaçlı örnek veriler gösterir. Lisans satırları sitedeki Start / Scale / Enterprise çerçevesiyle aynıdır. Gerçek müşteri, lisans, fatura, parola veya ödeme bilgisi içermez.</p></div><aside><small>DEMO HESABI</small><strong>Örnek Yazılım Müşterisi</strong><span>Demo kullanıcı · salt görünüm</span><Link className="button button-primary" href="/musteri-girisi">Gerçek müşteri girişi</Link></aside></section>
      <section className="demo-portal-stats" aria-label="Demo portal özeti"><article><small>Lisanslar</small><strong>{licenses.length}</strong><span>örnek kayıt</span></article><article><small>Fatura görünümü</small><strong>{invoices.length}</strong><span>örnek kalem</span></article><article><small>İşlem yetkisi</small><strong>Yok</strong><span>salt demo</span></article></section>
      <section className="demo-portal-data"><div><span className="kicker">LİSANS GÖRÜNÜMÜ</span><h2>Örnek lisanslar</h2><p className="demo-portal-note">Start, Scale ve Enterprise — <Link href="/paketler">paket sayfasındaki</Link> örnek bantla aynı kaynak.</p><div className="demo-table-wrap"><table><caption className="visually-hidden">Demo hesaba ait örnek lisans kayıtları</caption><thead><tr><th scope="col">Ürün</th><th scope="col">Plan</th><th scope="col">Durum</th><th scope="col">Not</th></tr></thead><tbody>{licenses.map((row) => <tr key={row[1]}>{row.map((cell, index) => index === 0 ? <th scope="row" key={`${row[1]}-${index}`}>{cell}</th> : <td key={`${row[1]}-${index}`}>{cell}</td>)}</tr>)}</tbody></table></div></div><div><span className="kicker">FİNANSAL ÖZET</span><h2>Örnek fatura kalemleri</h2><p className="demo-portal-note">Tutarlar örnek banddır; tahsilat veya e-Fatura değildir.</p><div className="demo-table-wrap"><table><caption className="visually-hidden">Demo hesaba ait örnek fatura kalemleri</caption><thead><tr><th scope="col">Kayıt</th><th scope="col">Kapsam</th><th scope="col">Durum</th><th scope="col">Not</th></tr></thead><tbody>{invoices.map((row) => <tr key={row[0]}>{row.map((cell, index) => index === 0 ? <th scope="row" key={`${row[0]}-${index}`}>{cell}</th> : <td key={`${row[0]}-${index}`}>{cell}</td>)}</tr>)}</tbody></table></div></div></section>
      <aside className="demo-portal-boundary"><strong>Demo sınırı</strong><p>Bu sayfa oturum açma, kayıt değiştirme, ödeme, indirme veya müşteri verisine erişim işlevi sunmaz. Paket adları tanıtım sitesindeki çerçeveden gelir; yönetimdeki gerçek müşteri kaydı burada görünmez. Gerçek portal erişimi yalnız onaylı müşteri hesabıyla yapılır.</p></aside>
    </main>
  );
}
