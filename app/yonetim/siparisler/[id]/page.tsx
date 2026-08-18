import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq, ne, sql } from "drizzle-orm";
import { customers, modules, packages, softwareInvoices, softwareOrders, supportTickets } from "../../../../db/schema";
import { chatGPTSignOutPath } from "../../../chatgpt-auth";
import { requireAdminUser } from "../../../admin-auth";
import { softwareOrderKindLabel } from "../../../software-order-admin.mjs";
import { ticketNoteOrderLikePattern } from "../../../support-ticket-admin.mjs";
import { AdminShell } from "../../admin-shell";
import { OrderForm } from "../order-form";
import { OrderRelated } from "../order-related";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sipariş Detayı | Avcı Yönetim",
  robots: { index: false, follow: false },
};

export default async function SoftwareOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await requireAdminUser(`/yonetim/siparisler/${encodeURIComponent(id.slice(0, 40))}`);
  if (!admin.authorized || !admin.user) {
    return (
      <main className="admin-access-page">
        <section>
          <span className="admin-lock" aria-hidden="true">×</span>
          <span className="kicker kicker-light">YETKİLİ ERİŞİMİ</span>
          <h1>Bu siparişi görme yetkiniz yok.</h1>
          <div>
            <Link className="button button-primary" href="/">Ana sayfaya dön</Link>
            <a className="button button-ghost" href={chatGPTSignOutPath("/yonetim/siparisler")}>Farklı hesapla giriş yap</a>
          </div>
        </section>
      </main>
    );
  }

  const orderId = Number(id);
  if (!Number.isSafeInteger(orderId) || orderId < 1) notFound();

  let order: typeof softwareOrders.$inferSelect | undefined;
  let customerOptions: Array<{ id: number; name: string; extra?: string }> = [];
  let packageOptions: Array<{ id: number; name: string }> = [];
  let moduleOptions: Array<{ id: number; name: string }> = [];
  let draftInvoiceId = 0;
  let openTicketId = 0;
  let databaseFailed = false;

  try {
    const { getDb } = await import("../../../../db");
    const db = getDb();
    const orderPattern = ticketNoteOrderLikePattern(orderId);
    const [rows, customerRows, packageRows, moduleRows, draftInvoiceRows, openTicketRows] = await Promise.all([
      db.select().from(softwareOrders).where(eq(softwareOrders.id, orderId)).limit(1),
      db.select({ id: customers.id, name: customers.name, company: customers.company }).from(customers).orderBy(asc(customers.name)),
      db.select({ id: packages.id, name: packages.name }).from(packages).orderBy(asc(packages.sortOrder), asc(packages.id)),
      db.select({ id: modules.id, name: modules.name }).from(modules).orderBy(asc(modules.sortOrder), asc(modules.id)),
      db.select({ id: softwareInvoices.id }).from(softwareInvoices).where(and(eq(softwareInvoices.orderId, orderId), eq(softwareInvoices.status, "draft"))).limit(1),
      orderPattern
        ? db.select({ id: supportTickets.id }).from(supportTickets).where(and(
          ne(supportTickets.status, "closed"),
          sql`${supportTickets.note} LIKE ${orderPattern} ESCAPE '\\'`,
        )).limit(1)
        : Promise.resolve([] as Array<{ id: number }>),
    ]);
    order = rows[0];
    customerOptions = customerRows.map((item) => ({ id: item.id, name: item.name, extra: item.company || undefined }));
    packageOptions = packageRows;
    moduleOptions = moduleRows;
    draftInvoiceId = draftInvoiceRows[0]?.id ?? 0;
    openTicketId = openTicketRows[0]?.id ?? 0;
  } catch (cause) {
    console.error("Software order detail failed", cause);
    databaseFailed = true;
  }

  if (databaseFailed) {
    return (
      <main className="admin-access-page">
        <section>
          <span className="admin-lock" aria-hidden="true">!</span>
          <span className="kicker kicker-light">VERİTABANI HAZIR DEĞİL</span>
          <h1>Sipariş açılamıyor.</h1>
          <Link className="button button-primary" href="/yonetim/siparisler">Listeye dön</Link>
        </section>
      </main>
    );
  }
  if (!order) notFound();

  const customer = customerOptions.find((item) => item.id === order.customerId);
  const packageName = packageOptions.find((item) => item.id === order.packageId)?.name;
  const moduleName = moduleOptions.find((item) => item.id === order.moduleId)?.name;
  const itemLabel = order.kind === "module" ? (moduleName || "Modül") : (packageName || "Paket");

  return (
    <AdminShell current="siparisler" displayName={admin.user.displayName}>
      <section className="admin-main">
        <header className="admin-heading">
          <div>
            <span className="kicker">SİPARİŞ #{order.id}</span>
            <h1>{customer?.name || "Yazılım siparişi"}</h1>
            <Link className="admin-back-link" href="/yonetim/siparisler">Listeye dön</Link>
          </div>
          <div className="admin-heading-actions">
            <p>{softwareOrderKindLabel(order.kind)} · {itemLabel} · {customer?.extra || "Firma belirtilmedi"}</p>
            {customer ? <Link href={`/yonetim/musteriler/${customer.id}`}>Müşteriyi aç</Link> : null}
            {customer ? (
              draftInvoiceId
                ? <Link href={`/yonetim/faturalar/${draftInvoiceId}`}>Taslak faturayı aç</Link>
                : <Link href={`/yonetim/faturalar/yeni?musteri=${customer.id}&siparis=${order.id}`}>Fatura taslağı aç</Link>
            ) : null}
            {customer ? (
              openTicketId
                ? <Link href={`/yonetim/destek/${openTicketId}`}>Açık desteği aç</Link>
                : <Link href={`/yonetim/destek/yeni?musteri=${customer.id}&siparis=${order.id}`}>Destek kaydı aç</Link>
            ) : null}
          </div>
        </header>
        <OrderForm
          mode="edit"
          orderId={order.id}
          customers={customerOptions}
          packages={packageOptions}
          modules={moduleOptions}
          initial={{
            customerId: order.customerId,
            kind: order.kind,
            packageId: order.packageId,
            moduleId: order.moduleId,
            status: order.status,
            priceNote: order.priceNote,
            note: order.note,
            expectedUpdatedAt: order.updatedAt,
          }}
        />
        {customer ? <OrderRelated orderId={order.id} customerId={customer.id} itemLabel={itemLabel} /> : null}
      </section>
    </AdminShell>
  );
}
