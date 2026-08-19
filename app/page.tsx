import type { Metadata } from "next";
import Link from "next/link";
import { ECOSYSTEM_LAYERS } from "./ecosystem-options";
import { HeroStage } from "./hero-stage";
import { LiveStrip } from "./live-strip";
import { getPackageName, type PackageId } from "./package-options";
import { OfferForm } from "./offer-form";
import { FEATURE_ICONS, StartIcon, STEP_ICONS } from "./start-icons";
import { StartPromo } from "./start-promo";
import { StoryBand } from "./story-band";
import { SITE_OPEN_GRAPH } from "./site-social-metadata";
import { HeaderCtaCluster } from "./header-cta-cluster";
import { SiteBrand } from "./site-brand";
import { SiteFooter } from "./site-footer";
import { loadSiteSettings } from "./site-settings.mjs";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  openGraph: { ...SITE_OPEN_GRAPH, url: "/" },
  alternates: {
    canonical: "/",
    languages: { "tr-TR": "/", en: "/en", "x-default": "/" },
  },
};

const products = [
  {
    number: "01",
    href: "/eticaret-altyapisi",
    title: "E-Ticaret Altyapısı",
    text: "Ürün, sipariş, kampanya, ödeme ve kargo operasyonlarını tek merkezden yönetin.",
    tags: ["B2C", "Mobil uyum", "Pazaryeri"],
  },
  {
    number: "02",
    href: "/b2b-c2c",
    title: "B2B & Bayi Sistemi",
    text: "Firmaya, bayiye ve müşteri grubuna özel fiyatlarla güçlü bir dijital satış ağı kurun.",
    tags: ["Bayi fiyatı", "Teklif", "Tahsilat"],
  },
  {
    number: "03",
    href: "/b2b-c2c",
    title: "C2C Pazaryeri",
    text: "Satıcı başvurularından komisyonlara kadar çok satıcılı platformunuzu yönetin.",
    tags: ["Satıcı paneli", "Komisyon", "Hakediş"],
  },
  {
    number: "04",
    href: "/e-ihracat",
    title: "E-İhracat",
    text: "Çoklu dil, para birimi ve ülke bazlı fiyatlandırma ile sınırların ötesine satış yapın.",
    tags: ["Çoklu dil", "Kur", "Global SEO"],
  },
  {
    number: "05",
    href: "/mobil-sektorel#mobil",
    title: "Mobil Uygulama",
    text: "Müşteri ve ekip görevlerini doğru cihaz deneyimi ve güvenli veri akışlarıyla destekleyin.",
    tags: ["PWA / mağaza", "Bildirim", "API"],
  },
  {
    number: "06",
    href: "/mobil-sektorel#sektorel",
    title: "Sektörel Yazılım",
    text: "İşletmenize özgü kayıt, rol, onay ve operasyon adımlarını tek akışta planlayın.",
    tags: ["Özel akış", "Yetki", "Rapor"],
  },
];

const productIcons = ["store", "layers", "target", "plane", "phone", "gear"] as const;

const aiTools = [
  "Ürün açıklaması ve SEO metni",
  "Akıllı satış ve destek asistanı",
  "Görsel iyileştirme ve arka plan",
  "Talep, stok ve satış tahmini",
  "Kampanya ve müşteri segmentasyonu",
  "Doğal dille yönetim raporları",
];

const integrations = [
  "TRENDYOL",
  "HEPSİBURADA",
  "N11",
  "İYZİCO",
  "PAYTR",
  "PARAŞÜT",
  "YURTİÇİ",
  "ARAS",
];

const solutionRail = [
  { index: "01", title: "E-Ticaret Altyapısı", note: "Mağaza ve operasyon", href: "/eticaret-altyapisi" },
  { index: "02", title: "B2B & Bayi", note: "Kurumsal satış ağı", href: "/b2b-c2c" },
  { index: "03", title: "Entegrasyonlar", note: "Kanal ve servisler", href: "/entegrasyonlar" },
  { index: "04", title: "Özel Modül", note: "Pakete ek yazılım", href: "/ozel-yazilim" },
  { index: "05", title: "Güvenlik", note: "Erişim, yedek, KVKK", href: "/guvenlik" },
];

