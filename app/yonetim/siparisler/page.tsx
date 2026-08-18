import { withBasePath } from "../../base-path";
import type { Metadata } from "next";
import Link from "next/link";
import { and, desc, eq, inArray, ne, notExists, or, sql, type SQL } from "drizzle-orm";
import { customers, modules, packages, softwareInvoices, softwareOrders, supportTickets } from "../../../db/schema";
import { chatGPTSignOutPath } from "../../chatgpt-auth";
import { requireAdminUser } from "../../admin-auth";
import { normalizeLeadSearch, escapeLeadLike } from "../../lead-search.mjs";
import { clampLeadPage, getLeadTotalPages, LEAD_PAGE_SIZE, parseLeadPage } from "../../lead-pagination.mjs";
import {
  SOFTWARE_ORDER_KIND_OPTIONS,
  SOFTWARE_ORDER_STATUS_OPTIONS,
  isSoftwareOrderKind,
  isSoftwareOrderStatus,
  softwareOrderKindLabel,
  softwareOrderStatusLabel,
} from "../../software-order-admin.mjs";
import { parseTicketOrderIdFromNote, ticketNoteOrderLikePattern } from "../../support-ticket-admin.mjs";
import { AdminShell } from "../admin-shell";
import { parseAdminCustomerId, parseAdminModuleId, parseAdminPackageId, adminCustomerListHref } from "../../admin-customer-query.mjs";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Yazılım Siparişleri | Avcı Yönetim",
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

