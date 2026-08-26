import type { Metadata } from "next";
import Link from "next/link";
import { asc } from "drizzle-orm";
import { commerceLicenseInstallations, customerIntegrationInstances, customerModuleInstances, customers, softwareInvoices } from "../../../db/schema";
import { requireAdminUser } from "../../admin-auth";
import { AdminShell } from "../admin-shell";
import "./systems.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Müşteri Sistemleri | Avcı E-Ticaret", robots: { index: false, follow: false } };

export default async function CustomerSystemsPage() {
  const admin = await requireAdminUser("/yonetim/sistemler");
  if (!admin.authorized || !admin.user) return null;
  const { getDb } = await import("../../../db");
  const db = getDb();
  const [customerRows, licenses, moduleRows, integrationRows, invoices] = await Promise.all([
    db.select().from(customers).orderBy(asc(customers.company), asc(customers.name)),
    db.select().from(commerceLicenseInstallations).orderBy(asc(commerceLicenseInstallations.primaryDomain)),
    db.select().from(customerModuleInstances),
    db.select().from(customerIntegrationInstances),
    db.select({ customerId: softwareInvoices.customerId, status: softwareInvoices.status }).from(softwareInvoices),
  ]);
  const byCustomer = <T extends { customerId: number }>(rows: T[], id: number) => rows.filter(item => item.customerId === id);

  return <AdminShell current="sistemler" displayName={admin.user.displayName}><section className="admin-main customer-systems-page">
    <header className="admin-heading"><div><span className="kicker">AVCI COMMERCE KONTROL DÜZLEMİ</span><h1>Müşteri Sistemleri</h1><p>Domain, lisans, ödeme, modül, entegrasyon ve Tofy kapsamını müşteri kurulumu bazında yönetin.</p></div><Link className="admin-btn admin-btn-primary" href="/yonetim/musteriler/yeni">Yeni müşteri</Link></header>
    <div className="customer-system-summary"><article><span>Müşteri</span><strong>{customerRows.length}</strong></article><article><span>Lisanslı kurulum</span><strong>{licenses.length}</strong></article><article><span>Aktif kurulum</span><strong>{licenses.filter(item => item.status === "active").length}</strong></article><article><span>Takip gereken</span><strong>{licenses.filter(item => item.status !== "active" || new Date(item.validUntil) <= new Date()).length}</strong></article></div>
    <div className="customer-system-list">{customerRows.length ? customerRows.map(customer => {
      const ownedLicenses = byCustomer(licenses, customer.id);
      const ownedModules = byCustomer(moduleRows, customer.id);
      const ownedIntegrations = byCustomer(integrationRows, customer.id);
      const openInvoices = byCustomer(invoices, customer.id).filter(item => item.status === "draft" || item.status === "sent").length;
      return <article className="customer-system-card" key={customer.id}><div className="customer-system-company"><span>{(customer.company || customer.name).slice(0,2).toUpperCase()}</span><div><strong>{customer.company || customer.name}</strong><small>{customer.email}</small></div></div><div className="customer-system-domains">{ownedLicenses.length ? ownedLicenses.map(license => <span key={license.id}><b>{license.primaryDomain}</b><em className={`is-${license.status}`}>{license.status}</em><small>{license.plan} · {new Date(license.validUntil).toLocaleDateString("tr-TR")}</small></span>) : <span><b>Lisanslı kurulum yok</b><small>Domain ve aktivasyon bekleniyor</small></span>}</div><div className="customer-system-signals"><span><b>{ownedModules.filter(item => item.status === "active").length}</b> aktif modül</span><span><b>{ownedIntegrations.filter(item => item.status === "active").length}</b> aktif entegrasyon</span><span><b>{openInvoices}</b> açık fatura</span></div><div className="customer-system-actions"><Link href={`/yonetim/musteriler/${customer.id}/portal`}>Sistemi yönet</Link><Link href={`/yonetim/faturalar?musteri=${customer.id}`}>Ödeme geçmişi</Link></div></article>;
    }) : <div className="admin-card"><p>Henüz müşteri sistemi yok.</p></div>}</div>
  </section></AdminShell>;
}