const technologyEcosystem = [
  { mark: "G", name: "Google", note: "Arama, ölçüm ve görünürlük" },
  { mark: "YA", name: "Yandex", note: "Arama ve harita kanalları" },
  { mark: "ADS", name: "Google Ads", note: "Performans reklamları" },
  { mark: "M", name: "Meta", note: "Facebook ve Instagram" },
  { mark: "H", name: "Hostinger", note: "Barındırma seçenekleri" },
  { mark: "CF", name: "Cloudflare", note: "DNS, güvenlik ve performans" },
  { mark: "P", name: "PayTR", note: "Ödeme sağlayıcısı bağlantısı" },
  { mark: "İ", name: "iyzico", note: "Ödeme sağlayıcısı bağlantısı" },
];

const platformFeatures = [
  {
    number: "01",
    title: "Mağaza ve katalog yönetimi",
    text: "Ürün, varyant, kategori, fiyat, kampanya ve içerik akışını web ve mobil satış kanalları için yönetin.",
    metric: "Ortak katalog",
  },
  {
    number: "02",
    title: "Sipariş, ödeme ve teslimat",
    text: "Siparişten tahsilata, kargodan iade sürecine kadar günlük ticaret operasyonunu aynı akışta izleyin.",
    metric: "Uçtan uca sipariş",
  },
  {
    number: "03",
    title: "Müşteri ve satış kanalları",
    text: "B2C, B2B, C2C, pazaryeri ve e-ihracat modellerini müşteri rolleri ve kanal kurallarıyla birlikte yönetin.",
    metric: "Çok kanallı satış",
  },
  {
    number: "04",
    title: "Modüler operasyon merkezi",
    text: "Entegrasyon, lisans, destek, audit ve isteğe bağlı AI modüllerini mağaza ihtiyacına göre etkinleştirin.",
    metric: "İhtiyaca göre modül",
  },
];

const startSteps = [
  {
    number: "1",
    title: "Paketleri inceleyin",
    text: "İhtiyacınız kadar başlayın. Lisans, kurulum ve ek modüller ayrı yazılır.",
    href: "/paketler",
  },
  {
    number: "2",
    title: "Mağazanızı kuralım",
    text: "Katalog, ödeme ve kargo bağlantılarını kontrollü biçimde yayına hazırlarız.",
    href: "/hizmetler",
  },
  {
    number: "3",
    title: "Kanalları bağlayın",
    text: "Pazaryeri ve operasyon bağlantısı, sağlayıcı doğrulandıktan sonra açılır.",
    href: "/entegrasyonlar",
  },
];

const startFeatures = [
  ["KATALOG", "Ortak katalog", "Ürün, varyant, fiyat ve görseli web ile kanallar için tek yerden yönetin."],
  ["GEÇİŞ", "Kurulum eşliği", "Geçiş ve yayını tek başına bırakmayız; kontrol listesiyle ilerleriz."],
  ["DENEYİM", "Mobil vitrin", "Mağaza ekranları dar cihazda da aynı omurga ile çalışacak biçimde kurulur."],
  ["GÖRÜNÜRLÜK", "SEO zemini", "Sayfa yapısı arama için hazırlanır. İleri içerik işi ayrı katmandır."],
  ["YAYIN", "Güvenli yayın", "Canlıya çıkışta TLS bağlantısı ve yetki sınırları planın parçasıdır."],
  ["OPERASYON", "Ödeme ve kargo", "POS ve kargo kapsamı, hesabınız ve sağlayıcı koşulları doğrulanınca netleşir."],
  ["GLOBAL", "E-ihracat", "Dil, kur ve ülke kuralını aynı panelden yönetecek modeli kurarız."],
  ["ENTEGRASYON", "Özel bağlantı", "Hazır listede yoksa özel entegrasyon teklifte ayrı kalem olarak yazılır."],
];

const advantages = [
  {
    number: "01",
    title: "Şeffaf paketleme",
    text: "İhtiyacınız olmayan modülle başlamazsınız. Lisans, kurulum ve entegrasyon ayrı ve net yazılır.",
  },
  {
    number: "02",
    title: "Kontrollü geçiş",
    text: "Veri, ödeme ve kargo bağlantıları kontrol listesiyle yayına alınır. Geçiş tek başına sizin işiniz değildir.",
  },
  {
    number: "03",
    title: "Tek operasyon merkezi",
    text: "Web, pazaryeri ve sipariş aynı omurgada yürür. Ekip tek yerden bakar, kanal kopukluğu azalır.",
  },
];

