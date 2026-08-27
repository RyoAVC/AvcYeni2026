import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq, ne, sql } from "drizzle-orm";
import {
  customers,
  integrations,
  leads,
  modules,
  softwareInvoices,
  softwareOrders,
  supportTickets,
} from "../../db/schema";
import { requireAdminUser } from "../admin-auth";
import { AdminShell } from "./admin-shell";
import "./provider-dashboard.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sağlayıcı Kontrol Merkezi | Avcı E-Ticaret",
  robots: { index: false, follow: false },
};

const formatDate = (value: string) => new Intl.DateTimeFormat("tr-TR", {
  dateStyle: "medium",
  timeZone: "Europe/Istanbul",
}).format(new Date(value));

type Dashboard = {
  customers: number;
  leads: number;
  assignments: number;
  openTickets: number;
  activeModules: number;
  activeIntegrations: number;
  invoices: number;
  recentAssignments: Array<{
    id: number;
    createdAt: string;
    status: string;
    customer: string | null;
    kind: string;
  }>;
  recentLeads: Array<{
    id: number;
    createdAt: string;
    name: string;
    company: string;
    status: string;
  }>;
};

export default async function ProviderDashboard() {
  const admin = await requireAdminUser("/yonetim");
  if (!admin.authorized || !admin.user) return null;

  let data: Dashboard | null = null;

  try {
    const { getDb } = await import("../../db");
    const db = getDb();
    const [customerCount, leadCount, assignmentCount, ticketCount, moduleCount, integrationCount, invoiceCount, assignments, newestLeads] = await Promise.all([
      db.select({ value: sql<number>`count(*)` }).from(customers),
      db.select({ value: sql<number>`count(*)` }).from(leads),
      db.select({ value: sql<number>`count(*)` }).from(softwareOrders),
      db.select({ value: sql<number>`count(*)` }).from(supportTickets).where(ne(supportTickets.status, "closed")),
      db.select({ value: sql<number>`count(*)` }).from(modules).where(eq(modules.status, "active")),
      db.select({ value: sql<number>`count(*)` }).from(integrations).where(eq(integrations.status, "active")),
      db.select({ value: sql<number>`count(*)` }).from(softwareInvoices).where(ne(softwareInvoices.status, "cancelled")),
      db.select({
        id: softwareOrders.id,
        createdAt: softwareOrders.createdAt,
        status: softwareOrders.status,
        customer: customers.company,
        kind: softwareOrders.kind,
      })
        .from(softwareOrders)
        .leftJoin(customers, eq(softwareOrders.customerId, customers.id))
        .orderBy(desc(softwareOrders.createdAt))
        .limit(6),
      db.select({
        id: leads.id,
        createdAt: leads.createdAt,
        name: leads.name,
        company: leads.company,
        status: leads.status,
      }).from(leads).orderBy(desc(leads.createdAt)).limit(6),
    ]);

    data = {
      customers: Number(customerCount[0]?.value ?? 0),
      leads: Number(leadCount[0]?.value ?? 0),
      assignments: Number(assignmentCount[0]?.value ?? 0),
      openTickets: Number(ticketCount[0]?.value ?? 0),
      activeModules: Number(moduleCount[0]?.value ?? 0),
      activeIntegrations: Number(integrationCount[0]?.value ?? 0),
      invoices: Number(invoiceCount[0]?.value ?? 0),
      recentAssignments: assignments,
      recentLeads: newestLeads,
    };
  } catch (cause) {
    console.error("Provider dashboard failed", cause);
  }

  return (
    <AdminShell current="panel" displayName={admin.user.displayName}>
      <section className="admin-main">
        <header className="provider-hero">
          <div className="provider-hero__copy">
            <span className="provider-eyebrow"><i /> AVCI OPERASYON MERKEZİ</span>
            <h1>İşletmenizin tamamı,<br /><em>tek kontrol ekranında.</em></h1>
            <p>Müşterileri, lisansları, modülleri ve destek süreçlerini aynı güvenli çalışma alanından yönetin.</p>
            <div className="provider-hero__actions">
              <Link className="admin-btn admin-btn-primary" href="/yonetim/musteriler/yeni">Yeni müşteri oluştur</Link>
              <Link className="provider-text-link" href="/yonetim/raporlar">Operasyon raporunu aç <span>→</span></Link>
            </div>
          </div>
          <div className="provider-hero__status">
            <span className="provider-status-label">PLATFORM DURUMU</span>
            <strong>Tüm servisler çalışıyor</strong>
            <p>Son kontrol: şimdi</p>
            <div className="provider-health-list"><span><i />Veritabanı</span><span><i />Lisans servisi</span><span><i />Canlı ortam</span></div>
          </div>
        </header>

        {!data ? (
          <div className="admin-card provider-empty-state">
            <h2>Veri bağlantısı kontrol ediliyor</h2>
            <p>Sağlayıcı kayıtları güvenli biçimde yüklenemedi. Birkaç saniye sonra tekrar deneyin.</p>
          </div>
        ) : (
          <>
            <div className="admin-kpi-grid">
              <ProviderMetric icon="users" label="Müşteri portföyü" value={data.customers} detail={`${data.leads} toplam başvuru`} href="/yonetim/musteriler" />
              <ProviderMetric icon="license" label="Lisans ve hizmet" value={data.assignments} detail={`${data.activeModules} aktif modül`} href="/yonetim/siparisler" />
              <ProviderMetric icon="support" label="Açık destek talebi" value={data.openTickets} detail="Yanıt bekleyen kayıtlar" href="/yonetim/destek" alert={data.openTickets > 0} />
              <ProviderMetric icon="invoice" label="Fatura kaydı" value={data.invoices} detail={`${data.activeIntegrations} aktif entegrasyon`} href="/yonetim/faturalar" />
            </div>

            <div className="admin-toolbar">
              <div className="admin-toolbar-left">
                <span className="provider-toolbar-label">SAĞLAYICI KISAYOLLARI:</span>
                <Link className="admin-badge admin-badge--info" href="/yonetim/basvurular">Teklifler ({data.leads})</Link>
                <Link className="admin-badge admin-badge--neutral" href="/yonetim/paketler">Altyapı paketleri</Link>
                <Link className="admin-badge admin-badge--success" href="/yonetim/moduller">Eklenti & modüller</Link>
                <Link className="admin-badge admin-badge--warning" href="/yonetim/entegrasyonlar">Entegrasyon kataloğu</Link>
              </div>
            </div>

            <div className="provider-overview-grid">
              <div className="admin-card provider-operation-overview">
                <div className="admin-card-header"><div><span className="kicker">OPERASYON DAĞILIMI</span><h2 className="admin-card-title">Platform özeti</h2></div><Link className="admin-card-action" href="/yonetim/raporlar">Raporu aç →</Link></div>
                <DashboardBar label="Müşteri portföyü" value={data.customers} max={Math.max(data.customers, data.assignments, data.leads, 1)} />
                <DashboardBar label="Lisans ve hizmet ataması" value={data.assignments} max={Math.max(data.customers, data.assignments, data.leads, 1)} />
                <DashboardBar label="Teklif / başvuru" value={data.leads} max={Math.max(data.customers, data.assignments, data.leads, 1)} />
              </div>
              <div className="admin-card provider-focus-card"><span className="kicker">ÖNCELİKLİ İŞLER</span><h2>Bugün neye bakmalısınız?</h2><Link href="/yonetim/destek"><span>Açık destek kayıtları</span><strong>{data.openTickets}</strong></Link><Link href="/yonetim/basvurular"><span>Teklif havuzu</span><strong>{data.leads}</strong></Link><Link href="/yonetim/entegrasyonlar"><span>Aktif entegrasyonlar</span><strong>{data.activeIntegrations}</strong></Link></div>
            </div>

            <div className="admin-dashboard-row">
              <ProviderList title="Son lisans ve hizmet atamaları" action="Tüm atamalar" href="/yonetim/siparisler">
                {data.recentAssignments.length ? data.recentAssignments.map((item) => (
                  <Link className="provider-activity-row" href={`/yonetim/siparisler/${item.id}`} key={item.id}>
                    <span><strong>{item.customer || "Müşteri kaydı"}</strong><small>{item.kind === "module" ? "Eklenti / modül" : "Altyapı paketi"}</small></span>
                    <span><b>{item.status}</b><small>{formatDate(item.createdAt)}</small></span>
                  </Link>
                )) : <Empty text="Henüz lisans veya hizmet ataması yok." />}
              </ProviderList>

              <ProviderList title="Yeni teklif ve başvurular" action="Başvuruları aç" href="/yonetim/basvurular">
                {data.recentLeads.length ? data.recentLeads.map((item) => (
                  <Link className="provider-activity-row" href={`/yonetim/basvurular/${item.id}`} key={item.id}>
                    <span><strong>{item.company || item.name}</strong><small>{item.name}</small></span>
                    <span><b>{item.status}</b><small>{formatDate(item.createdAt)}</small></span>
                  </Link>
                )) : <Empty text="Henüz teklif başvurusu yok." />}
              </ProviderList>
            </div>

            <div className="admin-card provider-architecture">
              <div className="admin-card-header">
                <div>
                  <h2 className="admin-card-title">Avcı ürün mimarisi</h2>
                  <p className="admin-card-subtitle">Bu panel mağaza kasası değildir; müşteriye sunulan altyapı ve lisansların kontrol düzlemidir.</p>
                </div>
              </div>
              <div className="provider-link-grid">
                <Link href="/yonetim/paketler"><strong>Altyapı paketleri</strong><span>Aylık/yıllık kapsam ve fiyatlama</span></Link>
                <Link href="/yonetim/moduller"><strong>Eklenti & modüller</strong><span>Müşteri bazlı açılan yetenekler</span></Link>
                <Link href="/yonetim/musteriler"><strong>Müşteri portalları</strong><span>Firma, kimlik, tema ve erişim</span></Link>
                <Link href="/yonetim/entegrasyonlar"><strong>Entegrasyon ekosistemi</strong><span>Pazaryeri, ödeme, kargo ve muhasebe</span></Link>
              </div>
            </div>
          </>
        )}
      </section>
    </AdminShell>
  );
}

