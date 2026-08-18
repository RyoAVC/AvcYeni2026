import type { Metadata } from "next";
import Link from "next/link";
import { chatGPTSignOutPath } from "../../../chatgpt-auth";
import { requireAdminUser } from "../../../admin-auth";
import { parseAdminCustomerId, parseAdminOrderId } from "../../../admin-customer-query.mjs";
import { invoiceDraftFromOrder } from "../../../software-invoice-admin.mjs";
import { AdminShell } from "../../admin-shell";
import { InvoiceForm } from "../invoice-form";
import { findDraftInvoiceForOrder, loadInvoiceFormOptions } from "../order-options";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Yeni Yazılım Faturası | Avcı Yönetim",
  robots: { index: false, follow: false },
};

export default async function NewSoftwareInvoicePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await requireAdminUser("/yonetim/faturalar/yeni");
  if (!admin.authorized || !admin.user) {
    return (
      <main className="admin-access-page">
        <section>
          <span className="admin-lock" aria-hidden="true">×</span>
          <span className="kicker kicker-light">YETKİLİ ERİŞİMİ</span>
          <h1>Fatura ekleme yetkiniz yok.</h1>
          <div>
            <Link className="button button-primary" href="/">Ana sayfaya dön</Link>
            <a className="button button-ghost" href={chatGPTSignOutPath("/yonetim/faturalar/yeni")}>Farklı hesapla giriş yap</a>
          </div>
        </section>
      </main>
    );
  }

  let customers: Array<{ id: number; name: string; extra?: string }> = [];
  let orders: Array<{ id: number; customerId: number; label: string; itemName: string; priceNote: string }> = [];
  let existingDraft: { id: number; title: string } | undefined;
  let databaseFailed = false;

  try {
    const options = await loadInvoiceFormOptions();
    customers = options.customers;
    orders = options.orders;
    const requestedOrderId = parseAdminOrderId((await searchParams).siparis);
    if (requestedOrderId) {
      existingDraft = await findDraftInvoiceForOrder(requestedOrderId);
    }
  } catch (cause) {
    console.error("New software invoice page failed", cause);
    databaseFailed = true;
  }

  const params = await searchParams;
  const requestedOrderId = parseAdminOrderId(params.siparis);
  const requestedCustomerId = parseAdminCustomerId(params.musteri);
  const selectedOrder = orders.find((item) => item.id === requestedOrderId);
  const missingOrder = Boolean(requestedOrderId && !selectedOrder);
  const selectedCustomerId = selectedOrder?.customerId
    || (customers.some((item) => item.id === requestedCustomerId) ? requestedCustomerId : 0);
  const draft = selectedOrder
    ? invoiceDraftFromOrder(
      { id: selectedOrder.id, customerId: selectedOrder.customerId, priceNote: selectedOrder.priceNote },
      selectedOrder.itemName,
    )
    : selectedCustomerId
      ? { customerId: selectedCustomerId, orderId: null, title: "", amountNote: "", status: "draft", note: "" }
      : undefined;

  if (databaseFailed) {
    return (
      <main className="admin-access-page">
        <section>
          <span className="admin-lock" aria-hidden="true">!</span>
          <span className="kicker kicker-light">VERİTABANI HAZIR DEĞİL</span>
          <h1>Fatura formu açılamıyor.</h1>
          <Link className="button button-primary" href="/yonetim/faturalar">Listeye dön</Link>
        </section>
      </main>
    );
  }

  const formOrders = orders.map(({ id, customerId, label }) => ({ id, customerId, label }));

  return (
    <AdminShell current="faturalar" displayName={admin.user.displayName}>
      <section className="admin-main">
        <header className="admin-heading">
          <div>
            <span className="kicker">AVCI YÖNETİM</span>
            <h1>{selectedOrder ? "Siparişten fatura taslağı" : "Yeni fatura"}</h1>
            <Link className="admin-back-link" href={selectedOrder ? `/yonetim/siparisler/${selectedOrder.id}` : "/yonetim/faturalar"}>
              {selectedOrder ? "Siparişe dön" : "Listeye dön"}
            </Link>
          </div>
          <div className="admin-heading-actions">
            <p>
              {selectedOrder
                ? "Başlık ve tutar notu siparişten dolduruldu. Kaydedince iç tahsil kaydı oluşur. Kart çekilmez; e-Fatura üretilmez."
                : "Müşteri ve başlık zorunlu. Kart çekilmez; e-Fatura üretilmez. Bu iç tahsil kaydıdır."}
            </p>
            {selectedCustomerId ? <Link href={`/yonetim/musteriler/${selectedCustomerId}`}>Müşteri kartı</Link> : null}
          </div>
        </header>
        {customers.length === 0 ? (
          <div className="admin-empty">
            <h2>Önce yazılım müşterisi ekleyin.</h2>
            <p>Fatura, altyapı alan bir işletmeye bağlanır.</p>
            <Link className="button button-primary" href="/yonetim/musteriler/yeni">Müşteri ekle</Link>
          </div>
        ) : missingOrder ? (
          <div className="admin-empty">
            <h2>Bu sipariş bulunamadı.</h2>
            <p>Taslak ancak kayıtlı bir yazılım siparişinden açılır. Mağaza fişi değildir.</p>
            <Link className="button button-primary" href="/yonetim/siparisler">Siparişlere dön</Link>
          </div>
        ) : existingDraft && selectedOrder ? (
          <div className="admin-empty">
            <h2>Bu sipariş için taslak fatura zaten var.</h2>
            <p>{existingDraft.title}. İkinci taslak açılmaz; mevcut kaydı düzenleyin veya gönderin. e-Fatura üretilmez.</p>
            <Link className="button button-primary" href={`/yonetim/faturalar/${existingDraft.id}`}>Taslağı aç</Link>
            <Link className="button button-ghost" href={`/yonetim/siparisler/${selectedOrder.id}`}>Siparişe dön</Link>
          </div>
        ) : (
          <InvoiceForm
            mode="create"
            customers={customers}
            orders={formOrders}
            initial={draft}
          />
        )}
      </section>
    </AdminShell>
  );
}
