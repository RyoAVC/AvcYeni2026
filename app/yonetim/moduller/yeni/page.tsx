import type { Metadata } from "next";
import Link from "next/link";
import { chatGPTSignOutPath } from "../../../chatgpt-auth";
import { requireAdminUser } from "../../../admin-auth";
import { AdminShell } from "../../admin-shell";
import { ModuleForm } from "../module-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Yeni Yazılım Modülü | Avcı Yönetim",
  robots: { index: false, follow: false },
};

export default async function NewModulePage() {
  const admin = await requireAdminUser("/yonetim/moduller/yeni");
  if (!admin.authorized || !admin.user) {
    return (
      <main className="admin-access-page">
        <section>
          <span className="admin-lock" aria-hidden="true">×</span>
          <span className="kicker kicker-light">YETKİLİ ERİŞİMİ</span>
          <h1>Modül ekleme yetkiniz yok.</h1>
          <div>
            <Link className="button button-primary" href="/">Ana sayfaya dön</Link>
            <a className="button button-ghost" href={chatGPTSignOutPath("/yonetim/moduller/yeni")}>Farklı hesapla giriş yap</a>
          </div>
        </section>
      </main>
    );
  }

  return (
    <AdminShell current="moduller" displayName={admin.user.displayName}>
      <section className="admin-main">
        <header className="admin-heading">
          <div>
            <span className="kicker">AVCI YÖNETİM</span>
            <h1>Yeni modül</h1>
            <Link className="admin-back-link" href="/yonetim/moduller">Listeye dön</Link>
          </div>
          <div className="admin-heading-actions">
            <p>Ad zorunlu. Bu, satılan eklentidir; mağaza ürünü değil. Kamu entegrasyon sayfası otomatik değişmez.</p>
          </div>
        </header>
        <ModuleForm mode="create" />
      </section>
    </AdminShell>
  );
}