const journey = [
  ["01", "İhtiyacı birlikte netleştiririz", "İş modelinizi, satış kanallarınızı ve operasyon akışınızı çıkarırız."],
  ["02", "Doğru modülleri kurgularız", "Hazır altyapıyı ihtiyacınıza göre paketler, gerekli özel bağlantıları planlarız."],
  ["03", "Kurup güvenle devreye alırız", "Veri, ödeme, kargo ve pazaryeri bağlantılarını kontrollü biçimde yayına hazırlarız."],
  ["04", "Birlikte büyütürüz", "Performans, destek ve yeni modüllerle altyapınızı işinizle birlikte geliştiririz."],
];

function buildStructuredData(contact: { email: string; telephone: string }) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://avcieticaret.com/#organization",
        name: "Avcı E-Ticaret",
        url: "https://avcieticaret.com",
        email: contact.email,
        telephone: contact.telephone,
        sameAs: ["https://hatay360.com", "https://adana360.com", "https://seoeksper.com"],
      },
      {
        "@type": "WebSite",
        "@id": "https://avcieticaret.com/#website",
        url: "https://avcieticaret.com",
        name: "Avcı E-Ticaret",
        inLanguage: "tr-TR",
        publisher: { "@id": "https://avcieticaret.com/#organization" },
      },
      {
        "@type": "SoftwareApplication",
        name: "Avcı Commerce OS",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description: "Web mağazası, mobil uygulama, katalog, sipariş, ödeme, B2B, C2C ve e-ihracat yönetimi sunan modüler e-ticaret platformu.",
        provider: { "@id": "https://avcieticaret.com/#organization" },
      },
    ],
  };
}

const packages = [
  {
    id: "start" satisfies PackageId,
    eyebrow: "Hızlı başlangıç",
    text: "Dijital satışa sağlam ve sade bir altyapıyla başlamak isteyen işletmeler için.",
    features: ["E-ticaret yönetimi", "Ödeme ve kargo", "Temel raporlama"],
  },
  {
    id: "scale" satisfies PackageId,
    eyebrow: "Büyüme odağı",
    text: "Pazaryerlerinde büyüyen ve süreçlerini otomatikleştirmek isteyen markalar için.",
    features: ["Gelişmiş entegrasyonlar", "B2B satış araçları", "Operasyon otomasyonları"],
    featured: true,
  },
  {
    id: "enterprise" satisfies PackageId,
    eyebrow: "Kuruma özel",
    text: "Özel süreçleri, yüksek hacmi ve çoklu operasyonu olan şirketler için.",
    features: ["Özel modül geliştirme", "Kurumsal entegrasyon", "Öncelikli destek"],
  },
];

