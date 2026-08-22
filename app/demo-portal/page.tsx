import type { Metadata } from "next";
import Link from "next/link";
import { HeaderCtaCluster } from "../header-cta-cluster";
import { SiteBrand } from "../site-brand";
import { TofyMark } from "../tofy-mark";
import { loadSiteSettings } from "../site-settings.mjs";
import { PACKAGE_SCOPE_DETAILS, packageScopeTitle } from "../package-scope-details";
import { DemoPortalNav, type DemoPortalNavItem } from "./demo-portal-nav";

export const metadata: Metadata = {
  title: "Demo Müşteri Paneli V2 | Avcı E-Ticaret",
  description: "Avcı müşteri paneli görünümünü örnek işletme verisiyle inceleyin. Gerçek hesap veya parola içermez.",
  alternates: { canonical: "/demo-portal" },
  robots: { index: false, follow: false },
};

const licenses = PACKAGE_SCOPE_DETAILS.map((item) => [
  "AVC E-Ticaret",
  packageScopeTitle(item.id),
  "Örnek görünüm",
  `${item.salePrice} örnek band`,
]);

const invoices = PACKAGE_SCOPE_DETAILS.map((item) => [
  `${packageScopeTitle(item.id)} örnek band`,
  "Lisans çerçevesi",
  "Taslak görünüm",
  item.salePrice,
]);

const scalePackage = PACKAGE_SCOPE_DETAILS.find((item) => item.id === "scale") ?? PACKAGE_SCOPE_DETAILS[1];

const financialHighlights = [
  { label: "Aktif paket", value: packageScopeTitle("scale"), note: "örnek çerçeve" },
  { label: "Örnek band", value: scalePackage.salePrice, note: "teklifte netleşir" },
  { label: "Açık bakiye", value: "0 TL", note: "salt demo · tahsilat yok" },
  { label: "Son kayıt", value: "Ödendi", note: "örnek · e-Fatura değil" },
] as const;

const navItems: DemoPortalNavItem[] = [
  { id: "ozet", label: "Özet" },
  { id: "bildirimler", label: "Bildirimler" },
  { id: "operasyon", label: "Operasyon" },
  { id: "altyapi", label: "Altyapı" },
  { id: "tofy", label: "Tofy" },
  { id: "lisanslar", label: "Lisanslar" },
  { id: "erisim", label: "Erişimler" },
  { id: "destek", label: "Destek" },
  { id: "teslim", label: "Teslim" },
  { id: "sonraki", label: "Sonraki" },
];

const modules = [
  { name: "E-Ticaret altyapısı", status: "Aktif", note: "Scale çerçevesi · örnek" },
  { name: "Pazaryeri senkronu", status: "Kurulumda", note: "Trendyol / HB · örnek" },
  { name: "Tofy Ajan V2", status: "Aktif", note: "Sepet ve öneri · örnek" },
  { name: "Hosting & SSL", status: "Aktif", note: "Yenileme 2027 · örnek" },
] as const;

const accessLinks = [
  { title: "Mağaza vitrini", text: "Müşteriye açık site", href: "https://basbitir.com", external: true },
  { title: "Mağaza paneli", text: "Ürün, sipariş, stok", href: "#erisim", external: false },
  { title: "Tofy konsolu", text: "Ajan ayarları", href: "#tofy", external: false },
  { title: "Destek kaydı", text: "Talep ve yanıt", href: "#destek", external: false },
] as const;

const tofyCapabilities = [
  { title: "Ürün önerisi", note: "Kategori ve stok bağlamı · örnek" },
  { title: "Sepet yönlendirme", note: "Tek tık ekleme akışı · örnek" },
  { title: "Çapraz satış", note: "Tamamlayıcı ürün · örnek" },
  { title: "Politika güvenliği", note: "Uydurma fiyat yok · örnek" },
] as const;

