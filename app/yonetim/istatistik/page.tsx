import type { Metadata } from "next";
import Link from "next/link";
import { and, desc, eq, gte, lt, lte, ne, notExists, sql } from "drizzle-orm";
import { customers, leads, siteVisits, softwareInvoices, softwareOrders, supportTickets } from "../../../db/schema";
import { chatGPTSignOutPath } from "../../chatgpt-auth";
import { requireAdminUser } from "../../admin-auth";
import { parseLeadDateRange } from "../../lead-date-filter.mjs";
import { istanbulCalendarDay, lastIstanbulDays } from "../../site-visit.mjs";
import { AdminShell } from "../admin-shell";
import { TICKET_NOTE_ANY_ORDER_LIKE } from "../../support-ticket-admin.mjs";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "İstatistik | Avcı Yönetim",
  robots: { index: false, follow: false },
};

function pathLabel(path: string) {
  return path === "/" ? "Ana sayfa" : path;
}

function referrerLabel(host: string) {
  return host || "Doğrudan / iç geçiş";
}

function formatDayLabel(day: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "short",
    timeZone: "Europe/Istanbul",
  }).format(new Date(`${day}T12:00:00+03:00`));
}

function rateLabel(part: number, whole: number) {
  if (!whole) return "—";
  return `${((part / whole) * 100).toFixed(1).replace(".", ",")}%`;
}

