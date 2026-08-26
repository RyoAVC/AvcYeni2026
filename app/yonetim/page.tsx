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
        <header className="admin-heading provider-heading">
          <div>
            <span className="kicker">AVCI E-TİCARET SAĞLAYICI YÖNETİMİ</span>
            <h1>Kontrol Merkezi</h1>
            <p>Müşteri, teklif, altyapı paketi, modül, lisans ve destek operasyonlarının merkezi.</p>
          </div>
          <div className="admin-heading-actions">
            <Link className="admin-btn admin-btn-secondary" href="/yonetim/paketler">Paketleri yönet</Link>
            <Link className="admin-btn admin-btn-primary" href="/yonetim/musteriler/yeni">Yeni müşteri</Link>
          </div>
        </header>

        <div className="provider-command-strip">
          <div><span className="provider-command-icon">A</span><span><strong>Avcı Commerce kontrol düzlemi</strong><small>Lisans, müşteri sistemi ve modül operasyonları tek merkezde</small></span></div>
          <div className="provider-command-health"><span><i className="is-healthy" />D1 bağlı</span><span><i className="is-healthy" />Lisans servisi aktif</span><span><i className="is-healthy" />Canlı ortam</span></div>
        </div>

        {!data ? (
          <div className="admin-card provider-empty-state">
            <h2>Veri bağlantısı kontrol ediliyor</h2>
            <p>Sağlayıcı kayıtları güvenli biçimde yüklenemedi. Birkaç saniye sonra tekrar deneyin.</p>
          </div>
        ) : (
          <>
            <div className="admin-kpi-grid">
              <ProviderMetric icon="users" label="MÜŞTERİ PORTFÖYÜ" value={data.customers} detail={`${data.leads} toplam başvuru`} href="/yonetim/musteriler" tone="mint" />
              <ProviderMetric icon="license" label="LİSANS & HİZMET" value={data.assignments} detail={`${data.activeModules} aktif modül`} href="/yonetim/siparisler" tone="cyan" />
              <ProviderMetric icon="support" label="DESTEK & SLA" value={data.openTickets} detail="açık veya bekleyen talep" href="/yonetim/destek" tone="lime" />
              <ProviderMetric icon="invoice" label="FATURA KAYITLARI" value={data.invoices} detail={`${data.activeIntegrations} katalog entegrasyonu`} href="/yonetim/faturalar" tone="ink" />
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
              <div className="admin-card provider-focus-card"><span className="kicker">BUGÜNÜN ODAĞI</span><h2>Kontrol edilmesi gerekenler</h2><Link href="/yonetim/destek"><span>Açık destek kayıtları</span><strong>{data.openTickets}</strong></Link><Link href="/yonetim/basvurular"><span>Toplam teklif havuzu</span><strong>{data.leads}</strong></Link><Link href="/yonetim/entegrasyonlar"><span>Yayınlanan entegrasyonlar</span><strong>{data.activeIntegrations}</strong></Link></div>
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

function ProviderMetric({ label, value, detail, href, icon, tone }: { label: string; value: string | number; detail: string; href: string; icon: string; tone: string }) {
  return (
    <Link className={`admin-kpi-card provider-metric is-${tone}`} href={href}>
      <div className="admin-kpi-head"><span className="provider-metric-icon" aria-hidden="true">{icon === "users" ? "M" : icon === "license" ? "L" : icon === "support" ? "S" : "F"}</span><span className="admin-kpi-label">{label}</span><span className="provider-metric-arrow">↗</span></div>
      <div className="admin-kpi-value">{value}</div>
      <div className="admin-kpi-footer"><span className="admin-kpi-subtext">{detail}</span></div>
    </Link>
  );
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
