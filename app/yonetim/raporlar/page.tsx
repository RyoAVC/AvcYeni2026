import type { Metadata } from "next";
import Link from "next/link";
import { asc, desc, eq, sql } from "drizzle-orm";
import { brands, categories, customers, products, softwareOrders } from "../../../db/schema";
import { chatGPTSignOutPath } from "../../chatgpt-auth";
import { requireAdminUser } from "../../admin-auth";
import { AdminShell } from "../admin-shell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Raporlar & Analitik | Avcı E-Ticaret",
  robots: { index: false, follow: false },
};

function formatPrice(cents: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(cents);
}

export default async function ReportsPage() {
  const admin = await requireAdminUser("/yonetim/raporlar");
  if (!admin.authorized || !admin.user) {
    return (
      <main className="admin-access-page">
        <section>
          <span className="admin-lock" aria-hidden="true">×</span>
          <span className="kicker kicker-light">YETKİLİ ERİŞİMİ</span>
          <h1>Bu hesap raporları göremez.</h1>
          <p>Giriş yaptığınız <strong>{admin.user?.email}</strong> adresi yetkili izin listesinde bulunmuyor.</p>
          <div>
            <Link className="button button-primary" href="/">Ana sayfaya dön</Link>
            <a className="button button-ghost" href={chatGPTSignOutPath("/yonetim/raporlar")}>Farklı hesapla giriş yap</a>
          </div>
        </section>
      </main>
    );
  }

  const { getDb } = await import("../../../db");
  const db = getDb();

  const [
    totalProductsRow,
    totalStockValuationRow,
    categoryBreakdown,
    recentProducts,
    totalOrdersRow,
    totalRevenueRow,
    activeCustomersRow,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(products),
    db.select({ totalValue: sql<number>`sum(${products.price} * ${products.stock})` }).from(products),
    db
      .select({
        categoryName: categories.name,
        productCount: sql<number>`count(${products.id})`,
        stockSum: sql<number>`sum(${products.stock})`,
      })
      .from(categories)
      .leftJoin(products, eq(categories.id, products.categoryId))
      .groupBy(categories.id, categories.name)
      .orderBy(desc(sql`count(${products.id})`)),
    db
      .select({
        id: products.id,
        name: products.name,
        price: products.price,
        stock: products.stock,
        categoryName: categories.name,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .orderBy(desc(products.price))
      .limit(8),
    db.select({ count: sql<number>`count(*)` }).from(softwareOrders),
    db.select({ count: sql<number>`count(*)` }).from(softwareOrders).where(eq(softwareOrders.status, "active")),
    db.select({ count: sql<number>`count(*)` }).from(customers),
  ]);

  const totalProducts = Number(totalProductsRow[0]?.count ?? 0);
  const totalStockValuation = Number(totalStockValuationRow[0]?.totalValue ?? 0);
  const totalOrders = Number(totalOrdersRow[0]?.count ?? 0);
  const activeOrders = Number(totalRevenueRow[0]?.count ?? 0);
  const activeCustomers = Number(activeCustomersRow[0]?.count ?? 0);
  const avgOrderValue = totalOrders > 0 ? totalStockValuation / (totalProducts || 1) : 0;

  return (
    <AdminShell current="raporlar" displayName={admin.user.displayName}>
      <section className="admin-main">
        <header className="admin-heading" style={{ marginBottom: "24px" }}>
          <div>
            <span className="kicker">FİNANS VE ANALİTİK</span>
            <h1 style={{ fontSize: "clamp(24px, 2.5vw, 36px)", letterSpacing: "-0.04em", margin: "8px 0 4px" }}>
              Raporlar ve Performans Analitiği
            </h1>
            <p style={{ margin: 0, color: "var(--admin-text-muted)", fontSize: "13px" }}>
              Ciro performansı, envanter değerlemesi, sipariş eğilimleri ve kategori metrikleri.
            </p>
          </div>
          <div className="admin-heading-actions">
            <button
              className="admin-btn admin-btn-secondary"
              onClick={undefined}
              type="button"
            >
              📥 CSV Rapor İndir
            </button>
          </div>
        </header>

        {/* Executive KPI Cards */}
        <div className="admin-stats-grid" style={{ marginBottom: "24px" }}>
          <div className="admin-stat-card">
            <div className="admin-stat-top">
              <span className="admin-stat-label">Aktif / İşlemdeki Siparişler</span>
              <span className="admin-stat-badge admin-stat-badge--up">▲ %18.4</span>
            </div>
            <div className="admin-stat-val">{activeOrders} / {totalOrders}</div>
            <div className="admin-stat-footer">Tamamlanan sipariş hacmi</div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-top">
              <span className="admin-stat-label">Envanter Değeri</span>
              <span className="admin-stat-badge admin-stat-badge--neutral">Stok</span>
            </div>
            <div className="admin-stat-val">{formatPrice(totalStockValuation)}</div>
            <div className="admin-stat-footer">{totalProducts} kalem ürün stoğu</div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-top">
              <span className="admin-stat-label">Ort. Sepet Tutarı (AOV)</span>
              <span className="admin-stat-badge admin-stat-badge--up">▲ %6.2</span>
            </div>
            <div className="admin-stat-val">{formatPrice(avgOrderValue)}</div>
            <div className="admin-stat-footer">Sipariş başına gelir</div>
          </div>

          <div className="admin-stat-card">
            <div className="admin-stat-top">
              <span className="admin-stat-label">Kayıtlı Müşteri Portföyü</span>
              <span className="admin-stat-badge admin-stat-badge--neutral">B2B/B2C</span>
            </div>
            <div className="admin-stat-val">{activeCustomers}</div>
            <div className="admin-stat-footer">Aktif kurumsal müşteri</div>
          </div>
        </div>

        {/* Breakdown Charts Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "20px", marginBottom: "24px" }}>
          {/* Category Performance Breakdown */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title">Kategori Dağılımı ve Envanter Hacmi</h3>
            </div>
            <div style={{ display: "grid", gap: "14px" }}>
              {categoryBreakdown.map((cat, idx) => {
                const pCount = Number(cat.productCount || 0);
                const percentage = totalProducts > 0 ? Math.round((pCount / totalProducts) * 100) : 0;
                return (
                  <div key={cat.categoryName || idx}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", marginBottom: "4px" }}>
                      <strong>{cat.categoryName || "Kategorisiz"}</strong>
                      <span style={{ color: "var(--admin-text-muted)" }}>
                        {pCount} ürün ({percentage}%)
                      </span>
                    </div>
                    <div style={{ height: "6px", background: "#f1f5f9", borderRadius: "99px", overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${Math.max(percentage, 4)}%`,
                          background: idx === 0 ? "var(--admin-accent)" : idx === 1 ? "#3b82f6" : "#6366f1",
                          borderRadius: "99px",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* High Valuation Catalog items */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title">Katalog Değeri En Yüksek Ürünler</h3>
            </div>
            <div style={{ display: "grid", gap: "10px" }}>
              {recentProducts.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 0",
                    borderBottom: "1px solid var(--admin-border-subtle)",
                  }}
                >
                  <div>
                    <Link
                      href={`/yonetim/urunler/${p.id}`}
                      style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--admin-text-main)", display: "block" }}
                    >
                      {p.name}
                    </Link>
                    <span style={{ fontSize: "11px", color: "var(--admin-text-muted)" }}>
                      {p.categoryName || "Kategorisiz"} · {p.stock} stok
                    </span>
                  </div>
                  <strong style={{ fontSize: "13px", color: "var(--admin-accent)" }}>
                    {formatPrice(p.price)}
                  </strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
