import type { Metadata } from "next";
import Link from "next/link";
import { HeaderCtaCluster } from "../header-cta-cluster";
import { SiteBrand } from "../site-brand";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Güvenlik Olayı ve Bildirim | Avcı E-Ticaret",
  description:
    "Mağazada şüpheli erişim, sızıntı şüphesi veya Avcı tarafındaki olay nasıl bildirilir. Parola ve anahtar e-postaya yazılmaz. Sabit müdahale saati vaadi yok.",
  alternates: { canonical: "/olay-bildirim" },
};

const layers = [
  {
    number: "01",
    title: "Sizin mağazanız",
    text: "Yetkisiz giriş, toplu iade, garip sipariş veya personel hesabı çalınması sizin operasyonunuzdur. Avcı kasa nöbeti tutmaz. Bildirimde ne görüldü, ne zaman, hangi hesap: bunlar yeter.",
  },
  {
    number: "02",
    title: "Avcı altyapısı",
    text: "Tanıtım sitesi, lisans kaydı veya barındırma Avcı tarafındaysa ve sizi etkiliyorsa sözleşmedeki kanal kullanılır. ‘15 dakikada kapatırız’ cümlesi ölçülmeden yazılmaz.",
  },
  {
    number: "03",
    title: "Ne gönderilmez",
    text: "Parola, ham lisans, API anahtarı, kart, yedek dosyası mesaja yapıştırılmaz. Destek sayfasındaki yasak liste burada da geçerlidir.",
  },
  {
    number: "04",
    title: "Sorumlu bildirim",
    text: "Araştırmacı bir açık bulursa kanıtı kontrollü iletir; halka açık istismar metni istenmez. Ödül programı yoksa yok denir, uydurulmaz.",
  },
];

const bounds = {
  included: [
    "Sözleşmede yazılan bildirim kanalı",
    "Avcı kapsamındaki sistem için durum notu",
    "Destek kaydının güvenlik olarak sınıflanması",
    "Gerekirse erişimin geçici kesilmesi (yazılırsa)",
  ],
  separate: [
    "Sabit saatlik müdahale taahhüdü (SLA yazılmadıysa)",
    "Ödeme kuruluşu veya pazaryeri ihlali",
    "Sizin personelinizin cihazındaki virüs temizliği",
    "Halka açık bug bounty ödülü",
  ],
};

export default function IncidentPage() {
  return (
    <main className="catalog-page">
      <a className="skip-link" href="#olay-katman">Olay katmanına geç</a>
      <header className="catalog-header">
        <SiteBrand />
        <nav aria-label="Sayfa menüsü">
          <Link href="/guvenlik">Güvenlik</Link>
          <Link href="/erisim-denetim">Erişim</Link>
          <Link className="active" href="/olay-bildirim">Olay Bildirimi</Link>
          <Link href="/api-guvenlik">API Güvenliği</Link>
          <Link href="/destek">Destek</Link>
        </nav>
        <HeaderCtaCluster>
          <Link className="header-cta" href="/destek">Güvenli destek kanalı</Link>
        </HeaderCtaCluster>
      </header>

      <section className="catalog-hero">
        <div>
          <span className="kicker kicker-light">MÜŞTERİ SORUSU</span>
          <h1>
            Bir şey şüpheliyse
            <br />
            <em>kime, nasıl yazılır?</em>
          </h1>
        </div>
        <p>
          Yazılım müşterisi panik e-postasına parola yapıştırmaz. Avcı mağazayı izlemez; olay
          bildirimi kanal, yasak içerik ve kapsam sınırıyla yürür.
        </p>
      </section>

      <section className="solution-list" id="olay-katman">
        {layers.map((layer) => (
          <article className="solution-detail" id={`olay-${layer.number}`} key={layer.number}>
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

      <section className="package-scope-section" aria-labelledby="olay-sinir">
        <div className="section-heading">
          <div>
            <span className="kicker">KAPSAM SINIRI</span>
            <h2 id="olay-sinir">
              Kanal yazılır.
              <br />
              Saat uydurulmaz.
            </h2>
          </div>
          <p>Yanıt süresi hizmet sözleşmesinde yoksa bu sayfada icat edilmez.</p>
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
        <h2>Önce sırrı silin, sonra yazın.</h2>
        <p>Ne oldu, hangi hesap, hangi saat: üç cümle yeter. Anahtar yapıştırmayın.</p>
        <div>
          <Link className="button button-primary" href="/destek">
            Destek merkezine gidin
          </Link>
          <Link className="button button-ghost" href="/api-guvenlik">
            API ve webhook
          </Link>
        </div>
      </section>
    </main>
  );
}
