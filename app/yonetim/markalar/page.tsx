import type { Metadata } from "next";
import Link from "next/link";
import { asc, sql } from "drizzle-orm";
import { brands, products } from "../../../db/schema";
import { chatGPTSignOutPath } from "../../chatgpt-auth";
import { requireAdminUser } from "../../admin-auth";
import { AdminShell } from "../admin-shell";
import { BrandClient } from "./brand-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Marka Yönetimi | Avcı E-Ticaret",
  robots: { index: false, follow: false },
};

export default async function BrandsPage() {
  const admin = await requireAdminUser("/yonetim/markalar");
  if (!admin.authorized || !admin.user) {
    return (
      <main className="admin-access-page">
        <section>
          <span className="admin-lock" aria-hidden="true">×</span>
          <span className="kicker kicker-light">YETKİLİ ERİŞİMİ</span>
          <h1>Bu hesap markaları göremez.</h1>
          <p>Giriş yaptığınız <strong>{admin.user?.email}</strong> adresi yetkili izin listesinde bulunmuyor.</p>
          <div>
            <Link className="button button-primary" href="/">Ana sayfaya dön</Link>
            <a className="button button-ghost" href={chatGPTSignOutPath("/yonetim/markalar")}>Farklı hesapla giriş yap</a>
          </div>
        </section>
      </main>
    );
  }

  const { getDb } = await import("../../../db");
  const db = getDb();

  const brandRows = await db
    .select({
      id: brands.id,
      name: brands.name,
      slug: brands.slug,
      website: brands.website,
      description: brands.description,
      sortOrder: brands.sortOrder,
      status: brands.status,
    })
    .from(brands)
    .orderBy(asc(brands.sortOrder), asc(brands.name));

  const productCounts = await db
    .select({ brandId: products.brandId, count: sql<number>`count(*)` })
    .from(products)
    .groupBy(products.brandId);

  const countMap = new Map(productCounts.map((r) => [r.brandId, Number(r.count)]));

  const brandsWithCounts = brandRows.map((b) => ({
    ...b,
    productCount: countMap.get(b.id) || 0,
  }));

  return (
    <AdminShell current="markalar" displayName={admin.user.displayName}>
      <section className="admin-main">
        <header className="admin-heading" style={{ marginBottom: "24px" }}>
          <div>
            <span className="kicker">KATALOG VE ÜRETİCİLER</span>
            <h1 style={{ fontSize: "clamp(24px, 2.5vw, 36px)", letterSpacing: "-0.04em", margin: "8px 0 4px" }}>
              Marka Yönetimi
            </h1>
            <p style={{ margin: 0, color: "var(--admin-text-muted)", fontSize: "13px" }}>
              Tedarikçi markalarınızı, üreticilerinizi ve logolarını tek merkezde yönetin.
            </p>
          </div>
        </header>

        <BrandClient initialBrands={brandsWithCounts} />
      </section>
    </AdminShell>
  );
}