function ProviderMetric({ label, value, detail, href, icon, alert = false }: { label: string; value: string | number; detail: string; href: string; icon: string; alert?: boolean }) {
  return (
    <Link className={`admin-kpi-card provider-metric ${alert ? "is-alert" : ""}`} href={href}>
      <div className="admin-kpi-head"><span className="provider-metric-icon" aria-hidden="true"><MetricIcon type={icon} /></span><span className="admin-kpi-label">{label}</span><span className="provider-metric-arrow">↗</span></div>
      <div className="admin-kpi-value">{value}</div>
      <div className="admin-kpi-footer"><span className="admin-kpi-subtext">{detail}</span></div>
    </Link>
  );
}

function MetricIcon({ type }: { type: string }) {
  const common = { fill: "none", height: 20, stroke: "currentColor", strokeLinecap: "round" as const, strokeLinejoin: "round" as const, strokeWidth: 1.8, viewBox: "0 0 24 24", width: 20 };
  if (type === "users") return <svg {...common}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
  if (type === "license") return <svg {...common}><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h6M7 16h4"/></svg>;
  if (type === "support") return <svg {...common}><path d="M4 14a8 8 0 0 1 16 0"/><path d="M18 19c0 1.1-.9 2-2 2h-3"/><rect x="2" y="13" width="4" height="6" rx="2"/><rect x="18" y="13" width="4" height="6" rx="2"/></svg>;
  return <svg {...common}><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>;
}

function DashboardBar({ label, value, max }: { label: string; value: number; max: number }) {
  return <div className="provider-dashboard-bar"><div><span>{label}</span><strong>{value}</strong></div><i><b style={{ width: `${Math.max(4, Math.round((value / max) * 100))}%` }} /></i></div>;
}

function ProviderList({ title, action, href, children }: { title: string; action: string; href: string; children: React.ReactNode }) {
  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h2 className="admin-card-title">{title}</h2>
        <Link className="admin-card-action" href={href}>{action} →</Link>
      </div>
      <div className="provider-activity-list">{children}</div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="provider-list-empty">{text}</p>;
}
