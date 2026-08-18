import type { Metadata } from "next";
import Link from "next/link";
import { and, asc, eq, ne, sql } from "drizzle-orm";
import { customers, modules, packages, softwareOrders, supportTickets } from "../../../../db/schema";
import { chatGPTSignOutPath } from "../../../chatgpt-auth";
import { requireAdminUser } from "../../../admin-auth";
import { AdminShell } from "../../admin-shell";
import { parseAdminCustomerId, parseAdminOrderId } from "../../../admin-customer-query.mjs";
import { ticketDraftFromOrder, ticketNoteOrderLikePattern } from "../../../support-ticket-admin.mjs";
import { TicketForm } from "../ticket-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Yeni Destek Kaydı | Avcı Yönetim",
  robots: { index: false, follow: false },
};

export default async function NewSupportTicketPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await requireAdminUser("/yonetim/destek/yeni");
  if (!admin.authorized || !admin.user) {
    return (
      <main className="admin-access-page">
        <section>
          <span className="admin-lock" aria-hidden="true">×</span>
          <span className="kicker kicker-light">YETKİLİ ERİŞİMİ</span>
          <h1>Destek kaydı açma yetkiniz yok.</h1>
          <div>
            <Link className="button button-primary" href="/">Ana sayfaya dön</Link>
            <a className="button button-ghost" href={chatGPTSignOutPath("/yonetim/destek/yeni")}>Farklı hesapla giriş yap</a>
          </div>
        </section>
      </main>
    );
  }

  let customerOptions: Array<{ id: number; name: string; extra?: string }> = [];
  let selectedOrder: { id: number; customerId: number; kind: string; itemName: string } | undefined;
  let existingTicket: { id: number; subject: string } | undefined;
  let databaseFailed = false;

  const params = await searchParams;
  const requestedOrderId = parseAdminOrderId(params.siparis);
  const requestedCustomerId = parseAdminCustomerId(params.musteri);

  try {
    const { getDb } = await import("../../../../db");
    const db = getDb();
    const [customerRows, orderRows] = await Promise.all([
      db.select({ id: customers.id, name: customers.name, company: customers.company }).from(customers).orderBy(asc(customers.name)),
      requestedOrderId
        ? db.select({
          id: softwareOrders.id,
          customerId: softwareOrders.customerId,
          kind: softwareOrders.kind,
          packageName: packages.name,
          moduleName: modules.name,
        })
          .from(softwareOrders)
          .leftJoin(packages, eq(softwareOrders.packageId, packages.id))
          .leftJoin(modules, eq(softwareOrders.moduleId, modules.id))
          .where(eq(softwareOrders.id, requestedOrderId))
          .limit(1)
        : Promise.resolve([] as Array<{
          id: number;
          customerId: number;
          kind: string;
          packageName: string | null;
          moduleName: string | null;
        }>),
    ]);
    customerOptions = customerRows.map((item) => ({ id: item.id, name: item.name, extra: item.company || undefined }));
    const orderRow = orderRows[0];
    if (orderRow) {
      selectedOrder = {
        id: orderRow.id,
        customerId: orderRow.customerId,
        kind: orderRow.kind,
        itemName: orderRow.kind === "module" ? (orderRow.moduleName || "Modül") : (orderRow.packageName || "Paket"),
      };
      const orderPattern = ticketNoteOrderLikePattern(orderRow.id);
      if (orderPattern) {
        const [openTicket] = await db.select({ id: supportTickets.id, subject: supportTickets.subject })
          .from(supportTickets)
          .where(and(
            eq(supportTickets.customerId, orderRow.customerId),
            ne(supportTickets.status, "closed"),
            sql`${supportTickets.note} LIKE ${orderPattern} ESCAPE '\\'`,
          ))
          .limit(1);
        existingTicket = openTicket;
      }
    }
  } catch (cause) {
    console.error("New support ticket page failed", cause);
    databaseFailed = true;
  }

  const missingOrder = Boolean(requestedOrderId && !selectedOrder);
  const selectedCustomerId = selectedOrder?.customerId
    || (customerOptions.some((item) => item.id === requestedCustomerId) ? requestedCustomerId : 0);
  const draft = selectedOrder
    ? ticketDraftFromOrder(
      { id: selectedOrder.id, customerId: selectedOrder.customerId, kind: selectedOrder.kind },
      selectedOrder.itemName,
    )
    : selectedCustomerId
      ? { customerId: selectedCustomerId, topic: "diger", subject: "", message: "", note: "", status: "open" }
      : undefined;

  if (databaseFailed) {
    return (
      <main className="admin-access-page">
        <section>
          <span className="admin-lock" aria-hidden="true">!</span>
          <span className="kicker kicker-light">VERİTABANI HAZIR DEĞİL</span>
          <h1>Destek formu açılamıyor.</h1>
          <Link className="button button-primary" href="/yonetim/destek">Listeye dön</Link>
        </section>
      </main>
    );
  }

  return (
    <AdminShell current="destek" displayName={admin.user.displayName}>
      <section className="admin-main">
        <header className="admin-heading">
          <div>
            <span className="kicker">AVCI YÖNETİM</span>
            <h1>{selectedOrder ? "Siparişten destek kaydı" : "Yeni destek kaydı"}</h1>
            <Link className="admin-back-link" href={selectedOrder ? `/yonetim/siparisler/${selectedOrder.id}` : "/yonetim/destek"}>
              {selectedOrder ? "Siparişe dön" : "Listeye dön"}
            </Link>
          </div>
          <div className="admin-heading-actions">
            <p>
              {selectedOrder
                ? "Konu siparişten dolduruldu. Müşteriye e-posta gitmez; mağaza iadesi değildir."
                : "Müşteri ve konu zorunlu. E-posta gönderilmez; bu iç kayıttır."}
            </p>
            {selectedCustomerId ? <Link href={`/yonetim/musteriler/${selectedCustomerId}`}>Müşteri kartı</Link> : null}
          </div>
        </header>
        {customerOptions.length === 0 ? (
          <div className="admin-empty">
            <h2>Önce yazılım müşterisi ekleyin.</h2>
            <p>Destek kaydı, altyapı alan bir işletmeye bağlanır.</p>
            <Link className="button button-primary" href="/yonetim/musteriler/yeni">Müşteri ekle</Link>
          </div>
        ) : missingOrder ? (
          <div className="admin-empty">
            <h2>Bu sipariş bulunamadı.</h2>
            <p>Destek taslağı ancak kayıtlı bir yazılım siparişinden açılır.</p>
            <Link className="button button-primary" href="/yonetim/siparisler">Siparişlere dön</Link>
          </div>
        ) : existingTicket && selectedOrder ? (
          <div className="admin-empty">
            <h2>Bu sipariş için açık destek kaydı zaten var.</h2>
            <p>{existingTicket.subject}. İkinci açık kayıt açılmaz. Kapandıktan sonra yenisi serbesttir. E-posta gitmez.</p>
            <Link className="button button-primary" href={`/yonetim/destek/${existingTicket.id}`}>Kaydı aç</Link>
          </div>
        ) : (
          <TicketForm
            mode="create"
            customers={customerOptions}
            initial={draft}
          />
        )}
      </section>
    </AdminShell>
  );
}
