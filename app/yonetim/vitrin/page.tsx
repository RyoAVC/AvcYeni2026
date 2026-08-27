import type { Metadata } from "next";
import Link from "next/link";
import { asc } from "drizzle-orm";
import { vitrineSignals, vitrineToasts } from "../../../db/schema";
import { chatGPTSignOutPath } from "../../chatgpt-auth";
import { requireAdminUser } from "../../admin-auth";
import { AdminShell } from "../admin-shell";
import { SignalToggle } from "./signal-toggle";
import { ToastToggle } from "./toast-toggle";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ana Sayfa Vitrini | Avcı Yönetim",
  robots: { index: false, follow: false },
};

export default async function VitrineSignalsPage() {
  const admin = await requireAdminUser("/yonetim/vitrin");
  if (!admin.authorized || !admin.user) {
    return (
      <main className="admin-access-page">
        <section>
          <span className="admin-lock" aria-hidden="true">×</span>
          <span className="kicker kicker-light">YETKİLİ ERİŞİMİ</span>
          <h1>Bu hesap vitrin şeridini göremez.</h1>
          <p>Giriş yaptığınız <strong>{admin.user?.email}</strong> adresi yönetici izin listesinde bulunmuyor.</p>
          <div>
            <Link className="button button-primary" href="/">Ana sayfaya dön</Link>
            <a className="button button-ghost" href={chatGPTSignOutPath("/yonetim/vitrin")}>Farklı hesapla giriş yap</a>
          </div>
        </section>
      </main>
    );
  }

  let rows: Array<typeof vitrineSignals.$inferSelect> = [];
  let toasts: Array<typeof vitrineToasts.$inferSelect> = [];
  let databaseFailed = false;

  try {
    const { getDb } = await import("../../../db");
    const db = getDb();
    [rows, toasts] = await Promise.all([
      db.select().from(vitrineSignals).orderBy(asc(vitrineSignals.sortOrder), asc(vitrineSignals.id)),
      db.select().from(vitrineToasts).orderBy(asc(vitrineToasts.sortOrder), asc(vitrineToasts.id)),
    ]);
  } catch (cause) {
    console.error("Vitrine signals page failed", cause);
    databaseFailed = true;
  }

  if (databaseFailed) {
    return (
      <main className="admin-access-page">
        <section>
          <span className="admin-lock" aria-hidden="true">!</span>
          <span className="kicker kicker-light">VERİTABANI HAZIR DEĞİL</span>
          <h1>Vitrin satırları şu anda açılamıyor.</h1>
          <Link className="button button-primary" href="/yonetim">Panele dön</Link>
        </section>
      </main>
    );
  }

  const liveCount = rows.filter((item) => item.status === "live").length;
  const liveToasts = toasts.filter((item) => item.status === "live").length;

  return (
    <AdminShell current="vitrin" displayName={admin.user.displayName}>
      <section className="admin-main">
        <header className="admin-heading">
          <div>
            <span className="kicker">AVCI YÖNETİM</span>
            <h1>Vitrin ve Commerce duyuruları</h1>
            <Link className="admin-back-link" href="/yonetim">Panele dön</Link>
          </div>
          <div className="admin-heading-actions">
            <p>Burada “Açık” olan sayfa bildirimleri, sürümlü yayın üzerinden bağlı Avcı Commerce mağazalarının sistem duyuru alanında otomatik görünür.</p>
            <Link href="/yonetim/vitrin/yeni">Yeni şerit</Link>
          </div>
        </header>

        <div className="admin-stats">
          <article><small>Toplam</small><strong>{rows.length}</strong><span>vitrin satırı</span></article>
          <article><small>Açık</small><strong>{liveCount}</strong><span>ana sayfada görünür</span></article>
          <article><small>Kapalı</small><strong>{rows.length - liveCount}</strong><span>sitede yok</span></article>
          <article><small>Bildirim</small><strong>{liveToasts}</strong><span>{toasts.length} karttan açık</span></article>
        </div>

        <div className="admin-recent-head">
          <h2>Ana sayfa şeridi</h2>
          <Link href="/yonetim/vitrin/yeni">Yeni şerit satırı</Link>
        </div>

        {rows.length ? (
          <div className="lead-table-wrap">
            <table className="lead-table">
              <caption className="visually-hidden">Ana sayfa vitrin satırları</caption>
              <thead>
                <tr>
                  <th scope="col">Metin</th>
                  <th scope="col">Değer</th>
                  <th scope="col">Durum</th>
                  <th scope="col">Sıra</th>
                  <th scope="col">Ana sayfa</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => (
                  <tr key={item.id}>
                    <th scope="row">
                      <Link className="lead-detail-link" href={`/yonetim/vitrin/${item.id}`}>{item.label}</Link>
                      <small>{item.slug}</small>
                    </th>
                    <td><strong>{item.value}</strong></td>
                    <td><span className={`lead-status ${item.status === "live" ? "" : "closed"}`}>{item.status === "live" ? "Açık" : "Kapalı"}</span></td>
                    <td>{item.sortOrder}</td>
                    <td>
                      <SignalToggle
                        id={item.id}
                        label={item.label}
                        slug={item.slug}
                        value={item.value}
                        sortOrder={item.sortOrder}
                        status={item.status}
                        expectedUpdatedAt={item.updatedAt}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-empty">
            <h2>Henüz vitrin satırı yok.</h2>
            <p>Örnek: Müşteri Çevrimiçi, Destekte, yeni kayıt, canlı site.</p>
            <Link className="button button-primary" href="/yonetim/vitrin/yeni">İlk satırı ekle</Link>
          </div>
        )}

        <div className="admin-vitrine-block">
        <div className="admin-recent-head">
          <h2>Avcı Commerce sistem duyuruları</h2>
          <Link href="/yonetim/vitrin/bildirim/yeni">Yeni bildirim</Link>
        </div>

        {toasts.length ? (
          <div className="lead-table-wrap">
            <table className="lead-table">
              <caption className="visually-hidden">Örnek sayfa bildirimleri</caption>
              <thead>
                <tr>
                  <th scope="col">Başlık</th>
                  <th scope="col">Metin</th>
                  <th scope="col">Durum</th>
                  <th scope="col">Sıra</th>
                  <th scope="col">Sitede</th>
                </tr>
              </thead>
              <tbody>
                {toasts.map((item) => (
                  <tr key={item.id}>
                    <th scope="row">
                      <Link className="lead-detail-link" href={`/yonetim/vitrin/bildirim/${item.id}`}>{item.title}</Link>
                      <small>{item.slug}</small>
                    </th>
                    <td>{item.text}</td>
                    <td><span className={`lead-status ${item.status === "live" ? "" : "closed"}`}>{item.status === "live" ? "Açık" : "Kapalı"}</span></td>
                    <td>{item.sortOrder}</td>
                    <td>
                      <ToastToggle
                        id={item.id}
                        title={item.title}
                        slug={item.slug}
                        text={item.text}
                        sortOrder={item.sortOrder}
                        status={item.status}
                        expectedUpdatedAt={item.updatedAt}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-empty">
            <h2>Henüz bildirim yok.</h2>
            <p>Sipariş, ödeme, pazaryeri, POS gibi örnek kartlar ekleyin.</p>
            <Link className="button button-primary" href="/yonetim/vitrin/bildirim/yeni">İlk bildirimi ekle</Link>
          </div>
        )}
        </div>
      </section>
    </AdminShell>
  );
}
