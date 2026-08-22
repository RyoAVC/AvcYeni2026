import type { Metadata } from "next";
import Link from "next/link";
import { desc } from "drizzle-orm";
import { campaigns } from "../../../db/schema";
import { chatGPTSignOutPath } from "../../chatgpt-auth";
import { requireAdminUser } from "../../admin-auth";
import { AdminShell } from "../admin-shell";
import { CampaignClient } from "./campaign-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kampanya Yönetimi | Avcı E-Ticaret",
  robots: { index: false, follow: false },
};

export default async function CampaignsPage() {
  const admin = await requireAdminUser("/yonetim/kampanyalar");
  if (!admin.authorized || !admin.user) {
    return (
      <main className="admin-access-page">
        <section>
          <span className="admin-lock" aria-hidden="true">×</span>
          <span className="kicker kicker-light">YETKİLİ ERİŞİMİ</span>
          <h1>Bu hesap kampanyaları göremez.</h1>
          <p>Giriş yaptığınız <strong>{admin.user?.email}</strong> adresi yetkili izin listesinde bulunmuyor.</p>
          <div>
            <Link className="button button-primary" href="/">Ana sayfaya dön</Link>
            <a className="button button-ghost" href={chatGPTSignOutPath("/yonetim/kampanyalar")}>Farklı hesapla giriş yap</a>
          </div>
        </section>
      </main>
    );
  }

  const { getDb } = await import("../../../db");
  const db = getDb();

  const campaignRows = await db
    .select({
      id: campaigns.id,
      name: campaigns.name,
      type: campaigns.type,
      discountValue: campaigns.discountValue,
      minSpend: campaigns.minSpend,
      targetType: campaigns.targetType,
      status: campaigns.status,
      startsAt: campaigns.startsAt,
      endsAt: campaigns.endsAt,
    })
    .from(campaigns)
    .orderBy(desc(campaigns.createdAt));

  return (
    <AdminShell current="kampanyalar" displayName={admin.user.displayName}>
      <section className="admin-main">
        <header className="admin-heading" style={{ marginBottom: "24px" }}>
          <div>
            <span className="kicker">PAZARLAMA VE PROMOSYON</span>
            <h1 style={{ fontSize: "clamp(24px, 2.5vw, 36px)", letterSpacing: "-0.04em", margin: "8px 0 4px" }}>
              Kampanya Yönetimi
            </h1>
            <p style={{ margin: 0, color: "var(--admin-text-muted)", fontSize: "13px" }}>
              Yüzdesel indirim, ücretsiz kargo ve sepet promosyon kurallarını planlayın ve yönetin.
            </p>
          </div>
        </header>

        <CampaignClient initialCampaigns={campaignRows} />
      </section>
    </AdminShell>
  );
}
