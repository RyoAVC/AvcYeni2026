import type { Metadata } from "next";
import Link from "next/link";
import { HeaderCtaCluster } from "../header-cta-cluster";
import { SiteBrand } from "../site-brand";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mağaza E-postası ve Teslim Güvenliği | Avcı E-Ticaret",
  description:
    "Sipariş ve şifre sıfırlama e-postası kimin alan adından gider, SPF/DKIM kimin işi. Avcı izinsiz pazarlama bombardımanı yapmaz.",
  alternates: { canonical: "/eposta-teslim" },
};

const layers = [
  {
    number: "01",
    title: "Kimden görünür",
    text: "Sipariş onayı ve kargo bilgisi sizin alan adınızdan gitmeliyse DNS (SPF, DKIM, varsa DMARC) teklifte yazılır. Avcı’nın kendi kutusundan giden örnek, sizin markanız değildir.",
  },
  {
    number: "02",
    title: "Ne gider",
    text: "İşlemsel posta: sipariş, kargo, şifre sıfırlama. Kampanya ve bülten ayrı izin ve ayrı kalemdir. Tofy sohbeti müşteriye toplu e-posta atmaz.",
  },
  {
    number: "03",
    title: "İçinde sır olmaz",
    text: "E-postaya ham parola, tam kart, API anahtarı konmaz. Sıfırlama bağlantısı süresi sınırlıdır. Destek ve olay bildirimi sayfalarındaki yasak burada da geçerlidir.",
  },
  {
    number: "04",
    title: "Spam kutusu",
    text: "Teslim oranı sağlayıcıya, DNS’e ve alıcı politikasına bağlıdır. ‘Inbox garantisi’ uydurulmaz. Alan adı ısındırma yazılırsa ayrı iştir.",
  },
];

const bounds = {
  included: [
    "Kararlaştırılan işlemsel şablonlar",
    "Sizin alan adınızdan gönderim için DNS maddesi",
    "Şifre sıfırlama bağlantısının süre sınırı",
    "Bültenin işlemselden ayrı tutulması",
  ],
  separate: [
    "Reklam bülteni, SMS ve WhatsApp kotası",
    "Alıcı sağlayıcının spam kararı",
    "Avcı’nın sizin adınıza izinsiz kampanya basması",
    "Kesin gelen kutusu oranı",
  ],
};

export default function StoreEmailPage() {
  return (
    <main className="catalog-page">
      <a className="skip-link" href="#eposta-katman">E-posta katmanına geç</a>
      <header className="catalog-header">
        <SiteBrand />
        <nav aria-label="Sayfa menüsü">
          <Link href="/guvenlik">Güvenlik</Link>
          <Link href="/alan-adi-hosting">Alan Adı</Link>
          <Link className="active" href="/eposta-teslim">E-posta</Link>
          <Link href="/ortam-ayrimi">Ortam Ayrımı</Link>
          <Link href="/olay-bildirim">Olay</Link>
        </nav>
        <HeaderCtaCluster>
          <Link className="header-cta" href="/teklif?cozum=hosting">E-posta kapsamı isteyin</Link>
        </HeaderCtaCluster>
      </header>

      <section className="catalog-hero">
        <div>
          <span className="kicker kicker-light">MÜŞTERİ SORUSU</span>
          <h1>
            Sipariş maili
            <br />
            <em>kimin adından gider?</em>
          </h1>
        </div>
        <p>
          Yazılım müşterisi bunu sormadan yayın yapmamalı. Avcı sizin müşterinize izinsiz kampanya
          basmaz; işlemsel posta ve DNS teklifte ayrılır.
        </p>
      </section>

      <section className="solution-list" id="eposta-katman">
        {layers.map((layer) => (
          <article className="solution-detail" id={`eposta-${layer.number}`} key={layer.number}>
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

      <section className="package-scope-section" aria-labelledby="eposta-sinir">
        <div className="section-heading">
          <div>
            <span className="kicker">KAPSAM SINIRI</span>
            <h2 id="eposta-sinir">
              İşlemsel ayrıdır.
              <br />
              Bülten ayrıdır.
            </h2>
          </div>
          <p>Kimden görüneceği ve hangi şablonun gideceği yazılmadan ‘e-posta hazır’ denmez.</p>
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
        <h2>Hangi kutudan sipariş gidecek?</h2>
        <p>siparis@sizin-alanadiniz yeter; Avcı kutusundan giden örnek marka maili değildir.</p>
        <div>
          <Link className="button button-primary" href="/teklif?cozum=hosting">
            DNS ve e-posta görüşmesi
          </Link>
          <Link className="button button-ghost" href="/alan-adi-hosting">
            Alan adı ve hosting
          </Link>
        </div>
      </section>
    </main>
  );
}
