import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { brands, categories, products } from "../../../../db/schema";
import { chatGPTSignOutPath } from "../../../chatgpt-auth";
import { requireAdminUser } from "../../../admin-auth";
import { AdminShell } from "../../admin-shell";
import { ProductForm } from "../product-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ürünü Düzenle | Avcı Yönetim",
  robots: { index: false, follow: false },
};

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = Number(id);
  if (!productId || Number.isNaN(productId)) {
    notFound();
  }

  const admin = await requireAdminUser(`/yonetim/urunler/${id}`);
  if (!admin.authorized || !admin.user) {
    return (
      <main className="admin-access-page">
        <section>
          <span className="admin-lock" aria-hidden="true">×</span>
          <span className="kicker kicker-light">YETKİLİ ERİŞİMİ</span>
          <h1>Bu hesap ürünü düzenleyemez.</h1>
          <p>Giriş yaptığınız <strong>{admin.user?.email}</strong> adresi yetkili izin listesinde bulunmuyor.</p>
          <div>
            <Link className="button button-primary" href="/">Ana sayfaya dön</Link>
            <a className="button button-ghost" href={chatGPTSignOutPath(`/yonetim/urunler/${id}`)}>Farklı hesapla giriş yap</a>
          </div>
        </section>
      </main>
    );
  }

  const { getDb } = await import("../../../../db");
  const db = getDb();

  const [productRow, categoryRows, brandRows] = await Promise.all([
    db.select().from(products).where(eq(products.id, productId)).limit(1),
    db.select({ id: categories.id, name: categories.name }).from(categories).orderBy(asc(categories.name)),
    db.select({ id: brands.id, name: brands.name }).from(brands).orderBy(asc(brands.name)),
  ]);

  const product = productRow[0];
  if (!product) {
    notFound();
  }

  return (
    <AdminShell current="urunler" displayName={admin.user.displayName}>
      <section className="admin-main">
        <header className="admin-heading" style={{ marginBottom: "24px" }}>
          <div>
            <span className="kicker">KATALOG YÖNETİMİ</span>
            <h1 style={{ fontSize: "clamp(24px, 2.5vw, 36px)", letterSpacing: "-0.04em", margin: "8px 0 4px" }}>
              {product.name}
            </h1>
            <p style={{ margin: 0, color: "var(--admin-text-muted)", fontSize: "13px" }}>
              SKU: {product.sku || "Belirtilmedi"} · Durum: {product.status === "active" ? "Satışta" : product.status}
            </p>
          </div>
          <div className="admin-heading-actions">
            <Link className="admin-btn admin-btn-secondary" href="/yonetim/urunler">
              ← Ürün Listesine Dön
            </Link>
          </div>
        </header>

        <ProductForm
          brands={brandRows}
          categories={categoryRows}
          initial={product}
          mode="edit"
          productId={product.id}
        />
      </section>
    </AdminShell>
  );
}