export default async function SoftwareOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await requireAdminUser("/yonetim/siparisler");
  if (!admin.authorized || !admin.user) {
    return (
      <main className="admin-access-page">
        <section>
          <span className="admin-lock" aria-hidden="true">×</span>
          <span className="kicker kicker-light">YETKİLİ ERİŞİMİ</span>
          <h1>Bu hesap yazılım siparişlerini göremez.</h1>
          <p>Giriş yaptığınız <strong>{admin.user?.email}</strong> adresi yönetici izin listesinde bulunmuyor.</p>
          <div>
            <Link className="button button-primary" href="/">Ana sayfaya dön</Link>
            <a className="button button-ghost" href={chatGPTSignOutPath("/yonetim/siparisler")}>Farklı hesapla giriş yap</a>
          </div>
        </section>
      </main>
    );
  }

  const params = await searchParams;
  const search = normalizeLeadSearch(firstValue(params.q));
  const requestedStatus = firstValue(params.status) ?? "all";
  const requestedKind = firstValue(params.kind) ?? "all";
  const status = isSoftwareOrderStatus(requestedStatus) ? requestedStatus : "all";
  const kind = isSoftwareOrderKind(requestedKind) ? requestedKind : "all";
  const requestedPage = parseLeadPage(firstValue(params.page) ?? "1");
  const customerId = parseAdminCustomerId(firstValue(params.musteri));
  const packageId = parseAdminPackageId(firstValue(params.paketId));
  const moduleId = parseAdminModuleId(firstValue(params.modulId));
  const missingInvoice = firstValue(params.eksik) === "fatura";

  const conditions: SQL[] = [];
  if (status !== "all") conditions.push(eq(softwareOrders.status, status));
  if (kind !== "all") conditions.push(eq(softwareOrders.kind, kind));
  if (customerId) conditions.push(eq(softwareOrders.customerId, customerId));
  if (packageId) conditions.push(eq(softwareOrders.packageId, packageId));
  if (moduleId) conditions.push(eq(softwareOrders.moduleId, moduleId));
  if (search) {
    const pattern = `%${escapeLeadLike(search)}%`;
    const searchCondition = or(
      sql`${customers.name} LIKE ${pattern} ESCAPE '\\'`,
      sql`${customers.company} LIKE ${pattern} ESCAPE '\\'`,
      sql`${packages.name} LIKE ${pattern} ESCAPE '\\'`,
      sql`${modules.name} LIKE ${pattern} ESCAPE '\\'`,
    );
    if (searchCondition) conditions.push(searchCondition);
  }

  let rows: Array<{
    id: number;
    customerId: number;
    kind: string;
    status: string;
    priceNote: string;
    createdAt: string;
    customerName: string | null;
    customerCompany: string | null;
    packageName: string | null;
    moduleName: string | null;
  }> = [];
  let summary: Array<{ status: string; count: number }> = [];
  let totalMatches = 0;
  let currentPage = requestedPage;
  let scopedCustomerName = "";
  let scopedPackageName = "";
  let scopedModuleName = "";
  let draftInvoiceByOrderId = new Map<number, number>();
  let openTicketByOrderId = new Map<number, number>();
  let databaseFailed = false;

  try {
    const { getDb } = await import("../../../db");
    const db = getDb();
    if (missingInvoice) {
      conditions.push(notExists(
        db.select({ id: softwareInvoices.id }).from(softwareInvoices).where(eq(softwareInvoices.orderId, softwareOrders.id)),
      ));
    }
    const where = conditions.length ? and(...conditions) : undefined;
    const [resultSummary, resultTotal, scopedCustomers, scopedPackages, scopedModules] = await Promise.all([
      db.select({ status: softwareOrders.status, count: sql<number>`count(*)` }).from(softwareOrders).groupBy(softwareOrders.status),
      db.select({ count: sql<number>`count(*)` })
        .from(softwareOrders)
        .leftJoin(customers, eq(softwareOrders.customerId, customers.id))
        .leftJoin(packages, eq(softwareOrders.packageId, packages.id))
        .leftJoin(modules, eq(softwareOrders.moduleId, modules.id))
        .where(where),
      customerId
        ? db.select({ id: customers.id, name: customers.name }).from(customers).where(eq(customers.id, customerId)).limit(1)
        : Promise.resolve([] as Array<{ id: number; name: string }>),
      packageId
        ? db.select({ id: packages.id, name: packages.name }).from(packages).where(eq(packages.id, packageId)).limit(1)
        : Promise.resolve([] as Array<{ id: number; name: string }>),
      moduleId
        ? db.select({ id: modules.id, name: modules.name }).from(modules).where(eq(modules.id, moduleId)).limit(1)
        : Promise.resolve([] as Array<{ id: number; name: string }>),
    ]);
    summary = resultSummary;
    totalMatches = Number(resultTotal[0]?.count ?? 0);
    scopedCustomerName = scopedCustomers[0]?.name ?? "";
    scopedPackageName = scopedPackages[0]?.name ?? "";
    scopedModuleName = scopedModules[0]?.name ?? "";
    currentPage = clampLeadPage(requestedPage, totalMatches);
    rows = await db
      .select({
        id: softwareOrders.id,
        customerId: softwareOrders.customerId,
        kind: softwareOrders.kind,
        status: softwareOrders.status,
        priceNote: softwareOrders.priceNote,
        createdAt: softwareOrders.createdAt,
        customerName: customers.name,
        customerCompany: customers.company,
        packageName: packages.name,
        moduleName: modules.name,
      })
      .from(softwareOrders)
      .leftJoin(customers, eq(softwareOrders.customerId, customers.id))
      .leftJoin(packages, eq(softwareOrders.packageId, packages.id))
      .leftJoin(modules, eq(softwareOrders.moduleId, modules.id))
      .where(where)
      .orderBy(desc(softwareOrders.createdAt), desc(softwareOrders.id))
      .limit(LEAD_PAGE_SIZE)
      .offset((currentPage - 1) * LEAD_PAGE_SIZE);
    if (rows.length) {
      const draftRows = await db.select({
        id: softwareInvoices.id,
        orderId: softwareInvoices.orderId,
      })
        .from(softwareInvoices)
        .where(and(
          eq(softwareInvoices.status, "draft"),
          inArray(softwareInvoices.orderId, rows.map((item) => item.id)),
        ));
      for (const row of draftRows) {
        if (row.orderId && !draftInvoiceByOrderId.has(row.orderId)) {
          draftInvoiceByOrderId.set(row.orderId, row.id);
        }
      }
      const ticketFilters = rows
        .map((item) => ticketNoteOrderLikePattern(item.id))
        .filter(Boolean)
        .map((pattern) => sql`${supportTickets.note} LIKE ${pattern} ESCAPE '\\'`);
      if (ticketFilters.length) {
        const ticketCondition = ticketFilters.length === 1 ? ticketFilters[0] : or(...ticketFilters);
        const ticketRows = await db.select({
          id: supportTickets.id,
          note: supportTickets.note,
        })
          .from(supportTickets)
          .where(and(ne(supportTickets.status, "closed"), ticketCondition));
        for (const row of ticketRows) {
          const relatedOrderId = parseTicketOrderIdFromNote(row.note);
          if (relatedOrderId && !openTicketByOrderId.has(relatedOrderId)) {
            openTicketByOrderId.set(relatedOrderId, row.id);
          }
        }
      }
    }
  } catch (cause) {
    console.error("Software orders page failed", cause);
    databaseFailed = true;
  }

  if (databaseFailed) {
    return (
      <main className="admin-access-page">
        <section>
          <span className="admin-lock" aria-hidden="true">!</span>
          <span className="kicker kicker-light">VERİTABANI HAZIR DEĞİL</span>
          <h1>Yazılım siparişleri şu anda açılamıyor.</h1>
          <Link className="button button-primary" href="/yonetim">Panele dön</Link>
        </section>
      </main>
    );
  }

  const counts = Object.fromEntries(summary.map((item) => [item.status, Number(item.count)]));
  const totalPages = getLeadTotalPages(totalMatches);
  const pageHref = (page: number) => adminCustomerListHref("/yonetim/siparisler", customerId, {
    q: search,
    status: status !== "all" ? status : "",
    kind: kind !== "all" ? kind : "",
    paketId: packageId || "",
    modulId: moduleId || "",
    eksik: missingInvoice ? "fatura" : "",
    page: page > 1 ? page : "",
  });
  const scopeQuery = adminCustomerListHref("/yonetim/siparisler", customerId, {
    paketId: packageId || "",
    modulId: moduleId || "",
  });
  const hasExtraFilter = Boolean(search || status !== "all" || kind !== "all" || missingInvoice);
  const hasScope = Boolean(customerId || packageId || moduleId);
  const title = customerId && scopedCustomerName
    ? `${scopedCustomerName} siparişleri`
    : packageId && scopedPackageName
      ? `${scopedPackageName} siparişleri`
      : moduleId && scopedModuleName
        ? `${scopedModuleName} siparişleri`
        : hasScope
          ? "Süzülmüş siparişler"
          : "Yazılım siparişleri";
  const backHref = customerId
    ? `/yonetim/musteriler/${customerId}`
    : packageId
      ? `/yonetim/paketler/${packageId}`
      : moduleId
        ? `/yonetim/moduller/${moduleId}`
        : "/yonetim";
  const backLabel = customerId ? "Müşteri kartına dön" : packageId ? "Paket kartına dön" : moduleId ? "Modül kartına dön" : "Panele dön";
  const createHref = adminCustomerListHref("/yonetim/siparisler/yeni", customerId, {
    paketId: packageId || "",
    modulId: moduleId || "",
  });

  return (
    <AdminShell current="siparisler" displayName={admin.user.displayName}>
      <section className="admin-main">
        <header className="admin-heading">
          <div>
            <span className="kicker">AVCI YÖNETİM</span>
            <h1>{title}</h1>
            <Link className="admin-back-link" href={backHref}>{backLabel}</Link>
          </div>
          <div className="admin-heading-actions">
            <p>Hangi işletme hangi paketi veya eklentiyi aldı. Mağaza sepeti / kasa değil. Ödeme buradan çekilmez.</p>
            <Link href={createHref}>Yeni sipariş</Link>
          </div>
        </header>

        <form action={withBasePath("/yonetim/siparisler")} method="get">
          <fieldset className="admin-filters is-simple">
            <legend className="visually-hidden">Sipariş listesini filtrele</legend>
            {customerId ? <input type="hidden" name="musteri" value={customerId} /> : null}
            {packageId ? <input type="hidden" name="paketId" value={packageId} /> : null}
            {moduleId ? <input type="hidden" name="modulId" value={moduleId} /> : null}
            <label><span>Ara</span><input name="q" type="search" defaultValue={search} placeholder="Müşteri, paket veya modül" /></label>
            <label>
              <span>Tür</span>
              <select name="kind" defaultValue={kind}>
                <option value="all">Tüm türler</option>
                {SOFTWARE_ORDER_KIND_OPTIONS.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
              </select>
            </label>
            <label>
              <span>Durum</span>
              <select name="status" defaultValue={status}>
                <option value="all">Tüm durumlar</option>
                {SOFTWARE_ORDER_STATUS_OPTIONS.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
              </select>
            </label>
            <label>
              <span>Fatura</span>
              <select name="eksik" defaultValue={missingInvoice ? "fatura" : "all"}>
                <option value="all">Tümü</option>
                <option value="fatura">Faturası yok</option>
              </select>
            </label>
            <button type="submit">Filtrele</button>
            {(hasExtraFilter || hasScope) && <Link href={hasExtraFilter ? scopeQuery : "/yonetim/siparisler"}>{hasExtraFilter ? "Temizle" : "Tüm siparişler"}</Link>}
          </fieldset>
        </form>

        <div className="admin-stats">
          <article><small>Toplam</small><strong>{summary.reduce((sum, item) => sum + Number(item.count), 0)}</strong><span>yazılım siparişi</span></article>
          <article><small>Aktif</small><strong>{counts.active ?? 0}</strong><span><Link href={adminCustomerListHref("/yonetim/siparisler", customerId, { kind: kind !== "all" ? kind : "", paketId: packageId || "", modulId: moduleId || "", eksik: missingInvoice ? "fatura" : "", status: "active" })}>çalışıyor</Link></span></article>
          <article><small>Taslak</small><strong>{counts.draft ?? 0}</strong><span><Link href={adminCustomerListHref("/yonetim/siparisler", customerId, { kind: kind !== "all" ? kind : "", paketId: packageId || "", modulId: moduleId || "", eksik: missingInvoice ? "fatura" : "", status: "draft" })}>henüz başlamadı</Link></span></article>
          <article><small>Eşleşen</small><strong>{totalMatches}</strong><span>filtre sonucu</span></article>
        </div>

        {rows.length ? (
          <div className="lead-table-wrap">
            <table className="lead-table">
              <caption className="visually-hidden">Yazılım siparişleri</caption>
              <thead><tr><th scope="col">Müşteri</th><th scope="col">Ürün</th><th scope="col">Fiyat notu</th><th scope="col">Durum</th><th scope="col">Kayıt</th></tr></thead>
              <tbody>
                {rows.map((item) => {
                  const draftInvoiceId = draftInvoiceByOrderId.get(item.id);
                  const openTicketId = openTicketByOrderId.get(item.id);
                  return (
                  <tr key={item.id}>
                    <th scope="row">
                      <Link className="lead-detail-link" href={`/yonetim/siparisler/${item.id}`}>{item.customerName || "Müşteri silinmiş"}</Link>
                      <small>
                        {item.customerId
                          ? <Link href={`/yonetim/musteriler/${item.customerId}`}>{item.customerCompany || "Firma belirtilmedi"}</Link>
                          : (item.customerCompany || "Firma belirtilmedi")}
                      </small>
                    </th>
                    <td>
                      <span className="lead-interest">{softwareOrderKindLabel(item.kind)}</span>
                      <small>{item.kind === "module" ? (item.moduleName || "—") : (item.packageName || "—")}</small>
                      <Link href={draftInvoiceId
                        ? `/yonetim/faturalar/${draftInvoiceId}`
                        : `/yonetim/faturalar/yeni?musteri=${item.customerId}&siparis=${item.id}`}>
                        {draftInvoiceId ? "Taslak fatura" : "Fatura taslağı"}
                      </Link>
                      <Link href={openTicketId
                        ? `/yonetim/destek/${openTicketId}`
                        : `/yonetim/destek/yeni?musteri=${item.customerId}&siparis=${item.id}`}>
                        {openTicketId ? "Açık destek" : "Destek taslağı"}
                      </Link>
                    </td>
                    <td>{item.priceNote || "Teklifle belirlenir"}</td>
                    <td>{softwareOrderStatusLabel(item.status)}</td>
                    <td><time dateTime={item.createdAt}>{formatDate(item.createdAt)}</time></td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-empty">
            <h2>{search || status !== "all" || kind !== "all" || hasScope || missingInvoice ? "Eşleşen sipariş yok." : "Henüz yazılım siparişi yok."}</h2>
            <p>{search || status !== "all" || kind !== "all" || hasScope || missingInvoice ? "Filtreleri değiştirin." : "Önce müşteri ekleyin, sonra paket veya modül bağlayın."}</p>
            <Link className="button button-primary" href={createHref}>İlk siparişi ekle</Link>
          </div>
        )}

        {totalMatches > 0 && (
          <nav className="admin-pagination" aria-label="Sipariş sayfaları">
            {currentPage > 1 ? <Link href={pageHref(currentPage - 1)}>Önceki</Link> : <span />}
            <p>Sayfa <strong>{Math.min(currentPage, totalPages)}</strong> / {totalPages}</p>
            {currentPage < totalPages ? <Link href={pageHref(currentPage + 1)}>Sonraki</Link> : <span />}
          </nav>
        )}
      </section>
    </AdminShell>
  );
}