export default async function AdminStatsPage() {
  const admin = await requireAdminUser("/yonetim/istatistik");

  if (!admin.authorized || !admin.user) {
    return (
      <main className="admin-access-page">
        <section>
          <span className="admin-lock" aria-hidden="true">×</span>
          <span className="kicker kicker-light">YETKİLİ ERİŞİMİ</span>
          <h1>Bu hesap istatistikleri göremez.</h1>
          <p>Giriş yaptığınız <strong>{admin.user?.email}</strong> adresi yönetici izin listesinde bulunmuyor.</p>
          <div>
            <Link className="button button-primary" href="/">Ana sayfaya dön</Link>
            <a className="button button-ghost" href={chatGPTSignOutPath("/yonetim/istatistik")}>Farklı hesapla giriş yap</a>
          </div>
        </section>
      </main>
    );
  }

  const today = istanbulCalendarDay();
  const weekDays = lastIstanbulDays(7);
  const weekFrom = weekDays[0];
  const todayRange = parseLeadDateRange(today, today);
  const weekRange = parseLeadDateRange(weekFrom, today);

  let todayViews = 0;
  let todayVisitors = 0;
  let weekViews = 0;
  let weekVisitors = 0;
  let todayLeads = 0;
  let weekLeads = 0;
  let qualifiedLeads = 0;
  let customersTotal = 0;
  let weekCustomers = 0;
  let ordersTotal = 0;
  let draftOrders = 0;
  let invoicesTotal = 0;
  let draftInvoices = 0;
  let openTickets = 0;
  let waitingTickets = 0;
  let customersWithoutOrders = 0;
  let invoicesWithoutOrders = 0;
  let ordersWithoutInvoices = 0;
  let ticketsWithoutOrders = 0;
  let leadsWithoutCustomers = 0;
  let daily: Array<{ day: string; views: number; visitors: number }> = weekDays.map((day) => ({ day, views: 0, visitors: 0 }));
  let topPaths: Array<{ path: string; views: number; visitors: number }> = [];
  let topReferrers: Array<{ host: string; views: number }> = [];
  let databaseFailed = false;

  try {
    const { getDb } = await import("../../../db");
    const db = getDb();
    const weekWhere = and(gte(siteVisits.day, weekFrom), lte(siteVisits.day, today));
    const [
      todayViewRows,
      todayVisitorRows,
      weekViewRows,
      weekVisitorRows,
      todayLeadRows,
      weekLeadRows,
      qualifiedLeadRows,
      customerRows,
      weekCustomerRows,
      orderRows,
      draftOrderRows,
      invoiceRows,
      draftInvoiceRows,
      ticketStatusRows,
      customersWithoutOrderRows,
      invoicesWithoutOrderRows,
      ordersWithoutInvoiceRows,
      ticketsWithoutOrderRows,
      leadsWithoutCustomerRows,
      dailyRows,
      pathRows,
      referrerRows,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(siteVisits).where(eq(siteVisits.day, today)),
      db.select({ count: sql<number>`count(distinct ${siteVisits.visitorKey})` }).from(siteVisits).where(eq(siteVisits.day, today)),
      db.select({ count: sql<number>`count(*)` }).from(siteVisits).where(weekWhere),
      db.select({ count: sql<number>`count(distinct ${siteVisits.visitorKey})` }).from(siteVisits).where(weekWhere),
      db.select({ count: sql<number>`count(*)` }).from(leads).where(and(gte(leads.createdAt, todayRange.startInclusive), lt(leads.createdAt, todayRange.endExclusive))),
      db.select({ count: sql<number>`count(*)` }).from(leads).where(and(gte(leads.createdAt, weekRange.startInclusive), lt(leads.createdAt, weekRange.endExclusive))),
      db.select({ count: sql<number>`count(*)` }).from(leads).where(eq(leads.status, "qualified")),
      db.select({ count: sql<number>`count(*)` }).from(customers),
      db.select({ count: sql<number>`count(*)` }).from(customers).where(and(gte(customers.createdAt, weekRange.startInclusive), lt(customers.createdAt, weekRange.endExclusive))),
      db.select({ count: sql<number>`count(*)` }).from(softwareOrders),
      db.select({ count: sql<number>`count(*)` }).from(softwareOrders).where(eq(softwareOrders.status, "draft")),
      db.select({ count: sql<number>`count(*)` }).from(softwareInvoices),
      db.select({ count: sql<number>`count(*)` }).from(softwareInvoices).where(eq(softwareInvoices.status, "draft")),
      db.select({ status: supportTickets.status, count: sql<number>`count(*)` }).from(supportTickets).groupBy(supportTickets.status),
      db.select({ count: sql<number>`count(*)` }).from(customers).where(notExists(
        db.select({ id: softwareOrders.id }).from(softwareOrders).where(eq(softwareOrders.customerId, customers.id)),
      )),
      db.select({ count: sql<number>`count(*)` }).from(softwareInvoices).where(sql`${softwareInvoices.orderId} is null`),
      db.select({ count: sql<number>`count(*)` }).from(softwareOrders).where(notExists(
        db.select({ id: softwareInvoices.id }).from(softwareInvoices).where(eq(softwareInvoices.orderId, softwareOrders.id)),
      )),
      db.select({ count: sql<number>`count(*)` }).from(supportTickets).where(and(
        ne(supportTickets.status, "closed"),
        sql`${supportTickets.note} NOT LIKE ${TICKET_NOTE_ANY_ORDER_LIKE} ESCAPE '\\'`,
      )),
      db.select({ count: sql<number>`count(*)` }).from(leads).where(and(
        ne(leads.status, "closed"),
        notExists(db.select({ id: customers.id }).from(customers).where(eq(customers.email, leads.email))),
      )),
      db.select({
        day: siteVisits.day,
        views: sql<number>`count(*)`,
        visitors: sql<number>`count(distinct ${siteVisits.visitorKey})`,
      }).from(siteVisits).where(weekWhere).groupBy(siteVisits.day),
      db.select({
        path: siteVisits.path,
        views: sql<number>`count(*)`,
        visitors: sql<number>`count(distinct ${siteVisits.visitorKey})`,
      }).from(siteVisits).where(weekWhere).groupBy(siteVisits.path).orderBy(desc(sql`count(*)`)).limit(8),
      db.select({
        host: siteVisits.referrerHost,
        views: sql<number>`count(*)`,
      }).from(siteVisits).where(and(weekWhere, ne(siteVisits.referrerHost, ""))).groupBy(siteVisits.referrerHost).orderBy(desc(sql`count(*)`)).limit(6),
    ]);

    todayViews = Number(todayViewRows[0]?.count ?? 0);
    todayVisitors = Number(todayVisitorRows[0]?.count ?? 0);
    weekViews = Number(weekViewRows[0]?.count ?? 0);
    weekVisitors = Number(weekVisitorRows[0]?.count ?? 0);
    todayLeads = Number(todayLeadRows[0]?.count ?? 0);
    weekLeads = Number(weekLeadRows[0]?.count ?? 0);
    qualifiedLeads = Number(qualifiedLeadRows[0]?.count ?? 0);
    customersTotal = Number(customerRows[0]?.count ?? 0);
    weekCustomers = Number(weekCustomerRows[0]?.count ?? 0);
    ordersTotal = Number(orderRows[0]?.count ?? 0);
    draftOrders = Number(draftOrderRows[0]?.count ?? 0);
    invoicesTotal = Number(invoiceRows[0]?.count ?? 0);
    draftInvoices = Number(draftInvoiceRows[0]?.count ?? 0);
    const ticketCounts = Object.fromEntries(ticketStatusRows.map((row) => [row.status, Number(row.count)]));
    openTickets = ticketCounts.open ?? 0;
    waitingTickets = ticketCounts.waiting ?? 0;
    customersWithoutOrders = Number(customersWithoutOrderRows[0]?.count ?? 0);
    invoicesWithoutOrders = Number(invoicesWithoutOrderRows[0]?.count ?? 0);
    ordersWithoutInvoices = Number(ordersWithoutInvoiceRows[0]?.count ?? 0);
    ticketsWithoutOrders = Number(ticketsWithoutOrderRows[0]?.count ?? 0);
    leadsWithoutCustomers = Number(leadsWithoutCustomerRows[0]?.count ?? 0);
    const dailyMap = Object.fromEntries(dailyRows.map((row) => [row.day, { views: Number(row.views), visitors: Number(row.visitors) }]));
    daily = weekDays.map((day) => ({ day, views: dailyMap[day]?.views ?? 0, visitors: dailyMap[day]?.visitors ?? 0 }));
    topPaths = pathRows.map((row) => ({ path: row.path, views: Number(row.views), visitors: Number(row.visitors) }));
    topReferrers = referrerRows.map((row) => ({ host: row.host, views: Number(row.views) }));
  } catch (cause) {
    console.error("Admin stats page failed", cause);
    databaseFailed = true;
  }

  const maxViews = Math.max(1, ...daily.map((item) => item.views));

  return (
    <AdminShell current="istatistik" displayName={admin.user.displayName}>
      <section className="admin-main">
        <header className="admin-heading">
          <div>
            <span className="kicker">AVCI YÖNETİM</span>
            <h1>İstatistik</h1>
            <Link className="admin-back-link" href="/yonetim">Panele dön</Link>
          </div>
          <div className="admin-heading-actions">
            <p>Tanıtım sitesi ziyareti ve yazılım hunisi. Mağaza siparişi değil. IP saklanmaz; yönetim sayfaları sayılmaz.</p>
            <Link href="/">Siteyi aç</Link>
          </div>
        </header>

        {databaseFailed ? (
          <div className="admin-empty">
            <h2>İstatistikler şu anda açılamıyor.</h2>
            <p>D1 bağlantısı hazır olunca sayılar otomatik dolar.</p>
          </div>
        ) : (
          <>
            <div className="admin-stats">
              <article><small>Bugün kişi</small><strong>{todayVisitors}</strong><span>aynı tarayıcı 1 kişi sayılır</span></article>
              <article><small>Bugün sayfa</small><strong>{todayViews}</strong><span>açılan tanıtım sayfası</span></article>
              <article><small>7 gün kişi</small><strong>{weekVisitors}</strong><span>{weekViews} sayfa görüntüleme</span></article>
              <article><small>Teklif oranı</small><strong>{rateLabel(todayLeads, todayVisitors)}</strong><span>bugün {todayLeads} · 7 gün {weekLeads} · <Link href="/yonetim/basvurular?status=qualified">fırsat {qualifiedLeads}</Link> · <Link href="/yonetim/basvurular?eksik=musteri">müşterisiz {leadsWithoutCustomers}</Link></span></article>
            </div>

            <div className="admin-recent-head">
              <h2>Yazılım hunisi</h2>
              <small>Altyapı satışı; mağaza fişi değil</small>
            </div>
            <div className="admin-stats">
              <article>
                <small>Yazılım müşterisi</small>
                <strong>{customersTotal}</strong>
                <span>7 günde {weekCustomers} yeni · <Link href="/yonetim/musteriler?eksik=siparis">siparişsiz {customersWithoutOrders}</Link></span>
              </article>
              <article>
                <small>Yazılım siparişi</small>
                <strong>{ordersTotal}</strong>
                <span><Link href="/yonetim/siparisler?status=draft">{draftOrders} taslak</Link> · <Link href="/yonetim/siparisler?eksik=fatura">faturasız {ordersWithoutInvoices}</Link></span>
              </article>
              <article>
                <small>Tahsil kaydı</small>
                <strong>{invoicesTotal}</strong>
                <span><Link href="/yonetim/faturalar?status=draft">{draftInvoices} taslak</Link> · <Link href="/yonetim/faturalar?eksik=siparis">siparişsiz {invoicesWithoutOrders}</Link></span>
              </article>
              <article>
                <small>Açık destek</small>
                <strong>{openTickets + waitingTickets}</strong>
                <span>açık {openTickets} · bekleyen {waitingTickets} · <Link href="/yonetim/destek?eksik=siparis">siparişsiz {ticketsWithoutOrders}</Link></span>
              </article>
            </div>

            <div className="admin-chart-card">
              <div className="admin-recent-head">
                <h2>Son 7 gün</h2>
                <small>Sayfa görüntüleme</small>
              </div>
              <div className="admin-chart" role="img" aria-label="Son 7 gün sayfa görüntüleme grafiği">
                {daily.map((item) => (
                  <div className="admin-chart-col" key={item.day}>
                    <span>{item.views}</span>
                    <b className="admin-chart-bar" style={{ height: `${Math.max(8, Math.round((item.views / maxViews) * 140))}px` }} />
                    <small>{formatDayLabel(item.day)}</small>
                  </div>
                ))}
              </div>
            </div>

            <div className="admin-os-grid">
              <article className="admin-rank-card">
                <h2>En çok açılan sayfalar</h2>
                {topPaths.length ? (
                  <ol>
                    {topPaths.map((item) => (
                      <li key={item.path}>
                        <strong>{pathLabel(item.path)}</strong>
                        <small>{item.visitors} kişi · {item.views} görüntüleme</small>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p>Henüz sayfa kaydı yok. Ana sayfayı bir kez açınca burada görünür.</p>
                )}
              </article>
              <article className="admin-rank-card">
                <h2>Nereden geldiler</h2>
                {topReferrers.length ? (
                  <ol>
                    {topReferrers.map((item) => (
                      <li key={item.host}>
                        <strong>{referrerLabel(item.host)}</strong>
                        <small>{item.views} görüntüleme</small>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p>Dış siteden gelen henüz yok. Google veya başka siteden tıklanınca burada durur.</p>
                )}
              </article>
            </div>
          </>
        )}
      </section>
    </AdminShell>
  );
}
