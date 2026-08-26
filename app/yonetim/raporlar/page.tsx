import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq, ne, sql } from "drizzle-orm";
import { customers, integrations, modules, softwareInvoices, softwareOrders, supportTickets } from "../../../db/schema";
import { chatGPTSignOutPath } from "../../chatgpt-auth";
import { requireAdminUser } from "../../admin-auth";
import { AdminShell } from "../admin-shell";
import "./reports.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Sağlayıcı Raporları | Avcı E-Ticaret", robots: { index: false, follow: false } };

const formatDate = (value: string) => new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeZone: "Europe/Istanbul" }).format(new Date(value));
const statusLabel: Record<string, string> = { active: "Aktif", draft: "Taslak", planned: "Planlandı", setup: "Kurulumda", paused: "Duraklatıldı", expired: "Süresi doldu", paid: "Ödendi", pending: "Bekliyor", overdue: "Gecikmiş", cancelled: "İptal", open: "Açık", waiting: "Beklemede", closed: "Kapalı" };

export default async function ReportsPage() {
  const admin = await requireAdminUser("/yonetim/raporlar");
  if (!admin.authorized || !admin.user) return <main className="admin-access-page"><section><span className="admin-lock" aria-hidden="true">×</span><span className="kicker kicker-light">YETKİLİ ERİŞİMİ</span><h1>Bu hesap raporları göremez.</h1><p>Giriş yaptığınız <strong>{admin.user?.email}</strong> adresi yetkili izin listesinde bulunmuyor.</p><div><Link className="button button-primary" href="/">Ana sayfaya dön</Link><a className="button button-ghost" href={chatGPTSignOutPath("/yonetim/raporlar")}>Farklı hesapla giriş yap</a></div></section></main>;

  const { getDb } = await import("../../../db");
  const db = getDb();
  const [customerRows, orderRows, invoiceRows, ticketRows, activeModulesRow, activeIntegrationsRow, recentInvoices] = await Promise.all([
    db.select({ status: customers.status, count: sql<number>`count(*)` }).from(customers).groupBy(customers.status),
    db.select({ status: softwareOrders.status, count: sql<number>`count(*)` }).from(softwareOrders).groupBy(softwareOrders.status),
    db.select({ status: softwareInvoices.status, count: sql<number>`count(*)` }).from(softwareInvoices).groupBy(softwareInvoices.status),
    db.select({ status: supportTickets.status, count: sql<number>`count(*)` }).from(supportTickets).groupBy(supportTickets.status),
    db.select({ count: sql<number>`count(*)` }).from(modules).where(eq(modules.status, "active")),
    db.select({ count: sql<number>`count(*)` }).from(integrations).where(eq(integrations.status, "active")),
    db.select({ id: softwareInvoices.id, title: softwareInvoices.title, amountNote: softwareInvoices.amountNote, status: softwareInvoices.status, createdAt: softwareInvoices.createdAt, customer: customers.company }).from(softwareInvoices).leftJoin(customers, eq(softwareInvoices.customerId, customers.id)).orderBy(desc(softwareInvoices.createdAt)).limit(7),
  ]);

  const sum = (rows: Array<{ count: number }>) => rows.reduce((total, row) => total + Number(row.count || 0), 0);
  const countStatus = (rows: Array<{ status: string; count: number }>, status: string) => Number(rows.find((row) => row.status === status)?.count || 0);
  const customerTotal = sum(customerRows);
  const activeCustomers = countStatus(customerRows, "active");
  const assignmentTotal = sum(orderRows);
  const activeAssignments = countStatus(orderRows, "active");
  const invoiceTotal = sum(invoiceRows);
  const pendingInvoices = invoiceRows.filter((row) => !["paid", "cancelled"].includes(row.status)).reduce((total, row) => total + Number(row.count), 0);
  const openTickets = ticketRows.filter((row) => row.status !== "closed").reduce((total, row) => total + Number(row.count), 0);
  const catalogTotal = Number(activeModulesRow[0]?.count || 0) + Number(activeIntegrationsRow[0]?.count || 0);
  const assignmentRate = assignmentTotal ? Math.round((activeAssignments / assignmentTotal) * 100) : 0;
  const customerRate = customerTotal ? Math.round((activeCustomers / customerTotal) * 100) : 0;

  return <AdminShell current="raporlar" displayName={admin.user.displayName}><section className="admin-main reports-page">
    <header className="admin-heading reports-heading"><div><span className="kicker">SAĞLAYICI ANALİTİĞİ</span><h1>Gelir ve lisans görünümü</h1><p>Avcı E‑Ticaret müşteri portföyünü, lisans atamalarını, fatura durumlarını ve destek yükünü gerçek sistem kayıtlarıyla izleyin.</p></div><div className="admin-heading-actions"><Link className="admin-btn admin-btn-secondary" href="/yonetim/faturalar">Faturaları aç</Link><Link className="admin-btn admin-btn-primary" href="/yonetim/sistemler">Müşteri sistemleri</Link></div></header>

    <aside className="reports-trust-strip"><span><i />D1 canlı verisi</span><p>Bu raporda tahmini ciro, sahte büyüme yüzdesi veya mağaza stok verisi kullanılmaz.</p><small>Son görünüm: {new Intl.DateTimeFormat("tr-TR", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Istanbul" }).format(new Date())}</small></aside>

    <div className="admin-kpi-grid reports-kpi-grid">
      <ReportMetric label="MÜŞTERİ PORTFÖYÜ" value={customerTotal} detail={`${activeCustomers} aktif müşteri`} rate={customerRate} tone="mint" />
      <ReportMetric label="LİSANS & HİZMET" value={assignmentTotal} detail={`${activeAssignments} aktif atama`} rate={assignmentRate} tone="cyan" />
      <ReportMetric label="BEKLEYEN FATURA" value={pendingInvoices} detail={`${invoiceTotal} toplam fatura kaydı`} tone="lime" />
      <ReportMetric label="DESTEK YÜKÜ" value={openTickets} detail="açık veya bekleyen talep" tone="ink" />
    </div>

    <div className="reports-main-grid">
      <section className="admin-card reports-distribution"><div className="admin-card-header"><div><span className="kicker">LİSANS DAĞILIMI</span><h2 className="admin-card-title">Atama sağlığı</h2><p className="admin-card-subtitle">Paket ve modül atamalarının mevcut durum dağılımı</p></div><strong>{assignmentRate}%<small>aktiflik</small></strong></div><StatusBars rows={orderRows} total={assignmentTotal} /></section>
      <section className="admin-card reports-catalog"><div className="admin-card-header"><div><span className="kicker">ÜRÜN KATALOĞU</span><h2 className="admin-card-title">Yayınlanan yetenekler</h2></div></div><div><Link href="/yonetim/moduller"><span>Aktif modüller</span><strong>{Number(activeModulesRow[0]?.count || 0)}</strong></Link><Link href="/yonetim/entegrasyonlar"><span>Yayınlanan entegrasyonlar</span><strong>{Number(activeIntegrationsRow[0]?.count || 0)}</strong></Link><Link href="/yonetim/siparisler"><span>Toplam lisans ataması</span><strong>{assignmentTotal}</strong></Link></div><footer><span>Toplam yayınlanan katalog</span><strong>{catalogTotal}</strong></footer></section>
    </div>

    <div className="reports-secondary-grid">
      <section className="admin-card"><div className="admin-card-header"><div><h2 className="admin-card-title">Fatura durumları</h2><p className="admin-card-subtitle">Tahsilat kayıtlarının operasyonel dağılımı</p></div><Link className="admin-card-action" href="/yonetim/faturalar">Tümünü aç →</Link></div><StatusBars rows={invoiceRows} total={invoiceTotal} /></section>
      <section className="admin-card reports-invoices"><div className="admin-card-header"><div><h2 className="admin-card-title">Son fatura kayıtları</h2><p className="admin-card-subtitle">En son oluşturulan müşteri faturaları</p></div></div>{recentInvoices.length ? <div>{recentInvoices.map((invoice) => <Link href={`/yonetim/faturalar/${invoice.id}`} key={invoice.id}><span><strong>{invoice.customer || "Müşteri kaydı"}</strong><small>{invoice.title} · {formatDate(invoice.createdAt)}</small></span><span><b className={`report-status is-${invoice.status}`}>{statusLabel[invoice.status] || invoice.status}</b><small>{invoice.amountNote || "Tutar belirtilmedi"}</small></span></Link>)}</div> : <p className="reports-empty">Henüz fatura kaydı bulunmuyor.</p>}</section>
    </div>
  </section></AdminShell>;
}

function ReportMetric({ label, value, detail, rate, tone }: { label: string; value: number; detail: string; rate?: number; tone: string }) {
  return <article className={`admin-kpi-card report-metric is-${tone}`}><header><span>{label}</span>{typeof rate === "number" && <b>{rate}% aktif</b>}</header><strong>{value}</strong><p>{detail}</p><i><b style={{ width: `${typeof rate === "number" ? Math.max(3, rate) : 100}%` }} /></i></article>;
}

function StatusBars({ rows, total }: { rows: Array<{ status: string; count: number }>; total: number }) {
  if (!rows.length) return <p className="reports-empty">Henüz raporlanacak kayıt bulunmuyor.</p>;
  return <div className="report-status-bars">{rows.map((row) => { const count = Number(row.count || 0); const rate = total ? Math.round((count / total) * 100) : 0; return <div key={row.status}><header><span><i className={`is-${row.status}`} />{statusLabel[row.status] || row.status}</span><strong>{count}<small>{rate}%</small></strong></header><p><i style={{ width: `${Math.max(3, rate)}%` }} /></p></div>; })}</div>;
}
