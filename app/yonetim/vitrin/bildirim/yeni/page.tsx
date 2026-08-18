import type { Metadata } from "next";
import Link from "next/link";
import { chatGPTSignOutPath } from "../../../../chatgpt-auth";
import { requireAdminUser } from "../../../../admin-auth";
import { AdminShell } from "../../../admin-shell";
import { ToastForm } from "../../toast-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Yeni Bildirim | Avcı Yönetim",
  robots: { index: false, follow: false },
};

export default async function NewVitrineToastPage() {
  const admin = await requireAdminUser("/yonetim/vitrin/bildirim/yeni");
  if (!admin.authorized || !admin.user) {
    return (
      <main className="admin-access-page">
        <section>
          <span className="admin-lock" aria-hidden="true">×</span>
          <span className="kicker kicker-light">YETKİLİ ERİŞİMİ</span>
          <h1>Bildirim ekleme yetkiniz yok.</h1>
          <div>
            <Link className="button button-primary" href="/">Ana sayfaya dön</Link>
            <a className="button button-ghost" href={chatGPTSignOutPath("/yonetim/vitrin/bildirim/yeni")}>Farklı hesapla giriş yap</a>
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
            <h1>Yeni bildirim</h1>
            <Link className="admin-back-link" href="/yonetim/vitrin">Listeye dön</Link>
          </div>
          <div className="admin-heading-actions">
            <p>Bu kart örnek vitrindir. Gerçek sipariş, ödeme veya müşteri adı yazılmaz.</p>
          </div>
        </header>
        <ToastForm mode="create" />
      </section>
    </AdminShell>
  );
}
