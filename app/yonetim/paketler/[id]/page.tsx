import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { packages } from "../../../../db/schema";
import { chatGPTSignOutPath } from "../../../chatgpt-auth";
import { requireAdminUser } from "../../../admin-auth";
import { packageFamilyLabel } from "../../../package-admin.mjs";
import { AdminShell } from "../../admin-shell";
import { PackageForm } from "../package-form";
import { CatalogOrders } from "../../catalog-orders";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Paket Detayı | Avcı Yönetim",
  robots: { index: false, follow: false },
};

export default async function PackageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await requireAdminUser(`/yonetim/paketler/${encodeURIComponent(id.slice(0, 40))}`);
  if (!admin.authorized || !admin.user) {
    return (
      <main className="admin-access-page">
        <section>
          <span className="admin-lock" aria-hidden="true">×</span>
          <span className="kicker kicker-light">YETKİLİ ERİŞİMİ</span>
          <h1>Bu paketi görme yetkiniz yok.</h1>
          <div>
            <Link className="button button-primary" href="/">Ana sayfaya dön</Link>
            <a className="button button-ghost" href={chatGPTSignOutPath("/yonetim/paketler")}>Farklı hesapla giriş yap</a>
          </div>
        </section>
      </main>
    );
  }

  const packageId = Number(id);
  if (!Number.isSafeInteger(packageId) || packageId < 1) notFound();

  let item: typeof packages.$inferSelect | undefined;
  let databaseFailed = false;
  try {
    const { getDb } = await import("../../../../db");
    const db = getDb();
    const rows = await db.select().from(packages).where(eq(packages.id, packageId)).limit(1);
    item = rows[0];
  } catch (cause) {
    console.error("Package detail failed", cause);
    databaseFailed = true;
  }

  if (databaseFailed) {
    return (
      <main className="admin-access-page">
        <section>
          <span className="admin-lock" aria-hidden="true">!</span>
          <span className="kicker kicker-light">VERİTABANI HAZIR DEĞİL</span>
          <h1>Paket açılamıyor.</h1>
          <Link className="button button-primary" href="/yonetim/paketler">Listeye dön</Link>
        </section>
      </main>
    );
  }
  if (!item) notFound();

  return (
    <AdminShell current="paketler" displayName={admin.user.displayName}>
      <section className="admin-main">
        <header className="admin-heading">
          <div>
            <span className="kicker">PAKET #{item.id}</span>
            <h1>{item.name}</h1>
            <Link className="admin-back-link" href="/yonetim/paketler">Listeye dön</Link>
          </div>
          <div className="admin-heading-actions">
            <p>{packageFamilyLabel(item.family)} · {item.slug}</p>
            <Link href={`/yonetim/siparisler?paketId=${item.id}`}>Siparişleri gör</Link>
            <Link href={`/yonetim/siparisler/yeni?paketId=${item.id}`}>Sipariş aç</Link>
          </div>
        </header>
        <PackageForm
          mode="edit"
          packageId={item.id}
          initial={{
            name: item.name,
            slug: item.slug,
            family: item.family,
            summary: item.summary,
            features: item.features,
            priceNote: item.priceNote,
            sortOrder: item.sortOrder,
            status: item.status,
            expectedUpdatedAt: item.updatedAt,
          }}
        />
        <CatalogOrders kind="package" catalogId={item.id} catalogName={item.name} />
      </section>
    </AdminShell>
  );
}
