import { withBasePath } from "../../base-path";
import type { Metadata } from "next";
import Link from "next/link";
import { and, desc, eq, or, sql, type SQL } from "drizzle-orm";
import { customers, supportTickets } from "../../../db/schema";
import { chatGPTSignOutPath } from "../../chatgpt-auth";
import { requireAdminUser } from "../../admin-auth";
import { normalizeLeadSearch, escapeLeadLike } from "../../lead-search.mjs";
import { clampLeadPage, getLeadTotalPages, LEAD_PAGE_SIZE, parseLeadPage } from "../../lead-pagination.mjs";
import {
  TICKET_STATUS_OPTIONS,
  TICKET_TOPIC_OPTIONS,
  isTicketStatus,
  isTicketTopic,
  parseTicketOrderIdFromNote,
  ticketNoteOrderLikePattern,
  TICKET_NOTE_ANY_ORDER_LIKE,
  ticketStatusLabel,
  ticketTopicLabel,
} from "../../support-ticket-admin.mjs";
import { AdminShell } from "../admin-shell";
import { parseAdminCustomerId, parseAdminOrderId, adminCustomerListHref } from "../../admin-customer-query.mjs";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Destek Kayıtları | Avcı Yönetim",
  robots: { index: false, follow: false },
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Istanbul",
  }).format(new Date(value));
}

