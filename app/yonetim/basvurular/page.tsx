import { withBasePath } from "../../base-path";
import type { Metadata } from "next";
import Link from "next/link";
import { and, desc, eq, inArray, notExists, sql } from "drizzle-orm";
import { customers, leads } from "../../../db/schema";
import { chatGPTSignOutPath } from "../../chatgpt-auth";
import { requireAdminUser } from "../../admin-auth";
import { StatusControl } from "./status-control";
import { OFFER_INTEREST_GROUPS, OFFER_INTERESTS } from "../../offer-options";
import { canExportLeadRows, MAX_LEAD_EXPORT_ROWS } from "../../lead-export.mjs";
import { normalizeLeadSearch } from "../../lead-search.mjs";
import { appendLeadDateParams, parseLeadDateRange } from "../../lead-date-filter.mjs";
import { isLeadStatus, LEAD_STATUS_OPTIONS } from "../../lead-statuses";
import { clampLeadPage, getLeadTotalPages, LEAD_PAGE_SIZE, parseLeadPage } from "../../lead-pagination.mjs";
import { buildLeadFacetWheres } from "../../lead-query";
import { customerIdByNormalizedEmail, matchLeadToCustomerId } from "../../customer-record.mjs";
import { normalizeEmailAddress } from "../../email-normalization.mjs";
import { AdminShell } from "../admin-shell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Başvuru Yönetimi | Avcı E-Ticaret",
  robots: { index: false, follow: false },
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Istanbul",
  }).format(new Date(value));
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function sourceLabel(value: string) {
  return value === "direct" ? "Doğrudan" : value;
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await requireAdminUser("/yonetim/basvurular");

  if (!admin.authorized || !admin.user) {
    return (
      <main className="admin-access-page">
        <section>
          <span className="admin-lock" aria-hidden="true">×</span>
          <span className="kicker kicker-light">YETKİLİ ERİŞİMİ</span>
          <h1>Bu hesap yönetim paneline yetkili değil.</h1>
          <p>Giriş yaptığınız <strong>{admin.user?.email}</strong> adresi yönetici izin listesinde bulunmuyor. Yetkilendirme sunucu tarafında yapılır.</p>
          <div><Link className="button button-primary" href="/">Ana sayfaya dön</Link><a className="button button-ghost" href={chatGPTSignOutPath("/yonetim/basvurular")}>Farklı hesapla giriş yap</a></div>
        </section>
      </main>
    );
  }

  const params = await searchParams;
  const search = normalizeLeadSearch(firstValue(params.q));
  const requestedStatus = firstValue(params.status) ?? "all";
  const status = isLeadStatus(requestedStatus) ? requestedStatus : "all";
  const requestedSource = (firstValue(params.source) ?? "all").trim().slice(0, 100);
  const source = requestedSource && requestedSource !== "all" ? requestedSource : "all";
  const requestedInterest = (firstValue(params.interest) ?? "all").trim();
  const interest = OFFER_INTERESTS.includes(requestedInterest as (typeof OFFER_INTERESTS)[number])
    ? requestedInterest
    : "all";
  const dateRange = parseLeadDateRange(firstValue(params.from), firstValue(params.to));
  const requestedPage = parseLeadPage(firstValue(params.page));
  const missingCustomer = firstValue(params.eksik) === "musteri";
  let currentPage = requestedPage;

  const { where, statusSummaryWhere, sourceSummaryWhere, interestSummaryWhere } = buildLeadFacetWheres({
    search,
    status,
    source,
    interest,
    dateRange,
  });

  let rows: Array<typeof leads.$inferSelect> = [];
  let customerByEmail = new Map();
  let summary: Array<{ status: string; count: number }> = [];
  let sourceSummary: Array<{ source: string; count: number }> = [];
  let interestSummary: Array<{ interest: string; count: number }> = [];
  let totalMatches = 0;
  let databaseFailed = false;

  try {
    const { getDb } = await import("../../../db");
    const db = getDb();
    const listWhere = missingCustomer
      ? and(
        where,
        notExists(db.select({ id: customers.id }).from(customers).where(eq(customers.email, leads.email))),
      )
      : where;
    const [resultSummary, resultSourceSummary, resultInterestSummary, resultTotal] = await Promise.all([
      db.select({ status: leads.status, count: sql<number>`count(*)` }).from(leads).where(statusSummaryWhere).groupBy(leads.status),
      db.select({ source: leads.source, count: sql<number>`count(*)` }).from(leads).where(sourceSummaryWhere).groupBy(leads.source),
      db.select({ interest: leads.interest, count: sql<number>`count(*)` }).from(leads).where(interestSummaryWhere).groupBy(leads.interest),
      db.select({ count: sql<number>`count(*)` }).from(leads).where(listWhere),
    ]);
    summary = resultSummary;
    sourceSummary = resultSourceSummary;
    interestSummary = resultInterestSummary;
    totalMatches = Number(resultTotal[0]?.count ?? 0);
    currentPage = clampLeadPage(requestedPage, totalMatches);
    rows = await db
      .select()
      .from(leads)
      .where(listWhere)
      .orderBy(desc(leads.createdAt), desc(leads.id))
      .limit(LEAD_PAGE_SIZE)
      .offset((currentPage - 1) * LEAD_PAGE_SIZE);
    const emails = [...new Set(rows.map((lead) => normalizeEmailAddress(lead.email, 180)).filter(Boolean))];
    if (emails.length) {
      const matches = await db.select({ id: customers.id, email: customers.email }).from(customers).where(inArray(customers.email, emails));
      customerByEmail = customerIdByNormalizedEmail(matches);
    }
  } catch (cause) {
    console.error("Admin leads page failed", cause);
    databaseFailed = true;
  }

  if (databaseFailed) {
    return (
      <main className="admin-access-page">
        <section><span className="admin-lock" aria-hidden="true">!</span><span className="kicker kicker-light">VERİTABANI HAZIR DEĞİL</span><h1>Başvuru kayıtları şu anda açılamıyor.</h1><p>D1 bağlantısı ve migration yayın ortamında tamamlandığında panel otomatik olarak çalışacaktır.</p><Link className="button button-primary" href="/">Ana sayfaya dön</Link></section>
      </main>
    );
  }

  const counts = Object.fromEntries(summary.map((item) => [item.status, Number(item.count)]));
  const totalPages = getLeadTotalPages(totalMatches);
  const exportQuery = new URLSearchParams();
  if (search) exportQuery.set("q", search);
  if (status !== "all") exportQuery.set("status", status);
  if (source !== "all") exportQuery.set("source", source);
  if (interest !== "all") exportQuery.set("interest", interest);
  if (missingCustomer) exportQuery.set("eksik", "musteri");
  appendLeadDateParams(exportQuery, dateRange);
  const exportHref = `/api/yonetim/basvurular/export${exportQuery.size ? `?${exportQuery.toString()}` : ""}`;
  const exportAvailable = !dateRange.error && canExportLeadRows(totalMatches);
  const pageHref = (page: number) => {
    const query = new URLSearchParams();
    if (search) query.set("q", search);
    if (status !== "all") query.set("status", status);
    if (source !== "all") query.set("source", source);
    if (interest !== "all") query.set("interest", interest);
    if (missingCustomer) query.set("eksik", "musteri");
    appendLeadDateParams(query, dateRange);
    if (page > 1) query.set("page", String(page));
    const value = query.toString();
    return value ? `/yonetim/basvurular?${value}` : "/yonetim/basvurular";
  };
  const sourceHref = (nextSource: string) => {
    const query = new URLSearchParams();
    if (search) query.set("q", search);
    if (status !== "all") query.set("status", status);
    if (nextSource !== "all") query.set("source", nextSource);
    if (interest !== "all") query.set("interest", interest);
    if (missingCustomer) query.set("eksik", "musteri");
    appendLeadDateParams(query, dateRange);
    const value = query.toString();
    return value ? `/yonetim/basvurular?${value}` : "/yonetim/basvurular";
  };
  const sortedSources = [...sourceSummary].sort((a, b) => Number(b.count) - Number(a.count));
  const interestCounts = Object.fromEntries(interestSummary.map((item) => [item.interest, Number(item.count)]));
  const sortedInterests = [...interestSummary].sort((a, b) => Number(b.count) - Number(a.count));
  const interestHref = (nextInterest: string) => {
    const query = new URLSearchParams();
    if (search) query.set("q", search);
    if (status !== "all") query.set("status", status);
    if (source !== "all") query.set("source", source);
    if (nextInterest !== "all") query.set("interest", nextInterest);
    if (missingCustomer) query.set("eksik", "musteri");
    appendLeadDateParams(query, dateRange);
    const value = query.toString();
    return value ? `/yonetim/basvurular?${value}` : "/yonetim/basvurular";
  };

  return (
    <AdminShell current="basvurular" displayName={admin.user.displayName}>
      <section className="admin-main" id="basvurular">
        <header className="admin-heading">
          <div><span className="kicker">AVCI YÖNETİM</span><h1>Teklif başvuruları</h1><Link className="admin-back-link" href="/yonetim">Panele dön</Link></div>
          <div className="admin-heading-actions"><p>{missingCustomer ? "Bu listede yazılım müşterisi yok. Satırdan çevirin; kaydedince sipariş formu açılır." : `${totalMatches} eşleşme · En yeni başvuru önce`}</p>{exportAvailable ? <a href={exportHref}>CSV indir</a> : dateRange.error ? <span className="admin-export-disabled">Tarih aralığını düzeltin</span> : <span className="admin-export-disabled" title={`CSV dışa aktarımı en fazla ${MAX_LEAD_EXPORT_ROWS.toLocaleString("tr-TR")} kayıtla sınırlıdır.`}>CSV için filtreleyin <b>{MAX_LEAD_EXPORT_ROWS.toLocaleString("tr-TR")} sınırı</b></span>}</div>
        </header>

        <form action={withBasePath("/yonetim/basvurular")} method="get">
          <fieldset className="admin-filters">
            <legend className="visually-hidden">Başvuru listesini filtrele</legend>
            <p id="admin-date-range-help" className="visually-hidden">Başlangıç ve bitiş tarihleri birlikte bir tarih aralığı oluşturur.</p>
            <label><span>Başvurularda ara</span><input name="q" type="search" defaultValue={search} placeholder="Ad, firma, e-posta veya telefon" /></label>
            <label><span>Durum</span><select name="status" defaultValue={status}><option value="all">Tüm durumlar</option>{LEAD_STATUS_OPTIONS.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></label>
            <label><span>Müşteri</span><select name="eksik" defaultValue={missingCustomer ? "musteri" : "all"}><option value="all">Tümü</option><option value="musteri">Müşteri kaydı yok</option></select></label>
            <label><span>Kaynak</span><select name="source" defaultValue={source}><option value="all">Tüm kaynaklar</option>{sortedSources.map((item) => <option value={item.source} key={item.source}>{sourceLabel(item.source)} ({item.count})</option>)}</select></label>
            <label><span>Çözüm</span><select name="interest" defaultValue={interest}><option value="all">Tüm çözümler</option>{OFFER_INTEREST_GROUPS.map((group) => <optgroup label={group.label.tr} key={group.label.tr}>{group.interests.map((item) => <option value={item} key={item}>{item}{interestCounts[item] ? ` (${interestCounts[item]})` : ""}</option>)}</optgroup>)}</select></label>
            <label><span>Başlangıç tarihi</span><input name="from" type="date" defaultValue={dateRange.from} max={dateRange.to || undefined} aria-describedby="admin-date-range-help" /></label>
            <label><span>Bitiş tarihi</span><input name="to" type="date" defaultValue={dateRange.to} min={dateRange.from || undefined} aria-describedby="admin-date-range-help" /></label>
            <button type="submit">Filtrele</button>
            {(search || status !== "all" || source !== "all" || interest !== "all" || dateRange.hasInput || missingCustomer) && <Link href="/yonetim/basvurular">Temizle</Link>}
            {dateRange.error && <p className="admin-filter-error" role="alert">{dateRange.error}</p>}
          </fieldset>
        </form>

        <div className="admin-stats">
          <article><small>Eşleşen kayıt</small><strong>{totalMatches}</strong><span>filtre sonucunda</span></article>
          <article><small>Yeni</small><strong>{counts.new ?? 0}</strong><span><Link href={`/yonetim/basvurular?status=new${missingCustomer ? "&eksik=musteri" : ""}`}>yanıt bekliyor</Link></span></article>
              <article><small>Fırsat</small><strong>{counts.qualified ?? 0}</strong><span><Link href={`/yonetim/basvurular?status=qualified${missingCustomer ? "&eksik=musteri" : ""}`}>değerlendiriliyor</Link></span></article>
          <article><small>Tamamlanan</small><strong>{counts.closed ?? 0}</strong><span>süreç kapandı</span></article>
        </div>

        {sortedSources.length > 0 && <nav className="admin-source-summary" aria-label="Başvuru kaynakları"><span>Kaynak dağılımı</span><Link className={source === "all" ? "active" : ""} href={sourceHref("all")}>Tümü <strong>{sourceSummary.reduce((total, item) => total + Number(item.count), 0)}</strong></Link>{sortedSources.slice(0, 6).map((item) => <Link className={source === item.source ? "active" : ""} href={sourceHref(item.source)} key={item.source}>{sourceLabel(item.source)} <strong>{item.count}</strong></Link>)}</nav>}
        {sortedInterests.length > 0 && <nav className="admin-interest-summary" aria-label="Çözüm talep dağılımı"><span>Çözüm dağılımı</span><Link className={interest === "all" ? "active" : ""} href={interestHref("all")}>Tümü <strong>{interestSummary.reduce((total, item) => total + Number(item.count), 0)}</strong></Link>{sortedInterests.map((item) => <Link className={interest === item.interest ? "active" : ""} href={interestHref(item.interest)} key={item.interest}>{item.interest} <strong>{item.count}</strong></Link>)}</nav>}

        {rows.length ? (
          <div className="lead-table-wrap">
            <table className="lead-table">
              <caption className="visually-hidden">Aktif filtrelerle eşleşen teklif başvuruları</caption>
              <thead><tr><th scope="col">Başvuru</th><th scope="col">Çözüm</th><th scope="col">İletişim</th><th scope="col">Durum</th><th scope="col">Tarih</th></tr></thead>
              <tbody>
                {rows.map((lead) => {
                  const customerId = matchLeadToCustomerId(lead, customerByEmail);
                  return (
                  <tr key={lead.id}>
                    <th scope="row"><Link className="lead-detail-link" href={`/yonetim/basvurular/${lead.id}`}>{lead.name}</Link><small>{lead.company || "Firma belirtilmedi"}{customerId ? " · yazılım müşterisi var" : ""}</small>{lead.message && <p>{lead.message}</p>}</th>
                    <td><span className="lead-interest">{lead.interest}</span><small className="lead-source">Kaynak: {sourceLabel(lead.source)}</small></td>
                    <td><a href={`mailto:${lead.email}`}>{lead.email}</a><a href={`tel:${lead.phone.replace(/\s/g, "")}`}>{lead.phone}</a>{customerId ? <Link href={`/yonetim/musteriler/${customerId}`}>Müşteri kartı</Link> : <Link href={`/yonetim/musteriler/yeni?basvuru=${lead.id}`}>Müşteriye çevir</Link>}{customerId ? <Link href={`/yonetim/siparisler/yeni?musteri=${customerId}`}>Sipariş ekle</Link> : null}</td>
                    <td><StatusControl id={lead.id} label={`${lead.name} başvuru durumu`} initialStatus={lead.status} initialUpdatedAt={lead.updatedAt} /></td>
                    <td><time dateTime={lead.createdAt}>{formatDate(lead.createdAt)}</time></td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          ) : (
          <div className="admin-empty"><h2>{search || status !== "all" || source !== "all" || interest !== "all" || dateRange.hasInput || missingCustomer ? "Eşleşen başvuru yok." : "Henüz başvuru yok."}</h2><p>{search || status !== "all" || source !== "all" || interest !== "all" || dateRange.hasInput || missingCustomer ? "Filtreleri değiştirerek tekrar deneyebilirsiniz." : "Web sitesindeki teklif formundan gelen kayıtlar burada listelenecek."}</p></div>
        )}
        {totalMatches > 0 && (
          <nav className="admin-pagination" aria-label="Başvuru sayfaları">
            {currentPage > 1 ? <Link href={pageHref(currentPage - 1)}>Önceki</Link> : <span />}
            <p>Sayfa <strong>{Math.min(currentPage, totalPages)}</strong> / {totalPages}</p>
            {currentPage < totalPages ? <Link href={pageHref(currentPage + 1)}>Sonraki</Link> : <span />}
          </nav>
        )}
      </section>
    </AdminShell>
  );
}
