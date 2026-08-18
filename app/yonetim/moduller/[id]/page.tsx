import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { modules } from "../../../../db/schema";
import { chatGPTSignOutPath } from "../../../chatgpt-auth";
import { requireAdminUser } from "../../../admin-auth";
import { moduleCategoryLabel } from "../../../module-admin.mjs";
import { AdminShell } from "../../admin-shell";
import { ModuleForm } from "../module-form";
import { CatalogOrders } from "../../catalog-orders";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Modül Detayı | Avcı Yönetim",
  robots: { index: false, follow: false },
};

export default async function ModuleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await requireAdminUser(`/yonetim/moduller/${encodeURIComponent(id.slice(0, 40))}`);
  if (!admin.authorized || !admin.user) {
    return (
      <main className="admin-access-page">
        <section>
          <span className="admin-lock" aria-hidden="true">×</span>
          <span className="kicker kicker-light">YETKİLİ ERİŞİMİ</span>
          <h1>Bu modülü görme yetkiniz yok.</h1>
          <div>
            <Link className="button button-primary" href="/">Ana sayfaya dön</Link>
            <a className="button button-ghost" href={chatGPTSignOutPath("/yonetim/moduller")}>Farklı hesapla giriş yap</a>
          </div>
        </section>
      </main>
    );
  }

  const moduleId = Number(id);
  if (!Number.isSafeInteger(moduleId) || moduleId < 1) notFound();

  let item: typeof modules.$inferSelect | undefined;
  let databaseFailed = false;
  try {
    const { getDb } = await import("../../../../db");
    const db = getDb();
    const rows = await db.select().from(modules).where(eq(modules.id, moduleId)).limit(1);
    item = rows[0];
  } catch (cause) {
    console.error("Module detail failed", cause);
    databaseFailed = true;
  }

  if (databaseFailed) {
    return (
      <main className="admin-access-page">
        <section>
          <span className="admin-lock" aria-hidden="true">!</span>
          <span className="kicker kicker-light">VERİTABANI HAZIR DEĞİL</span>
          <h1>Modül açılamıyor.</h1>
          <Link className="button button-primary" href="/yonetim/moduller">Listeye dön</Link>
        </section>
      </main>
    );
  }
  if (!item) notFound();

  return (
    <AdminShell current="moduller" displayName={admin.user.displayName}>
      <section className="admin-main">
        <header className="admin-heading">
          <div>
            <span className="kicker">MODÜL #{item.id}</span>
            <h1>{item.name}</h1>
            <Link className="admin-back-link" href="/yonetim/moduller">Listeye dön</Link>
          </div>
          <div className="admin-heading-actions">
            <p>{moduleCategoryLabel(item.category)} · {item.slug}</p>
            <Link href={`/yonetim/siparisler?modulId=${item.id}`}>Siparişleri gör</Link>
            <Link href={`/yonetim/siparisler/yeni?modulId=${item.id}`}>Sipariş aç</Link>
          </div>
        </header>
        <ModuleForm
          mode="edit"
          moduleId={item.id}
          initial={{
            name: item.name,
            slug: item.slug,
            category: item.category,
            summary: item.summary,
            features: item.features,
            priceNote: item.priceNote,
            sortOrder: item.sortOrder,
            status: item.status,
            expectedUpdatedAt: item.updatedAt,
          }}
        />
        <CatalogOrders kind="module" catalogId={item.id} catalogName={item.name} />
      </section>
    </AdminShell>
  );
}
