import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq, sql } from "drizzle-orm";
import { customers, leadActivities, leadNotes, leads } from "../../../../db/schema";
import { normalizeEmailAddress } from "../../../email-normalization.mjs";
import { requireAdminUser } from "../../../admin-auth";
import { chatGPTSignOutPath } from "../../../chatgpt-auth";
import { StatusControl } from "../status-control";
import { NoteForm } from "./note-form";
import { leadStatusLabel } from "../../../lead-statuses";
import { historyCountLabel } from "../../../history-count-label.mjs";
import { AdminShell } from "../../admin-shell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Başvuru Detayı | Avcı E-Ticaret",
  robots: { index: false, follow: false },
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Istanbul",
  }).format(new Date(value));
}

function sourceLabel(value: string) {
  return value === "direct" ? "Doğrudan" : value;
}

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProtectedLeadDetail idParam={id} />;
}

async function ProtectedLeadDetail({ idParam }: { idParam: string }) {
  const safeReturnId = encodeURIComponent(idParam.slice(0, 40));
  const admin = await requireAdminUser(`/yonetim/basvurular/${safeReturnId}`);

  if (!admin.authorized || !admin.user) {
    return (
      <main className="admin-access-page">
        <section><span className="admin-lock" aria-hidden="true">×</span><span className="kicker kicker-light">YETKİLİ ERİŞİMİ</span><h1>Bu başvuruyu görüntüleme yetkiniz yok.</h1><p>Başvuru ayrıntıları yalnızca sunucu tarafındaki yönetici izin listesinde bulunan hesaplara gösterilir.</p><div><Link className="button button-primary" href="/">Ana sayfaya dön</Link><a className="button button-ghost" href={chatGPTSignOutPath(`/yonetim/basvurular/${safeReturnId}`)}>Farklı hesapla giriş yap</a></div></section>
      </main>
    );
  }

  const leadId = Number(idParam);
  if (!Number.isSafeInteger(leadId) || leadId < 1) notFound();

  let lead: typeof leads.$inferSelect | undefined;
  let activities: Array<typeof leadActivities.$inferSelect> = [];
  let notes: Array<typeof leadNotes.$inferSelect> = [];
  let activityTotal = 0;
  let noteTotal = 0;
  let existingCustomer: { id: number; name: string } | undefined;
  let databaseFailed = false;
  try {
    const { getDb } = await import("../../../../db");
    const db = getDb();
    const [leadRows, activityRows, noteRows, activityCountRows, noteCountRows] = await Promise.all([
      db.select().from(leads).where(eq(leads.id, leadId)).limit(1),
      db.select().from(leadActivities).where(eq(leadActivities.leadId, leadId)).orderBy(desc(leadActivities.createdAt), desc(leadActivities.id)).limit(100),
      db.select().from(leadNotes).where(eq(leadNotes.leadId, leadId)).orderBy(desc(leadNotes.createdAt), desc(leadNotes.id)).limit(100),
      db.select({ count: sql<number>`count(*)` }).from(leadActivities).where(eq(leadActivities.leadId, leadId)),
      db.select({ count: sql<number>`count(*)` }).from(leadNotes).where(eq(leadNotes.leadId, leadId)),
    ]);
    lead = leadRows[0];
    activities = activityRows;
    notes = noteRows;
    activityTotal = Number(activityCountRows[0]?.count ?? 0);
    noteTotal = Number(noteCountRows[0]?.count ?? 0);
    if (lead) {
      const email = normalizeEmailAddress(lead.email, 180);
      if (email) {
        const [match] = await db.select({ id: customers.id, name: customers.name }).from(customers).where(eq(customers.email, email)).limit(1);
        existingCustomer = match;
      }
    }
  } catch (cause) {
    console.error("Lead detail page failed", cause);
    databaseFailed = true;
  }

  if (databaseFailed) {
    return (
      <main className="admin-access-page"><section><span className="admin-lock" aria-hidden="true">!</span><span className="kicker kicker-light">VERİTABANI HAZIR DEĞİL</span><h1>Başvuru ayrıntısı açılamıyor.</h1><p>D1 bağlantısı ve migration tamamlandığında bu ekran otomatik olarak çalışacaktır.</p><Link className="button button-primary" href="/yonetim/basvurular">Başvurulara dön</Link></section></main>
    );
  }
  if (!lead) notFound();

  const phoneDigits = lead.phone.replace(/\D/g, "");
  const phoneHref = lead.phone.trim().startsWith("+") ? `+${phoneDigits}` : phoneDigits;
  const emailSubject = encodeURIComponent(`AVC başvurunuz #${lead.id}: ${lead.interest}`);

  return (
    <AdminShell current="basvurular" displayName={admin.user.displayName}>
      <section className="admin-main lead-detail-page">
        <header className="lead-detail-heading">
          <div><Link href="/yonetim/basvurular">Başvurulara dön</Link><span className="kicker">BAŞVURU #{lead.id}</span><h1>{lead.name}</h1><p>{lead.company || "Firma belirtilmedi"} · {lead.interest}{existingCustomer ? <> · <Link href={`/yonetim/siparisler/yeni?musteri=${existingCustomer.id}`}>Sipariş ekle</Link></> : <> · <Link href={`/yonetim/musteriler/yeni?basvuru=${lead.id}`}>Yazılım müşterisine çevir</Link></>}</p></div>
          <div><small>Başvuru durumu</small><StatusControl id={lead.id} label={`${lead.name} başvuru durumu`} initialStatus={lead.status} initialUpdatedAt={lead.updatedAt} /></div>
        </header>

        <div className="lead-detail-grid">
          <article className="lead-detail-card contact-card"><span className="kicker">İLETİŞİM</span><h2>Başvuru sahibi</h2><dl><div><dt>E-posta</dt><dd><a href={`mailto:${lead.email}`}>{lead.email}</a></dd></div><div><dt>Telefon</dt><dd><a href={`tel:${phoneHref}`}>{lead.phone}</a></dd></div><div><dt>Firma</dt><dd>{lead.company || "—"}</dd></div></dl><div className="lead-contact-actions"><a href={`mailto:${lead.email}?subject=${emailSubject}`}>E-posta gönder</a><a href={`tel:${phoneHref}`}>Telefonla ara</a>{existingCustomer ? <Link href={`/yonetim/musteriler/${existingCustomer.id}`}>Müşteri kaydını aç</Link> : <Link href={`/yonetim/musteriler/yeni?basvuru=${lead.id}`}>Yazılım müşterisine çevir</Link>}{existingCustomer ? <Link href={`/yonetim/siparisler?musteri=${existingCustomer.id}`}>Siparişleri gör</Link> : null}{existingCustomer ? <Link href={`/yonetim/siparisler/yeni?musteri=${existingCustomer.id}`}>Sipariş ekle</Link> : null}</div></article>
          <article className="lead-detail-card"><span className="kicker">PROJE</span><h2>{lead.interest}</h2><p className="lead-full-message">{lead.message || "Başvuru sahibi ek bir proje açıklaması paylaşmadı."}</p></article>
          <article className="lead-detail-card lead-timing"><span className="kicker">KAYNAK & ZAMAN</span><dl><div><dt>Kaynak</dt><dd>{sourceLabel(lead.source)}</dd></div>{lead.utmSource && <div><dt>UTM kaynağı</dt><dd>{lead.utmSource}</dd></div>}{lead.utmMedium && <div><dt>UTM ortamı</dt><dd>{lead.utmMedium}</dd></div>}{lead.utmCampaign && <div><dt>Kampanya</dt><dd>{lead.utmCampaign}</dd></div>}{lead.referrerHost && <div><dt>Yönlendiren alan</dt><dd>{lead.referrerHost}</dd></div>}{lead.landingPath && <div><dt>Açılış sayfası</dt><dd>{lead.landingPath}</dd></div>}<div><dt>Oluşturuldu</dt><dd><time dateTime={lead.createdAt}>{formatDate(lead.createdAt)}</time></dd></div><div><dt>Son güncelleme</dt><dd><time dateTime={lead.updatedAt}>{formatDate(lead.updatedAt)}</time></dd></div><div><dt>İletişim izni</dt><dd><time dateTime={lead.consentAt}>{formatDate(lead.consentAt)}</time></dd></div></dl></article>
        </div>

        <section className="notes-section">
          <div className="activity-heading"><div><span className="kicker">EKİP NOTLARI</span><h2>Takip notları</h2></div><small>{historyCountLabel(notes.length, noteTotal, "not")}</small></div>
          <NoteForm leadId={lead.id} />
          <div className="note-list">
            {notes.length ? notes.map((note) => (
              <article key={note.id}><p>{note.content}</p><footer><strong>{note.authorEmail}</strong><time dateTime={note.createdAt}>{formatDate(note.createdAt)}</time></footer></article>
            )) : <p className="note-empty">Bu başvuru için henüz ekip notu yok.</p>}
          </div>
        </section>

        <section className="activity-section">
          <div className="activity-heading"><div><span className="kicker">HAREKET GEÇMİŞİ</span><h2>Başvurunun zaman çizelgesi</h2></div><small>{historyCountLabel(activities.length, activityTotal, "durum değişikliği")}</small></div>
          <div className="activity-timeline">
            {activities.map((activity) => (
              <article key={activity.id}><i aria-hidden="true" /><div><strong>{leadStatusLabel(activity.fromStatus)} — {leadStatusLabel(activity.toStatus)}</strong><p>Durum, <span>{activity.actorEmail}</span> tarafından güncellendi.</p></div><time dateTime={activity.createdAt}>{formatDate(activity.createdAt)}</time></article>
            ))}
            <article className="created"><i aria-hidden="true" /><div><strong>Başvuru oluşturuldu</strong><p>Web sitesi teklif formu üzerinden alındı.</p></div><time dateTime={lead.createdAt}>{formatDate(lead.createdAt)}</time></article>
          </div>
        </section>
      </section>
    </AdminShell>
  );
}
