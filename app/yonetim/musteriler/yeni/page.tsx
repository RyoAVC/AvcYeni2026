import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { customers, leads } from "../../../../db/schema";
import { chatGPTSignOutPath } from "../../../chatgpt-auth";
import { requireAdminUser } from "../../../admin-auth";
import { parseAdminLeadId } from "../../../admin-customer-query.mjs";
import { customerDraftFromLead } from "../../../customer-record.mjs";
import { normalizeEmailAddress } from "../../../email-normalization.mjs";
import { AdminShell } from "../../admin-shell";
import { CustomerForm } from "../customer-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Yeni Yazılım Müşterisi | Avcı Yönetim",
  robots: { index: false, follow: false },
};

export default async function NewCustomerPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await requireAdminUser("/yonetim/musteriler/yeni");
  if (!admin.authorized || !admin.user) {
    return (
      <main className="admin-access-page">
        <section>
          <span className="admin-lock" aria-hidden="true">×</span>
          <span className="kicker kicker-light">YETKİLİ ERİŞİMİ</span>
          <h1>Müşteri ekleme yetkiniz yok.</h1>
          <div>
            <Link className="button button-primary" href="/">Ana sayfaya dön</Link>
            <a className="button button-ghost" href={chatGPTSignOutPath("/yonetim/musteriler/yeni")}>Farklı hesapla giriş yap</a>
          </div>
        </section>
      </main>
    );
  }

  const leadId = parseAdminLeadId((await searchParams).basvuru);
  let draft: ReturnType<typeof customerDraftFromLead> | undefined;
  let existingCustomer: { id: number; name: string } | undefined;
  let leadMissing = false;
  let databaseFailed = false;

  if (leadId) {
    try {
      const { getDb } = await import("../../../../db");
      const db = getDb();
      const [lead] = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
      if (!lead) {
        leadMissing = true;
      } else {
        draft = customerDraftFromLead(lead, lead.id);
        const email = normalizeEmailAddress(lead.email, 180);
        if (email) {
          const [match] = await db.select({ id: customers.id, name: customers.name }).from(customers).where(eq(customers.email, email)).limit(1);
          existingCustomer = match;
        }
      }
    } catch (cause) {
      console.error("Lead-to-customer prefills failed", cause);
      databaseFailed = true;
    }
  }

  if (databaseFailed) {
    return (
      <main className="admin-access-page">
        <section>
          <span className="admin-lock" aria-hidden="true">!</span>
          <span className="kicker kicker-light">VERİTABANI HAZIR DEĞİL</span>
          <h1>Müşteri formu açılamıyor.</h1>
          <Link className="button button-primary" href="/yonetim/musteriler">Listeye dön</Link>
        </section>
      </main>
    );
  }

  return (
    <AdminShell current="musteriler" displayName={admin.user.displayName}>
      <section className="admin-main">
        <header className="admin-heading">
          <div>
            <span className="kicker">AVCI YÖNETİM</span>
            <h1>{draft ? "Başvurudan müşteri" : "Yeni müşteri"}</h1>
            <Link className="admin-back-link" href={leadId ? `/yonetim/basvurular/${leadId}` : "/yonetim/musteriler"}>
              {leadId ? "Başvuruya dön" : "Listeye dön"}
            </Link>
          </div>
          <div className="admin-heading-actions">
            <p>
              {draft
                ? "Sitedeki teklif formu buraya aktarıldı. Kaydedince başvuru fırsat olur, ardından paket siparişi açılır. Mağaza müşterisi değil; altyapı alan işletmedir."
                : "Ad, e-posta ve telefon zorunlu. Bu kişi altyapı / modül alan işletmedir."}
            </p>
            {leadId ? <Link href={`/yonetim/basvurular/${leadId}`}>Başvuru #{leadId}</Link> : null}
          </div>
        </header>

        {leadMissing ? (
          <div className="admin-empty">
            <h2>Bu başvuru bulunamadı.</h2>
            <p>Formu boş bırakıyoruz. Listeye dönüp doğru kaydı açın.</p>
            <Link className="button button-primary" href="/yonetim/basvurular">Başvurulara dön</Link>
          </div>
        ) : existingCustomer ? (
          <div className="admin-empty">
            <h2>Bu e-posta zaten yazılım müşterisi.</h2>
            <p>{existingCustomer.name} kaydı var. Çift müşteri açılmaz; sipariş veya faturayı mevcut karta bağlayın.</p>
            <Link className="button button-primary" href={`/yonetim/musteriler/${existingCustomer.id}`}>Müşteri kaydını aç</Link>
            <Link className="button button-ghost" href={`/yonetim/siparisler/yeni?musteri=${existingCustomer.id}`}>Sipariş ekle</Link>
          </div>
        ) : (
          <CustomerForm mode="create" initial={draft} leadId={draft && leadId ? leadId : undefined} />
        )}
      </section>
    </AdminShell>
  );
}
