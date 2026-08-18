import { withBasePath } from "../../base-path";
import type { Metadata } from "next";
import Link from "next/link";
import { and, asc, eq, or, sql, type SQL } from "drizzle-orm";
import { packages } from "../../../db/schema";
import { chatGPTSignOutPath } from "../../chatgpt-auth";
import { requireAdminUser } from "../../admin-auth";
import { normalizeLeadSearch, escapeLeadLike } from "../../lead-search.mjs";
import { clampLeadPage, getLeadTotalPages, LEAD_PAGE_SIZE, parseLeadPage } from "../../lead-pagination.mjs";
import {
  PACKAGE_FAMILY_OPTIONS,
  PACKAGE_STATUS_OPTIONS,
  isPackageFamily,
  isPackageStatus,
  packageFamilyLabel,
  packageStatusLabel,
} from "../../package-admin.mjs";
import { AdminShell } from "../admin-shell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Yazılım Paketleri | Avcı Yönetim",
  robots: { index: false, follow: false },
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function featureCount(value: string) {
  return value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).length;
}

export default async function PackagesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await requireAdminUser("/yonetim/paketler");
  if (!admin.authorized || !admin.user) {
    return (
      <main className="admin-access-page">
        <section>
          <span className="admin-lock" aria-hidden="true">×</span>
          <span className="kicker kicker-light">YETKİLİ ERİŞİMİ</span>
          <h1>Bu hesap paketleri göremez.</h1>
          <p>Giriş yaptığınız <strong>{admin.user?.email}</strong> adresi yönetici izin listesinde bulunmuyor.</p>
          <div>
            <Link className="button button-primary" href="/">Ana sayfaya dön</Link>
            <a className="button button-ghost" href={chatGPTSignOutPath("/yonetim/paketler")}>Farklı hesapla giriş yap</a>
          </div>
        </section>
      </main>
    );
  }

  const params = await searchParams;
  const search = normalizeLeadSearch(firstValue(params.q));
  const requestedStatus = firstValue(params.status) ?? "all";
  const requestedFamily = firstValue(params.family) ?? "all";
  const status = isPackageStatus(requestedStatus) ? requestedStatus : "all";
  const family = isPackageFamily(requestedFamily) ? requestedFamily : "all";
  const requestedPage = parseLeadPage(firstValue(params.page) ?? "1");

  const conditions: SQL[] = [];
  if (status !== "all") conditions.push(eq(packages.status, status));
  if (family !== "all") conditions.push(eq(packages.family, family));
  if (search) {
    const pattern = `%${escapeLeadLike(search)}%`;
    const searchCondition = or(
      sql`${packages.name} LIKE ${pattern} ESCAPE '\\'`,
      sql`${packages.slug} LIKE ${pattern} ESCAPE '\\'`,
      sql`${packages.summary} LIKE ${pattern} ESCAPE '\\'`,
    );
    if (searchCondition) conditions.push(searchCondition);
  }
  const where = conditions.length ? and(...conditions) : undefined;

  let rows: Array<typeof packages.$inferSelect> = [];
  let summary: Array<{ status: string; count: number }> = [];
  let totalMatches = 0;
  let currentPage = requestedPage;
  let databaseFailed = false;

  try {
    const { getDb } = await import("../../../db");
    const db = getDb();
    const [resultSummary, resultTotal] = await Promise.all([
      db.select({ status: packages.status, count: sql<number>`count(*)` }).from(packages).groupBy(packages.status),
      db.select({ count: sql<number>`count(*)` }).from(packages).where(where),
    ]);
    summary = resultSummary;
    totalMatches = Number(resultTotal[0]?.count ?? 0);
    currentPage = clampLeadPage(requestedPage, totalMatches);
    rows = await db
      .select()
      .from(packages)
      .where(where)
      .orderBy(asc(packages.sortOrder), asc(packages.id))
      .limit(LEAD_PAGE_SIZE)
      .offset((currentPage - 1) * LEAD_PAGE_SIZE);
  } catch (cause) {
    console.error("Packages page failed", cause);
    databaseFailed = true;
  }

  if (databaseFailed) {
    return (
      <main className="admin-access-page">
        <section>
          <span className="admin-lock" aria-hidden="true">!</span>
          <span className="kicker kicker-light">VERİTABANI HAZIR DEĞİL</span>
          <h1>Paket kayıtları şu anda açılamıyor.</h1>
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
    if (family !== "all") query.set("family", family);
    if (page > 1) query.set("page", String(page));
    const text = query.toString();
    return text ? `/yonetim/paketler?${text}` : "/yonetim/paketler";
  };

  return (
    <AdminShell current="paketler" displayName={admin.user.displayName}>
      <section className="admin-main">
        <header className="admin-heading">
          <div>
            <span className="kicker">AVCI YÖNETİM</span>
            <h1>Yazılım paketleri</h1>
            <Link className="admin-back-link" href="/yonetim">Panele dön</Link>
          </div>
          <div className="admin-heading-actions">
            <p>Avcı’nın sattığı altyapı çerçeveleri. Kıyafet / SKU kataloğu değil. Kesin fiyat teklifte netleşir.</p>
            <Link href="/yonetim/paketler/yeni">Yeni paket</Link>
          </div>
        </header>

        <form action={withBasePath("/yonetim/paketler")} method="get">
          <fieldset className="admin-filters is-simple">
            <legend className="visually-hidden">Paket listesini filtrele</legend>
            <label><span>Ara</span><input name="q" type="search" defaultValue={search} placeholder="Ad, kod veya özet" /></label>
            <label>
              <span>Aile</span>
              <select name="family" defaultValue={family}>
                <option value="all">Tüm aileler</option>
                {PACKAGE_FAMILY_OPTIONS.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
              </select>
            </label>
            <label>
              <span>Durum</span>
              <select name="status" defaultValue={status}>
                <option value="all">Tüm durumlar</option>
                {PACKAGE_STATUS_OPTIONS.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
              </select>
            </label>
            <button type="submit">Filtrele</button>
            {(search || status !== "all" || family !== "all") && <Link href="/yonetim/paketler">Temizle</Link>}
          </fieldset>
        </form>

        <div className="admin-stats">
          <article><small>Toplam</small><strong>{summary.reduce((sum, item) => sum + Number(item.count), 0)}</strong><span>yazılım paketi</span></article>
          <article><small>Yayında</small><strong>{counts.live ?? 0}</strong><span>satışta gösterilir</span></article>
          <article><small>Taslak</small><strong>{counts.draft ?? 0}</strong><span>henüz hazır değil</span></article>
          <article><small>Eşleşen</small><strong>{totalMatches}</strong><span>filtre sonucu</span></article>
        </div>

        {rows.length ? (
          <div className="lead-table-wrap">
            <table className="lead-table">
              <caption className="visually-hidden">Yazılım paketleri</caption>
              <thead><tr><th scope="col">Paket</th><th scope="col">Aile</th><th scope="col">Fiyat notu</th><th scope="col">Durum</th><th scope="col">Sıra</th></tr></thead>
              <tbody>
                {rows.map((item) => (
                  <tr key={item.id}>
                    <th scope="row">
                      <Link className="lead-detail-link" href={`/yonetim/paketler/${item.id}`}>{item.name}</Link>
                      <small>{item.slug} · {featureCount(item.features)} madde</small>
                    </th>
                    <td>
                      <span className="lead-interest">{packageFamilyLabel(item.family)}</span>
                      <Link href={`/yonetim/siparisler?paketId=${item.id}`}>Siparişler</Link>
                      <Link href={`/yonetim/siparisler/yeni?paketId=${item.id}`}>Sipariş ekle</Link>
                    </td>
                    <td>{item.priceNote || "Teklifle belirlenir"}</td>
                    <td>{packageStatusLabel(item.status)}</td>
                    <td>{item.sortOrder}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-empty">
            <h2>{search || status !== "all" || family !== "all" ? "Eşleşen paket yok." : "Henüz yazılım paketi yok."}</h2>
            <p>{search || status !== "all" || family !== "all" ? "Filtreleri değiştirin." : "Start / Scale veya özel bir çerçeve ekleyin."}</p>
            <Link className="button button-primary" href="/yonetim/paketler/yeni">İlk paketi ekle</Link>
          </div>
        )}

        {totalMatches > 0 && (
          <nav className="admin-pagination" aria-label="Paket sayfaları">
            {currentPage > 1 ? <Link href={pageHref(currentPage - 1)}>Önceki</Link> : <span />}
            <p>Sayfa <strong>{Math.min(currentPage, totalPages)}</strong> / {totalPages}</p>
            {currentPage < totalPages ? <Link href={pageHref(currentPage + 1)}>Sonraki</Link> : <span />}
          </nav>
        )}
      </section>
    </AdminShell>
  );
}
