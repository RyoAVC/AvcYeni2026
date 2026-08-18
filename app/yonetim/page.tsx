import type { Metadata } from "next";
import Link from "next/link";
import { and, desc, eq, inArray, ne, notExists, sql } from "drizzle-orm";
import { customers, leads, modules, packages, softwareInvoices, softwareOrders, supportTickets } from "../../db/schema";
import { chatGPTSignOutPath } from "../chatgpt-auth";
import { requireAdminUser } from "../admin-auth";
import { TICKET_NOTE_ANY_ORDER_LIKE } from "../support-ticket-admin.mjs";
import { customerIdByNormalizedEmail, matchLeadToCustomerId } from "../customer-record.mjs";
import { normalizeEmailAddress } from "../email-normalization.mjs";
import { AdminShell } from "./admin-shell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Yönetim Paneli | Avcı",
  robots: { index: false, follow: false },
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Istanbul",
  }).format(new Date(value));
}

export default async function AdminHomePage() {
  const admin = await requireAdminUser("/yonetim");

  if (!admin.authorized || !admin.user) {
    return (
      <main className="admin-access-page">
        <section>
          <span className="admin-lock" aria-hidden="true">×</span>
          <span className="kicker kicker-light">YETKİLİ ERİŞİMİ</span>
          <h1>Bu hesap yönetim paneline yetkili değil.</h1>
          <p>Giriş yaptığınız <strong>{admin.user?.email}</strong> adresi yönetici izin listesinde bulunmuyor.</p>
          <div>
            <Link className="button button-primary" href="/">Ana sayfaya dön</Link>
            <a className="button button-ghost" href={chatGPTSignOutPath("/yonetim")}>Farklı hesapla giriş yap</a>
          </div>
        </section>
      </main>
    );
  }

  let total = 0;
  let fresh = 0;
  let contacted = 0;
  let qualified = 0;
  let closed = 0;
  let customersTotal = 0;
  let ordersTotal = 0;
  let openTickets = 0;
  let waitingTickets = 0;
  let invoicesTotal = 0;
  let trialCustomers = 0;
  let draftOrders = 0;
  let draftInvoices = 0;
  let customersWithoutOrders = 0;
  let invoicesWithoutOrders = 0;
  let ordersWithoutInvoices = 0;
  let ticketsWithoutOrders = 0;
  let leadsWithoutCustomers = 0;
  let recent: Array<typeof leads.$inferSelect & { customerId: number }> = [];
  let recentOrders: Array<{ id: number; createdAt: string; customerName: string | null; itemName: string }> = [];
  let databaseFailed = false;

  try {
    const { getDb } = await import("../../db");
    const db = getDb();
    const [totals, newest, customerRows, orderRows, ticketStatusRows, invoiceRows, newestOrders, trialRows, draftOrderRows, draftInvoiceRows, customersWithoutOrderRows, invoicesWithoutOrderRows, ordersWithoutInvoiceRows, ticketsWithoutOrderRows, leadsWithoutCustomerRows] = await Promise.all([
      db.select({ status: leads.status, count: sql<number>`count(*)` }).from(leads).groupBy(leads.status),
      db.select().from(leads).orderBy(desc(leads.createdAt), desc(leads.id)).limit(5),
      db.select({ count: sql<number>`count(*)` }).from(customers),
      db.select({ count: sql<number>`count(*)` }).from(softwareOrders),
      db.select({ status: supportTickets.status, count: sql<number>`count(*)` }).from(supportTickets).groupBy(supportTickets.status),
      db.select({ count: sql<number>`count(*)` }).from(softwareInvoices),
      db.select({
        id: softwareOrders.id,
        createdAt: softwareOrders.createdAt,
        customerName: customers.name,
        kind: softwareOrders.kind,
        packageName: packages.name,
        moduleName: modules.name,
      })
        .from(softwareOrders)
        .leftJoin(customers, eq(softwareOrders.customerId, customers.id))
        .leftJoin(packages, eq(softwareOrders.packageId, packages.id))
        .leftJoin(modules, eq(softwareOrders.moduleId, modules.id))
        .orderBy(desc(softwareOrders.createdAt), desc(softwareOrders.id))
        .limit(5),
      db.select({ count: sql<number>`count(*)` }).from(customers).where(eq(customers.status, "trial")),
      db.select({ count: sql<number>`count(*)` }).from(softwareOrders).where(eq(softwareOrders.status, "draft")),
      db.select({ count: sql<number>`count(*)` }).from(softwareInvoices).where(eq(softwareInvoices.status, "draft")),
      db.select({ count: sql<number>`count(*)` }).from(customers).where(notExists(
        db.select({ id: softwareOrders.id }).from(softwareOrders).where(eq(softwareOrders.customerId, customers.id)),
      )),
      db.select({ count: sql<number>`count(*)` }).from(softwareInvoices).where(sql`${softwareInvoices.orderId} is null`),
      db.select({ count: sql<number>`count(*)` }).from(softwareOrders).where(notExists(
        db.select({ id: softwareInvoices.id }).from(softwareInvoices).where(eq(softwareInvoices.orderId, softwareOrders.id)),
      )),
      db.select({ count: sql<number>`count(*)` }).from(supportTickets).where(and(
        ne(supportTickets.status, "closed"),
        sql`${supportTickets.note} NOT LIKE ${TICKET_NOTE_ANY_ORDER_LIKE} ESCAPE '\\'`,
      )),
      db.select({ count: sql<number>`count(*)` }).from(leads).where(and(
        ne(leads.status, "closed"),
        notExists(db.select({ id: customers.id }).from(customers).where(eq(customers.email, leads.email))),
      )),
    ]);
    const counts = Object.fromEntries(totals.map((item) => [item.status, Number(item.count)]));
    fresh = counts.new ?? 0;
    contacted = counts.contacted ?? 0;
    qualified = counts.qualified ?? 0;
    closed = counts.closed ?? 0;
    total = totals.reduce((sum, item) => sum + Number(item.count), 0);
    const emails = [...new Set(newest.map((lead) => normalizeEmailAddress(lead.email, 180)).filter(Boolean))];
    let byEmail = new Map<string, number>();
    if (emails.length) {
      const matches = await db.select({ id: customers.id, email: customers.email }).from(customers).where(inArray(customers.email, emails));
      byEmail = customerIdByNormalizedEmail(matches);
    }
    recent = newest.map((lead) => ({ ...lead, customerId: matchLeadToCustomerId(lead, byEmail) }));
    customersTotal = Number(customerRows[0]?.count ?? 0);
    ordersTotal = Number(orderRows[0]?.count ?? 0);
    const ticketCounts = Object.fromEntries(ticketStatusRows.map((item) => [item.status, Number(item.count)]));
    openTickets = ticketCounts.open ?? 0;
    waitingTickets = ticketCounts.waiting ?? 0;
    invoicesTotal = Number(invoiceRows[0]?.count ?? 0);
    trialCustomers = Number(trialRows[0]?.count ?? 0);
    draftOrders = Number(draftOrderRows[0]?.count ?? 0);
    draftInvoices = Number(draftInvoiceRows[0]?.count ?? 0);
    customersWithoutOrders = Number(customersWithoutOrderRows[0]?.count ?? 0);
    invoicesWithoutOrders = Number(invoicesWithoutOrderRows[0]?.count ?? 0);
    ordersWithoutInvoices = Number(ordersWithoutInvoiceRows[0]?.count ?? 0);
    ticketsWithoutOrders = Number(ticketsWithoutOrderRows[0]?.count ?? 0);
    leadsWithoutCustomers = Number(leadsWithoutCustomerRows[0]?.count ?? 0);
    recentOrders = newestOrders.map((item) => ({
      id: item.id,
      createdAt: item.createdAt,
      customerName: item.customerName,
      itemName: item.kind === "module" ? (item.moduleName || "Modül") : (item.packageName || "Paket"),
    }));
  } catch (cause) {
    console.error("Admin home failed", cause);
    databaseFailed = true;
  }

  return (
    <AdminShell current="panel" displayName={admin.user.displayName}>
      <section className="admin-main">
        <header className="admin-heading">
          <div>
            <span className="kicker">AVCI YÖNETİM</span>
            <h1>Panel özeti</h1>
          </div>
          <div className="admin-heading-actions">
            <p>Bu panel Avcı’nın kendi işini yönetir: altyapı teklifi, ileride lisans ve modül. Müşterinin mağaza siparişi veya stoğu burada yok.</p>
            <Link href="/yonetim/basvurular">Teklifleri aç</Link>
          </div>
        </header>

        {databaseFailed ? (
          <div className="admin-empty">
            <h2>Veritabanı şu anda açılamıyor.</h2>
            <p>D1 bağlantısı hazır olunca sayılar otomatik dolar.</p>
          </div>
        ) : (
          <>
            <div className="admin-stats">
              <article><small>Yeni</small><strong>{fresh}</strong><span><Link href="/yonetim/basvurular?status=new">{total} kayıt içinde</Link></span></article>
              <article><small>İletişim</small><strong>{contacted}</strong><span><Link href="/yonetim/basvurular?status=contacted">görüşülüyor</Link></span></article>
              <article><small>Fırsat</small><strong>{qualified}</strong><span><Link href="/yonetim/basvurular?status=qualified">değerlendiriliyor</Link></span></article>
              <article><small>Tamamlandı</small><strong>{closed}</strong><span><Link href="/yonetim/basvurular?status=closed">süreç bitti</Link></span></article>
            </div>

            <h2 className="admin-ops-title">Yazılım işi</h2>
            <nav className="admin-interest-summary" aria-label="İş akışı">
              <span>İŞ AKIŞI</span>
              <Link href="/yonetim/basvurular">Teklif</Link>
              <Link href="/yonetim/musteriler">Müşteri</Link>
              <Link href="/yonetim/siparisler">Sipariş</Link>
              <Link href="/yonetim/faturalar">Fatura</Link>
              <Link href="/yonetim/destek">Destek</Link>
            </nav>
            <nav className="admin-interest-summary" aria-label="Bekleyen iş">
              <span>BEKLEYEN</span>
              <Link href="/yonetim/basvurular?status=new">Yeni teklif <strong>{fresh}</strong></Link>
              <Link href="/yonetim/basvurular?status=contacted">İletişim kuruldu <strong>{contacted}</strong></Link>
              <Link href="/yonetim/basvurular?status=qualified">Fırsat <strong>{qualified}</strong></Link>
              <Link href="/yonetim/basvurular?eksik=musteri">Müşterisiz başvuru <strong>{leadsWithoutCustomers}</strong></Link>
              <Link href="/yonetim/musteriler?status=trial">Deneme müşteri <strong>{trialCustomers}</strong></Link>
              <Link href="/yonetim/musteriler?eksik=siparis">Siparişsiz müşteri <strong>{customersWithoutOrders}</strong></Link>
              <Link href="/yonetim/siparisler?status=draft">Taslak sipariş <strong>{draftOrders}</strong></Link>
              <Link href="/yonetim/siparisler?eksik=fatura">Faturasız sipariş <strong>{ordersWithoutInvoices}</strong></Link>
              <Link href="/yonetim/faturalar?status=draft">Taslak fatura <strong>{draftInvoices}</strong></Link>
              <Link href="/yonetim/faturalar?eksik=siparis">Siparişsiz fatura <strong>{invoicesWithoutOrders}</strong></Link>
              <Link href="/yonetim/destek?status=open">Açık destek <strong>{openTickets}</strong></Link>
              <Link href="/yonetim/destek?status=waiting">Yanıt bekleyen <strong>{waitingTickets}</strong></Link>
              <Link href="/yonetim/destek?eksik=siparis">Siparişsiz destek <strong>{ticketsWithoutOrders}</strong></Link>
            </nav>
            <div className="admin-stats">
              <article><small>Müşteri</small><strong>{customersTotal}</strong><span>altyapı alan işletme</span></article>
              <article><small>Sipariş</small><strong>{ordersTotal}</strong><span>paket / modül kaydı</span></article>
              <article><small>Açık destek</small><strong>{openTickets + waitingTickets}</strong><span>açık {openTickets} · bekleyen {waitingTickets}</span></article>
              <article><small>Fatura</small><strong>{invoicesTotal}</strong><span>yazılım tahsil kaydı</span></article>
            </div>

            <div className="admin-os-grid">
              <article className="admin-os-card is-live">
                <small>Hazır</small>
                <h2>Teklif başvuruları</h2>
                <p>Siteden gelen altyapı / modül / yazılım talepleri. Durum ve ekip notu burada.</p>
                <Link href="/yonetim/basvurular">Teklifleri aç</Link>
              </article>
              <article className="admin-os-card is-live">
                <small>Hazır</small>
                <h2>Site istatistikleri</h2>
                <p>Tanıtım ziyareti ve yazılım hunisi. Mağaza siparişi değil.</p>
                <Link href="/yonetim/istatistik">İstatistikleri aç</Link>
              </article>
              <article className="admin-os-card is-live">
                <small>Hazır</small>
                <h2>Yazılım müşterileri</h2>
                <p>Altyapı ve modül alan işletmeler. Ad, e-posta, telefon burada.</p>
                <Link href="/yonetim/musteriler">Müşterileri aç</Link>
              </article>
              <article className="admin-os-card is-live">
                <small>Hazır</small>
                <h2>Yazılım paketleri</h2>
                <p>Start / Scale / özel çerçeveler. Kesin fiyat teklifte; burası katalog kartı.</p>
                <Link href="/yonetim/paketler">Paketleri aç</Link>
              </article>
              <article className="admin-os-card is-live">
                <small>Hazır</small>
                <h2>Yazılım modülleri</h2>
                <p>Trendyol, PayTR, kargo gibi satılan eklentiler. Mağaza stoğu değil.</p>
                <Link href="/yonetim/moduller">Modülleri aç</Link>
              </article>
              <article className="admin-os-card is-live">
                <small>Hazır</small>
                <h2>Yazılım siparişleri</h2>
                <p>Hangi müşteri hangi paketi veya eklentiyi aldı. Kasa / sepet değil.</p>
                <Link href="/yonetim/siparisler">Siparişleri aç</Link>
              </article>
              <article className="admin-os-card is-live">
                <small>Hazır</small>
                <h2>Destek kayıtları</h2>
                <p>Altyapı / modül talepleri. Mağaza iadesi değil. E-posta gitmez.</p>
                <Link href="/yonetim/destek">Destek kayıtlarını aç</Link>
              </article>
              <article className="admin-os-card is-live">
                <small>Hazır</small>
                <h2>Yazılım faturaları</h2>
                <p>Paket / modül tahsil kaydı. Mağaza fişi, kart çekimi veya e-Fatura değil.</p>
                <Link href="/yonetim/faturalar">Faturaları aç</Link>
              </article>
              <article className="admin-os-card is-live">
                <small>Hazır</small>
                <h2>Ana sayfa vitrini</h2>
                <p>İnce şerit: çevrimiçi, destek, yeni kayıt. Örnek vitrin; gerçek CRM sayısı değil.</p>
                <Link href="/yonetim/vitrin">Vitrini aç</Link>
              </article>
              <article className="admin-os-card is-live">
                <small>Hazır</small>
                <h2>Genel / site ayarları</h2>
                <p>E-posta, telefon, tasarım yazısı ve logo. Mağaza ayarı değil.</p>
                <Link href="/yonetim/ayarlar">Ayarları aç</Link>
              </article>
              <article className="admin-os-card is-live">
                <small>Hazır</small>
                <h2>Site düzenleyici</h2>
                <p>Hero düğmeleri, footer cümlesi, şerit aç/kapa. Kaydet yeter. Sürükle-bırak tuval yok.</p>
                <Link href="/yonetim/editor">Editörü aç</Link>
              </article>
            </div>

            <div className="admin-related">
            <div className="admin-recent">
              <div className="admin-recent-head">
                <h2>Son teklifler</h2>
                <Link href={leadsWithoutCustomers ? "/yonetim/basvurular?eksik=musteri" : "/yonetim/basvurular"}>{leadsWithoutCustomers ? "Müşterisizler" : "Tümünü gör"}</Link>
              </div>
              {recent.length ? (
                <ul>
                  {recent.map((lead) => (
                    <li key={lead.id}>
                      <Link href={lead.customerId ? `/yonetim/basvurular/${lead.id}` : `/yonetim/musteriler/yeni?basvuru=${lead.id}`}>
                        <strong>{lead.name}</strong>
                        <small>{lead.customerId ? lead.interest : `${lead.interest} · müşteriye çevir`}</small>
                      </Link>
                      <time dateTime={lead.createdAt}>{formatDate(lead.createdAt)}</time>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Henüz başvuru yok. Sitedeki formdan gelenler burada görünür.</p>
              )}
            </div>
            <div className="admin-recent">
              <div className="admin-recent-head">
                <h2>Son yazılım siparişleri</h2>
                <Link href={ordersWithoutInvoices ? "/yonetim/siparisler?eksik=fatura" : "/yonetim/siparisler"}>{ordersWithoutInvoices ? "Faturasızlar" : "Tümünü gör"}</Link>
              </div>
              {recentOrders.length ? (
                <ul>
                  {recentOrders.map((item) => (
                    <li key={item.id}>
                      <Link href={`/yonetim/siparisler/${item.id}`}>
                        <strong>{item.customerName || "Müşteri silinmiş"}</strong>
                        <small>{item.itemName}</small>
                      </Link>
                      <time dateTime={item.createdAt}>{formatDate(item.createdAt)}</time>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Henüz yazılım siparişi yok. Teklif müşteriye, sonra pakete bağlanır.</p>
              )}
            </div>
            </div>
          </>
        )}
      </section>
    </AdminShell>
  );
}
