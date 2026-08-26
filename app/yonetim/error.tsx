"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import "./error-panel.css";

const sections = [
  ["Kontrol Merkezi", "/yonetim"],
  ["Ürünler", "/yonetim/urunler"],
  ["Kategoriler", "/yonetim/kategoriler"],
  ["Markalar", "/yonetim/markalar"],
  ["Paketler", "/yonetim/paketler"],
  ["Modüller", "/yonetim/moduller"],
  ["Siparişler", "/yonetim/siparisler"],
  ["Başvurular", "/yonetim/basvurular"],
  ["Faturalar", "/yonetim/faturalar"],
  ["Destek", "/yonetim/destek"],
  ["Müşteriler", "/yonetim/musteriler"],
  ["Kampanyalar", "/yonetim/kampanyalar"],
  ["Kuponlar", "/yonetim/kuponlar"],
  ["Raporlar", "/yonetim/raporlar"],
  ["Entegrasyonlar", "/yonetim/entegrasyonlar"],
  ["Site Ayarları", "/yonetim/ayarlar"],
] as const;

export default function ManagementError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();

  useEffect(() => {
    console.error("Management section failed", error);
  }, [error]);

  return (
    <main className="admin-fallback-shell">
      <aside className="admin-fallback-sidebar">
        <Link className="admin-fallback-brand" href="/yonetim" aria-label="Avcı yönetim ana sayfası">
          <span>A</span><strong>AVCI <small>E‑TİCARET</small></strong>
        </Link>
        <div className="admin-fallback-health"><i /> YÖNETİM MERKEZİ</div>
        <nav aria-label="Yönetim menüsü">
          {sections.map(([label, href]) => (
            <Link className={pathname === href ? "is-active" : ""} href={href} key={href}>{label}</Link>
          ))}
        </nav>
        <Link className="admin-fallback-site-link" href="/">← Canlı siteye dön</Link>
      </aside>

      <section className="admin-fallback-content">
        <header>
          <div><span>AVCI OPERASYON MERKEZİ</span><strong>Bölüm durumu</strong></div>
          <Link href="/yonetim">Kontrol merkezine dön</Link>
        </header>
        <div className="admin-fallback-card">
          <span className="admin-fallback-kicker">BAĞLANTI UYARISI</span>
          <h1>Bu bölüm geçici olarak kullanılamıyor.</h1>
          <p>Yönetim menüsü çalışmaya devam ediyor. Veriler kaybolmadı; bölümün veri bağlantısı kurulamadığı için içerik güvenli biçimde durduruldu.</p>
          <div>
            <button type="button" onClick={() => reset()}>Tekrar dene</button>
            <Link href="/yonetim">Kontrol merkezini aç</Link>
          </div>
          {error.digest ? <small>Hata referansı: {error.digest}</small> : null}
        </div>
      </section>
    </main>
  );
}
