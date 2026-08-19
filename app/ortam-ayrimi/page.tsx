import type { Metadata } from "next";
import Link from "next/link";
import { HeaderCtaCluster } from "../header-cta-cluster";
import { SiteBrand } from "../site-brand";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Canlı ve Test Ortamı Ayrımı | Avcı E-Ticaret",
  description:
    "Müşteri mağazasında canlı ile deneme ortamı nasıl ayrılır. Canlı anahtar testte kullanılmaz. Avcı sizin yerinize kopya mağaza işletmez.",
  alternates: { canonical: "/ortam-ayrimi" },
};

const layers = [
  {
    number: "01",
    title: "İki kapı",
    text: "Canlı satış başka, deneme başka. Test siparişi gerçek kargoyu ve gerçek tahsilatı tetiklemez. Karışırsa müşteri mağdur olur; Avcı bunu ‘küçük detay’ saymaz.",
  },
  {
    number: "02",
    title: "Anahtar ayrı",
    text: "Ödeme, pazaryeri ve API sırları ortama göredir. Canlı anahtar test sitesine, test anahtarı canlıya konmaz. API güvenliği sayfasındaki kural buraya da uygulanır.",
  },
  {
    number: "03",
    title: "Veri kopyası",
    text: "Canlı müşteri listesini teste doldurmak KVKK riskidir. Gerekirse anonim veya sınırlı örnek. Yazılmayan ‘üretim kopyası’ varsayılmaz.",
  },
  {
    number: "04",
    title: "Yayına alma",
    text: "Testten canlıya geçiş kontrol listesi teklifte yazılır. DNS yanlışlıkla teste bakmasın. Avcı sizin onayınız olmadan canlıya itmez.",
  },
];

const bounds = {
  included: [
    "Kararlaştırılan test adresi veya alt ortam",
    "Canlı / test anahtar ayrımı notu",
    "Yayına alma kontrol maddeleri",
    "Test siparişinin gerçek tahsilatı tetiklememesi",
  ],
  separate: [
    "Sürekli birebir üretim kopyası (yazılmadıysa yoktur)",
    "Her geliştirici için ayrı sunucu",
    "Avcı’nın sizin CI/CD’nizi işletmesi",
    "Test ortamında gerçek müşteri e-postası basmak",
  ],
};

export default function EnvironmentSplitPage() {
  return (
    <main className="catalog-page">
      <a className="skip-link" href="#ortam-katman">Ortam katmanına geç</a>
      <header className="catalog-header">
        <SiteBrand />
        <nav aria-label="Sayfa menüsü">
          <Link href="/guvenlik">Güvenlik</Link>
          <Link href="/api-guvenlik">API Güvenliği</Link>
          <Link className="active" href="/ortam-ayrimi">Ortam Ayrımı</Link>
          <Link href="/eposta-teslim">E-posta</Link>
          <Link href="/proje-sureci">Proje Süreci</Link>
        </nav>
        <HeaderCtaCluster>
          <Link className="header-cta" href="/teklif?cozum=eticaret">Ortam kapsamı isteyin</Link>
        </HeaderCtaCluster>
      </header>

      <section className="catalog-hero">
        <div>
          <span className="kicker kicker-light">MÜŞTERİ SORUSU</span>
          <h1>
            Test canlıyı bozar mı?
            <br />
            <em>Anahtar karışır mı?</em>
          </h1>
        </div>
        <p>
          Yazılım müşterisi bunu sormadan yayın yapmamalı. Avcı mağaza işletmez; canlı ve deneme
          kapıları teklifte ayrılır.
        </p>
      </section>

      <section className="solution-list" id="ortam-katman">
        {layers.map((layer) => (
          <article className="solution-detail" id={`ortam-${layer.number}`} key={layer.number}>
            <div className="solution-title">
              <span>{layer.number}</span>
              <div>
                <h2>{layer.title}</h2>
                <p>{layer.text}</p>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="package-scope-section" aria-labelledby="ortam-sinir">
        <div className="section-heading">
          <div>
            <span className="kicker">KAPSAM SINIRI</span>
            <h2 id="ortam-sinir">
              Kapı yazılır.
              <br />
              Sır karışmaz.
            </h2>
          </div>
          <p>Test adresi ve anahtar ayrımı yazılmadan ‘güvenli deneme’ denmez.</p>
        </div>
        <div className="package-scope-grid">
          <article>
            <small>TEKLİFTE YAZILIRSA DAHİL</small>
            <ul>
              {bounds.included.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article>
            <small>AYRI KALIR</small>
            <ul>
              {bounds.separate.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="decision-cta">
        <span className="kicker">SONRAKİ ADIM</span>
        <h2>İlk yayında test var mı?</h2>
        <p>Yoksa canlıya doğrudan basılır; risk sizde kalır. Varsa kapı ve anahtar ayrı yazılır.</p>
        <div>
          <Link className="button button-primary" href="/teklif?cozum=eticaret">
            Ortam görüşmesi
          </Link>
          <Link className="button button-ghost" href="/api-guvenlik">
            API güvenliği
          </Link>
        </div>
      </section>
    </main>
  );
}