export default async function SupportTicketsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await requireAdminUser("/yonetim/destek");
  if (!admin.authorized || !admin.user) {
    return (
      <main className="admin-access-page">
        <section>
          <span className="admin-lock" aria-hidden="true">×</span>
          <span className="kicker kicker-light">YETKİLİ ERİŞİMİ</span>
          <h1>Bu hesap destek kayıtlarını göremez.</h1>
          <p>Giriş yaptığınız <strong>{admin.user?.email}</strong> adresi yönetici izin listesinde bulunmuyor.</p>
          <div>
            <Link className="button button-primary" href="/">Ana sayfaya dön</Link>
            <a className="button button-ghost" href={chatGPTSignOutPath("/yonetim/destek")}>Farklı hesapla giriş yap</a>
          </div>
        </section>
      </main>
    );
  }

  const params = await searchParams;
  const search = normalizeLeadSearch(firstValue(params.q));
  const requestedStatus = firstValue(params.status) ?? "all";
  const requestedTopic = firstValue(params.topic) ?? "all";
  const status = isTicketStatus(requestedStatus) ? requestedStatus : "all";
  const topic = isTicketTopic(requestedTopic) ? requestedTopic : "all";
  const requestedPage = parseLeadPage(firstValue(params.page) ?? "1");
  const customerId = parseAdminCustomerId(firstValue(params.musteri));
  const orderId = parseAdminOrderId(firstValue(params.siparis));
  const orderPattern = ticketNoteOrderLikePattern(orderId);
  const missingOrder = !orderId && firstValue(params.eksik) === "siparis";

  const conditions: SQL[] = [];
  if (status !== "all") conditions.push(eq(supportTickets.status, status));
  if (topic !== "all") conditions.push(eq(supportTickets.topic, topic));
  if (customerId) conditions.push(eq(supportTickets.customerId, customerId));
  if (orderPattern) conditions.push(sql`${supportTickets.note} LIKE ${orderPattern} ESCAPE '\\'`);
  if (missingOrder) conditions.push(sql`${supportTickets.note} NOT LIKE ${TICKET_NOTE_ANY_ORDER_LIKE} ESCAPE '\\'`);
  if (search) {
    const pattern = `%${escapeLeadLike(search)}%`;
    const searchCondition = or(
      sql`${supportTickets.subject} LIKE ${pattern} ESCAPE '\\'`,
      sql`${customers.name} LIKE ${pattern} ESCAPE '\\'`,
      sql`${customers.company} LIKE ${pattern} ESCAPE '\\'`,
    );
    if (searchCondition) conditions.push(searchCondition);
  }
  const where = conditions.length ? and(...conditions) : undefined;

  let rows: Array<{
    id: number;
    customerId: number;
    topic: string;
    subject: string;
    status: string;
    note: string;
    createdAt: string;
    customerName: string | null;
    customerCompany: string | null;
  }> = [];
  let summary: Array<{ status: string; count: number }> = [];
  let totalMatches = 0;
  let currentPage = requestedPage;
  let scopedCustomerName = "";
  let databaseFailed = false;

  try {
    const { getDb } = await import("../../../db");
    const db = getDb();
    const [resultSummary, resultTotal, scopedRows] = await Promise.all([
      db.select({ status: supportTickets.status, count: sql<number>`count(*)` }).from(supportTickets).groupBy(supportTickets.status),
      db.select({ count: sql<number>`count(*)` })
        .from(supportTickets)
        .leftJoin(customers, eq(supportTickets.customerId, customers.id))
        .where(where),
      customerId
        ? db.select({ id: customers.id, name: customers.name }).from(customers).where(eq(customers.id, customerId)).limit(1)
        : Promise.resolve([]),
    ]);
    summary = resultSummary;
    totalMatches = Number(resultTotal[0]?.count ?? 0);
    scopedCustomerName = scopedRows[0]?.name ?? "";
    currentPage = clampLeadPage(requestedPage, totalMatches);
    rows = await db
      .select({
        id: supportTickets.id,
        customerId: supportTickets.customerId,
        topic: supportTickets.topic,
        subject: supportTickets.subject,
        status: supportTickets.status,
        note: supportTickets.note,
        createdAt: supportTickets.createdAt,
        customerName: customers.name,
        customerCompany: customers.company,
      })
      .from(supportTickets)
      .leftJoin(customers, eq(supportTickets.customerId, customers.id))
      .where(where)
      .orderBy(desc(supportTickets.createdAt), desc(supportTickets.id))
      .limit(LEAD_PAGE_SIZE)
      .offset((currentPage - 1) * LEAD_PAGE_SIZE);
  } catch (cause) {
    console.error("Support tickets page failed", cause);
    databaseFailed = true;
  }

  if (databaseFailed) {
    return (
      <main className="admin-access-page">
        <section>
          <span className="admin-lock" aria-hidden="true">!</span>
          <span className="kicker kicker-light">VERİTABANI HAZIR DEĞİL</span>
          <h1>Destek kayıtları şu anda açılamıyor.</h1>
          <Link className="button button-primary" href="/yonetim">Panele dön</Link>
        </section>
      </main>
    );
  }

  const counts = Object.fromEntries(summary.map((item) => [item.status, Number(item.count)]));
  const totalPages = getLeadTotalPages(totalMatches);
  const pageHref = (page: number) => adminCustomerListHref("/yonetim/destek", customerId, {
    q: search,
    status: status !== "all" ? status : "",
    topic: topic !== "all" ? topic : "",
    siparis: orderId || "",
    eksik: missingOrder ? "siparis" : "",
    page: page > 1 ? page : "",
  });
  const clearHref = adminCustomerListHref("/yonetim/destek", customerId, { siparis: orderId || "" });
  const hasExtraFilter = Boolean(search || status !== "all" || topic !== "all" || missingOrder);
  const hasScope = Boolean(customerId || orderId);
  const title = orderId
    ? `Sipariş #${orderId} destek kayıtları`
    : customerId
      ? (scopedCustomerName ? `${scopedCustomerName} destek kayıtları` : "Müşteri destek kayıtları")
      : "Destek kayıtları";
  const backHref = orderId
    ? `/yonetim/siparisler/${orderId}`
    : customerId
      ? `/yonetim/musteriler/${customerId}`
      : "/yonetim";
  const backLabel = orderId ? "Siparişe dön" : customerId ? "Müşteri kartına dön" : "Panele dön";
  const createHref = adminCustomerListHref("/yonetim/destek/yeni", customerId, { siparis: orderId || "" });

  return (
    <AdminShell current="destek" displayName={admin.user.displayName}>
      <section className="admin-main">
        <header className="admin-heading">
          <div>
            <span className="kicker">AVCI YÖNETİM</span>
            <h1>{title}</h1>
            <Link className="admin-back-link" href={backHref}>{backLabel}</Link>
          </div>
          <div className="admin-heading-actions">
            <p>Altyapı / modül kullanan işletmenin destek talebi. Mağaza iadesi veya kargo şikâyeti değil.</p>
            <Link href={createHref}>Yeni kayıt</Link>
          </div>
        </header>

        <form action={withBasePath("/yonetim/destek")} method="get">
          <fieldset className="admin-filters is-simple">
            <legend className="visually-hidden">Destek listesini filtrele</legend>
            {customerId ? <input type="hidden" name="musteri" value={customerId} /> : null}
            {orderId ? <input type="hidden" name="siparis" value={orderId} /> : null}
            <label><span>Ara</span><input name="q" type="search" defaultValue={search} placeholder="Konu, müşteri veya firma" /></label>
            <label>
              <span>Başlık</span>
              <select name="topic" defaultValue={topic}>
                <option value="all">Tüm başlıklar</option>
                {TICKET_TOPIC_OPTIONS.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
              </select>
            </label>
            <label>
              <span>Durum</span>
              <select name="status" defaultValue={status}>
                <option value="all">Tüm durumlar</option>
                {TICKET_STATUS_OPTIONS.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
              </select>
            </label>
            {orderId ? null : (
              <label>
                <span>Sipariş</span>
                <select name="eksik" defaultValue={missingOrder ? "siparis" : "all"}>
                  <option value="all">Tümü</option>
                  <option value="siparis">Sipariş işareti yok</option>
                </select>
              </label>
            )}
            <button type="submit">Filtrele</button>
            {(hasExtraFilter || hasScope) && <Link href={hasExtraFilter ? clearHref : "/yonetim/destek"}>{hasExtraFilter ? "Temizle" : "Tüm kayıtlar"}</Link>}
          </fieldset>
        </form>

        <div className="admin-stats">
          <article><small>Toplam</small><strong>{summary.reduce((sum, item) => sum + Number(item.count), 0)}</strong><span>destek kaydı</span></article>
          <article><small>Açık</small><strong>{counts.open ?? 0}</strong><span><Link href={adminCustomerListHref("/yonetim/destek", customerId, { siparis: orderId || "", eksik: missingOrder ? "siparis" : "", topic: topic !== "all" ? topic : "", status: "open" })}>işleniyor</Link></span></article>
          <article><small>Bekleyen</small><strong>{counts.waiting ?? 0}</strong><span><Link href={adminCustomerListHref("/yonetim/destek", customerId, { siparis: orderId || "", eksik: missingOrder ? "siparis" : "", topic: topic !== "all" ? topic : "", status: "waiting" })}>yanıt bekliyor</Link></span></article>
          <article><small>Eşleşen</small><strong>{totalMatches}</strong><span>filtre sonucu</span></article>
        </div>

        {rows.length ? (
          <div className="lead-table-wrap">
            <table className="lead-table">
              <caption className="visually-hidden">Destek kayıtları</caption>
              <thead><tr><th scope="col">Konu</th><th scope="col">Müşteri</th><th scope="col">Başlık</th><th scope="col">Durum</th><th scope="col">Kayıt</th></tr></thead>
              <tbody>
                {rows.map((item) => {
                  const relatedOrderId = parseTicketOrderIdFromNote(item.note);
                  return (
                  <tr key={item.id}>
                    <th scope="row">
                      <Link className="lead-detail-link" href={`/yonetim/destek/${item.id}`}>{item.subject}</Link>
                      {relatedOrderId ? <small><Link href={`/yonetim/siparisler/${relatedOrderId}`}>Sipariş #{relatedOrderId}</Link></small> : (item.customerId ? <small><Link href={`/yonetim/siparisler/yeni?musteri=${item.customerId}`}>Sipariş bağla</Link></small> : null)}
                    </th>
                    <td>
                      {item.customerId
                        ? <Link href={`/yonetim/musteriler/${item.customerId}`}>{item.customerName || "Müşteri silinmiş"}</Link>
                        : (item.customerName || "Müşteri silinmiş")}
                      <small>{item.customerCompany || "Firma belirtilmedi"}</small>
                    </td>
                    <td><span className="lead-interest">{ticketTopicLabel(item.topic)}</span></td>
                    <td>{ticketStatusLabel(item.status)}</td>
                    <td><time dateTime={item.createdAt}>{formatDate(item.createdAt)}</time></td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-empty">
            <h2>{search || status !== "all" || topic !== "all" || hasScope || missingOrder ? "Eşleşen kayıt yok." : "Henüz destek kaydı yok."}</h2>
            <p>{search || status !== "all" || topic !== "all" || hasScope || missingOrder ? "Filtreleri değiştirin." : "Önce müşteri ekleyin, sonra destek kaydı açın."}</p>
            <Link className="button button-primary" href={createHref}>İlk kaydı aç</Link>
          </div>
        )}

        {totalMatches > 0 && (
          <nav className="admin-pagination" aria-label="Destek sayfaları">
            {currentPage > 1 ? <Link href={pageHref(currentPage - 1)}>Önceki</Link> : <span />}
            <p>Sayfa <strong>{Math.min(currentPage, totalPages)}</strong> / {totalPages}</p>
            {currentPage < totalPages ? <Link href={pageHref(currentPage + 1)}>Sonraki</Link> : <span />}
          </nav>
        )}
      </section>
    </AdminShell>
  );
}
