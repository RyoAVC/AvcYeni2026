import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { customers, integrations, modules } from "../../../../../db/schema";
import { requireAdminUser } from "../../../../admin-auth";
import { loadCustomerPortalSnapshot } from "../../../../customer-portal-data.mjs";
import { AdminShell } from "../../../admin-shell";
import { PortalEditor } from "./portal-editor";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Portal Ürünleşme | Avcı Yönetim", robots: { index: false, follow: false } };

export default async function CustomerPortalAdminPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await requireAdminUser(`/yonetim/musteriler/${encodeURIComponent(id)}/portal`);
  if (!admin.authorized || !admin.user) return <main className="admin-access-page"><section><h1>Bu alan için yetkiniz yok.</h1><Link className="button button-primary" href="/yonetim">Yönetime dön</Link></section></main>;
  const customerId = Number(id);
  if (!Number.isSafeInteger(customerId) || customerId < 1) notFound();
  const { getDb } = await import("../../../../../db");
  const db = getDb();
  const [[customer], moduleCatalog, integrationCatalog] = await Promise.all([
    db.select().from(customers).where(eq(customers.id, customerId)).limit(1),
    db.select({ id: modules.id, name: modules.name, slug: modules.slug, category: modules.category }).from(modules).orderBy(asc(modules.sortOrder)),
    db.select({ id: integrations.id, name: integrations.name, providerKey: integrations.providerKey, category: integrations.category }).from(integrations).orderBy(asc(integrations.category), asc(integrations.name)),
  ]);
  if (!customer) notFound();
  const snapshot = await loadCustomerPortalSnapshot(customer);
  return <AdminShell current="musteriler" displayName={admin.user.displayName}><section className="admin-main"><header className="admin-heading"><div><span className="kicker">PORTAL ÜRÜNLEŞME</span><h1>{customer.company || customer.name}</h1><Link className="admin-back-link" href={`/yonetim/musteriler/${customerId}`}>Müşteri detayına dön</Link></div><p>Modül, entegrasyon, Tofy, kimlik, bildirim ve eşikler</p></header><PortalEditor customerId={customerId} snapshot={snapshot} moduleCatalog={moduleCatalog} integrationCatalog={integrationCatalog} /></section></AdminShell>;
}
