import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { vitrineSignals } from "../../../../db/schema";
import { chatGPTSignOutPath } from "../../../chatgpt-auth";
import { requireAdminUser } from "../../../admin-auth";
import { vitrineSignalStatusLabel } from "../../../vitrine-signal-admin.mjs";
import { AdminShell } from "../../admin-shell";
import { SignalForm } from "../signal-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Vitrin Satırı | Avcı Yönetim",
  robots: { index: false, follow: false },
};

export default async function VitrineSignalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await requireAdminUser(`/yonetim/vitrin/${encodeURIComponent(id.slice(0, 40))}`);
  if (!admin.authorized || !admin.user) {
    return (
      <main className="admin-access-page">
        <section>
          <span className="admin-lock" aria-hidden="true">×</span>
          <span className="kicker kicker-light">YETKİLİ ERİŞİMİ</span>
          <h1>Bu vitrin satırını görme yetkiniz yok.</h1>
          <div>
            <Link className="button button-primary" href="/">Ana sayfaya dön</Link>
            <a className="button button-ghost" href={chatGPTSignOutPath("/yonetim/vitrin")}>Farklı hesapla giriş yap</a>
          </div>
        </section>
      </main>
    );
  }

  const signalId = Number(id);
  if (!Number.isSafeInteger(signalId) || signalId < 1) notFound();

  let item: typeof vitrineSignals.$inferSelect | undefined;
  let databaseFailed = false;
  try {
    const { getDb } = await import("../../../../db");
    const db = getDb();
    const rows = await db.select().from(vitrineSignals).where(eq(vitrineSignals.id, signalId)).limit(1);
    item = rows[0];
  } catch (cause) {
    console.error("Vitrine signal detail failed", cause);
    databaseFailed = true;
  }

  if (databaseFailed) {
    return (
      <main className="admin-access-page">
        <section>
          <span className="admin-lock" aria-hidden="true">!</span>
          <span className="kicker kicker-light">VERİTABANI HAZIR DEĞİL</span>
          <h1>Vitrin satırı açılamıyor.</h1>
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
            <span className="kicker">VİTRİN #{item.id}</span>
            <h1>{item.label}</h1>
            <Link className="admin-back-link" href="/yonetim/vitrin">Listeye dön</Link>
          </div>
          <div className="admin-heading-actions">
            <p>{vitrineSignalStatusLabel(item.status)} · {item.slug}</p>
          </div>
        </header>
        <SignalForm
          mode="edit"
          signalId={item.id}
          initial={{
            label: item.label,
            slug: item.slug,
            value: item.value,
            sortOrder: item.sortOrder,
            status: item.status,
            expectedUpdatedAt: item.updatedAt,
          }}
        />
      </section>
    </AdminShell>
  );
}
