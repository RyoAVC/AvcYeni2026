import Link from "next/link";
import { and, desc, eq, sql } from "drizzle-orm";
import { softwareInvoices, supportTickets } from "../../../db/schema";
import { invoiceStatusLabel } from "../../software-invoice-admin.mjs";
import { ticketNoteOrderLikePattern, ticketStatusLabel } from "../../support-ticket-admin.mjs";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeZone: "Europe/Istanbul",
  }).format(new Date(value));
}

export async function OrderRelated({
  orderId,
  customerId,
  itemLabel,
}: {
  orderId: number;
  customerId: number;
  itemLabel: string;
}) {
  let invoices: Array<{ id: number; title: string; amountNote: string; status: string; createdAt: string }> = [];
  let tickets: Array<{ id: number; subject: string; status: string; createdAt: string }> = [];

  try {
    const { getDb } = await import("../../../db");
    const db = getDb();
    const orderPattern = ticketNoteOrderLikePattern(orderId);
    const [invoiceRows, ticketRows] = await Promise.all([
      db.select({
        id: softwareInvoices.id,
        title: softwareInvoices.title,
        amountNote: softwareInvoices.amountNote,
        status: softwareInvoices.status,
        createdAt: softwareInvoices.createdAt,
      })
        .from(softwareInvoices)
        .where(eq(softwareInvoices.orderId, orderId))
        .orderBy(desc(softwareInvoices.createdAt), desc(softwareInvoices.id))
        .limit(8),
      orderPattern
        ? db.select({
          id: supportTickets.id,
          subject: supportTickets.subject,
          status: supportTickets.status,
          createdAt: supportTickets.createdAt,
        })
          .from(supportTickets)
          .where(and(
            eq(supportTickets.customerId, customerId),
            sql`${supportTickets.note} LIKE ${orderPattern} ESCAPE '\\'`,
          ))
          .orderBy(desc(supportTickets.createdAt), desc(supportTickets.id))
          .limit(8)
        : Promise.resolve([] as Array<{ id: number; subject: string; status: string; createdAt: string }>),
    ]);
    invoices = invoiceRows;
    tickets = ticketRows;
  } catch (cause) {
    console.error("Order related invoices failed", cause);
  }

  const openTicket = tickets.find((item) => item.status !== "closed");
  const draftInvoice = invoices.find((item) => item.status === "draft");

  return (
    <div className="admin-related">
      <div className="admin-recent">
        <div className="admin-recent-head">
          <h2>Bu siparişin faturaları</h2>
          <Link href={`/yonetim/faturalar?musteri=${customerId}&siparis=${orderId}`}>Tümünü gör</Link>
        </div>
        {invoices.length ? (
          <>
            <ul>
              {invoices.map((item) => (
                <li key={item.id}>
                  <Link href={`/yonetim/faturalar/${item.id}`}>
                    <strong>{item.title}</strong>
                    <small>{item.amountNote || "Tutar yazılmadı"} · {invoiceStatusLabel(item.status)}</small>
                  </Link>
                  <time dateTime={item.createdAt}>{formatDate(item.createdAt)}</time>
                </li>
              ))}
            </ul>
            {draftInvoice ? null : (
              <div className="admin-interest-summary admin-package-shortcuts">
                <span>YENİ TASLAK</span>
                <Link href={`/yonetim/faturalar/yeni?musteri=${customerId}&siparis=${orderId}`}>Fatura taslağı aç</Link>
              </div>
            )}
          </>
        ) : (
          <>
            <p>Bu yazılım siparişine bağlı fatura yok. Taslak iç tahsil kaydıdır; e-Fatura veya kart çekimi yoktur.</p>
            <div className="admin-interest-summary admin-package-shortcuts">
              <span>TASLAK</span>
              <Link href={`/yonetim/faturalar/yeni?musteri=${customerId}&siparis=${orderId}`}>Fatura taslağı aç</Link>
            </div>
          </>
        )}
      </div>
      <div className="admin-recent">
        <div className="admin-recent-head">
          <h2>Kurulum / lisans desteği</h2>
          {openTicket
            ? <Link href={`/yonetim/destek/${openTicket.id}`}>Açık kaydı aç</Link>
            : <Link href={`/yonetim/destek/yeni?musteri=${customerId}&siparis=${orderId}`}>Destek kaydı aç</Link>}
        </div>
        {tickets.length ? (
          <ul>
            {tickets.map((item) => (
              <li key={item.id}>
                <Link href={`/yonetim/destek/${item.id}`}>
                  <strong>{item.subject}</strong>
                  <small>{ticketStatusLabel(item.status)}</small>
                </Link>
                <time dateTime={item.createdAt}>{formatDate(item.createdAt)}</time>
              </li>
            ))}
          </ul>
        ) : (
          <p>{itemLabel} siparişinden iç destek taslağı açılır. Müşteriye e-posta gitmez; mağaza iadesi değildir.</p>
        )}
        <p><Link href={`/yonetim/destek?musteri=${customerId}&siparis=${orderId}`}>Bu siparişin kayıtları</Link></p>
      </div>
    </div>
  );
}
