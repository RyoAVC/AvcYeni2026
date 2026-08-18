import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { vitrineToasts } from "../../../../../db/schema";
import { chatGPTSignOutPath } from "../../../../chatgpt-auth";
import { requireAdminUser } from "../../../../admin-auth";
import { AdminShell } from "../../../admin-shell";
import { ToastForm } from "../../toast-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bildirim | Avcı Yönetim",
  robots: { index: false, follow: false },
};

export default async function VitrineToastDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await requireAdminUser(`/yonetim/vitrin/bildirim/${encodeURIComponent(id.slice(0, 40))}`);
  if (!admin.authorized || !admin.user) {
    return (
      <main className="admin-access-page">
        <section>
          <span className="admin-lock" aria-hidden="true">×</span>
          <span className="kicker kicker-light">YETKİLİ ERİŞİMİ</span>
          <h1>Bu bildirimi görme yetkiniz yok.</h1>
          <div>
            <Link className="button button-primary" href="/">Ana sayfaya dön</Link>
            <a className="button button-ghost" href={chatGPTSignOutPath("/yonetim/vitrin")}>Farklı hesapla giriş yap</a>
          </div>
        </section>
      </main>
    );
  }

  const toastId = Number(id);
  if (!Number.isSafeInteger(toastId) || toastId < 1) notFound();

  let item: typeof vitrineToasts.$inferSelect | undefined;
  let databaseFailed = false;
  try {
    const { getDb } = await import("../../../../../db");
    const db = getDb();
    const rows = await db.select().from(vitrineToasts).where(eq(vitrineToasts.id, toastId)).limit(1);
    item = rows[0];
  } catch (cause) {
    console.error("Vitrine toast detail failed", cause);
    databaseFailed = true;
  }

  if (databaseFailed) {
    return (
      <main className="admin-access-page">
        <section>
          <span className="admin-lock" aria-hidden="true">!</span>
          <span className="kicker kicker-light">VERİTABANI HAZIR DEĞİL</span>
          <h1>Bildirim açılamıyor.</h1>
          <Link className="button button-primary" href="/yonetim/vitrin">Listeye dön</Link>
        </section>
      </main>
    );
  }
  if (!item) notFound();

  return (
    <AdminShell current="vitrin" displayName={admin.user.displayName}>
      <section className="admin-main">
        <header className="admin-heading">
          <div>
            <span className="kicker">BİLDİRİM #{item.id}</span>
            <h1>{item.title}</h1>
            <Link className="admin-back-link" href="/yonetim/vitrin">Listeye dön</Link>
          </div>
          <div className="admin-heading-actions">
            <p>{item.status === "live" ? "Sitede kayar" : "Kapalı"} · {item.slug}</p>
          </div>
        </header>
        <ToastForm
          mode="edit"
          toastId={item.id}
          initial={{
            title: item.title,
            slug: item.slug,
            text: item.text,
            sortOrder: item.sortOrder,
            status: item.status,
            expectedUpdatedAt: item.updatedAt,
          }}
        />
      </section>
    </AdminShell>
  );
}
