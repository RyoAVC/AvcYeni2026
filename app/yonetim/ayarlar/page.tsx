import type { Metadata } from "next";
import Link from "next/link";
import { chatGPTSignOutPath } from "../../chatgpt-auth";
import { requireAdminUser } from "../../admin-auth";
import { loadSiteLogoMetas, loadSiteSettings } from "../../site-settings.mjs";
import { AdminShell } from "../admin-shell";
import { LogoSettingsForm } from "./logo-form";
import { SettingsForm } from "./settings-form";
import "./settings-page.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Site Ayarları | Avcı Yönetim",
  robots: { index: false, follow: false },
};

export default async function SiteSettingsPage() {
  const admin = await requireAdminUser("/yonetim/ayarlar");
  if (!admin.authorized || !admin.user) {
    return (
      <main className="admin-access-page">
        <section>
          <span className="admin-lock" aria-hidden="true">×</span>
          <span className="kicker kicker-light">YETKİLİ ERİŞİMİ</span>
          <h1>Bu hesap ayarları göremez.</h1>
          <p>Giriş yaptığınız <strong>{admin.user?.email}</strong> adresi yönetici izin listesinde bulunmuyor.</p>
          <div>
            <Link className="button button-primary" href="/">Ana sayfaya dön</Link>
            <a className="button button-ghost" href={chatGPTSignOutPath("/yonetim/ayarlar")}>Farklı hesapla giriş yap</a>
          </div>
        </section>
      </main>
    );
  }

  const [settings, logos] = await Promise.all([loadSiteSettings(), loadSiteLogoMetas()]);

  return (
    <AdminShell current="ayarlar" displayName={admin.user.displayName}>
      <section className="admin-main admin-settings-page">
        <header className="admin-heading">
          <div>
            <span className="kicker">AVCI E-TİCARET SİSTEM AYARLARI</span>
            <h1>Marka ve platform ayarları</h1>
            <Link className="admin-back-link" href="/yonetim">Panele dön</Link>
          </div>
          <div className="admin-heading-actions">
            <p>Avcı’nın ana sitesi, kurumsal kimliği ve genel kanalları. Müşteri lisansı, domain ve ücretli modüller Müşteri Sistemleri alanından yönetilir.</p>
          </div>
        </header>
        <SettingsForm initial={settings} />
        <LogoSettingsForm night={logos.night} day={logos.day} />
      </section>
    </AdminShell>
  );
}
