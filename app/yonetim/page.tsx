import type { Metadata } from "next";
import Link from "next/link";
import { and, desc, eq, inArray, ne, notExists, sql } from "drizzle-orm";
import {
  brands,
  campaigns,
  categories,
  coupons,
  customers,
  integrations,
  leads,
  modules,
  packages,
  products,
  softwareInvoices,
  softwareOrders,
  supportTickets,
} from "../../db/schema";
import { chatGPTSignOutPath } from "../chatgpt-auth";
import { requireAdminUser } from "../admin-auth";
import { TICKET_NOTE_ANY_ORDER_LIKE } from "../support-ticket-admin.mjs";
import { customerIdByNormalizedEmail, matchLeadToCustomerId } from "../customer-record.mjs";
import { normalizeEmailAddress } from "../email-normalization.mjs";
import { AdminShell } from "./admin-shell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kontrol Merkezi | Avcı E-Ticaret Yönetim",
  robots: { index: false, follow: false },
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Istanbul",
  }).format(new Date(value));
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(cents);
}

export default async function AdminHomePage() {
  const admin = await requireAdminUser("/yonetim");

  if (!admin.authorized || !admin.user) {
    return (
      <main className="admin-access-page">
        <section>
          <span className="admin-lock" aria-hidden="true">×</span>
          <span className="kicker kicker-light">YETKİLİ ERİŞİMİ</span>
          <h1>Bu hesap yönetim paneline yetkili değil.</h1>
          <p>Giriş yaptığınız <strong>{admin.user?.email}</strong> adresi yönetici izin listesinde bulunmuyor.</p>
          <div>
            <Link className="button button-primary" href="/">Ana sayfaya dön</Link>
            <a className="button button-ghost" href={chatGPTSignOutPath("/yonetim")}>Farklı hesapla giriş yap</a>
          </div>
        </section>
      </main>
    );
  }

  let total = 0;
  let fresh = 0;
  let contacted = 0;
  let qualified = 0;
  let closed = 0;
  let customersTotal = 0;
  let ordersTotal = 0;
  let openTickets = 0;
  let waitingTickets = 0;
  let invoicesTotal = 0;
  let trialCustomers = 0;
  let draftOrders = 0;
  let draftInvoices = 0;
  let customersWithoutOrders = 0;
  let invoicesWithoutOrders = 0;
  let ordersWithoutInvoices = 0;
  let ticketsWithoutOrders = 0;
  let leadsWithoutCustomers = 0;
  let productsTotal = 0;
  let criticalProductsTotal = 0;
  let categoriesTotal = 0;
  let brandsTotal = 0;
  let activeCampaignsTotal = 0;
  let activeCouponsTotal = 0;
  let activeIntegrationsTotal = 0;
  let criticalProductsList: Array<typeof products.$inferSelect> = [];
  let recent: Array<typeof leads.$inferSelect & { customerId: number }> = [];
  let recentOrders: Array<{ id: number; createdAt: string; customerName: string | null; itemName: string; status: string }> = [];
  let databaseFailed = false;

  try {
    const { getDb } = await import("../../db");
    const db = getDb();
    const [
      totals,
      newest,
      customerRows,
      orderRows,
      ticketStatusRows,
      invoiceRows,
      newestOrders,
      trialRows,
      draftOrderRows,
      draftInvoiceRows,
      customersWithoutOrderRows,
      invoicesWithoutOrderRows,
      ordersWithoutInvoiceRows,
      ticketsWithoutOrderRows,
      leadsWithoutCustomerRows,
      productCountRows,
      criticalProductRows,
      categoryCountRows,
      brandCountRows,
      campaignCountRows,
      couponCountRows,
      integrationCountRows,
      criticalProductListRows,
    ] = await Promise.all([
      db.select({ status: leads.status, count: sql<number>`count(*)` }).from(leads).groupBy(leads.status),
      db.select().from(leads).orderBy(desc(leads.createdAt), desc(leads.id)).limit(6),
      db.select({ count: sql<number>`count(*)` }).from(customers),
      db.select({ count: sql<number>`count(*)` }).from(softwareOrders),
      db.select({ status: supportTickets.status, count: sql<number>`count(*)` }).from(supportTickets).groupBy(supportTickets.status),
      db.select({ count: sql<number>`count(*)` }).from(softwareInvoices),
      db.select({
        id: softwareOrders.id,
        createdAt: softwareOrders.createdAt,
        customerName: customers.name,
        kind: softwareOrders.kind,
        packageName: packages.name,
        moduleName: modules.name,
        status: softwareOrders.status,
      })
        .from(softwareOrders)
        .leftJoin(customers, eq(softwareOrders.customerId, customers.id))
        .leftJoin(packages, eq(softwareOrders.packageId, packages.id))
        .leftJoin(modules, eq(softwareOrders.moduleId, modules.id))
        .orderBy(desc(softwareOrders.createdAt), desc(softwareOrders.id))
        .limit(6),
      db.select({ count: sql<number>`count(*)` }).from(customers).where(eq(customers.status, "trial")),
      db.select({ count: sql<number>`count(*)` }).from(softwareOrders).where(eq(softwareOrders.status, "draft")),
      db.select({ count: sql<number>`count(*)` }).from(softwareInvoices).where(eq(softwareInvoices.status, "draft")),
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
      db.select({ count: sql<number>`count(*)` }).from(products),
      db.select({ count: sql<number>`count(*)` }).from(products).where(sql`${products.stock} <= ${products.criticalStock}`),
      db.select({ count: sql<number>`count(*)` }).from(categories),
      db.select({ count: sql<number>`count(*)` }).from(brands),
      db.select({ count: sql<number>`count(*)` }).from(campaigns).where(eq(campaigns.status, "active")),
      db.select({ count: sql<number>`count(*)` }).from(coupons).where(eq(coupons.status, "active")),
      db.select({ count: sql<number>`count(*)` }).from(integrations).where(eq(integrations.status, "active")),
      db.select().from(products).where(sql`${products.stock} <= ${products.criticalStock}`).limit(4),
    ]);

    const counts = Object.fromEntries(totals.map((item) => [item.status, Number(item.count)]));
    fresh = counts.new ?? 0;
    contacted = counts.contacted ?? 0;
    qualified = counts.qualified ?? 0;
    closed = counts.closed ?? 0;
    total = totals.reduce((sum, item) => sum + Number(item.count), 0);

    const emails = [...new Set(newest.map((lead) => normalizeEmailAddress(lead.email, 180)).filter(Boolean))];
    let byEmail = new Map<string, number>();
    if (emails.length) {
      const matches = await db.select({ id: customers.id, email: customers.email }).from(customers).where(inArray(customers.email, emails));
      byEmail = customerIdByNormalizedEmail(matches);
    }
    recent = newest.map((lead) => ({ ...lead, customerId: matchLeadToCustomerId(lead, byEmail) }));

    customersTotal = Number(customerRows[0]?.count ?? 0);
    ordersTotal = Number(orderRows[0]?.count ?? 0);
    const ticketCounts = Object.fromEntries(ticketStatusRows.map((item) => [item.status, Number(item.count)]));
    openTickets = ticketCounts.open ?? 0;
    waitingTickets = ticketCounts.waiting ?? 0;
    invoicesTotal = Number(invoiceRows[0]?.count ?? 0);
    trialCustomers = Number(trialRows[0]?.count ?? 0);
    draftOrders = Number(draftOrderRows[0]?.count ?? 0);
    draftInvoices = Number(draftInvoiceRows[0]?.count ?? 0);
    customersWithoutOrders = Number(customersWithoutOrderRows[0]?.count ?? 0);
    invoicesWithoutOrders = Number(invoicesWithoutOrderRows[0]?.count ?? 0);
    ordersWithoutInvoices = Number(ordersWithoutInvoiceRows[0]?.count ?? 0);
    ticketsWithoutOrders = Number(ticketsWithoutOrderRows[0]?.count ?? 0);
    leadsWithoutCustomers = Number(leadsWithoutCustomerRows[0]?.count ?? 0);

    productsTotal = Number(productCountRows[0]?.count ?? 0);
    criticalProductsTotal = Number(criticalProductRows[0]?.count ?? 0);
    categoriesTotal = Number(categoryCountRows[0]?.count ?? 0);
    brandsTotal = Number(brandCountRows[0]?.count ?? 0);
    activeCampaignsTotal = Number(campaignCountRows[0]?.count ?? 0);
    activeCouponsTotal = Number(couponCountRows[0]?.count ?? 0);
    activeIntegrationsTotal = Number(integrationCountRows[0]?.count ?? 0);
    criticalProductsList = criticalProductListRows;

    recentOrders = newestOrders.map((item) => ({
      id: item.id,
      createdAt: item.createdAt,
      customerName: item.customerName,
      itemName: item.kind === "module" ? (item.moduleName || "Modül") : (item.packageName || "Paket"),
      status: item.status,
    }));
  } catch (cause) {
    console.error("Admin home failed", cause);
    databaseFailed = true;
  }

  return (
    <AdminShell current="panel" displayName={admin.user.displayName}>
      <section className="admin-main">
        {/* Welcome Header */}
        <header className="admin-heading" style={{ marginBottom: "28px" }}>
          <div>
            <span className="kicker">KURUMSAL E-TİCARET YÖNETİMİ</span>
            <h1 style={{ fontSize: "clamp(24px, 2.5vw, 36px)", letterSpacing: "-0.04em", margin: "8px 0 4px" }}>
              Kontrol Merkezi
            </h1>
            <p style={{ margin: 0, color: "var(--admin-text-muted)", fontSize: "13px" }}>
              Mağaza operasyonları, ürün kataloğu, sipariş yaşam döngüsü ve müşteri talepleri tek merkezde.
            </p>
          </div>
          <div className="admin-heading-actions" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <Link className="admin-btn admin-btn-secondary" href="/yonetim/istatistik">
              <svg aria-hidden="true" fill="none" height="14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="14">
                <line x1="18" x2="18" y1="20" y2="10" /><line x1="12" x2="12" y1="20" y2="4" /><line x1="6" x2="6" y1="20" y2="14" />
              </svg>
              <span>Raporlar</span>
            </Link>
            <Link className="admin-btn admin-btn-primary" href="/yonetim/urunler/yeni">
              <svg aria-hidden="true" fill="none" height="14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="14">
                <line x1="12" x2="12" y1="5" y2="19" /><line x1="5" x2="19" y1="12" y2="12" />
              </svg>
              <span>Yeni Ürün Ekle</span>
            </Link>
          </div>
        </header>

        {databaseFailed ? (
          <div className="admin-card" style={{ textAlign: "center", padding: "48px 24px" }}>
            <h2 style={{ margin: "0 0 8px" }}>Veritabanı Hazırlanıyor</h2>
            <p style={{ margin: 0, color: "var(--admin-text-muted)" }}>D1 yerel veritabanı şeması ilk çalıştırmada otomatik bağlanacaktır.</p>
          </div>
        ) : (
          <>
            {/* Top Row: Executive KPI Cards */}
            <div className="admin-kpi-grid">
              <div className="admin-kpi-card">
                <div className="admin-kpi-head">
                  <span className="admin-kpi-label">KATALOG & ÜRÜNLER</span>
                  <div className="admin-kpi-icon-wrap">
                    <svg aria-hidden="true" fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    </svg>
                  </div>
                </div>
                <div className="admin-kpi-value">{productsTotal}</div>
                <div className="admin-kpi-footer">
                  {criticalProductsTotal > 0 ? (
                    <span className="admin-kpi-trend admin-kpi-trend--down">
                      ⚠️ {criticalProductsTotal} kritik stok
                    </span>
                  ) : (
                    <span className="admin-kpi-trend admin-kpi-trend--up">
                      ✓ Stoklar yeterli
                    </span>
                  )}
                  <span className="admin-kpi-subtext">· {categoriesTotal} kategori, {brandsTotal} marka</span>
                </div>
              </div>

              <div className="admin-kpi-card">
                <div className="admin-kpi-head">
                  <span className="admin-kpi-label">SİPARİŞLER & TALEPLER</span>
                  <div className="admin-kpi-icon-wrap" style={{ color: "#2563eb" }}>
                    <svg aria-hidden="true" fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18">
                      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                  </div>
                </div>
                <div className="admin-kpi-value">{ordersTotal}</div>
                <div className="admin-kpi-footer">
                  <span className="admin-kpi-trend admin-kpi-trend--up">
                    {fresh} yeni teklif
                  </span>
                  <span className="admin-kpi-subtext">· {draftOrders} taslak sipariş</span>
                </div>
              </div>

              <div className="admin-kpi-card">
                <div className="admin-kpi-head">
                  <span className="admin-kpi-label">MÜŞTERİ PORTFÖYÜ</span>
                  <div className="admin-kpi-icon-wrap" style={{ color: "#7c3aed" }}>
                    <svg aria-hidden="true" fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    </svg>
                  </div>
                </div>
                <div className="admin-kpi-value">{customersTotal}</div>
                <div className="admin-kpi-footer">
                  <span className="admin-kpi-trend admin-kpi-trend--up">
                    {trialCustomers} deneme
                  </span>
                  <span className="admin-kpi-subtext">· {total} toplam başvuru</span>
                </div>
              </div>

              <div className="admin-kpi-card">
                <div className="admin-kpi-head">
                  <span className="admin-kpi-label">PAZARLAMA & ENTEGRASYON</span>
                  <div className="admin-kpi-icon-wrap" style={{ color: "#059669" }}>
                    <svg aria-hidden="true" fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                  </div>
                </div>
                <div className="admin-kpi-value">{activeIntegrationsTotal}</div>
                <div className="admin-kpi-footer">
                  <span className="admin-kpi-trend admin-kpi-trend--up">
                    {activeCampaignsTotal} kampanya
                  </span>
                  <span className="admin-kpi-subtext">· {activeCouponsTotal} aktif kupon</span>
                </div>
              </div>
            </div>

            {/* Quick Operational Filter Bar */}
            <div className="admin-toolbar">
              <div className="admin-toolbar-left">
                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--admin-text-muted)", letterSpacing: "0.06em" }}>HIZLI İŞLEM AKIŞI:</span>
                <Link className="admin-badge admin-badge--neutral" href="/yonetim/urunler">Ürün Kataloğu ({productsTotal})</Link>
                <Link className="admin-badge admin-badge--info" href="/yonetim/siparisler">Siparişler ({ordersTotal})</Link>
                <Link className="admin-badge admin-badge--warning" href="/yonetim/basvurular?status=new">Yeni Başvurular ({fresh})</Link>
                {openTickets > 0 && (
                  <Link className="admin-badge admin-badge--danger" href="/yonetim/destek?status=open">Açık Destek ({openTickets})</Link>
                )}
                <Link className="admin-badge admin-badge--success" href="/yonetim/entegrasyonlar">Entegrasyonlar ({activeIntegrationsTotal})</Link>
              </div>
              <div className="admin-toolbar-right">
                <Link className="admin-card-action" href="/yonetim/loglar">Sistem Günlüğü →</Link>
              </div>
            </div>

            {/* Middle Grid: Main Operations Tables & Critical Stock */}
            <div className="admin-dashboard-row">
              {/* Left Column: Recent Orders & Leads */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <div>
                    <h2 className="admin-card-title">
                      <svg aria-hidden="true" fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18">
                        <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                      </svg>
                      Son Sipariş & Lisans Akışı
                    </h2>
                    <p className="admin-card-subtitle">İşletmelerin aldığı e-ticaret altyapı ve modül siparişleri</p>
                  </div>
                  <Link className="admin-card-action" href="/yonetim/siparisler">Tümünü Gör ({ordersTotal})</Link>
                </div>

                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>SİPARİŞ NO</th>
                        <th>MÜŞTERİ</th>
                        <th>ÜRÜN / MODÜL</th>
                        <th>TARİH</th>
                        <th>DURUM</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.length ? (
                        recentOrders.map((order) => (
                          <tr key={order.id}>
                            <td>
                              <Link href={`/yonetim/siparisler/${order.id}`} style={{ fontWeight: 700, color: "var(--admin-accent)" }}>
                                #{order.id}
                              </Link>
                            </td>
                            <td>
                              <strong>{order.customerName || "Tanımsız Müşteri"}</strong>
                            </td>
                            <td>
                              <span style={{ fontSize: "12px", color: "var(--admin-text-muted)" }}>{order.itemName}</span>
                            </td>
                            <td>
                              <time dateTime={order.createdAt} style={{ fontSize: "11px", color: "var(--admin-text-muted)" }}>
                                {formatDate(order.createdAt)}
                              </time>
                            </td>
                            <td>
                              <span className={`admin-badge ${order.status === "active" ? "admin-badge--success" : order.status === "draft" ? "admin-badge--warning" : "admin-badge--neutral"}`}>
                                {order.status === "active" ? "Aktif" : order.status === "draft" ? "Taslak" : order.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} style={{ textAlign: "center", padding: "28px", color: "var(--admin-text-muted)" }}>
                            Henüz sipariş kaydı bulunmuyor.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column: Critical Stock & Live Attention */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <div>
                    <h2 className="admin-card-title" style={{ color: criticalProductsTotal > 0 ? "#dc2626" : "inherit" }}>
                      <svg aria-hidden="true" fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" x2="12" y1="9" y2="13" /><line x1="12" x2="12.01" y1="17" y2="17" />
                      </svg>
                      Kritik Stok Uyarısı ({criticalProductsTotal})
                    </h2>
                    <p className="admin-card-subtitle">Tükenmek üzere olan ürünler</p>
                  </div>
                  <Link className="admin-card-action" href="/yonetim/urunler">Katalog →</Link>
                </div>

                {criticalProductsList.length ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {criticalProductsList.map((p) => (
                      <div
                        key={p.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "12px",
                          borderRadius: "8px",
                          background: "#fff1f2",
                          border: "1px solid rgba(225, 29, 72, 0.15)",
                        }}
                      >
                        <div>
                          <strong style={{ fontSize: "12.5px", color: "#9f1239", display: "block" }}>{p.name}</strong>
                          <span style={{ fontSize: "11px", color: "#e11d48" }}>SKU: {p.sku || "-"} · Fiyat: {formatPrice(p.price)}</span>
                        </div>
                        <span
                          className="admin-badge admin-badge--danger"
                          style={{ fontSize: "12px", padding: "4px 8px" }}
                        >
                          {p.stock} adet kaldı
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "32px 16px", color: "var(--admin-text-muted)" }}>
                    <span style={{ fontSize: "28px", display: "block", marginBottom: "6px" }}>🎉</span>
                    <strong style={{ color: "var(--admin-text-main)", display: "block" }}>Tüm Stoklar Yeterli Seviyede</strong>
                    <span style={{ fontSize: "12px" }}>Kritik eşiğin altına düşen ürün bulunmuyor.</span>
                  </div>
                )}

                {/* Avcı AI Assist Box */}
                <div
                  style={{
                    marginTop: "20px",
                    padding: "16px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(168, 85, 247, 0.08))",
                    border: "1px solid rgba(168, 85, 247, 0.2)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <span style={{ fontSize: "14px" }}>🤖</span>
                    <strong style={{ fontSize: "12.5px", color: "#6b21a8" }}>Avcı AI Akıllı Asistan</strong>
                  </div>
                  <p style={{ margin: 0, fontSize: "12px", color: "#581c87", lineHeight: 1.5 }}>
                    Katalog açıklamalarını zenginleştirmek, SEO meta etiketleri oluşturmak veya satış analizi yapmak için Tofy asistanınızı kullanabilirsiniz.
                  </p>
                  <Link
                    href="/avcai"
                    style={{
                      display: "inline-block",
                      marginTop: "10px",
                      fontSize: "11.5px",
                      fontWeight: 700,
                      color: "#7c3aed",
                    }}
                  >
                    Avcı AI Sohbetini Başlat →
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom Row: Recent Leads / Sales Opportunities */}
            <div className="admin-card" style={{ marginBottom: "28px" }}>
              <div className="admin-card-header">
                <div>
                  <h2 className="admin-card-title">
                    <svg aria-hidden="true" fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18">
                      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
                      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
                    </svg>
                    Gelen Teklif Başvuruları & Satış Fırsatları
                  </h2>
                  <p className="admin-card-subtitle">Siteden yeni e-ticaret altyapısı veya modül teklifi isteyen müşteriler</p>
                </div>
                <Link className="admin-card-action" href="/yonetim/basvurular">Teklif Masasına Git ({total})</Link>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>BAŞVURU SAHİBİ</th>
                      <th>İLGİLENİLEN ALTYAPI</th>
                      <th>İLETİŞİM</th>
                      <th>TARİH</th>
                      <th>DURUM</th>
                      <th>AKSİYON</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.length ? (
                      recent.map((lead) => (
                        <tr key={lead.id}>
                          <td>
                            <strong>{lead.name}</strong>
                            {lead.company && (
                              <span style={{ display: "block", fontSize: "11px", color: "var(--admin-text-muted)" }}>
                                {lead.company}
                              </span>
                            )}
                          </td>
                          <td>
                            <span className="admin-badge admin-badge--neutral">{lead.interest}</span>
                          </td>
                          <td>
                            <div style={{ fontSize: "12px" }}>
                              <div>{lead.email}</div>
                              <span style={{ color: "var(--admin-text-muted)", fontSize: "11px" }}>{lead.phone}</span>
                            </div>
                          </td>
                          <td>
                            <time dateTime={lead.createdAt} style={{ fontSize: "11px", color: "var(--admin-text-muted)" }}>
                              {formatDate(lead.createdAt)}
                            </time>
                          </td>
                          <td>
                            <span className={`admin-badge ${lead.status === "new" ? "admin-badge--warning" : lead.status === "contacted" ? "admin-badge--info" : lead.status === "qualified" ? "admin-badge--success" : "admin-badge--neutral"}`}>
                              {lead.status === "new" ? "Yeni" : lead.status === "contacted" ? "İletişimde" : lead.status === "qualified" ? "Fırsat" : "Kapatıldı"}
                            </span>
                          </td>
                          <td>
                            <Link
                              className="admin-btn admin-btn-secondary admin-btn-sm"
                              href={lead.customerId ? `/yonetim/basvurular/${lead.id}` : `/yonetim/musteriler/yeni?basvuru=${lead.id}`}
                            >
                              {lead.customerId ? "İncele" : "Müşteriye Dönüştür"}
                            </Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} style={{ textAlign: "center", padding: "28px", color: "var(--admin-text-muted)" }}>
                          Henüz teklif başvurusu bulunmuyor.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </section>
    </AdminShell>
  );
}

