import type { Metadata } from "next";
import Link from "next/link";
import { and, desc, eq, like, or, sql, type SQL } from "drizzle-orm";
import { auditLogs } from "../../../db/schema";
import { chatGPTSignOutPath } from "../../chatgpt-auth";
import { requireAdminUser } from "../../admin-auth";
import { normalizeLeadSearch } from "../../lead-search.mjs";
import { AdminShell } from "../admin-shell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sistem ve İşlem Logları | Avcı Yönetim",
  robots: { index: false, follow: false },
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await requireAdminUser("/yonetim/loglar");
  if (!admin.authorized || !admin.user) {
    return (
      <main className="admin-access-page">
        <section>
          <span className="admin-lock" aria-hidden="true">×</span>
          <span className="kicker kicker-light">YETKİLİ ERİŞİMİ</span>
          <h1>Bu hesap sistem loglarını göremez.</h1>
          <p>Giriş yaptığınız <strong>{admin.user?.email}</strong> adresi yetkili izin listesinde bulunmuyor.</p>
          <div>
            <Link className="button button-primary" href="/">Ana sayfaya dön</Link>
            <a className="button button-ghost" href={chatGPTSignOutPath("/yonetim/loglar")}>Farklı hesapla giriş yap</a>
          </div>
        </section>
      </main>
    );
  }

  const params = await searchParams;
  const search = normalizeLeadSearch(firstValue(params.q));
  const requestedAction = firstValue(params.action) ?? "all";
  const requestedEntity = firstValue(params.entity) ?? "all";

  const { getDb } = await import("../../../db");
  const db = getDb();

  const filters: SQL[] = [];
  if (search) {
    const pattern = `%${search}%`;
    filters.push(
      or(
        like(auditLogs.userEmail, pattern),
        like(auditLogs.details, pattern),
        like(auditLogs.entityId, pattern)
      )!
    );
  }
  if (requestedAction && requestedAction !== "all") {
    filters.push(eq(auditLogs.action, requestedAction));
  }
  if (requestedEntity && requestedEntity !== "all") {
    filters.push(eq(auditLogs.entity, requestedEntity));
  }

  const whereClause = filters.length ? and(...filters) : undefined;

  const logs = await db
    .select()
    .from(auditLogs)
    .where(whereClause)
    .orderBy(desc(auditLogs.createdAt), desc(auditLogs.id))
    .limit(100);

  return (
    <AdminShell current="loglar" displayName={admin.user.displayName}>
      <section className="admin-main">
        <header className="admin-heading" style={{ marginBottom: "24px" }}>
          <div>
            <span className="kicker">GÜVENLİK VE İZ SÜRÜCÜ</span>
            <h1 style={{ fontSize: "clamp(24px, 2.5vw, 36px)", letterSpacing: "-0.04em", margin: "8px 0 4px" }}>
              Sistem Denetim Logları
            </h1>
            <p style={{ margin: 0, color: "var(--admin-text-muted)", fontSize: "13px" }}>
              Paneldeki tüm yönetici hareketleri, ürün/kategori değişiklikleri ve güvenlik olayları anlık kayıt altındadır.
            </p>
          </div>
        </header>

        {/* Filters */}
        <div className="admin-toolbar" style={{ marginBottom: "20px" }}>
          <form className="admin-toolbar-left" method="GET">
            <input
              className="admin-select"
              defaultValue={search}
              name="q"
              placeholder="Kullanıcı, işlem detayı ara..."
              style={{ width: "240px" }}
              type="search"
            />
            <select
              className="admin-select"
              defaultValue={requestedAction}
              name="action"
            >
              <option value="all">Tüm İşlemler</option>
              <option value="create">Oluşturma (create)</option>
              <option value="update">Güncelleme (update)</option>
              <option value="delete">Silme (delete)</option>
              <option value="login">Giriş (login)</option>
            </select>
            <select
              className="admin-select"
              defaultValue={requestedEntity}
              name="entity"
            >
              <option value="all">Tüm Modüller</option>
              <option value="product">Ürünler</option>
              <option value="category">Kategoriler</option>
              <option value="brand">Markalar</option>
              <option value="campaign">Kampanyalar</option>
              <option value="coupon">Kuponlar</option>
              <option value="integration">Entegrasyonlar</option>
              <option value="auth">Kimlik Doğrulama</option>
            </select>
            <button className="admin-btn admin-btn-secondary" type="submit">
              Filtrele
            </button>
            {(search || requestedAction !== "all" || requestedEntity !== "all") && (
              <Link className="admin-card-action" href="/yonetim/loglar" style={{ fontSize: "11.5px", marginLeft: "6px" }}>
                Temizle
              </Link>
            )}
          </form>
        </div>

        {/* Logs Table */}
        <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="admin-table-container" style={{ border: 0 }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: "160px" }}>ZAMAN</th>
                  <th>YÖNETİCİ</th>
                  <th>İŞLEM TÜRÜ</th>
                  <th>MODÜL</th>
                  <th>DETAYLAR</th>
                  <th>IP ADRESİ</th>
                </tr>
              </thead>
              <tbody>
                {logs.length ? (
                  logs.map((log) => {
                    const isDelete = log.action === "delete";
                    const isCreate = log.action === "create";
                    const isUpdate = log.action === "update";

                    return (
                      <tr key={log.id}>
                        <td>
                          <span style={{ fontSize: "12px", color: "var(--admin-text-muted)" }}>
                            {log.createdAt ? new Date(log.createdAt).toLocaleString("tr-TR") : "-"}
                          </span>
                        </td>
                        <td>
                          <strong style={{ fontSize: "12.5px" }}>{log.userEmail}</strong>
                        </td>
                        <td>
                          <span
                            className={`admin-badge ${isDelete ? "admin-badge--danger" : isCreate ? "admin-badge--success" : isUpdate ? "admin-badge--info" : "admin-badge--neutral"}`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: "12px", fontWeight: 600 }}>
                            {log.entity} {log.entityId ? `#${log.entityId}` : ""}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: "12px", color: "var(--admin-text-main)" }}>
                            {log.details}
                          </span>
                        </td>
                        <td>
                          <code style={{ fontSize: "11px", color: "var(--admin-text-muted)" }}>
                            {log.ipAddress || "local"}
                          </code>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "36px", color: "var(--admin-text-muted)" }}>
                      Henüz denetim kaydı bulunamadı.
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
