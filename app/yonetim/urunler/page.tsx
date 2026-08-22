import type { Metadata } from "next";
import Link from "next/link";
import { and, asc, desc, eq, like, or, sql, type SQL } from "drizzle-orm";
import { brands, categories, products } from "../../../db/schema";
import { chatGPTSignOutPath } from "../../chatgpt-auth";
import { requireAdminUser } from "../../admin-auth";
import { normalizeLeadSearch } from "../../lead-search.mjs";
import { AdminShell } from "../admin-shell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ürün Yönetimi | Avcı E-Ticaret",
  robots: { index: false, follow: false },
};

function formatPrice(cents: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(cents);
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await requireAdminUser("/yonetim/urunler");
  if (!admin.authorized || !admin.user) {
    return (
      <main className="admin-access-page">
        <section>
          <span className="admin-lock" aria-hidden="true">×</span>
          <span className="kicker kicker-light">YETKİLİ ERİŞİMİ</span>
          <h1>Bu hesap ürünleri göremez.</h1>
          <p>Giriş yaptığınız <strong>{admin.user?.email}</strong> adresi yetkili izin listesinde bulunmuyor.</p>
          <div>
            <Link className="button button-primary" href="/">Ana sayfaya dön</Link>
            <a className="button button-ghost" href={chatGPTSignOutPath("/yonetim/urunler")}>Farklı hesapla giriş yap</a>
          </div>
        </section>
      </main>
    );
  }

  const params = await searchParams;
  const search = normalizeLeadSearch(firstValue(params.q));
  const requestedStatus = firstValue(params.status) ?? "all";
  const requestedCategory = firstValue(params.kategori);

  const { getDb } = await import("../../../db");
  const db = getDb();

  const filters: SQL[] = [];
  if (search) {
    const likePattern = `%${search}%`;
    filters.push(
      or(
        like(products.name, likePattern),
        like(products.sku, likePattern),
        like(products.barcode, likePattern)
      )!
    );
  }

  if (requestedStatus === "critical") {
    filters.push(sql`${products.stock} <= ${products.criticalStock}`);
  } else if (requestedStatus && requestedStatus !== "all") {
    filters.push(eq(products.status, requestedStatus));
  }

  if (requestedCategory) {
    const catId = Number(requestedCategory);
    if (catId) filters.push(eq(products.categoryId, catId));
  }

  const whereClause = filters.length ? and(...filters) : undefined;

  const [
    allProducts,
    allCategories,
    allBrands,
    totalCountRow,
    criticalCountRow,
    activeCountRow,
  ] = await Promise.all([
    db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        sku: products.sku,
        barcode: products.barcode,
        price: products.price,
        discountedPrice: products.discountedPrice,
        stock: products.stock,
        criticalStock: products.criticalStock,
        status: products.status,
        isFeatured: products.isFeatured,
        images: products.images,
        categoryName: categories.name,
        brandName: brands.name,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(brands, eq(products.brandId, brands.id))
      .where(whereClause)
      .orderBy(desc(products.createdAt), desc(products.id))
      .limit(50),
    db.select({ id: categories.id, name: categories.name }).from(categories).orderBy(asc(categories.name)),
    db.select({ id: brands.id, name: brands.name }).from(brands).orderBy(asc(brands.name)),
    db.select({ count: sql<number>`count(*)` }).from(products),
    db.select({ count: sql<number>`count(*)` }).from(products).where(sql`${products.stock} <= ${products.criticalStock}`),
    db.select({ count: sql<number>`count(*)` }).from(products).where(eq(products.status, "active")),
  ]);

  const totalProducts = Number(totalCountRow[0]?.count ?? 0);
  const criticalProducts = Number(criticalCountRow[0]?.count ?? 0);
  const activeProducts = Number(activeCountRow[0]?.count ?? 0);

  return (
    <AdminShell current="urunler" displayName={admin.user.displayName}>
      <section className="admin-main">
        {/* Header */}
        <header className="admin-heading" style={{ marginBottom: "24px" }}>
          <div>
            <span className="kicker">KATALOG VE ENVANTER</span>
            <h1 style={{ fontSize: "clamp(24px, 2.5vw, 36px)", letterSpacing: "-0.04em", margin: "8px 0 4px" }}>
              Ürün Yönetimi
            </h1>
            <p style={{ margin: 0, color: "var(--admin-text-muted)", fontSize: "13px" }}>
              Mağazanızdaki ürünleri, fiyatları, varyantları ve stok adetlerini yönetin.
            </p>
          </div>
          <div className="admin-heading-actions">
            <Link className="admin-btn admin-btn-primary" href="/yonetim/urunler/yeni">
              <svg aria-hidden="true" fill="none" height="15" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" width="15">
                <line x1="12" x2="12" y1="5" y2="19" /><line x1="5" x2="19" y1="12" y2="12" />
              </svg>
              <span>Yeni Ürün Ekle</span>
            </Link>
          </div>
        </header>

        {/* Quick Filter Badges */}
        <div className="admin-toolbar" style={{ marginBottom: "20px" }}>
          <form className="admin-toolbar-left" method="GET">
            <input
              className="admin-select"
              defaultValue={search}
              name="q"
              placeholder="Ürün adı, SKU veya barkod ara..."
              style={{ width: "240px" }}
              type="search"
            />
            <select
              className="admin-select"
              defaultValue={requestedCategory || ""}
              name="kategori"
            >
              <option value="">Tüm Kategoriler</option>
              {allCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select
              className="admin-select"
              defaultValue={requestedStatus}
              name="status"
            >
              <option value="all">Tüm Durumlar ({totalProducts})</option>
              <option value="active">Yalnızca Satışta ({activeProducts})</option>
              <option value="draft">Taslaklar</option>
              <option value="critical">Kritik Stok Uyarıları ({criticalProducts})</option>
              <option value="passive">Pasifler</option>
            </select>
            <button className="admin-btn admin-btn-secondary" type="submit">
              Filtrele
            </button>
            {(search || (requestedStatus && requestedStatus !== "all") || requestedCategory) && (
              <Link className="admin-card-action" href="/yonetim/urunler" style={{ fontSize: "11.5px", marginLeft: "6px" }}>
                Temizle
              </Link>
            )}
          </form>
          <div className="admin-toolbar-right">
            <span style={{ fontSize: "12px", color: "var(--admin-text-muted)" }}>
              Toplam <strong>{allProducts.length}</strong> ürün listeleniyor
            </span>
          </div>
        </div>

        {/* Products Table */}
        <div className="admin-card" style={{ padding: "0", overflow: "hidden" }}>
          <div className="admin-table-container" style={{ border: 0 }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: "50px" }}>GÖRSEL</th>
                  <th>ÜRÜN ADI & KOD</th>
                  <th>KATEGORİ & MARKA</th>
                  <th>FİYAT</th>
                  <th>STOK DURUMU</th>
                  <th>DURUM</th>
                  <th style={{ textAlign: "right" }}>İŞLEMLER</th>
                </tr>
              </thead>
              <tbody>
                {allProducts.length ? (
                  allProducts.map((p) => {
                    let thumb = "";
                    try {
                      const parsedImgs = JSON.parse(p.images || "[]");
                      if (Array.isArray(parsedImgs) && parsedImgs[0]) thumb = parsedImgs[0];
                    } catch {}

                    const isCritical = p.stock <= p.criticalStock;

                    return (
                      <tr key={p.id}>
                        <td>
                          <div
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "8px",
                              background: "#f1f5f9",
                              border: "1px solid var(--admin-border)",
                              display: "grid",
                              placeItems: "center",
                              overflow: "hidden",
                            }}
                          >
                            {thumb ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                alt={p.name}
                                src={thumb}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            ) : (
                              <span style={{ fontSize: "16px", color: "#94a3b8" }}>📦</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <Link href={`/yonetim/urunler/${p.id}`} style={{ fontWeight: 700, color: "var(--admin-text-main)", display: "block" }}>
                            {p.name}
                          </Link>
                          <span style={{ fontSize: "11px", color: "var(--admin-text-muted)" }}>
                            SKU: {p.sku || "-"} {p.barcode ? `· Barkod: ${p.barcode}` : ""}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontSize: "12px" }}>
                            <strong>{p.categoryName || "Kategorisiz"}</strong>
                            {p.brandName && (
                              <span style={{ display: "block", fontSize: "11px", color: "var(--admin-text-muted)" }}>
                                {p.brandName}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div>
                            <strong style={{ fontSize: "13px" }}>{formatPrice(p.price)}</strong>
                            {p.discountedPrice && (
                              <span style={{ display: "block", fontSize: "11px", color: "#dc2626", fontWeight: 600 }}>
                                İndirim: {formatPrice(p.discountedPrice)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span
                            className={`admin-badge ${isCritical ? "admin-badge--danger" : "admin-badge--success"}`}
                          >
                            {isCritical ? `⚠️ ${p.stock} adet (Kritik)` : `${p.stock} adet`}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`admin-badge ${p.status === "active" ? "admin-badge--success" : p.status === "draft" ? "admin-badge--warning" : "admin-badge--neutral"}`}
                          >
                            {p.status === "active" ? "Satışta" : p.status === "draft" ? "Taslak" : "Pasif"}
                          </span>
                          {Boolean(p.isFeatured) && (
                            <span style={{ marginLeft: "4px", fontSize: "12px" }} title="Vitrinde Öne Çıkarılan">
                              ⭐
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <Link
                            className="admin-btn admin-btn-secondary admin-btn-sm"
                            href={`/yonetim/urunler/${p.id}`}
                          >
                            Düzenle
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "48px 24px", color: "var(--admin-text-muted)" }}>
                      <span style={{ fontSize: "32px", display: "block", marginBottom: "8px" }}>📦</span>
                      <strong style={{ color: "var(--admin-text-main)", display: "block", fontSize: "15px" }}>Ürün Bulunamadı</strong>
                      <p style={{ margin: "4px 0 16px", fontSize: "12.5px" }}>Arama kriterlerine uygun ürün kaydı yok veya henüz ürün eklenmemiş.</p>
                      <Link className="admin-btn admin-btn-primary" href="/yonetim/urunler/yeni">
                        İlk Ürünü Ekle
                      </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