const tofyStorePreview = [
  { role: "visitor" as const, text: "Bu deri cüzdanın kahverengi rengi stokta mı?" },
  { role: "tofy" as const, text: "Evet, stokta. Sepete eklemek veya benzer modellere bakmak ister misiniz?" },
] as const;

const tofyMetrics = [
  { label: "Öneri tıklama", value: "%12,4", note: "örnek · son 7 gün" },
  { label: "Sepete yönlendirme", value: "186", note: "örnek oturum" },
  { label: "Tamamlayıcı ürün", value: "34", note: "örnek ekleme" },
] as const;

const tofyRecommendedProducts = [
  { name: "Deri cüzdan", price: "1.890 ₺", tone: "wallet" },
  { name: "Minimal kartlık", price: "890 ₺", tone: "card" },
  { name: "El dikişi kemer", price: "1.450 ₺", tone: "belt" },
  { name: "Mini sırt çantası", price: "2.680 ₺", tone: "bag" },
  { name: "Anahtarlık seti", price: "420 ₺", tone: "key" },
  { name: "Pasaport kılıfı", price: "760 ₺", tone: "cover" },
] as const;

function ProductThumb({ tone }: { tone: (typeof tofyRecommendedProducts)[number]["tone"] }) {
  return (
    <span className={`cp-product-thumb is-${tone}`} aria-hidden="true">
      <svg viewBox="0 0 64 64" role="img" aria-hidden="true">
        {tone === "wallet" ? (
          <path fill="currentColor" d="M12 22h36a6 6 0 0 1 6 6v18a6 6 0 0 1-6 6H12a4 4 0 0 1-4-4V26a4 4 0 0 1 4-4zm30 10h8v8h-8a4 4 0 1 1 0-8z" />
        ) : null}
        {tone === "card" ? (
          <rect x="14" y="18" width="36" height="28" rx="5" fill="currentColor" />
        ) : null}
        {tone === "belt" ? (
          <path fill="currentColor" d="M10 30h44v8H10zm38-6 8 4-8 4z" />
        ) : null}
        {tone === "bag" ? (
          <path fill="currentColor" d="M18 24h28l4 28H14zm10-8a8 8 0 0 1 16 0v6H28z" />
        ) : null}
        {tone === "key" ? (
          <>
            <circle cx="22" cy="24" r="8" fill="currentColor" />
            <path fill="currentColor" d="M28 24h24v6H34v8h-6v-8h-6z" />
          </>
        ) : null}
        {tone === "cover" ? (
          <path fill="currentColor" d="M16 14h32a4 4 0 0 1 4 4v32a4 4 0 0 1-4 4H16a6 6 0 0 1-6-6V20a6 6 0 0 1 6-6z" />
        ) : null}
      </svg>
    </span>
  );
}

const supportSnapshot = {
  openCount: 0,
  lastTicket: {
    code: "DSP-2401",
    subject: "Pazaryeri stok eşlemesi",
    status: "Kapalı",
    updated: "örnek · 12 gün önce",
  },
  channel: "E-posta · örnek",
} as const;

const projectMilestones = [
  { label: "Teslim", value: "Tamamlandı", tone: "live" },
  { label: "Eğitim", value: "Planlandı", tone: "pending" },
  { label: "Tofy V2", value: "Aktif", tone: "live" },
] as const;

const operationChecks = [
  { label: "SSL sertifikası", status: "Geçerli", tone: "ok", note: "örnek · 2027 yenileme" },
  { label: "Gece yedeği", status: "Başarılı", tone: "ok", note: "örnek · 04:00 snapshot" },
  { label: "Alan adı DNS", status: "Senkron", tone: "ok", note: "örnek · basbitir.com" },
  { label: "SEO temel tarama", status: "İzleniyor", tone: "watch", note: "örnek · 3 uyarı" },
  { label: "Mobil performans", status: "İyi", tone: "ok", note: "örnek · 78 puan" },
  { label: "Uptime izleme", status: "Aktif", tone: "ok", note: "örnek · 30 gün" },
] as const;

