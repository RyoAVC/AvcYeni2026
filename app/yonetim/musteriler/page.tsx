import { withBasePath } from "../../base-path";
import type { Metadata } from "next";
import Link from "next/link";
import { and, desc, eq, notExists, or, sql, type SQL } from "drizzle-orm";
import { customers, softwareOrders } from "../../../db/schema";
import { chatGPTSignOutPath } from "../../chatgpt-auth";
import { requireAdminUser } from "../../admin-auth";
import { normalizeLeadSearch, escapeLeadLike } from "../../lead-search.mjs";
import { normalizeLeadPhone } from "../../lead-contact.mjs";
import { clampLeadPage, getLeadTotalPages, LEAD_PAGE_SIZE, parseLeadPage } from "../../lead-pagination.mjs";
import { CUSTOMER_STATUS_OPTIONS, customerStatusLabel, isCustomerStatus } from "../../customer-statuses";
import { AdminShell } from "../admin-shell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Yazılım Müşterileri | Avcı Yönetim",
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

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await requireAdminUser("/yonetim/musteriler");
  if (!admin.authorized || !admin.user) {
    return (
      <main className="admin-access-page">
        <section>
          <span className="admin-lock" aria-hidden="true">×</span>
          <span className="kicker kicker-light">YETKİLİ ERİŞİMİ</span>
          <h1>Bu hesap müşterileri göremez.</h1>
          <p>Giriş yaptığınız <strong>{admin.user?.email}</strong> adresi yönetici izin listesinde bulunmuyor.</p>
          <div>
            <Link className="button button-primary" href="/">Ana sayfaya dön</Link>
            <a className="button button-ghost" href={chatGPTSignOutPath("/yonetim/musteriler")}>Farklı hesapla giriş yap</a>
          </div>
        </section>
      </main>
    );
  }

  const params = await searchParams;
  const search = normalizeLeadSearch(firstValue(params.q));
  const requestedStatus = firstValue(params.status) ?? "all";
  const status = isCustomerStatus(requestedStatus) ? requestedStatus : "all";
  const missingOrders = firstValue(params.eksik) === "siparis";
  const requestedPage = parseLeadPage(firstValue(params.page) ?? "1");

  const conditions: SQL[] = [];
  if (status !== "all") conditions.push(eq(customers.status, status));
  if (search) {
    const pattern = `%${escapeLeadLike(search)}%`;
    const phone = normalizeLeadPhone(search);
    const phoneFilter = phone.length >= 10 ? eq(customers.phoneNormalized, phone) : sql`${customers.phone} LIKE ${pattern} ESCAPE '\\'`;
    const searchCondition = or(
      sql`${customers.name} LIKE ${pattern} ESCAPE '\\'`,
      sql`${customers.email} LIKE ${pattern} ESCAPE '\\'`,
      sql`${customers.company} LIKE ${pattern} ESCAPE '\\'`,
      phoneFilter,
    );
    if (searchCondition) conditions.push(searchCondition);
  }

  let rows: Array<typeof customers.$inferSelect> = [];
  let summary: Array<{ status: string; count: number }> = [];
  let totalMatches = 0;
  let currentPage = requestedPage;
  let databaseFailed = false;

  try {
    const { getDb } = await import("../../../db");
    const db = getDb();
    if (missingOrders) {
      conditions.push(notExists(
        db.select({ id: softwareOrders.id }).from(softwareOrders).where(eq(softwareOrders.customerId, customers.id)),
      ));
    }
    const where = conditions.length ? and(...conditions) : undefined;
    const [resultSummary, resultTotal] = await Promise.all([
      db.select({ status: customers.status, count: sql<number>`count(*)` }).from(customers).groupBy(customers.status),
      db.select({ count: sql<number>`count(*)` }).from(customers).where(where),
    ]);
    summary = resultSummary;
    totalMatches = Number(resultTotal[0]?.count ?? 0);
    currentPage = clampLeadPage(requestedPage, totalMatches);
    rows = await db
      .select()
      .from(customers)
      .where(where)
      .orderBy(desc(customers.createdAt), desc(customers.id))
      .limit(LEAD_PAGE_SIZE)
      .offset((currentPage - 1) * LEAD_PAGE_SIZE);
  } catch (cause) {
    console.error("Customers page failed", cause);
    databaseFailed = true;
  }

  if (databaseFailed) {
    return (
      <main className="admin-access-page">
        <section>
          <span className="admin-lock" aria-hidden="true">!</span>
          <span className="kicker kicker-light">VERİTABANI HAZIR DEĞİL</span>
          <h1>Müşteri kayıtları şu anda açılamıyor.</h1>
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
    if (missingOrders) query.set("eksik", "siparis");
    if (page > 1) query.set("page", String(page));
    const text = query.toString();
    return text ? `/yonetim/musteriler?${text}` : "/yonetim/musteriler";
  };
  const statusHref = (nextStatus: string) => {
    const query = new URLSearchParams();
    if (nextStatus !== "all") query.set("status", nextStatus);
    if (missingOrders) query.set("eksik", "siparis");
    const text = query.toString();
    return text ? `/yonetim/musteriler?${text}` : "/yonetim/musteriler";
  };

  return (
    <AdminShell current="musteriler" displayName={admin.user.displayName}>
      <section className="admin-main">
        <header className="admin-heading">
          <div>
            <span className="kicker">AVCI YÖNETİM</span>
            <h1>Yazılım müşterileri</h1>
            <Link className="admin-back-link" href="/yonetim">Panele dön</Link>
          </div>
          <div className="admin-heading-actions">
            <p>Altyapı / modül alan işletmeler. Mağaza alışveriş müşterisi değil.</p>
            <Link href="/yonetim/musteriler/yeni">Yeni müşteri</Link>
          </div>
        </header>

        <form action={withBasePath("/yonetim/musteriler")} method="get">
          <fieldset className="admin-filters is-simple">
            <legend className="visually-hidden">Müşteri listesini filtrele</legend>
            <label><span>Ara</span><input name="q" type="search" defaultValue={search} placeholder="Ad, firma, e-posta veya telefon" /></label>
            <label>
              <span>Durum</span>
              <select name="status" defaultValue={status}>
                <option value="all">Tüm durumlar</option>
                {CUSTOMER_STATUS_OPTIONS.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
              </select>
            </label>
            <label>
              <span>Sipariş</span>
              <select name="eksik" defaultValue={missingOrders ? "siparis" : "all"}>
                <option value="all">Tümü</option>
                <option value="siparis">Siparişi yok</option>
              </select>
            </label>
            <button type="submit">Filtrele</button>
            {(search || status !== "all" || missingOrders) && <Link href="/yonetim/musteriler">Temizle</Link>}
          </fieldset>
        </form>

        <div className="admin-stats">
          <article><small>Toplam</small><strong>{summary.reduce((sum, item) => sum + Number(item.count), 0)}</strong><span>yazılım müşterisi</span></article>
          <article><small>Aktif</small><strong>{counts.active ?? 0}</strong><span><Link href={statusHref("active")}>çalışıyor</Link></span></article>
          <article><small>Deneme</small><strong>{counts.trial ?? 0}</strong><span><Link href={statusHref("trial")}>deneme sürecinde</Link></span></article>
          <article><small>Eşleşen</small><strong>{totalMatches}</strong><span>filtre sonucu</span></article>
        </div>

        {rows.length ? (
          <div className="lead-table-wrap">
            <table className="lead-table">
              <caption className="visually-hidden">Yazılım müşterileri</caption>
              <thead><tr><th scope="col">Müşteri</th><th scope="col">İletişim</th><th scope="col">Paket / modül</th><th scope="col">Durum</th><th scope="col">Kayıt</th></tr></thead>
              <tbody>
                {rows.map((customer) => (
                  <tr key={customer.id}>
                    <th scope="row">
                      <Link className="lead-detail-link" href={`/yonetim/musteriler/${customer.id}`}>{customer.name}</Link>
                      <small>{customer.company || "Firma belirtilmedi"}{customer.city ? ` · ${customer.city}` : ""}</small>
                    </th>
                    <td>
                      <a href={`mailto:${customer.email}`}>{customer.email}</a>
                      <a href={`tel:${customer.phone.replace(/\s/g, "")}`}>{customer.phone}</a>
                    </td>
                    <td>
                      <span className="lead-interest">{customer.interest || "—"}</span>
                      <Link href={`/yonetim/siparisler?musteri=${customer.id}`}>Siparişler</Link>
                      <Link href={`/yonetim/siparisler/yeni?musteri=${customer.id}`}>Sipariş ekle</Link>
                      <Link href={`/yonetim/faturalar?musteri=${customer.id}`}>Faturalar</Link>
                      <Link href={`/yonetim/faturalar/yeni?musteri=${customer.id}`}>Fatura ekle</Link>
                      <Link href={`/yonetim/destek?musteri=${customer.id}`}>Destek</Link>
                      <Link href={`/yonetim/destek/yeni?musteri=${customer.id}`}>Destek ekle</Link>
                    </td>
                    <td>{customerStatusLabel(customer.status)}</td>
                    <td><time dateTime={customer.createdAt}>{formatDate(customer.createdAt)}</time></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-empty">
            <h2>{search || status !== "all" || missingOrders ? "Eşleşen müşteri yok." : "Henüz yazılım müşterisi yok."}</h2>
            <p>{search || status !== "all" || missingOrders ? "Filtreleri değiştirin." : "Altyapı veya modül alan işletmeyi buradan ekleyin."}</p>
            <Link className="button button-primary" href="/yonetim/musteriler/yeni">İlk müşteriyi ekle</Link>
          </div>
        )}

        {totalMatches > 0 && (
          <nav className="admin-pagination" aria-label="Müşteri sayfaları">
            {currentPage > 1 ? <Link href={pageHref(currentPage - 1)}>Önceki</Link> : <span />}
            <p>Sayfa <strong>{Math.min(currentPage, totalPages)}</strong> / {totalPages}</p>
            {currentPage < totalPages ? <Link href={pageHref(currentPage + 1)}>Sonraki</Link> : <span />}
          </nav>
        )}
      </section>
    </AdminShell>
  );
}
