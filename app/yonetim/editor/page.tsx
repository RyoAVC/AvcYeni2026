import type { Metadata } from "next";
import Link from "next/link";
import { chatGPTSignOutPath } from "../../chatgpt-auth";
import { requireAdminUser } from "../../admin-auth";
import { loadSiteSettings } from "../../site-settings.mjs";
import { AdminShell } from "../admin-shell";
import { EditorForm } from "./editor-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Site Editörü | Avcı Yönetim",
  robots: { index: false, follow: false },
};

export default async function SiteEditorPage() {
  const admin = await requireAdminUser("/yonetim/editor");
  if (!admin.authorized || !admin.user) {
    return (
      <main className="admin-access-page">
        <section>
          <span className="admin-lock" aria-hidden="true">×</span>
          <span className="kicker kicker-light">YETKİLİ ERİŞİMİ</span>
          <h1>Bu hesap editörü göremez.</h1>
          <p>Giriş yaptığınız <strong>{admin.user?.email}</strong> adresi yönetici izin listesinde bulunmuyor.</p>
          <div>
            <Link className="button button-primary" href="/">Ana sayfaya dön</Link>
            <a className="button button-ghost" href={chatGPTSignOutPath("/yonetim/editor")}>Farklı hesapla giriş yap</a>
          </div>
        </section>
      </main>
    );
  }

  const settings = await loadSiteSettings();

  return (
    <AdminShell current="editor" displayName={admin.user.displayName}>
      <section className="admin-main">
        <header className="admin-heading">
          <div>
            <span className="kicker">AVCI YÖNETİM</span>
            <h1>Site düzenleyici</h1>
            <Link className="admin-back-link" href="/yonetim">Panele dön</Link>
          </div>
          <div className="admin-heading-actions">
            <p>Ticimax / IdeaSoft’taki gibi alan doldurup kaydedin. Elementor tuvali değil. Logo için Ayarlar’ı kullanın.</p>
            <Link href="/yonetim/ayarlar">Logo ve tasarıma git</Link>
          </div>
        </header>
        <EditorForm
          initial={{
            footerTagline: settings.footerTagline,
            heroCtaPrimary: settings.heroCtaPrimary,
            heroCtaSecondary: settings.heroCtaSecondary,
            showLiveStrip: settings.showLiveStrip,
            showTrustStrip: settings.showTrustStrip,
          }}
        />
      </section>
    </AdminShell>
  );
}
