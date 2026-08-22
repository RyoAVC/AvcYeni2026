import type { Metadata } from "next";
import Link from "next/link";
import { asc } from "drizzle-orm";
import { brands, categories } from "../../../../db/schema";
import { chatGPTSignOutPath } from "../../../chatgpt-auth";
import { requireAdminUser } from "../../../admin-auth";
import { AdminShell } from "../../admin-shell";
import { ProductForm } from "../product-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Yeni Ürün Ekle | Avcı Yönetim",
  robots: { index: false, follow: false },
};

export default async function NewProductPage() {
  const admin = await requireAdminUser("/yonetim/urunler/yeni");
  if (!admin.authorized || !admin.user) {
    return (
      <main className="admin-access-page">
        <section>
          <span className="admin-lock" aria-hidden="true">×</span>
          <span className="kicker kicker-light">YETKİLİ ERİŞİMİ</span>
          <h1>Bu hesap ürün ekleyemez.</h1>
          <p>Giriş yaptığınız <strong>{admin.user?.email}</strong> adresi yetkili izin listesinde bulunmuyor.</p>
          <div>
            <Link className="button button-primary" href="/">Ana sayfaya dön</Link>
            <a className="button button-ghost" href={chatGPTSignOutPath("/yonetim/urunler/yeni")}>Farklı hesapla giriş yap</a>
          </div>
        </section>
      </main>
    );
  }

  const { getDb } = await import("../../../../db");
  const db = getDb();

  const [categoryRows, brandRows] = await Promise.all([
    db.select({ id: categories.id, name: categories.name }).from(categories).orderBy(asc(categories.name)),
    db.select({ id: brands.id, name: brands.name }).from(brands).orderBy(asc(brands.name)),
  ]);

  return (
    <AdminShell current="urunler" displayName={admin.user.displayName}>
      <section className="admin-main">
        <header className="admin-heading" style={{ marginBottom: "24px" }}>
          <div>
            <span className="kicker">KATALOG YÖNETİMİ</span>
            <h1 style={{ fontSize: "clamp(24px, 2.5vw, 36px)", letterSpacing: "-0.04em", margin: "8px 0 4px" }}>
              Yeni Ürün Ekle
            </h1>
            <p style={{ margin: 0, color: "var(--admin-text-muted)", fontSize: "13px" }}>
              Kataloğunuza yeni bir e-ticaret ürünü veya lisans paketi tanımlayın.
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
          mode="create"
        />
      </section>
    </AdminShell>
  );
}
