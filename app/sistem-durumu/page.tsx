import type { Metadata } from "next";
import Link from "next/link";
import { HeaderCtaCluster } from "../header-cta-cluster";
import { SiteBrand } from "../site-brand";
import { loadPlatformStatusMeta, loadSiteSettings } from "../site-settings.mjs";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sistem Durumu | Avcı E-Ticaret",
  description: "Avcı E-Ticaret tanıtım sitesi, yönetim paneli ve müşteri portalının güncel durumu.",
  alternates: { canonical: "/sistem-durumu" },
};

const STATUS_LABEL: Record<string, string> = {
  operational: "Her şey çalışıyor",
  degraded: "Kısmi sorun yaşanıyor",
  maintenance: "Planlı bakımda",
};

function formatUpdatedAt(value: string | null) {
  if (!value) return "Henüz kayıt edilmedi";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Henüz kayıt edilmedi";
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Istanbul" }).format(date);
}

export default async function SystemStatusPage() {
  const [settings, statusMeta] = await Promise.all([loadSiteSettings(), loadPlatformStatusMeta()]);
  const status = settings.platformStatus;
  const label = STATUS_LABEL[status] || STATUS_LABEL.operational;

  return (
    <main className="catalog-page status-page">
      <header className="catalog-header">
        <SiteBrand />
        <nav aria-label="Sayfa menüsü"><Link href="/eticaret-altyapisi">E-Ticaret</Link><Link href="/yazilimlar">Yazılımlar</Link><Link href="/kaynaklar">Kaynaklar</Link><Link href="/degisiklik-gunlugu">Değişiklik Günlüğü</Link><Link href="/destek">Destek</Link></nav>
        <HeaderCtaCluster><Link className="header-cta" href="/destek">Destek isteyin</Link></HeaderCtaCluster>
      </header>

      <section className="status-hero">
        <span className="kicker kicker-light">SİSTEM DURUMU</span>
        <h1>Avcı E-Ticaret platformunun<br />güncel durumu.</h1>
        <span className={`status-badge ${status}`}>{label}</span>
        <p className="status-meta">Son güncelleme: {formatUpdatedAt(statusMeta.updatedAt)}</p>
        {settings.platformStatusNote ? <p className="status-note">{settings.platformStatusNote}</p> : null}
      </section>

      <section className="status-explain">
        <div>
          <span className="kicker">BU SAYFA NASIL ÇALIŞIR</span>
          <h2>Otomatik değil,<br />sorumlu bir kişi tarafından.</h2>
          <p>Bu durum bilgisini ekibimiz, bir sorun fark ettiğinde veya planlı bir bakım öncesinde elle günceller. Saniyelik otomatik izleme grafiği veya uydurma çalışma süresi (uptime) yüzdesi göstermiyoruz — yalnızca ekibin o an bildiği gerçek durumu paylaşıyoruz.</p>
        </div>
        <ul>
          <li><strong>Kapsam</strong>Tanıtım sitesi, yönetim paneli ve müşteri portalının genel erişilebilirliğini kapsar. Tek bir müşteri hesabına özel sorunlar için lütfen destek kanalını kullanın.</li>
          <li><strong>Güncelleme sıklığı</strong>Sabit bir aralık yoktur; durum değiştiğinde veya planlı bir bakım öncesinde güncellenir. Üstteki tarih, ekibin son dokunduğu andır.</li>
          <li><strong>Acil durum</strong>Bu sayfa bir destek kanalı değildir. Kesinti şüphesi veya acil bir sorun için doğrudan destek hattından bize ulaşın.</li>
        </ul>
      </section>

      <section className="decision-cta"><span className="kicker">SORUNUZ MU VAR?</span><h2>Bir sorun mu fark ettiniz, yoksa sadece merak mı ettiniz?</h2><p>Her iki durumda da doğrudan bize ulaşabilirsiniz.</p><div><Link className="button button-primary" href="/destek">Destek isteyin</Link><Link className="button button-ghost" href="/degisiklik-gunlugu">Değişiklik günlüğünü görün</Link></div></section>
    </main>
  );
}
