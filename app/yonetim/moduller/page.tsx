import { withBasePath } from "../../base-path";
import type { Metadata } from "next";
import Link from "next/link";
import { and, asc, eq, or, sql, type SQL } from "drizzle-orm";
import { modules } from "../../../db/schema";
import { chatGPTSignOutPath } from "../../chatgpt-auth";
import { requireAdminUser } from "../../admin-auth";
import { normalizeLeadSearch, escapeLeadLike } from "../../lead-search.mjs";
import { clampLeadPage, getLeadTotalPages, LEAD_PAGE_SIZE, parseLeadPage } from "../../lead-pagination.mjs";
import {
  MODULE_CATEGORY_OPTIONS,
  MODULE_STATUS_OPTIONS,
  isModuleCategory,
  isModuleStatus,
  moduleCategoryLabel,
  moduleStatusLabel,
} from "../../module-admin.mjs";
import { AdminShell } from "../admin-shell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Yazılım Modülleri | Avcı Yönetim",
  robots: { index: false, follow: false },
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function featureCount(value: string) {
  return value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).length;
}

export default async function ModulesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await requireAdminUser("/yonetim/moduller");
  if (!admin.authorized || !admin.user) {
    return (
      <main className="admin-access-page">
        <section>
          <span className="admin-lock" aria-hidden="true">×</span>
          <span className="kicker kicker-light">YETKİLİ ERİŞİMİ</span>
          <h1>Bu hesap modülleri göremez.</h1>
          <p>Giriş yaptığınız <strong>{admin.user?.email}</strong> adresi yönetici izin listesinde bulunmuyor.</p>
          <div>
            <Link className="button button-primary" href="/">Ana sayfaya dön</Link>
            <a className="button button-ghost" href={chatGPTSignOutPath("/yonetim/moduller")}>Farklı hesapla giriş yap</a>
          </div>
        </section>
      </main>
    );
  }

  const params = await searchParams;
  const search = normalizeLeadSearch(firstValue(params.q));
  const requestedStatus = firstValue(params.status) ?? "all";
  const requestedCategory = firstValue(params.category) ?? "all";
  const status = isModuleStatus(requestedStatus) ? requestedStatus : "all";
  const category = isModuleCategory(requestedCategory) ? requestedCategory : "all";
  const requestedPage = parseLeadPage(firstValue(params.page) ?? "1");

  const conditions: SQL[] = [];
  if (status !== "all") conditions.push(eq(modules.status, status));
  if (category !== "all") conditions.push(eq(modules.category, category));
  if (search) {
    const pattern = `%${escapeLeadLike(search)}%`;
    const searchCondition = or(
      sql`${modules.name} LIKE ${pattern} ESCAPE '\\'`,
      sql`${modules.slug} LIKE ${pattern} ESCAPE '\\'`,
      sql`${modules.summary} LIKE ${pattern} ESCAPE '\\'`,
    );
    if (searchCondition) conditions.push(searchCondition);
  }
  const where = conditions.length ? and(...conditions) : undefined;

  let rows: Array<typeof modules.$inferSelect> = [];
  let summary: Array<{ status: string; count: number }> = [];
  let totalMatches = 0;
  let currentPage = requestedPage;
  let databaseFailed = false;

  try {
    const { getDb } = await import("../../../db");
    const db = getDb();
    const [resultSummary, resultTotal] = await Promise.all([
      db.select({ status: modules.status, count: sql<number>`count(*)` }).from(modules).groupBy(modules.status),
      db.select({ count: sql<number>`count(*)` }).from(modules).where(where),
    ]);
    summary = resultSummary;
    totalMatches = Number(resultTotal[0]?.count ?? 0);
    currentPage = clampLeadPage(requestedPage, totalMatches);
    rows = await db
      .select()
      .from(modules)
      .where(where)
      .orderBy(asc(modules.sortOrder), asc(modules.id))
      .limit(LEAD_PAGE_SIZE)
      .offset((currentPage - 1) * LEAD_PAGE_SIZE);
  } catch (cause) {
    console.error("Modules page failed", cause);
    databaseFailed = true;
  }

  if (databaseFailed) {
    return (
      <main className="admin-access-page">
        <section>
          <span className="admin-lock" aria-hidden="true">!</span>
          <span className="kicker kicker-light">VERİTABANI HAZIR DEĞİL</span>
          <h1>Modül kayıtları şu anda açılamıyor.</h1>
          <Link className="button button-primary" href="/yonetim">Panele dön</Link>
        </section>
      </main>
    );
  }

  const counts = Object.fromEntries(summary.map((item) => [item.status, Number(item.count)]));
  const totalPages = getLeadTotalPages(totalMatches);
  const pageHref = (page: number) => {
    const query = new URLSearchParams();
    if (search) query.set("q", search);
    if (status !== "all") query.set("status", status);
    if (category !== "all") query.set("category", category);
    if (page > 1) query.set("page", String(page));
    const text = query.toString();
    return text ? `/yonetim/moduller?${text}` : "/yonetim/moduller";
  };

  return (
    <AdminShell current="moduller" displayName={admin.user.displayName}>
      <section className="admin-main">
        <header className="admin-heading">
          <div>
            <span className="kicker">AVCI YÖNETİM</span>
            <h1>Yazılım modülleri</h1>
            <Link className="admin-back-link" href="/yonetim">Panele dön</Link>
          </div>
          <div className="admin-heading-actions">
            <p>Avcı’nın sattığı eklentiler: pazaryeri, ödeme, kargo. Mağaza ürün stoğu değil. Kesin fiyat teklifte netleşir.</p>
            <Link href="/yonetim/moduller/yeni">Yeni modül</Link>
          </div>
        </header>

        <form action={withBasePath("/yonetim/moduller")} method="get">
          <fieldset className="admin-filters is-simple">
            <legend className="visually-hidden">Modül listesini filtrele</legend>
            <label><span>Ara</span><input name="q" type="search" defaultValue={search} placeholder="Ad, kod veya özet" /></label>
            <label>
              <span>Kategori</span>
              <select name="category" defaultValue={category}>
                <option value="all">Tüm kategoriler</option>
                {MODULE_CATEGORY_OPTIONS.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
              </select>
            </label>
            <label>
              <span>Durum</span>
              <select name="status" defaultValue={status}>
                <option value="all">Tüm durumlar</option>
                {MODULE_STATUS_OPTIONS.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
              </select>
            </label>
            <button type="submit">Filtrele</button>
            {(search || status !== "all" || category !== "all") && <Link href="/yonetim/moduller">Temizle</Link>}
          </fieldset>
        </form>

        <div className="admin-stats">
          <article><small>Toplam</small><strong>{summary.reduce((sum, item) => sum + Number(item.count), 0)}</strong><span>yazılım modülü</span></article>
          <article><small>Yayında</small><strong>{counts.live ?? 0}</strong><span>satışta gösterilir</span></article>
          <article><small>Taslak</small><strong>{counts.draft ?? 0}</strong><span>henüz hazır değil</span></article>
          <article><small>Eşleşen</small><strong>{totalMatches}</strong><span>filtre sonucu</span></article>
        </div>

        {rows.length ? (
          <div className="lead-table-wrap">
            <table className="lead-table">
              <caption className="visually-hidden">Yazılım modülleri</caption>
              <thead><tr><th scope="col">Modül</th><th scope="col">Kategori</th><th scope="col">Fiyat notu</th><th scope="col">Durum</th><th scope="col">Sıra</th></tr></thead>
              <tbody>
                {rows.map((item) => (
                  <tr key={item.id}>
                    <th scope="row">
                      <Link className="lead-detail-link" href={`/yonetim/moduller/${item.id}`}>{item.name}</Link>
                      <small>{item.slug} · {featureCount(item.features)} madde</small>
                    </th>
                    <td>
                      <span className="lead-interest">{moduleCategoryLabel(item.category)}</span>
                      <Link href={`/yonetim/siparisler?modulId=${item.id}`}>Siparişler</Link>
                      <Link href={`/yonetim/siparisler/yeni?modulId=${item.id}`}>Sipariş ekle</Link>
                    </td>
                    <td>{item.priceNote || "Teklifle belirlenir"}</td>
                    <td>{moduleStatusLabel(item.status)}</td>
                    <td>{item.sortOrder}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-empty">
            <h2>{search || status !== "all" || category !== "all" ? "Eşleşen modül yok." : "Henüz yazılım modülü yok."}</h2>
            <p>{search || status !== "all" || category !== "all" ? "Filtreleri değiştirin." : "Trendyol, PayTR veya kargo eklentisi ekleyin."}</p>
            <Link className="button button-primary" href="/yonetim/moduller/yeni">İlk modülü ekle</Link>
          </div>
        )}

        {totalMatches > 0 && (
          <nav className="admin-pagination" aria-label="Modül sayfaları">
            {currentPage > 1 ? <Link href={pageHref(currentPage - 1)}>Önceki</Link> : <span />}
            <p>Sayfa <strong>{Math.min(currentPage, totalPages)}</strong> / {totalPages}</p>
            {currentPage < totalPages ? <Link href={pageHref(currentPage + 1)}>Sonraki</Link> : <span />}
          </nav>
        )}
      </section>
    </AdminShell>
  );
}
