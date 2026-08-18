import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { customers, supportTickets } from "../../../../db/schema";
import { chatGPTSignOutPath } from "../../../chatgpt-auth";
import { requireAdminUser } from "../../../admin-auth";
import { ticketTopicLabel, parseTicketOrderIdFromNote } from "../../../support-ticket-admin.mjs";
import { AdminShell } from "../../admin-shell";
import { TicketForm } from "../ticket-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Destek Detayı | Avcı Yönetim",
  robots: { index: false, follow: false },
};

export default async function SupportTicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await requireAdminUser(`/yonetim/destek/${encodeURIComponent(id.slice(0, 40))}`);
  if (!admin.authorized || !admin.user) {
    return (
      <main className="admin-access-page">
        <section>
          <span className="admin-lock" aria-hidden="true">×</span>
          <span className="kicker kicker-light">YETKİLİ ERİŞİMİ</span>
          <h1>Bu kaydı görme yetkiniz yok.</h1>
          <div>
            <Link className="button button-primary" href="/">Ana sayfaya dön</Link>
            <a className="button button-ghost" href={chatGPTSignOutPath("/yonetim/destek")}>Farklı hesapla giriş yap</a>
          </div>
        </section>
      </main>
    );
  }

  const ticketId = Number(id);
  if (!Number.isSafeInteger(ticketId) || ticketId < 1) notFound();

  let ticket: typeof supportTickets.$inferSelect | undefined;
  let customerOptions: Array<{ id: number; name: string; extra?: string }> = [];
  let databaseFailed = false;

  try {
    const { getDb } = await import("../../../../db");
    const db = getDb();
    const [rows, customerRows] = await Promise.all([
      db.select().from(supportTickets).where(eq(supportTickets.id, ticketId)).limit(1),
      db.select({ id: customers.id, name: customers.name, company: customers.company }).from(customers).orderBy(asc(customers.name)),
    ]);
    ticket = rows[0];
    customerOptions = customerRows.map((item) => ({ id: item.id, name: item.name, extra: item.company || undefined }));
  } catch (cause) {
    console.error("Support ticket detail failed", cause);
    databaseFailed = true;
  }

  if (databaseFailed) {
    return (
      <main className="admin-access-page">
        <section>
          <span className="admin-lock" aria-hidden="true">!</span>
          <span className="kicker kicker-light">VERİTABANI HAZIR DEĞİL</span>
          <h1>Destek kaydı açılamıyor.</h1>
          <Link className="button button-primary" href="/yonetim/destek">Listeye dön</Link>
        </section>
      </main>
    );
  }
  if (!ticket) notFound();

  const customer = customerOptions.find((item) => item.id === ticket.customerId);
  const relatedOrderId = parseTicketOrderIdFromNote(ticket.note);

  return (
    <AdminShell current="destek" displayName={admin.user.displayName}>
      <section className="admin-main">
        <header className="admin-heading">
          <div>
            <span className="kicker">DESTEK #{ticket.id}</span>
            <h1>{ticket.subject}</h1>
            <Link className="admin-back-link" href="/yonetim/destek">Listeye dön</Link>
          </div>
          <div className="admin-heading-actions">
            <p>{ticketTopicLabel(ticket.topic)} · {customer?.name || "Müşteri silinmiş"}</p>
            {customer ? <Link href={`/yonetim/musteriler/${customer.id}`}>Müşteriyi aç</Link> : null}
            {relatedOrderId ? <Link href={`/yonetim/siparisler/${relatedOrderId}`}>Sipariş #{relatedOrderId}</Link> : null}
            {!relatedOrderId && customer ? <Link href={`/yonetim/siparisler/yeni?musteri=${customer.id}`}>Sipariş ekle</Link> : null}
            {customer ? <Link href={`/yonetim/siparisler?musteri=${customer.id}`}>Siparişleri gör</Link> : null}
            {customer ? <Link href={`/yonetim/faturalar?musteri=${customer.id}`}>Faturaları gör</Link> : null}
          </div>
        </header>
        <TicketForm
          mode="edit"
          ticketId={ticket.id}
          customers={customerOptions}
          initial={{
            customerId: ticket.customerId,
            topic: ticket.topic,
            subject: ticket.subject,
            message: ticket.message,
            note: ticket.note,
            status: ticket.status,
            expectedUpdatedAt: ticket.updatedAt,
          }}
        />
      </section>
    </AdminShell>
  );
}
