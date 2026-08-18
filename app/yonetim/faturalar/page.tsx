import { withBasePath } from "../../base-path";
import type { Metadata } from "next";
import Link from "next/link";
import { and, desc, eq, or, sql, type SQL } from "drizzle-orm";
import { customers, softwareInvoices } from "../../../db/schema";
import { chatGPTSignOutPath } from "../../chatgpt-auth";
import { requireAdminUser } from "../../admin-auth";
import { normalizeLeadSearch, escapeLeadLike } from "../../lead-search.mjs";
import { clampLeadPage, getLeadTotalPages, LEAD_PAGE_SIZE, parseLeadPage } from "../../lead-pagination.mjs";
import { INVOICE_STATUS_OPTIONS, invoiceStatusLabel, isInvoiceStatus } from "../../software-invoice-admin.mjs";
import { AdminShell } from "../admin-shell";
import { parseAdminCustomerId, parseAdminOrderId, adminCustomerListHref } from "../../admin-customer-query.mjs";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Yazılım Faturaları | Avcı Yönetim",
  robots: { index: false, follow: false },
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Istanbul",
  }).format(new Date(value));
}

export default async function SoftwareInvoicesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await requireAdminUser("/yonetim/faturalar");
  if (!admin.authorized || !admin.user) {
    return (
      <main className="admin-access-page">
        <section>
          <span className="admin-lock" aria-hidden="true">×</span>
          <span className="kicker kicker-light">YETKİLİ ERİŞİMİ</span>
          <h1>Bu hesap faturaları göremez.</h1>
          <p>Giriş yaptığınız <strong>{admin.user?.email}</strong> adresi yönetici izin listesinde bulunmuyor.</p>
          <div>
            <Link className="button button-primary" href="/">Ana sayfaya dön</Link>
            <a className="button button-ghost" href={chatGPTSignOutPath("/yonetim/faturalar")}>Farklı hesapla giriş yap</a>
          </div>
        </section>
      </main>
    );
  }

  const params = await searchParams;
  const search = normalizeLeadSearch(firstValue(params.q));
  const requestedStatus = firstValue(params.status) ?? "all";
  const status = isInvoiceStatus(requestedStatus) ? requestedStatus : "all";
  const requestedPage = parseLeadPage(firstValue(params.page) ?? "1");
  const customerId = parseAdminCustomerId(firstValue(params.musteri));
  const orderId = parseAdminOrderId(firstValue(params.siparis));
  const missingOrder = !orderId && firstValue(params.eksik) === "siparis";

  const conditions: SQL[] = [];
  if (status !== "all") conditions.push(eq(softwareInvoices.status, status));
  if (customerId) conditions.push(eq(softwareInvoices.customerId, customerId));
  if (orderId) conditions.push(eq(softwareInvoices.orderId, orderId));
  if (missingOrder) conditions.push(sql`${softwareInvoices.orderId} is null`);
  if (search) {
    const pattern = `%${escapeLeadLike(search)}%`;
    const searchCondition = or(
      sql`${softwareInvoices.title} LIKE ${pattern} ESCAPE '\\'`,
      sql`${softwareInvoices.amountNote} LIKE ${pattern} ESCAPE '\\'`,
      sql`${customers.name} LIKE ${pattern} ESCAPE '\\'`,
      sql`${customers.company} LIKE ${pattern} ESCAPE '\\'`,
    );
    if (searchCondition) conditions.push(searchCondition);
  }
  const where = conditions.length ? and(...conditions) : undefined;

  let rows: Array<{
    id: number;
    customerId: number;
    orderId: number | null;
    title: string;
    amountNote: string;
    status: string;
    createdAt: string;
    customerName: string | null;
    customerCompany: string | null;
  }> = [];
  let summary: Array<{ status: string; count: number }> = [];
  let totalMatches = 0;
  let currentPage = requestedPage;
  let scopedCustomerName = "";
  let databaseFailed = false;

  try {
    const { getDb } = await import("../../../db");
    const db = getDb();
    const [resultSummary, resultTotal, scopedRows] = await Promise.all([
      db.select({ status: softwareInvoices.status, count: sql<number>`count(*)` }).from(softwareInvoices).groupBy(softwareInvoices.status),
      db.select({ count: sql<number>`count(*)` })
        .from(softwareInvoices)
        .leftJoin(customers, eq(softwareInvoices.customerId, customers.id))
        .where(where),
      customerId
        ? db.select({ id: customers.id, name: customers.name }).from(customers).where(eq(customers.id, customerId)).limit(1)
        : Promise.resolve([]),
    ]);
    summary = resultSummary;
    totalMatches = Number(resultTotal[0]?.count ?? 0);
    scopedCustomerName = scopedRows[0]?.name ?? "";
    currentPage = clampLeadPage(requestedPage, totalMatches);
    rows = await db
      .select({
        id: softwareInvoices.id,
        customerId: softwareInvoices.customerId,
        orderId: softwareInvoices.orderId,
        title: softwareInvoices.title,
        amountNote: softwareInvoices.amountNote,
        status: softwareInvoices.status,
        createdAt: softwareInvoices.createdAt,
        customerName: customers.name,
        customerCompany: customers.company,
      })
      .from(softwareInvoices)
      .leftJoin(customers, eq(softwareInvoices.customerId, customers.id))
      .where(where)
      .orderBy(desc(softwareInvoices.createdAt), desc(softwareInvoices.id))
      .limit(LEAD_PAGE_SIZE)
      .offset((currentPage - 1) * LEAD_PAGE_SIZE);
  } catch (cause) {
    console.error("Software invoices page failed", cause);
    databaseFailed = true;
  }

  if (databaseFailed) {
    return (
      <main className="admin-access-page">
        <section>
          <span className="admin-lock" aria-hidden="true">!</span>
          <span className="kicker kicker-light">VERİTABANI HAZIR DEĞİL</span>
          <h1>Faturalar şu anda açılamıyor.</h1>
          <Link className="button button-primary" href="/yonetim">Panele dön</Link>
        </section>
      </main>
    );
  }

  const counts = Object.fromEntries(summary.map((item) => [item.status, Number(item.count)]));
  const totalPages = getLeadTotalPages(totalMatches);
  const pageHref = (page: number) => adminCustomerListHref("/yonetim/faturalar", customerId, {
    q: search,
    status: status !== "all" ? status : "",
    siparis: orderId || "",
    eksik: missingOrder ? "siparis" : "",
    page: page > 1 ? page : "",
  });
  const scopeQuery = adminCustomerListHref("/yonetim/faturalar", customerId, { siparis: orderId || "" });
  const hasExtraFilter = Boolean(search || status !== "all" || missingOrder);
  const hasScope = Boolean(customerId || orderId);
  const title = orderId
    ? `Sipariş #${orderId} faturaları`
    : customerId && scopedCustomerName
      ? `${scopedCustomerName} faturaları`
      : customerId
        ? "Müşteri faturaları"
        : "Yazılım faturaları";
  const backHref = orderId ? `/yonetim/siparisler/${orderId}` : customerId ? `/yonetim/musteriler/${customerId}` : "/yonetim";
  const backLabel = orderId ? "Siparişe dön" : customerId ? "Müşteri kartına dön" : "Panele dön";
  const createHref = adminCustomerListHref("/yonetim/faturalar/yeni", customerId, { siparis: orderId || "" });

  return (
    <AdminShell current="faturalar" displayName={admin.user.displayName}>
      <section className="admin-main">
        <header className="admin-heading">
          <div>
            <span className="kicker">AVCI YÖNETİM</span>
            <h1>{title}</h1>
            <Link className="admin-back-link" href={backHref}>{backLabel}</Link>
          </div>
          <div className="admin-heading-actions">
            <p>Altyapı / modül faturası. Mağaza fişi veya kart çekimi değil. e-Fatura / e-Arşiv yok.</p>
            <Link href={createHref}>Yeni fatura</Link>
          </div>
        </header>

        <form action={withBasePath("/yonetim/faturalar")} method="get">
          <fieldset className="admin-filters is-simple">
            <legend className="visually-hidden">Fatura listesini filtrele</legend>
            {customerId ? <input type="hidden" name="musteri" value={customerId} /> : null}
            {orderId ? <input type="hidden" name="siparis" value={orderId} /> : null}
            <label><span>Ara</span><input name="q" type="search" defaultValue={search} placeholder="Başlık, tutar, müşteri" /></label>
            <label>
              <span>Durum</span>
              <select name="status" defaultValue={status}>
                <option value="all">Tüm durumlar</option>
                {INVOICE_STATUS_OPTIONS.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
              </select>
            </label>
            {orderId ? null : (
              <label>
                <span>Sipariş</span>
                <select name="eksik" defaultValue={missingOrder ? "siparis" : "all"}>
                  <option value="all">Tümü</option>
                  <option value="siparis">Siparişi yok</option>
                </select>
              </label>
            )}
            <button type="submit">Filtrele</button>
            {(hasExtraFilter || hasScope) && <Link href={hasExtraFilter ? scopeQuery : "/yonetim/faturalar"}>{hasExtraFilter ? "Temizle" : "Tüm faturalar"}</Link>}
          </fieldset>
        </form>

        <div className="admin-stats">
          <article><small>Toplam</small><strong>{summary.reduce((sum, item) => sum + Number(item.count), 0)}</strong><span>yazılım faturası</span></article>
          <article><small>Taslak</small><strong>{counts.draft ?? 0}</strong><span><Link href={adminCustomerListHref("/yonetim/faturalar", customerId, { siparis: orderId || "", eksik: missingOrder ? "siparis" : "", status: "draft" })}>henüz gönderilmedi</Link></span></article>
          <article><small>Ödendi</small><strong>{counts.paid ?? 0}</strong><span><Link href={adminCustomerListHref("/yonetim/faturalar", customerId, { siparis: orderId || "", eksik: missingOrder ? "siparis" : "", status: "paid" })}>tahsil kaydı</Link></span></article>
          <article><small>Eşleşen</small><strong>{totalMatches}</strong><span>filtre sonucu</span></article>
        </div>

        {rows.length ? (
          <div className="lead-table-wrap">
            <table className="lead-table">
              <caption className="visually-hidden">Yazılım faturaları</caption>
              <thead><tr><th scope="col">Fatura</th><th scope="col">Müşteri</th><th scope="col">Tutar</th><th scope="col">Durum</th><th scope="col">Kayıt</th></tr></thead>
              <tbody>
                {rows.map((item) => (
                  <tr key={item.id}>
                    <th scope="row">
                      <Link className="lead-detail-link" href={`/yonetim/faturalar/${item.id}`}>{item.title}</Link>
                      <small>
                        {item.orderId
                          ? <Link href={`/yonetim/siparisler/${item.orderId}`}>Sipariş #{item.orderId}</Link>
                          : (item.customerId
                            ? <Link href={`/yonetim/siparisler/yeni?musteri=${item.customerId}`}>Sipariş bağla</Link>
                            : "Sipariş bağlı değil")}
                      </small>
                    </th>
                    <td>
                      {item.customerId
                        ? <Link href={`/yonetim/musteriler/${item.customerId}`}>{item.customerName || "Müşteri silinmiş"}</Link>
                        : (item.customerName || "Müşteri silinmiş")}
                      <small>{item.customerCompany || "Firma belirtilmedi"}</small>
                    </td>
                    <td>{item.amountNote || "Tutar yazılmadı"}</td>
                    <td>{invoiceStatusLabel(item.status)}</td>
                    <td><time dateTime={item.createdAt}>{formatDate(item.createdAt)}</time></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-empty">
            <h2>{search || status !== "all" || hasScope || missingOrder ? "Eşleşen fatura yok." : "Henüz yazılım faturası yok."}</h2>
            <p>{search || status !== "all" || hasScope || missingOrder ? "Filtreleri değiştirin." : "Önce müşteri ekleyin, sonra fatura kaydı açın."}</p>
            <Link className="button button-primary" href={createHref}>İlk faturayı ekle</Link>
          </div>
        )}

        {totalMatches > 0 && (
          <nav className="admin-pagination" aria-label="Fatura sayfaları">
            {currentPage > 1 ? <Link href={pageHref(currentPage - 1)}>Önceki</Link> : <span />}
            <p>Sayfa <strong>{Math.min(currentPage, totalPages)}</strong> / {totalPages}</p>
            {currentPage < totalPages ? <Link href={pageHref(currentPage + 1)}>Sonraki</Link> : <span />}
          </nav>
        )}
      </section>
    </AdminShell>
  );
}
