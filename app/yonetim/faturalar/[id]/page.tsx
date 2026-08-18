import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { softwareInvoices } from "../../../../db/schema";
import { chatGPTSignOutPath } from "../../../chatgpt-auth";
import { requireAdminUser } from "../../../admin-auth";
import { AdminShell } from "../../admin-shell";
import { InvoiceForm } from "../invoice-form";
import { loadInvoiceFormOptions } from "../order-options";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Fatura Detayı | Avcı Yönetim",
  robots: { index: false, follow: false },
};

export default async function SoftwareInvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await requireAdminUser(`/yonetim/faturalar/${encodeURIComponent(id.slice(0, 40))}`);
  if (!admin.authorized || !admin.user) {
    return (
      <main className="admin-access-page">
        <section>
          <span className="admin-lock" aria-hidden="true">×</span>
          <span className="kicker kicker-light">YETKİLİ ERİŞİMİ</span>
          <h1>Bu faturayı görme yetkiniz yok.</h1>
          <div>
            <Link className="button button-primary" href="/">Ana sayfaya dön</Link>
            <a className="button button-ghost" href={chatGPTSignOutPath("/yonetim/faturalar")}>Farklı hesapla giriş yap</a>
          </div>
        </section>
      </main>
    );
  }

  const invoiceId = Number(id);
  if (!Number.isSafeInteger(invoiceId) || invoiceId < 1) notFound();

  let invoice: typeof softwareInvoices.$inferSelect | undefined;
  let customers: Array<{ id: number; name: string; extra?: string }> = [];
  let orders: Array<{ id: number; customerId: number; label: string }> = [];
  let databaseFailed = false;

  try {
    const { getDb } = await import("../../../../db");
    const db = getDb();
    const [rows, options] = await Promise.all([
      db.select().from(softwareInvoices).where(eq(softwareInvoices.id, invoiceId)).limit(1),
      loadInvoiceFormOptions(),
    ]);
    invoice = rows[0];
    customers = options.customers;
    orders = options.orders;
  } catch (cause) {
    console.error("Software invoice detail failed", cause);
    databaseFailed = true;
  }

  if (databaseFailed) {
    return (
      <main className="admin-access-page">
        <section>
          <span className="admin-lock" aria-hidden="true">!</span>
          <span className="kicker kicker-light">VERİTABANI HAZIR DEĞİL</span>
          <h1>Fatura açılamıyor.</h1>
          <Link className="button button-primary" href="/yonetim/faturalar">Listeye dön</Link>
        </section>
      </main>
    );
  }
  if (!invoice) notFound();

  const customer = customers.find((item) => item.id === invoice.customerId);
  const relatedOrder = invoice.orderId ? orders.find((item) => item.id === invoice.orderId) : undefined;

  return (
    <AdminShell current="faturalar" displayName={admin.user.displayName}>
      <section className="admin-main">
        <header className="admin-heading">
          <div>
            <span className="kicker">FATURA #{invoice.id}</span>
            <h1>{invoice.title}</h1>
            <Link className="admin-back-link" href="/yonetim/faturalar">Listeye dön</Link>
          </div>
          <div className="admin-heading-actions">
            <p>{customer?.name || "Müşteri silinmiş"} · {invoice.amountNote || "Tutar yazılmadı"}</p>
            {customer ? <Link href={`/yonetim/musteriler/${customer.id}`}>Müşteriyi aç</Link> : null}
            {relatedOrder ? <Link href={`/yonetim/siparisler/${relatedOrder.id}`}>Siparişi aç</Link> : null}
            {!relatedOrder && customer ? <Link href={`/yonetim/siparisler/yeni?musteri=${customer.id}`}>Sipariş ekle</Link> : null}
            {customer ? (
              <Link href={relatedOrder
                ? `/yonetim/destek/yeni?musteri=${customer.id}&siparis=${relatedOrder.id}`
                : `/yonetim/destek/yeni?musteri=${customer.id}`}>
                Destek ekle
              </Link>
            ) : null}
          </div>
        </header>
        <InvoiceForm
          mode="edit"
          invoiceId={invoice.id}
          customers={customers}
          orders={orders}
          initial={{
            customerId: invoice.customerId,
            orderId: invoice.orderId,
            title: invoice.title,
            amountNote: invoice.amountNote,
            status: invoice.status,
            note: invoice.note,
            expectedUpdatedAt: invoice.updatedAt,
          }}
        />
      </section>
    </AdminShell>
  );
}
