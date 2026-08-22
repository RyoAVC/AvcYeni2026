import type { Metadata } from "next";
import Link from "next/link";
import { asc, eq, sql } from "drizzle-orm";
import { categories, products } from "../../../db/schema";
import { chatGPTSignOutPath } from "../../chatgpt-auth";
import { requireAdminUser } from "../../admin-auth";
import { AdminShell } from "../admin-shell";
import { CategoryClient } from "./category-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kategori Yönetimi | Avcı E-Ticaret",
  robots: { index: false, follow: false },
};

export default async function CategoriesPage() {
  const admin = await requireAdminUser("/yonetim/kategoriler");
  if (!admin.authorized || !admin.user) {
    return (
      <main className="admin-access-page">
        <section>
          <span className="admin-lock" aria-hidden="true">×</span>
          <span className="kicker kicker-light">YETKİLİ ERİŞİMİ</span>
          <h1>Bu hesap kategorileri göremez.</h1>
          <p>Giriş yaptığınız <strong>{admin.user?.email}</strong> adresi yetkili izin listesinde bulunmuyor.</p>
          <div>
            <Link className="button button-primary" href="/">Ana sayfaya dön</Link>
            <a className="button button-ghost" href={chatGPTSignOutPath("/yonetim/kategoriler")}>Farklı hesapla giriş yap</a>
          </div>
        </section>
      </main>
    );
  }

  const { getDb } = await import("../../../db");
  const db = getDb();

  const categoryRows = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      sortOrder: categories.sortOrder,
      status: categories.status,
    })
    .from(categories)
    .orderBy(asc(categories.sortOrder), asc(categories.name));

  const productCounts = await db
    .select({ categoryId: products.categoryId, count: sql<number>`count(*)` })
    .from(products)
    .groupBy(products.categoryId);

  const countMap = new Map(productCounts.map((r) => [r.categoryId, Number(r.count)]));

  const categoriesWithCounts = categoryRows.map((c) => ({
    ...c,
    productCount: countMap.get(c.id) || 0,
  }));

  return (
    <AdminShell current="kategoriler" displayName={admin.user.displayName}>
      <section className="admin-main">
        <header className="admin-heading" style={{ marginBottom: "24px" }}>
          <div>
            <span className="kicker">KATALOG VE REYONLAR</span>
            <h1 style={{ fontSize: "clamp(24px, 2.5vw, 36px)", letterSpacing: "-0.04em", margin: "8px 0 4px" }}>
              Kategori Yönetimi
            </h1>
            <p style={{ margin: 0, color: "var(--admin-text-muted)", fontSize: "13px" }}>
              Mağaza reyonlarınızı, ürün kategorilerinizi ve sıralama hiyerarşisini düzenleyin.
            </p>
          </div>
        </header>

        <CategoryClient initialCategories={categoriesWithCounts} />
      </section>
    </AdminShell>
  );
}