const panelNotices = [
  {
    title: "Hosting yenileme takvimi",
    text: "Scale çerçevesi için örnek yenileme penceresi 2027 son çeyrekte planlanır.",
    when: "örnek · 2 gün önce",
    tone: "info",
  },
  {
    title: "Tofy V2 öneri güncellemesi",
    text: "Kategori bazlı öneri kuralları örnek vitrinde genişletildi; mağaza verisi değişmez.",
    when: "örnek · bugün",
    tone: "live",
  },
  {
    title: "Planlı bakım penceresi",
    text: "Gece yedeği sonrası kısa DNS kontrolü örnek olarak işaretlendi; müdahale yok.",
    when: "örnek · 5 gün sonra",
    tone: "watch",
  },
] as const;

const nextSteps = [
  "Tofy Ajan V2 öneri kurallarını kategori bazında netleştirin.",
  "Pazaryeri stok eşlemesini canlıya alın.",
  "Yenileme öncesi hosting ve SSL kontrol listesini tamamlayın.",
] as const;

const deliverySnapshot = {
  completedAt: "örnek · 14 gün önce",
  trainingStatus: "Planlandı",
  sessions: "2 oturum",
  attendee: "Murat Bey · operasyon",
} as const;

const deliveryNotes = [
  { label: "Yayın kontrolü", status: "Tamamlandı", tone: "ok", note: "HTTPS ve ödeme denemesi · örnek" },
  { label: "Yetkili ekip", status: "Belirlendi", tone: "ok", note: "1 kişi · örnek rol listesi" },
  { label: "Eğitim oturumu", status: "Planlandı", tone: "pending", note: "Katalog ve sipariş · örnek tarih" },
  { label: "Günlük operasyon", status: "Müşteri", tone: "ok", note: "Avcı mağaza işletmez · örnek sınır" },
] as const;

export const dynamic = "force-dynamic";

