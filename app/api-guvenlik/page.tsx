import type { Metadata } from "next";
import Link from "next/link";
import { HeaderCtaCluster } from "../header-cta-cluster";
import { SiteBrand } from "../site-brand";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "API Anahtarı ve Webhook Güvenliği | Avcı E-Ticaret",
  description:
    "Mağaza API’si, webhook imzası ve sır saklama. Anahtar vitrine yazılmaz, e-postaya yapıştırılmaz. Avcı sizin entegrasyon hesabınızı sahiplenmez.",
  alternates: { canonical: "/api-guvenlik" },
};

const layers = [
  {
    number: "01",
    title: "Anahtar vitrinde olmaz",
    text: "Canlı mağaza sayfası, Tofy sohbeti ve tanıtım sitesi API sırrı taşımaz. Anahtar sunucu tarafında, mümkünse ortam değişkeninde durur.",
  },
  {
    number: "02",
    title: "Webhook imzası",
    text: "Gelen olay HMAC veya eşdeğeri ile doğrulanır; ham gövdeye güvenilmez. Tekrar deneme aynı olay kimliğiyle idempotent işlenir. Platform sayfasındaki kural burada da geçerlidir.",
  },
  {
    number: "03",
    title: "Yetki daraltılır",
    text: "Bir entegrasyon yalnızca sipariş okusun diye tam yönetici anahtarı verilmez. Kapsam teklifte yazılır. Yazılmayan ‘her şeyi çeker’ demek değildir.",
  },
  {
    number: "04",
    title: "Sızdıysa döndürülür",
    text: "Anahtar e-posta, sohbet veya ekran görüntüsüne düştüyse iptal + yeni anahtar. Avcı sizin pazaryeri veya POS anahtarınızı yerine koymaz.",
  },
];

const bounds = {
  included: [
    "Kararlaştırılan API uçları ve okuma/yazma yönü",
    "Webhook imza doğrulaması (yazılırsa)",
    "Operasyon ekranında ham sırrın gizlenmesi",
    "İptal / yenileme prosedürünün notu",
  ],
  separate: [
    "Üçüncü tarafın kendi anahtar kasası ücreti",
    "Sızan anahtarın yol açtığı pazaryeri cezası",
    "Açık internete şifresiz REST ‘herkese açık’",
    "Avcı’nın sizin CI sisteminizi yönetmesi",
  ],
};

export default function ApiSecurityPage() {
  return (
    <main className="catalog-page">
      <a className="skip-link" href="#api-katman">API katmanına geç</a>
      <header className="catalog-header">
        <SiteBrand />
        <nav aria-label="Sayfa menüsü">
          <Link href="/guvenlik">Güvenlik</Link>
          <Link href="/entegrasyonlar">Entegrasyonlar</Link>
          <Link className="active" href="/api-guvenlik">API Güvenliği</Link>
          <Link href="/olay-bildirim">Olay Bildirimi</Link>
          <Link href="/platform">Platform</Link>
        </nav>
        <HeaderCtaCluster>
          <Link className="header-cta" href="/teklif?cozum=entegrasyon">API kapsamı isteyin</Link>
        </HeaderCtaCluster>
      </header>

      <section className="catalog-hero">
        <div>
          <span className="kicker kicker-light">MÜŞTERİ SORUSU</span>
          <h1>
            Anahtar nereye konur?
            <br />
            <em>Webhook nasıl doğrulanır?</em>
          </h1>
        </div>
        <p>
          Entegrasyon isteyen müşteri bunu sormadan bağlanmamalı. Avcı sizin API hesabınızın sahibi
          değildir; sır vitrine ve e-postaya yazılmaz.
        </p>
      </section>

      <section className="solution-list" id="api-katman">
        {layers.map((layer) => (
          <article className="solution-detail" id={`api-${layer.number}`} key={layer.number}>
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

      <section className="package-scope-section" aria-labelledby="api-sinir">
        <div className="section-heading">
          <div>
            <span className="kicker">KAPSAM SINIRI</span>
            <h2 id="api-sinir">
              Uç yazılır.
              <br />
              Sır saklanır.
            </h2>
          </div>
          <p>Hangi sistem, hangi yön, hangi imza: bunlar olmadan ‘açık API’ denmez.</p>
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
        <h2>Hangi sistem okuyacak, hangisi yazacak?</h2>
        <p>Tek yön çoğu zaman yeter. Çift yön ve geniş yetki ayrı kalemdir.</p>
        <div>
          <Link className="button button-primary" href="/teklif?cozum=entegrasyon">
            Entegrasyon görüşmesi
          </Link>
          <Link className="button button-ghost" href="/olay-bildirim">
            Olay bildirimi
          </Link>
        </div>
      </section>
    </main>
  );
}