export default async function Home() {
  const settings = await loadSiteSettings();

  return (
    <main id="top">
      <a className="skip-link" href="#ana-icerik">Ana içeriğe geç</a>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildStructuredData({
            email: settings.contactEmail,
            telephone: settings.contactPhoneHref,
          })),
        }}
      />
      <header className="site-header">
        <SiteBrand href="#top" anchor />
        <nav aria-label="Ana menü">
          <Link href="/eticaret-altyapisi">E-Ticaret</Link>
          <Link href="/yazilimlar">Yazılımlar</Link>
          <Link href="/yapay-zeka">Yapay Zekâ</Link>
          <Link href="/entegrasyonlar">Entegrasyonlar</Link>
          <Link href="/paketler">Paketler</Link>
          <Link href="/guvenlik">Güvenlik</Link>
          <Link href="/hizmetler">Hizmetler</Link>
        </nav>
        <details className="mobile-nav">
          <summary aria-label="Menüyü aç"><span /><span /></summary>
          <nav aria-label="Mobil menü">
            <Link href="/eticaret-altyapisi">E-Ticaret</Link>
            <Link href="/yazilimlar">Yazılımlar</Link>
            <Link href="/yapay-zeka">Yapay Zekâ</Link>
            <Link href="/entegrasyonlar">Entegrasyonlar</Link>
            <Link href="/paketler">Paketler</Link>
            <Link href="/ozel-yazilim">Özel Modül</Link>
            <Link href="/guvenlik">Güvenlik</Link>
            <Link href="/cozum-senaryolari">Çözüm Senaryoları</Link>
            <Link href="/hizmetler">Hizmetler</Link>
            <a href="#surec">Çalışma modeli</a>
            {settings.customerLoginEnabled && <Link href="/musteri-girisi">Müşteri girişi</Link>}
            <Link href="/kaynaklar">Kaynaklar ve SSS</Link>
            <Link href="/en" hrefLang="en">English</Link>
            <a className="mobile-nav-cta" href="#iletisim">Demo isteyin</a>
          </nav>
        </details>
        <div className="header-actions"><Link className="language-link" href="/en" hrefLang="en">EN</Link>{settings.customerLoginEnabled && <Link className="customer-login-link" href="/musteri-girisi">Müşteri girişi</Link>}<HeaderCtaCluster><a className="header-cta" href="#iletisim">Demo iste</a></HeaderCtaCluster></div>
      </header>

      <section className="hero" id="ana-icerik">
        <div className="hero-grid" aria-hidden="true" />
        <div className="orb orb-one" aria-hidden="true" />
        <div className="orb orb-two" aria-hidden="true" />

        <HeroStage
          ctaPrimary={settings.heroCtaPrimary}
          ctaSecondary={settings.heroCtaSecondary}
          contactEmail={settings.contactEmail}
        />

        <a className="scroll-cue" href="#urunler" aria-label="Ürünlere ilerle"><span>Kaydır</span></a>
      </section>

      {settings.showLiveStrip ? <LiveStrip /> : null}

      <section className="solution-rail" aria-labelledby="solution-rail-title">
        <div className="solution-rail-intro">
          <span>ÇÖZÜM HARİTASI</span>
          <strong id="solution-rail-title">İhtiyacınız olan katmana doğrudan ilerleyin.</strong>
        </div>
        <nav aria-label="Öne çıkan çözümler">
          {solutionRail.map((item) => (
            <Link href={item.href} key={item.index}>
              <small>{item.index}</small>
              <span><strong>{item.title}</strong><em>{item.note}</em></span>
              <b aria-hidden="true" />
            </Link>
          ))}
        </nav>
      </section>

      <section className="start-path" id="basla" aria-labelledby="basla-baslik">
        <div className="visually-hidden" id="basla-baslik">Mağazaya giden üç adım</div>
        <div className="start-steps">
          {startSteps.map((step, index) => (
            <article key={step.number} className={`start-step reveal reveal-${["one", "two", "three"][index]}`}>
              <div className="start-step-mark" aria-hidden="true">
                <strong>{step.number}</strong>
                <span className={`start-step-orb start-step-orb-${step.number}`}>
                  <StartIcon name={STEP_ICONS[index]} />
                </span>
              </div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
              <Link href={step.href}>İnceleyin</Link>
            </article>
          ))}
        </div>

        <StartPromo />

        <div className="start-features-heading">
          <div>
            <span className="kicker">TEK OMURGA, NET KAPSAM</span>
            <h2>Mağazanızın temel çalışma sistemi.</h2>
          </div>
          <p>Katalogdan yayına, ödeme akışından özel bağlantılara kadar her katman aynı planın içinde görünür kalır.</p>
        </div>
        <div className="start-features">
          {startFeatures.map(([label, title, text], index) => (
            <article key={title} className="start-feature">
              <div className="start-feature-top">
                <span className={`start-feature-icon start-feature-icon-${index + 1}`} aria-hidden="true">
                  <StartIcon name={FEATURE_ICONS[index]} />
                </span>
                <span className="start-feature-number">0{index + 1}</span>
              </div>
              <div className="start-feature-copy">
                <small>{label}</small>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
              <span className="start-feature-line" aria-hidden="true" />
            </article>
          ))}
        </div>
      </section>

      <StoryBand />

      <section className="edge-section" id="avantajlar" aria-labelledby="avantaj-baslik">
        <div className="section-heading">
          <div>
            <span className="kicker">NEDEN AVCI</span>
            <h2 id="avantaj-baslik">Beklenmedik sürpriz yok.<br />Kapsam baştan net.</h2>
          </div>
          <p>Ücretsiz vaat yığını yerine: ne kurulacağı, neyin ayrı teklif olduğu ve geçişin nasıl kontrol edileceği açık yazılır.</p>
        </div>
        <div className="edge-grid">
          {advantages.map((item) => (
            <article key={item.number}>
              <span>{item.number}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="platform-section" id="platform">
        <div className="platform-intro">
          <span className="kicker kicker-light">AVCI PLATFORM</span>
          <h2>Yazılımlarınızın arkasındaki<br /><em>ortak işletim merkezi.</em></h2>
          <p>
            Web mağazası, mobil uygulama, katalog, sipariş, ödeme, müşteri ve satış
            kanallarını; entegrasyon ve operasyon araçlarıyla aynı modüler omurgada birleştirin.
          </p>
          <Link className="platform-link" href="/platform">
            Platformu keşfedin
          </Link>
        </div>
        <div className="platform-grid">
          {platformFeatures.map((feature) => (
            <article className="platform-card" key={feature.number}>
              <div className="platform-card-top">
                <span>{feature.number}</span>
                <i aria-hidden="true" />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
              <small>{feature.metric}</small>
            </article>
          ))}
        </div>
      </section>

      {settings.showTrustStrip ? <section className="home-ecosystem" id="referanslar" aria-labelledby="ecosystem-title">
        <header className="ecosystem-heading">
          <div>
            <span className="kicker">BAĞLANTI EKOSİSTEMİ</span>
            <h2 id="ecosystem-title">Markalarımız ayrı.<br />Teknoloji ağımız geniş.</h2>
          </div>
          <p>Avcı ürün ailesini; arama, reklam, barındırma, güvenlik ve ödeme kanallarıyla ihtiyaca göre aynı proje planında buluşturuyoruz.</p>
        </header>
        <div className="ecosystem-brand-network" aria-label="Avcı marka ağı">
          <span>AVCI MARKA AĞI</span>
          <div>
            <a href="https://hatay360.com" target="_blank" rel="noopener noreferrer"><strong>HATAY<span>360</span></strong><small>Yerel dijital ağ</small></a>
            <a href="https://adana360.com" target="_blank" rel="noopener noreferrer"><strong>ADANA<span>360</span></strong><small>Özel geliştirme</small></a>
            <a href="https://seoeksper.com" target="_blank" rel="noopener noreferrer"><strong>SEO<span>EKSPER</span></strong><small>İçerik ve görünürlük</small></a>
            <div><strong>AVCI<span>LABS</span></strong><small>Ürün ve Ar-Ge</small></div>
          </div>
        </div>
        <div className="ecosystem-platforms">
          <div className="ecosystem-platforms-head">
            <span>TEKNOLOJİ VE KANALLAR</span>
            <small>Proje kapsamına göre seçilir ve doğrulanır</small>
          </div>
          <div className="ecosystem-platform-grid">
            {technologyEcosystem.map((item) => (
              <article key={item.name}>
                <span aria-hidden="true">{item.mark}</span>
                <div><strong>{item.name}</strong><small>{item.note}</small></div>
                <i aria-hidden="true" />
              </article>
            ))}
          </div>
        </div>
        <p className="ecosystem-disclaimer">Gösterilen markalar, desteklenebilen teknoloji ve kanal örnekleridir. Resmî iş ortaklığı, hazır entegrasyon veya ticari onay anlamına gelmez; kapsam sağlayıcı ve hesap koşulları doğrulandıktan sonra belirlenir.</p>
      </section> : null}

      <section className="section products-section" id="urunler">
        <div className="section-heading">
          <div><span className="kicker">YAZILIM AİLESİ</span><h2>Her büyüme aşamasına<br />uygun bir altyapı.</h2></div>
          <p>Hazır kalıplara sıkışmadan, işletmenizin bugününe ve yarınına uyum sağlayan modüler yazılım çözümleri.</p>
        </div>
        <div className="product-grid">
          {products.map((product, index) => (
            <article className="product-card" key={product.number}>
              <span className="product-number">{product.number}</span>
              <span className="product-icon" aria-hidden="true"><StartIcon name={productIcons[index]} /></span>
              <h3>{product.title}</h3>
              <p>{product.text}</p>
              <div className="tag-row">{product.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
              <Link href={product.href}>Detayları inceleyin</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="ai-section" id="yapay-zeka">
        <div className="ai-visual" aria-hidden="true">
          <div className="ai-console">
            <div className="ai-console-bar"><span>TOFY / OPERASYON KATMANI</span><i /><i /><i /></div>
            <div className="ai-console-stage">
              <div className="ai-orbit orbit-a"><i /></div>
              <div className="ai-orbit orbit-b"><i /></div>
              <div className="ai-core"><small>TOFY</small><strong>AVCI<br />E-TİCARET</strong><span>AKTİF MODÜL</span></div>
              <div className="ai-node node-one"><small>01</small><strong>İÇERİK</strong><span>Ürün & SEO</span></div>
              <div className="ai-node node-two"><small>02</small><strong>SATIŞ</strong><span>Öneri akışı</span></div>
              <div className="ai-node node-three"><small>03</small><strong>DESTEK</strong><span>Akıllı yanıt</span></div>
              <div className="ai-node node-four"><small>04</small><strong>RAPOR</strong><span>Doğal dil</span></div>
              <div className="ai-signal signal-one" /><div className="ai-signal signal-two" />
            </div>
            <div className="ai-console-footer"><span><i /> İhtiyaca göre etkin</span><small>Mağaza çekirdeğine bağlı çalışır</small></div>
          </div>
        </div>
        <div className="ai-content">
          <span className="kicker kicker-light">YAPAY ZEKÂ KATMANI</span>
          <h2>Ekibinizin hızını<br /><em>katlayan</em> akıllı araçlar.</h2>
          <p>AI, ana ürünün yerine geçmez. Mağazanızın katalog, satış, destek ve raporlama akışlarında ihtiyaç duyduğunuz yerde etkinleştirilen modüler bir eklenti katmanıdır.</p>
          <div className="ai-list">
            {aiTools.map((tool) => <div key={tool}>{tool}</div>)}
          </div>
          <Link className="button button-light" href="/yapay-zeka">AI modüllerini keşfedin</Link>
        </div>
      </section>

      <section className="integration-section" id="entegrasyonlar">
        <span className="kicker">BAĞLANTI KURAN ALTYAPI</span>
        <h2>Bağlantı kapsamınızı<br />birlikte doğrulayın.</h2>
        <div className="marquee" aria-label="Örnek entegrasyon sağlayıcıları">
          <div className="marquee-track">
            {[...integrations, ...integrations].map((name, index) => <span key={`${name}-${index}`}>{name}</span>)}
          </div>
        </div>
        <p className="integration-note">Örnek sağlayıcılar gösterilir. Hazır bağlantı kapsamı; sağlayıcının güncel API’si, hesap türü, sürümü ve ticari koşulları doğrulandıktan sonra belirlenir.</p>
      </section>

      <section className="section package-section" id="paketler">
        <div className="section-heading">
          <div><span className="kicker">ESNEK PAKETLER</span><h2>İhtiyacınız kadar başlayın.<br />Büyüdükçe geliştirin.</h2></div>
          <p>Mağaza altyapısı, kurulum hizmeti, entegrasyonlar ve isteğe bağlı AI modülleri ayrı ve şeffaf biçimde planlanır.</p>
        </div>
        <div className="package-grid">
          {packages.map((item, index) => (
            <article
              className={`package-card${item.featured ? " featured" : ""}`}
              data-package-index={index}
              key={item.id}
            >
              <span className="package-card-glow" aria-hidden="true" />
              <span className="package-card-shine" aria-hidden="true" />
              {item.featured && <span className="popular">BÜYÜME İÇİN</span>}
              <div className="package-card-top">
                <small>{item.eyebrow}</small>
                <span className="package-index" aria-hidden="true">0{index + 1}</span>
              </div>
              <h3>{getPackageName(item.id)}</h3>
              <p>{item.text}</p>
              <ul>
                {item.features.map((feature) => (
                  <li key={feature}>
                    <span className="package-check" aria-hidden="true">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href={`/teklif?cozum=eticaret&paket=${item.id}`}>
                Teklif alın
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="ecosystem-bridge" aria-labelledby="ekosistem-baslik">
        <div className="ecosystem-bridge-heading"><span className="kicker">BİRBİRİNİ TAMAMLAYAN ÇÖZÜM KATMANLARI</span><h2 id="ekosistem-baslik">Ticaret çekirdeği önce.<br /><em>Doğru uzmanlık gerektiğinde.</em></h2><p>AVC E-Ticaret ana ürün olarak kalır. Özel geliştirme veya görünürlük ihtiyacı oluştuğunda, teklif kapsamında doğru uzmanlık katmanını ayrıca netleştiririz.</p></div>
        <div className="ecosystem-layer-grid">
          {ECOSYSTEM_LAYERS.map((layer, index) => <article key={layer.id}><span>0{index + 1}</span><small>{layer.label}</small><h3>{layer.name}</h3><p>{layer.focus}</p>{layer.href ? <a href={layer.href} target="_blank" rel="noopener noreferrer">Marka yaklaşımını inceleyin</a> : <Link href="/eticaret-altyapisi">Ticaret çekirdeğini inceleyin</Link>}</article>)}
        </div>
        <p className="ecosystem-disclaimer">Bu katmanlar ortak API, ortak giriş veya otomatik veri paylaşımı anlamına gelmez. Her işin sorumluluğu, teslimi ve teknik sınırı teklifte ayrı yazılır.</p>
      </section>

      <section className="section journey-section" id="surec">
        <div className="section-heading">
          <div><span className="kicker">BİRLİKTE ÇALIŞMA MODELİ</span><h2>Fikirden çalışan sisteme,<br />net ve kontrollü ilerleyin.</h2></div>
          <p>Hazır paket dayatmak yerine işinize uyan altyapıyı kurar, ölçer ve ihtiyaç oldukça geliştiririz.</p>
        </div>
        <div className="journey-list">
          {journey.map(([number, title, text]) => (
            <article className="journey-item" key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="close-band" id="altyapi" aria-labelledby="altyapi-baslik">
        <span className="kicker">AVCI E-TİCARET</span>
        <h2 id="altyapi-baslik">
          Büyüyen mağazaların
          <em> e-ticaret altyapısı.</em>
        </h2>
        <p>
          Tek ekip, tek omurga. Demo isteyin; doğru ürün ve kurulum kapsamını birlikte çıkaralım.
        </p>
        <div className="close-band-actions">
          <a className="button button-primary" href="#iletisim">Demo isteyin</a>
          <Link className="button button-ghost" href="/eticaret-altyapisi">Altyapıyı inceleyin</Link>
        </div>
      </section>

      <section className="cta-section" id="iletisim">
        <div className="cta-noise" aria-hidden="true" />
        <div className="cta-copy">
          <span className="kicker kicker-light">PROJENİZİ KONUŞALIM</span>
          <h2>İşletmeniz için doğru<br />dijital altyapıyı birlikte kuralım.</h2>
          <p>İhtiyacınızı birkaç cümleyle anlatın. Ekibimiz doğru ürün, lisans modeli ve uygulama planıyla size dönüş yapsın. Uydurma 7/24 vaadi yok; kapsam netleşince hareket ederiz.</p>
          <div className="contact-process" aria-label="Teklif süreci">
            <div><span>01</span><p><strong>İhtiyaç</strong><small>İş modelinizi ve kanallarınızı dinleriz.</small></p></div>
            <div><span>02</span><p><strong>Kapsam</strong><small>Gerekli ürün ve bağlantıları netleştiririz.</small></p></div>
            <div><span>03</span><p><strong>Teklif</strong><small>Lisans, kurulum ve ek işleri ayrı yazarız.</small></p></div>
          </div>
          <div className="contact-direct">
            <a href={`tel:${settings.contactPhoneHref}`}><small>Telefon</small><strong>{settings.contactPhone}</strong><span>Aramak için dokunun</span></a>
            <a href={`mailto:${settings.contactEmail}`}><small>E-posta</small><strong>{settings.contactEmail}</strong><span>Talebinizi yazın</span></a>
          </div>
        </div>
        <div className="cta-form-shell">
          <div className="cta-form-heading"><span>PROJE BİLGİLERİ</span><small>Alanları doldurun, talebiniz doğru ekibe ulaşsın.</small></div>
          <OfferForm />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
