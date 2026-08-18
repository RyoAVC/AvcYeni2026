import Link from "next/link";
import { withBasePath } from "../base-path";
import { SiteBrand } from "../site-brand";

type AdminSection = "panel" | "basvurular" | "istatistik" | "musteriler" | "paketler" | "moduller" | "siparisler" | "destek" | "faturalar" | "vitrin" | "ayarlar" | "editor";

export function AdminShell({
  current,
  displayName,
  children,
}: {
  current: AdminSection;
  displayName: string;
  children: React.ReactNode;
}) {
  return (
    <main className="admin-page">
      <aside className="admin-sidebar">
        <SiteBrand href="/yonetim" label="Avcı yönetim paneli" />
        <p className="admin-sidebar-live"><span className="status-dot" /> Sağlayıcı paneli</p>
        <nav aria-label="Yönetim menüsü">
          <Link className={current === "panel" ? "active" : undefined} href="/yonetim">
            <span>01</span> Panel
          </Link>
          <Link className={current === "basvurular" ? "active" : undefined} href="/yonetim/basvurular">
            <span>02</span> Teklifler
          </Link>
          <Link className={current === "istatistik" ? "active" : undefined} href="/yonetim/istatistik">
            <span>03</span> İstatistik
          </Link>
          <Link className={current === "musteriler" ? "active" : undefined} href="/yonetim/musteriler">
            <span>04</span> Müşteriler
          </Link>
          <Link className={current === "paketler" ? "active" : undefined} href="/yonetim/paketler">
            <span>05</span> Paketler
          </Link>
          <Link className={current === "moduller" ? "active" : undefined} href="/yonetim/moduller">
            <span>06</span> Modüller
          </Link>
          <Link className={current === "siparisler" ? "active" : undefined} href="/yonetim/siparisler">
            <span>07</span> Siparişler
          </Link>
          <Link className={current === "destek" ? "active" : undefined} href="/yonetim/destek">
            <span>08</span> Destek
          </Link>
          <Link className={current === "faturalar" ? "active" : undefined} href="/yonetim/faturalar">
            <span>09</span> Faturalar
          </Link>
          <Link className={current === "vitrin" ? "active" : undefined} href="/yonetim/vitrin">
            <span>10</span> Vitrin
          </Link>
          <Link className={current === "ayarlar" ? "active" : undefined} href="/yonetim/ayarlar">
            <span>11</span> Ayarlar
          </Link>
          <Link className={current === "editor" ? "active" : undefined} href="/yonetim/editor">
            <span>12</span> Editör
          </Link>
          <Link href="/"><span>13</span> Siteye dön</Link>
        </nav>
        <div className="admin-user">
          <small>Oturum</small>
          <strong>{displayName}</strong>
          <a href={withBasePath("/api/yonetim/cikis")}>Çıkış yap</a>
        </div>
      </aside>
      {children}
    </main>
  );
}
