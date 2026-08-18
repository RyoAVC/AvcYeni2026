import Link from "next/link";
import { asc, desc, eq } from "drizzle-orm";
import { modules, packages, softwareInvoices, softwareOrders, supportTickets } from "../../../db/schema";
import { softwareOrderKindLabel, softwareOrderStatusLabel } from "../../software-order-admin.mjs";
import { ticketStatusLabel, ticketTopicLabel, parseTicketOrderIdFromNote } from "../../support-ticket-admin.mjs";
import { invoiceStatusLabel } from "../../software-invoice-admin.mjs";
import { moduleCategoryLabel } from "../../module-admin.mjs";
import { PACKAGE_OPTIONS, findAdminPackageByCatalogId, guessCatalogPackageId } from "../../package-options";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeZone: "Europe/Istanbul",
  }).format(new Date(value));
}

export async function CustomerRelated({ customerId, interest = "" }: { customerId: number; interest?: string }) {
  let orders: Array<{ id: number; kind: string; status: string; createdAt: string; packageName: string | null; moduleName: string | null; moduleId: number | null }> = [];
  let tickets: Array<{ id: number; subject: string; topic: string; status: string; createdAt: string; note: string }> = [];
  let invoices: Array<{ id: number; title: string; amountNote: string; status: string; createdAt: string; orderId: number | null }> = [];
  let catalogPackages: Array<{ id: number; name: string; slug: string }> = [];
  let liveModules: Array<{ id: number; name: string; category: string }> = [];

  try {
    const { getDb } = await import("../../../db");
    const db = getDb();
    const [orderRows, ticketRows, invoiceRows, packageRows, moduleRows] = await Promise.all([
      db.select({
        id: softwareOrders.id,
        kind: softwareOrders.kind,
        status: softwareOrders.status,
        createdAt: softwareOrders.createdAt,
        packageName: packages.name,
        moduleName: modules.name,
        moduleId: softwareOrders.moduleId,
      })
        .from(softwareOrders)
        .leftJoin(packages, eq(softwareOrders.packageId, packages.id))
        .leftJoin(modules, eq(softwareOrders.moduleId, modules.id))
        .where(eq(softwareOrders.customerId, customerId))
        .orderBy(desc(softwareOrders.createdAt), desc(softwareOrders.id))
        .limit(5),
      db.select({
        id: supportTickets.id,
        subject: supportTickets.subject,
        topic: supportTickets.topic,
        status: supportTickets.status,
        createdAt: supportTickets.createdAt,
        note: supportTickets.note,
      })
        .from(supportTickets)
        .where(eq(supportTickets.customerId, customerId))
        .orderBy(desc(supportTickets.createdAt), desc(supportTickets.id))
        .limit(5),
      db.select({
        id: softwareInvoices.id,
        title: softwareInvoices.title,
        amountNote: softwareInvoices.amountNote,
        status: softwareInvoices.status,
        createdAt: softwareInvoices.createdAt,
        orderId: softwareInvoices.orderId,
      })
        .from(softwareInvoices)
        .where(eq(softwareInvoices.customerId, customerId))
        .orderBy(desc(softwareInvoices.createdAt), desc(softwareInvoices.id))
        .limit(5),
      db.select({ id: packages.id, name: packages.name, slug: packages.slug }).from(packages),
      db.select({ id: modules.id, name: modules.name, category: modules.category })
        .from(modules)
        .where(eq(modules.status, "live"))
        .orderBy(asc(modules.sortOrder), asc(modules.id))
        .limit(8),
    ]);
    orders = orderRows;
    tickets = ticketRows;
    invoices = invoiceRows;
    catalogPackages = packageRows;
    liveModules = moduleRows;
  } catch (cause) {
    console.error("Customer related records failed", cause);
  }

  const extraModules = liveModules.filter((item) => !orders.some((order) => order.kind === "module" && order.moduleId === item.id)).slice(0, 6);
  const draftInvoiceOrderIds = new Set(invoices.filter((item) => item.status === "draft" && item.orderId).map((item) => item.orderId));
  const ordersNeedingInvoiceDraft = orders.filter((item) => !draftInvoiceOrderIds.has(item.id));
  const openTicketOrderIds = new Set(
    tickets
      .filter((item) => item.status !== "closed")
      .map((item) => parseTicketOrderIdFromNote(item.note))
      .filter((id) => id >= 1),
  );
  const ordersNeedingTicket = orders.filter((item) => !openTicketOrderIds.has(item.id));

  return (
    <div className="admin-related">
      <div className="admin-recent">
        <div className="admin-recent-head">
          <h2>Yazılım siparişleri</h2>
          <Link href={`/yonetim/siparisler?musteri=${customerId}`}>Tümünü gör</Link>
        </div>
        {orders.length ? (
          <ul>
            {orders.map((item) => (
              <li key={item.id}>
                <Link href={`/yonetim/siparisler/${item.id}`}>
                  <strong>{item.kind === "module" ? (item.moduleName || "Modül") : (item.packageName || "Paket")}</strong>
                  <small>{softwareOrderKindLabel(item.kind)} · {softwareOrderStatusLabel(item.status)}</small>
                </Link>
                <time dateTime={item.createdAt}>{formatDate(item.createdAt)}</time>
              </li>
            ))}
          </ul>
        ) : (
          <>
            <p>Bu işletmeye bağlı yazılım siparişi yok. Sitedeki Start / Scale / Enterprise çerçevesinden birini bağlayın.</p>
            <div className="admin-interest-summary admin-package-shortcuts">
              <span>PAKET ÇERÇEVESİ</span>
              {PACKAGE_OPTIONS.map((item) => {
                const pack = findAdminPackageByCatalogId(catalogPackages, item.id);
                const suggested = guessCatalogPackageId(interest) === item.id;
                return (
                  <Link
                    key={item.id}
                    className={suggested ? "active" : undefined}
                    href={pack
                      ? `/yonetim/siparisler/yeni?musteri=${customerId}&paket=${item.id}`
                      : `/yonetim/paketler/yeni?cerceve=${item.id}`}
                  >
                    {pack ? `${item.name} siparişi` : `${item.name} kartını ekle`}
                    {suggested ? <strong>ilgi</strong> : null}
                  </Link>
                );
              })}
            </div>
          </>
        )}
        {orders.length > 0 && extraModules.length > 0 ? (
          <div className="admin-interest-summary admin-package-shortcuts">
            <span>EK MODÜL</span>
            {extraModules.map((item) => (
              <Link key={item.id} href={`/yonetim/siparisler/yeni?musteri=${customerId}&modulId=${item.id}`}>
                {item.name}
                <strong>{moduleCategoryLabel(item.category)}</strong>
              </Link>
            ))}
          </div>
        ) : null}
      </div>

      <div className="admin-recent">
        <div className="admin-recent-head">
          <h2>Destek kayıtları</h2>
          <Link href={`/yonetim/destek?musteri=${customerId}`}>Tümünü gör</Link>
        </div>
        {tickets.length ? (
          <ul>
            {tickets.map((item) => (
              <li key={item.id}>
                <Link href={`/yonetim/destek/${item.id}`}>
                  <strong>{item.subject}</strong>
                  <small>{ticketTopicLabel(item.topic)} · {ticketStatusLabel(item.status)}</small>
                </Link>
                <time dateTime={item.createdAt}>{formatDate(item.createdAt)}</time>
              </li>
            ))}
          </ul>
        ) : null}
        {ordersNeedingTicket.length ? (
          <>
            {tickets.length ? null : <p>Bu işletmeye bağlı destek kaydı yok. Siparişten iç taslak açabilirsiniz. E-posta gitmez.</p>}
            <div className="admin-interest-summary admin-package-shortcuts">
              <span>SİPARİŞTEN TASLAK</span>
              {ordersNeedingTicket.map((item) => (
                <Link key={item.id} href={`/yonetim/destek/yeni?musteri=${customerId}&siparis=${item.id}`}>
                  #{item.id} · {item.kind === "module" ? (item.moduleName || "Modül") : (item.packageName || "Paket")}
                </Link>
              ))}
            </div>
          </>
        ) : tickets.length ? null : (
          <p>Bu işletmeye bağlı destek kaydı yok.</p>
        )}
      </div>

      <div className="admin-recent">
        <div className="admin-recent-head">
          <h2>Yazılım faturaları</h2>
          <Link href={`/yonetim/faturalar?musteri=${customerId}`}>Tümünü gör</Link>
        </div>
        {invoices.length ? (
          <ul>
            {invoices.map((item) => (
              <li key={item.id}>
                <Link href={`/yonetim/faturalar/${item.id}`}>
                  <strong>{item.title}</strong>
                  <small>{item.amountNote || "Tutar yazılmadı"} · {invoiceStatusLabel(item.status)}</small>
                </Link>
                <time dateTime={item.createdAt}>{formatDate(item.createdAt)}</time>
              </li>
            ))}
          </ul>
        ) : null}
        {ordersNeedingInvoiceDraft.length ? (
          <>
            {invoices.length ? null : <p>Bu işletmeye bağlı fatura yok. Siparişten taslak açabilirsiniz. e-Fatura veya kart çekimi yoktur.</p>}
            <div className="admin-interest-summary admin-package-shortcuts">
              <span>SİPARİŞTEN TASLAK</span>
              {ordersNeedingInvoiceDraft.map((item) => (
                <Link key={item.id} href={`/yonetim/faturalar/yeni?musteri=${customerId}&siparis=${item.id}`}>
                  #{item.id} · {item.kind === "module" ? (item.moduleName || "Modül") : (item.packageName || "Paket")}
                </Link>
              ))}
            </div>
          </>
        ) : invoices.length ? null : (
          <p>Bu işletmeye bağlı fatura yok.</p>
        )}
      </div>
    </div>
  );
}
