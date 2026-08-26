import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { customers, leads } from "../../../../db/schema";
import { chatGPTSignOutPath } from "../../../chatgpt-auth";
import { requireAdminUser } from "../../../admin-auth";
import { leadStatusLabel } from "../../../lead-statuses";
import { AdminShell } from "../../admin-shell";
import { CustomerForm } from "../customer-form";
import { CustomerRelated } from "../customer-related";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Müşteri Detayı | Avcı Yönetim",
  robots: { index: false, follow: false },
};

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await requireAdminUser(`/yonetim/musteriler/${encodeURIComponent(id.slice(0, 40))}`);
  if (!admin.authorized || !admin.user) {
    return (
      <main className="admin-access-page">
        <section>
          <span className="admin-lock" aria-hidden="true">×</span>
          <span className="kicker kicker-light">YETKİLİ ERİŞİMİ</span>
          <h1>Bu müşteriyi görme yetkiniz yok.</h1>
          <div>
            <Link className="button button-primary" href="/">Ana sayfaya dön</Link>
            <a className="button button-ghost" href={chatGPTSignOutPath("/yonetim/musteriler")}>Farklı hesapla giriş yap</a>
          </div>
        </section>
      </main>
    );
  }

  const customerId = Number(id);
  if (!Number.isSafeInteger(customerId) || customerId < 1) notFound();

  let customer: typeof customers.$inferSelect | undefined;
  let matchedLead: { id: number; status: string } | undefined;
  let databaseFailed = false;
  try {
    const { getDb } = await import("../../../../db");
    const db = getDb();
    const rows = await db.select().from(customers).where(eq(customers.id, customerId)).limit(1);
    customer = rows[0];
    if (customer?.email) {
      const [lead] = await db.select({ id: leads.id, status: leads.status })
        .from(leads)
        .where(eq(leads.email, customer.email))
        .orderBy(desc(leads.createdAt), desc(leads.id))
        .limit(1);
      matchedLead = lead;
    }
  } catch (cause) {
    console.error("Customer detail failed", cause);
    databaseFailed = true;
  }

  if (databaseFailed) {
    return (
      <main className="admin-access-page">
        <section>
          <span className="admin-lock" aria-hidden="true">!</span>
          <span className="kicker kicker-light">VERİTABANI HAZIR DEĞİL</span>
          <h1>Müşteri açılamıyor.</h1>
          <Link className="button button-primary" href="/yonetim/musteriler">Listeye dön</Link>
        </section>
      </main>
    );
  }
  if (!customer) notFound();

  return (
    <AdminShell current="musteriler" displayName={admin.user.displayName}>
      <section className="admin-main">
        <header className="admin-heading">
          <div>
            <span className="kicker">MÜŞTERİ #{customer.id}</span>
            <h1>{customer.name}</h1>
            <Link className="admin-back-link" href="/yonetim/musteriler">Listeye dön</Link>
          </div>
          <div className="admin-heading-actions">
            <p>{customer.company || "Firma belirtilmedi"} · {customer.email}</p>
            <a href={`tel:${customer.phone.replace(/\s/g, "")}`}>Telefonla ara</a>
            {matchedLead ? <Link href={`/yonetim/basvurular/${matchedLead.id}`}>Teklif · {leadStatusLabel(matchedLead.status)}</Link> : null}
            <Link href={`/yonetim/siparisler?musteri=${customer.id}`}>Siparişler</Link>
            <Link href={`/yonetim/siparisler/yeni?musteri=${customer.id}`}>Sipariş ekle</Link>
            <Link href={`/yonetim/faturalar?musteri=${customer.id}`}>Faturalar</Link>
            <Link href={`/yonetim/faturalar/yeni?musteri=${customer.id}`}>Fatura ekle</Link>
            <Link href={`/yonetim/destek?musteri=${customer.id}`}>Destek</Link>
            <Link href={`/yonetim/destek/yeni?musteri=${customer.id}`}>Destek ekle</Link>
            <Link href={`/yonetim/musteriler/${customer.id}/portal`}>Portal ürünleşme</Link>
          </div>
        </header>
        <CustomerForm
          mode="edit"
          customerId={customer.id}
          initial={{
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            company: customer.company,
            city: customer.city,
            interest: customer.interest,
            note: customer.note,
            domainName: customer.domainName,
            domainExpiresAt: customer.domainExpiresAt,
            hostingExpiresAt: customer.hostingExpiresAt,
            status: customer.status,
            expectedUpdatedAt: customer.updatedAt,
          }}
        />
        <CustomerRelated customerId={customer.id} interest={customer.interest} />
      </section>
    </AdminShell>
  );
}
