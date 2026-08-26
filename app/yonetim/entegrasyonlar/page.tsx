import type { Metadata } from "next";
import Link from "next/link";
import { asc } from "drizzle-orm";
import { customerIntegrationInstances, integrations } from "../../../db/schema";
import { chatGPTSignOutPath } from "../../chatgpt-auth";
import { requireAdminUser } from "../../admin-auth";
import { AdminShell } from "../admin-shell";
import { IntegrationClient } from "./integration-client";
import "./integration-admin.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Entegrasyon Merkezi | Avcı E-Ticaret",
  robots: { index: false, follow: false },
};

export default async function IntegrationsPage() {
  const admin = await requireAdminUser("/yonetim/entegrasyonlar");
  if (!admin.authorized || !admin.user) {
    return (
      <main className="admin-access-page">
        <section>
          <span className="admin-lock" aria-hidden="true">×</span>
          <span className="kicker kicker-light">YETKİLİ ERİŞİMİ</span>
          <h1>Bu hesap entegrasyonları göremez.</h1>
          <p>Giriş yaptığınız <strong>{admin.user?.email}</strong> adresi yetkili izin listesinde bulunmuyor.</p>
          <div>
            <Link className="button button-primary" href="/">Ana sayfaya dön</Link>
            <a className="button button-ghost" href={chatGPTSignOutPath("/yonetim/entegrasyonlar")}>Farklı hesapla giriş yap</a>
          </div>
        </section>
      </main>
    );
  }

  const { getDb } = await import("../../../db");
  const db = getDb();

  const integrationRows = await db
    .select({
      id: integrations.id,
      providerKey: integrations.providerKey,
      category: integrations.category,
      name: integrations.name,
      status: integrations.status,
      lastSyncAt: integrations.lastSyncAt,
    })
    .from(integrations)
    .orderBy(asc(integrations.category), asc(integrations.name));

  const assignmentRows = await db.select({
    integrationId: customerIntegrationInstances.integrationId,
    status: customerIntegrationInstances.status,
    targetDomain: customerIntegrationInstances.targetDomain,
  }).from(customerIntegrationInstances);
  const integrationUsage = new Map<number, { total: number; active: number; domains: Set<string> }>();
  for (const assignment of assignmentRows) {
    const usage = integrationUsage.get(assignment.integrationId) || { total: 0, active: 0, domains: new Set<string>() };
    usage.total += 1;
    if (assignment.status === "active") {
      usage.active += 1;
      if (assignment.targetDomain) usage.domains.add(assignment.targetDomain);
    }
    integrationUsage.set(assignment.integrationId, usage);
  }
  const catalogRows = integrationRows.map((item) => {
    const usage = integrationUsage.get(item.id);
    return { ...item, customerActiveCount: usage?.active || 0, customerTotalCount: usage?.total || 0, activeDomains: [...(usage?.domains || [])] };
  });

  return (
    <AdminShell current="entegrasyonlar" displayName={admin.user.displayName}>
      <section className="admin-main">
        <header className="admin-heading" style={{ marginBottom: "24px" }}>
          <div>
            <span className="kicker">AVCI ENTEGRASYON KATALOĞU</span>
            <h1 style={{ fontSize: "clamp(24px, 2.5vw, 36px)", letterSpacing: "-0.04em", margin: "8px 0 4px" }}>
              Entegrasyon Merkezi
            </h1>
            <p style={{ margin: 0, color: "var(--admin-text-muted)", fontSize: "13px" }}>
              Sunulan bağlantıları yayınlayın; müşteri ve domain bazındaki gerçek kullanım sayılarını tek bakışta izleyin.
            </p>
          </div>
        </header>

        <IntegrationClient initialIntegrations={catalogRows} />
      </section>
    </AdminShell>
  );
}