export default async function DemoPortalPage() {
  const settings = await loadSiteSettings();
  if (!settings.demoPortalEnabled) {
    return (
      <main className="demo-portal-page">
        <header className="demo-portal-header">
          <SiteBrand subtitle="DEMO PORTAL" />
          <div>
            <span>KAPALI</span>
            <HeaderCtaCluster>
              <Link href="/">Ana sayfa</Link>
            </HeaderCtaCluster>
          </div>
        </header>
        <section className="demo-portal-hero" id="demo-ozeti">
          <div>
            <span className="kicker">DEMO PORTAL</span>
            <h1>
              Örnek portal
              <br />
              <em>şu anda kapalı.</em>
            </h1>
            <p>Yönetim bu vitrini kapattı. Gerçek lisans hesabınız varsa müşteri girişini kullanın.</p>
          </div>
          <aside>
            <small>DURUM</small>
            <strong>Kapalı</strong>
            <span>örnek veri yok</span>
            {settings.customerLoginEnabled ? (
              <Link className="button button-primary" href="/musteri-girisi">
                Müşteri girişi
              </Link>
            ) : (
              <Link className="button button-primary" href="/">
                Ana sayfaya dön
              </Link>
            )}
          </aside>
        </section>
      </main>
    );
  }

  return (
    <main className="demo-portal-page cp-page">
      <a className="skip-link" href="#demo-ozeti">
        Demo özetine geç
      </a>

      <div className="cp-shell">
        <aside className="cp-sidebar" aria-label="Müşteri paneli menüsü">
          <SiteBrand href="/demo-portal" subtitle="MÜŞTERİ PANELİ" label="Demo müşteri paneli" />
          <p className="cp-sidebar-badge">ÖRNEK VERİ · salt demo</p>
          <DemoPortalNav items={navItems} />
          <div className="cp-sidebar-foot">
            <small>GÜVENLİ DEMO OTURUMU</small>
            <strong>Örnek Yazılım Müşterisi</strong>
            <Link href="/musteri-girisi">Gerçek müşteri girişi</Link>
          </div>
        </aside>

        <div className="cp-main">
          <header className="cp-topbar">
            <div className="cp-topbar-copy">
              <div className="cp-topbar-meta">
                <span className="kicker">AVCI MÜŞTERİ PANELİ V2</span>
                <span className="cp-account-chip">Murat Bey · örnek hesap</span>
              </div>
              <h1 id="demo-ozeti">
                BasBitir Atölyesi
                <em>örnek işletme görünümü</em>
              </h1>
              <p>
                Bu ekran yalnız test amaçlı örnek veriler gösterir. Gerçek müşteri, lisans, fatura, parola veya ödeme
                bilgisi içermez.
              </p>
            </div>
            <div className="cp-topbar-actions">
              <Link className="button button-ghost" href="/musteri-merkezi">
                Portal kapsamı
              </Link>
              <Link className="button button-primary" href="/musteri-girisi">
                Gerçek müşteri girişi
              </Link>
            </div>
          </header>

          <div className="cp-workspace" aria-label="Örnek site özeti">
            <div>
              <small>MAĞAZA ADRESİ</small>
              <strong>basbitir.com</strong>
              <span>örnek müşteri vitrini</span>
            </div>
            <div>
              <small>ALTYAPI</small>
              <strong>Scale</strong>
              <span>örnek paket çerçevesi</span>
            </div>
            <div>
              <small>DESTEK</small>
              <strong>Açık değil</strong>
              <span>demo · salt okunur</span>
            </div>
          </div>

          <ul className="cp-milestones" aria-label="Proje durumu">
            {projectMilestones.map((item) => (
              <li className={item.tone === "live" ? "is-live" : undefined} key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </li>
            ))}
          </ul>

          <section className="cp-stats" aria-label="Demo portal özeti" id="ozet">
            <article>
              <small>Proje</small>
              <strong>Canlı</strong>
              <span>teslim sonrası · örnek</span>
            </article>
            <article>
              <small>Lisanslar</small>
              <strong>{licenses.length}</strong>
              <span>örnek kayıt</span>
            </article>
            <article>
              <small>Tofy</small>
              <strong>V2</strong>
              <span>ajan aktif · örnek</span>
            </article>
            <article>
              <small>İşlem yetkisi</small>
              <strong>Yok</strong>
              <span>salt demo</span>
            </article>
          </section>

          <section className="cp-notices" id="bildirimler" aria-label="Panel bildirimleri">
            <div className="cp-notices-head">
              <span className="kicker">BİLDİRİMLER</span>
              <h2>Panel duyuruları</h2>
              <p>
                Yenileme, bakım ve modül notları örnek görünümdür. E-posta gönderimi veya okundu işaretleme bu demoda
                çalışmaz.
              </p>
            </div>
            <ul className="cp-notices-list">
              {panelNotices.map((item) => (
                <li className={`cp-notice is-${item.tone}`} key={item.title}>
                  <div className="cp-notice-copy">
                    <strong>{item.title}</strong>
                    <p>{item.text}</p>
                  </div>
                  <span className="cp-notice-when">{item.when}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="cp-ops-checklist" id="operasyon" aria-label="Operasyon kontrol listesi">
            <div className="cp-ops-head">
              <span className="kicker">OPERASYON</span>
              <h2>Altyapı kontrol listesi</h2>
              <p>
                SSL, yedek, DNS ve SEO durumu örnek özet görünümüdür. Gerçek tarama, müdahale veya otomatik onarım bu
                demoda çalışmaz.
              </p>
            </div>
            <ul className="cp-ops-grid">
              {operationChecks.map((item) => (
                <li className={`cp-ops-item is-${item.tone}`} key={item.label}>
                  <div className="cp-ops-copy">
                    <strong>{item.label}</strong>
                    <span>{item.note}</span>
                  </div>
                  <b className={item.tone === "watch" ? "cp-pill" : "cp-pill is-live"}>{item.status}</b>
                </li>
              ))}
            </ul>
          </section>

          <section className="cp-grid" id="altyapi">
            <article className="cp-card cp-card-wide cp-card-featured" id="tofy">
              <div className="cp-tofy-showcase">
                <div className="cp-tofy-visual">
                  <div className="cp-tofy-mark-wrap" aria-hidden="true">
                    <TofyMark className="cp-tofy-mark" />
                  </div>
                  <div className="cp-tofy-mark-copy">
                    <strong>Tofy Ajan V2</strong>
                    <span>BasBitir vitrininde · örnek modül</span>
                  </div>
                  <div className="cp-tofy-preview" aria-label="Mağazada örnek Tofy diyaloğu">
                    <small>MAĞAZADA GÖRÜNÜM</small>
                    {tofyStorePreview.map((line) => (
                      <p className={line.role === "tofy" ? "is-tofy" : undefined} key={line.text}>
                        {line.role === "tofy" ? <TofyMark className="cp-tofy-preview-mark" /> : null}
                        <span>{line.text}</span>
                      </p>
                    ))}
                  </div>
                </div>
                <div className="cp-tofy-body">
                  <div className="cp-card-head">
                    <span className="kicker">TOFY AJAN V2</span>
                    <b className="cp-pill is-live">Aktif · örnek</b>
                  </div>
                  <h2>Mağazada satış asistanı</h2>
                  <p>
                    Tofy Ajan V2, müşterinin vitrininde ürün önerir, sepete ekleme yolunu gösterir ve çapraz satış
                    önerisi üretir. Avcı’nın kendi tanıtım asistanından ayrıdır; satılan bir mağaza modülüdür.
                  </p>
                  <ul className="cp-tofy-capabilities" aria-label="Tofy modül yetenekleri">
                    {tofyCapabilities.map((item) => (
                      <li key={item.title}>
                        <strong>{item.title}</strong>
                        <span>{item.note}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="cp-metric-strip" aria-label="Tofy örnek metrikleri">
                    {tofyMetrics.map((item) => (
                      <div key={item.label}>
                        <small>{item.label}</small>
                        <strong>{item.value}</strong>
                        <span>{item.note}</span>
                      </div>
                    ))}
                  </div>
                  <div className="cp-card-actions">
                    <Link href="/yapay-zeka">AI modül kataloğu</Link>
                    <Link href="/avcai">Tofy tanıtımını aç</Link>
                  </div>
                </div>
              </div>
              <section className="cp-tofy-picks" aria-label="Tofy'nin önerdiği ürünler örnek">
                <div className="cp-tofy-picks-head">
                  <TofyMark className="cp-tofy-picks-mark" />
                  <div className="cp-tofy-picks-copy">
                    <span className="kicker">AJAN ÖNERİSİ</span>
                    <h3>Tofy&apos;nin Önerdiği Ürünler</h3>
                    <p>
                      Tofy Ajan V2, mağaza vitrininde ziyaretçiye bu ürünleri örnek bağlamda öne çıkarır. Gerçek
                      fiyat mağaza kataloğundan gelir; burada salt demo görünümüdür.
                    </p>
                  </div>
                  <b className="cp-pill is-live">Öneri aktif · örnek</b>
                </div>
                <ul className="cp-tofy-picks-grid">
                  {tofyRecommendedProducts.map((item, index) => (
                    <li className="cp-tofy-pick" key={item.name} style={{ animationDelay: `${index * 0.45}s` }}>
                      <ProductThumb tone={item.tone} />
                      <div className="cp-tofy-pick-meta">
                        <strong>{item.name}</strong>
                        <span className="cp-tofy-pick-price">{item.price}</span>
                        <small>örnek vitrin</small>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            </article>

            <article className="cp-card">
              <div className="cp-card-head">
                <span className="kicker">AKTİF MODÜLLER</span>
              </div>
              <h2>Altyapı özeti</h2>
              <ul className="cp-module-list">
                {modules.map((item) => (
                  <li key={item.name}>
                    <div>
                      <strong>{item.name}</strong>
                      <span>{item.note}</span>
                    </div>
                    <b className={item.status === "Aktif" ? "cp-pill is-live" : "cp-pill"}>{item.status}</b>
                  </li>
                ))}
              </ul>
            </article>

            <article className="cp-card" id="erisim">
              <div className="cp-card-head">
                <span className="kicker">ERİŞİMLER</span>
              </div>
              <h2>Özel geçişler</h2>
              <p className="cp-card-lead">Demo linkleridir; gerçek panel parolası burada yoktur.</p>
              <ul className="cp-access-list">
                {accessLinks.map((item) => (
                  <li key={item.title}>
                    {item.external ? (
                      <a href={item.href} rel="noopener noreferrer" target="_blank">
                        <strong>{item.title}</strong>
                        <span>{item.text}</span>
                      </a>
                    ) : (
                      <a href={item.href}>
                        <strong>{item.title}</strong>
                        <span>{item.text}</span>
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </article>

            <article className="cp-card" id="destek">
              <div className="cp-card-head">
                <span className="kicker">DESTEK ÖZETİ</span>
                <b className="cp-pill">Salt okunur · örnek</b>
              </div>
              <h2>Destek talepleri</h2>
              <p className="cp-card-lead">
                Açık talep yok. Son kapanan kayıt örnek gösterim içindir; bu demoda yeni talep açılmaz.
              </p>
              <div className="cp-support-summary" aria-label="Örnek destek özeti">
                <div>
                  <small>AÇIK TALEP</small>
                  <strong>{supportSnapshot.openCount}</strong>
                  <span>örnek sayaç</span>
                </div>
                <div>
                  <small>KANAL</small>
                  <strong>{supportSnapshot.channel}</strong>
                  <span>destek hattı · örnek</span>
                </div>
              </div>
              <ul className="cp-support-ticket" aria-label="Son örnek destek kaydı">
                <li>
                  <div>
                    <strong>{supportSnapshot.lastTicket.code}</strong>
                    <span>{supportSnapshot.lastTicket.subject}</span>
                  </div>
                  <div className="cp-support-ticket-meta">
                    <b className="cp-pill">{supportSnapshot.lastTicket.status}</b>
                    <span>{supportSnapshot.lastTicket.updated}</span>
                  </div>
                </li>
              </ul>
            </article>

            <article className="cp-card" id="teslim">
              <div className="cp-card-head">
                <span className="kicker">TESLİM VE EĞİTİM</span>
                <b className="cp-pill is-live">Teslim tamam · örnek</b>
              </div>
              <h2>Teslim ve eğitim notları</h2>
              <p className="cp-card-lead">
                Yayın kontrolü ve eğitim planı örnek özetidir. Oturum kaydı veya sertifika indirme bu demoda yoktur.
              </p>
              <div className="cp-delivery-summary" aria-label="Örnek teslim özeti">
                <div>
                  <small>CANLI TESLİM</small>
                  <strong>{deliverySnapshot.completedAt}</strong>
                  <span>yayın kontrolü · örnek</span>
                </div>
                <div>
                  <small>EĞİTİM</small>
                  <strong>{deliverySnapshot.trainingStatus}</strong>
                  <span>
                    {deliverySnapshot.sessions} · {deliverySnapshot.attendee}
                  </span>
                </div>
              </div>
              <ul className="cp-delivery-notes" aria-label="Örnek teslim ve eğitim notları">
                {deliveryNotes.map((item) => (
                  <li className={item.tone === "pending" ? "is-pending" : undefined} key={item.label}>
                    <div>
                      <strong>{item.label}</strong>
                      <span>{item.note}</span>
                    </div>
                    <b className={item.tone === "pending" ? "cp-pill" : "cp-pill is-live"}>{item.status}</b>
                  </li>
                ))}
              </ul>
              <p className="cp-card-lead">
                Tam kapsam için{" "}
                <Link href="/teslim-egitim">teslim ve eğitim sayfasına</Link> bakın; günlük sipariş ve kargo müşteri
                operasyonudur.
              </p>
            </article>

            <article className="cp-card" id="sonraki">
              <div className="cp-card-head">
                <span className="kicker">SONRAKİ ADIMLAR</span>
              </div>
              <h2>Önerilen işler</h2>
              <ol className="cp-steps">
                {nextSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <p className="cp-card-lead">Belge indirme ve canlı destek bağlantısı bu demoda yoktur.</p>
            </article>
          </section>

          <section className="demo-portal-data cp-data" id="lisanslar">
            <div className="cp-finance-summary" aria-label="Örnek finansal özet">
              <div className="cp-finance-head">
                <span className="kicker">FİNANSAL ÖZET</span>
                <h2>Lisans ve tahsil görünümü</h2>
                <p>
                  Tutarlar örnek banddır; kart çekimi, e-Fatura veya indirme bu demoda yoktur. Güncel kapsam{" "}
                  <Link href="/paketler">paket sayfasında</Link> özetlenir.
                </p>
              </div>
              <ul className="cp-finance-grid">
                {financialHighlights.map((item) => (
                  <li key={item.label}>
                    <small>{item.label}</small>
                    <strong>{item.value}</strong>
                    <span>{item.note}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <span className="kicker">LİSANS GÖRÜNÜMÜ</span>
              <h2>Örnek lisanslar</h2>
              <p className="demo-portal-note">
                Start, Scale ve Enterprise — <Link href="/paketler">paket sayfasındaki</Link> örnek bantla aynı kaynak.
              </p>
              <div className="demo-table-wrap">
                <table>
                  <caption className="visually-hidden">Demo hesaba ait örnek lisans kayıtları</caption>
                  <thead>
                    <tr>
                      <th scope="col">Ürün</th>
                      <th scope="col">Plan</th>
                      <th scope="col">Durum</th>
                      <th scope="col">Not</th>
                    </tr>
                  </thead>
                  <tbody>
                    {licenses.map((row) => (
                      <tr key={row[1]}>
                        {row.map((cell, index) =>
                          index === 0 ? (
                            <th scope="row" key={`${row[1]}-${index}`}>
                              {cell}
                            </th>
                          ) : (
                            <td key={`${row[1]}-${index}`}>{cell}</td>
                          ),
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <span className="kicker">FİNANSAL ÖZET</span>
              <h2>Örnek fatura kalemleri</h2>
              <p className="demo-portal-note">Tutarlar örnek banddır; tahsilat veya e-Fatura değildir.</p>
              <div className="demo-table-wrap">
                <table>
                  <caption className="visually-hidden">Demo hesaba ait örnek fatura kalemleri</caption>
                  <thead>
                    <tr>
                      <th scope="col">Kayıt</th>
                      <th scope="col">Kapsam</th>
                      <th scope="col">Durum</th>
                      <th scope="col">Not</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((row) => (
                      <tr key={row[0]}>
                        {row.map((cell, index) =>
                          index === 0 ? (
                            <th scope="row" key={`${row[0]}-${index}`}>
                              {cell}
                            </th>
                          ) : (
                            <td key={`${row[0]}-${index}`}>{cell}</td>
                          ),
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <aside className="demo-portal-boundary">
            <strong>Demo sınırı</strong>
            <p>
              Bu sayfa oturum açma, kayıt değiştirme, ödeme, indirme veya müşteri verisine erişim işlevi sunmaz. Paket
              adları tanıtım sitesindeki çerçeveden gelir; yönetimdeki gerçek müşteri kaydı burada görünmez. Gerçek
              portal erişimi yalnız onaylı müşteri hesabıyla yapılır.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
