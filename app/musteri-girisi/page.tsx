import type { Metadata } from "next";
import Link from "next/link";
import { HeaderCtaCluster } from "../header-cta-cluster";
import { SiteBrand } from "../site-brand";
import { loadSiteSettings } from "../site-settings.mjs";
import { withBasePath } from "../base-path";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Müşteri Girişi | Avcı E-Ticaret",
  description: "Avcı müşteri portalına güvenli biçimde geçiş yapın.",
  alternates: { canonical: "/musteri-girisi" },
  robots: { index: false, follow: false },
};

export default async function CustomerLoginPage({ searchParams }: { searchParams: Promise<{ durum?: string }> }) {
  const { durum } = await searchParams;
  const settings = await loadSiteSettings();
  const preparing = durum === "hazirlaniyor" || !settings.portalReady;
  const supportMailto = `mailto:${settings.supportEmail}?subject=${encodeURIComponent("Müşteri Portalı Erişim Talebi")}`;

  return (
    <main className="customer-login-page">
      <a className="skip-link" href="#portal-girisi">Portal girişine geç</a>
      <div className="customer-login-grid" aria-hidden="true" />
      <header><SiteBrand /><HeaderCtaCluster><Link href="/">Ana sayfaya dön</Link></HeaderCtaCluster></header>
      <section id="portal-girisi">
        <div className="customer-login-copy"><span className="kicker kicker-light">MÜŞTERİ PORTALI</span><h1>Lisans ve faturalarınıza<br /><em>güvenli erişim.</em></h1><p>Bu tanıtım sitesi parola toplamaz. Demo yalnız örnek veri gösterir; yönetimdeki müşteri kaydı burada açılmaz. Ayrı lisans platformu bağlandıysa geçiş oraya gider, bağlanmadıysa hazırlanıyor uyarısı görünür.</p><ul><li><span>✓</span>Demo, sitedeki Start / Scale / Enterprise çerçevesini örnekler</li><li><span>✓</span>Yönetimdeki sipariş ve tahsil kaydı ayrı durur</li><li><span>✓</span>Parola, kart veya e-Fatura bu sitede işlenmez</li></ul><Link className="portal-scope-link" href="/musteri-merkezi">Portal kapsamını ve güvenlik sınırını inceleyin</Link></div>
        <aside className="customer-login-card">
          <span className="customer-lock" aria-hidden="true"></span>
          <small>GÜVENLİ GEÇİŞ</small>
          {settings.customerLoginEnabled ? (
            <>
              <h2>Parola bu sitede yazılmaz</h2>
              <p>Devam etmek ayrı bir lisans platformuna gider, yalnızca adres bağlandıysa. Bağlı değilse hazırlanıyor uyarısı görünür. Demo örnek veridir.</p>
              {preparing && <div className="portal-notice" role="status"><strong>Portal bağlantısı hazırlanıyor.</strong><span>Şimdilik destek ekibimizden erişim adresinizi isteyebilirsiniz.</span></div>}
              {!preparing && <a className="button button-primary" href={withBasePath("/musteri-portali")}>Güvenli geçişe devam et</a>}
              {settings.demoPortalEnabled && <Link className="demo-portal-link" href="/demo-portal">Demo portalını örnek verilerle inceleyin</Link>}
              {settings.supportEnabled && (
                <div className="portal-help">
                  <span>Hesabınız henüz onaylanmadı mı?</span>
                  <a href={supportMailto}>Destek ekibine yazın</a>
                </div>
              )}
            </>
          ) : (
            <>
              <h2>Müşteri girişi şu anda kapalı.</h2>
              <p>Yönetim bu kanalı kapattı. Lisans veya fatura için destek e-postasını kullanın.</p>
              {settings.supportEnabled && <a className="button button-primary" href={supportMailto}>Destek ekibine yazın</a>}
              <Link className="demo-portal-link" href="/">Ana sayfaya dön</Link>
            </>
          )}
        </aside>
      </section>
      <footer><span>Parolalar yalnızca lisans platformunda işlenir.</span><Link href="/gizlilik">Gizlilik</Link></footer>
    </main>
  );
}
