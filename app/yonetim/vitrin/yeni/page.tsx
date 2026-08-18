import type { Metadata } from "next";
import Link from "next/link";
import { chatGPTSignOutPath } from "../../../chatgpt-auth";
import { requireAdminUser } from "../../../admin-auth";
import { AdminShell } from "../../admin-shell";
import { SignalForm } from "../signal-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Yeni Vitrin Satırı | Avcı Yönetim",
  robots: { index: false, follow: false },
};

export default async function NewVitrineSignalPage() {
  const admin = await requireAdminUser("/yonetim/vitrin/yeni");
  if (!admin.authorized || !admin.user) {
    return (
      <main className="admin-access-page">
        <section>
          <span className="admin-lock" aria-hidden="true">×</span>
          <span className="kicker kicker-light">YETKİLİ ERİŞİMİ</span>
          <h1>Vitrin satırı ekleme yetkiniz yok.</h1>
          <div>
            <Link className="button button-primary" href="/">Ana sayfaya dön</Link>
            <a className="button button-ghost" href={chatGPTSignOutPath("/yonetim/vitrin/yeni")}>Farklı hesapla giriş yap</a>
          </div>
        </section>
      </main>
    );
  }

  return (
    <AdminShell current="vitrin" displayName={admin.user.displayName}>
      <section className="admin-main">
        <header className="admin-heading">
          <div>
            <span className="kicker">AVCI YÖNETİM</span>
            <h1>Yeni vitrin satırı</h1>
            <Link className="admin-back-link" href="/yonetim/vitrin">Listeye dön</Link>
          </div>
          <div className="admin-heading-actions">
            <p>Bu satır örnek vitrindir. Gerçek müşteri veya destek sayısı buraya yazılmaz.</p>
          </div>
        </header>
        <SignalForm mode="create" />
      </section>
    </AdminShell>
  );
}
