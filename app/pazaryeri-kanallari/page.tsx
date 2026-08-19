import type { Metadata } from "next";
import Link from "next/link";
import { HeaderCtaCluster } from "../header-cta-cluster";
import { SiteBrand } from "../site-brand";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pazaryeri Kanalları | Avcı E-Ticaret",
  description:
    "Kendi mağazanız ile Trendyol, Hepsiburada, N11 gibi kanallar arasında ürün, stok ve sipariş akışı. Avcı pazaryeri değildir; bağlantıyı kurar.",
  alternates: { canonical: "/pazaryeri-kanallari" },
};

const layers = [
  {
    number: "01",
    title: "Ana katalog sizde",
    text: "Ürün, fiyat ve stok Avcı mağaza çekirdeğinde durur. Pazaryeri kopyası, hangi alanın hangi yöne gittiği teklifte yazılır.",
  },
  {
    number: "02",
    title: "Sipariş birikir",
    text: "Kanal siparişi mağaza operasyonuna düşer. Her pazaryerinin kutu, komisyon ve iptal kuralı sağlayıcıya aittir; Avcı bunu uydurmaz.",
  },
  {
    number: "03",
    title: "Hesap sizin",
    text: "Pazaryeri mağaza hesabı, komisyon faturası ve reklam sizin sözleşmenizdir. Avcı yalnızca kararlaştırılan API bağlantısını kurar.",
  },
  {
    number: "04",
    title: "Sürüm değişir",
    text: "Sağlayıcı API’si değişince bağlantı yeniden doğrulanır. ‘Sonsuza kadar hazır’ sözü yoktur; bakım ayrı kalem olabilir.",
  },
];

const bounds = {
  included: [
    "Doğrulanmış kanal için ürün/stok/sipariş yönü",
    "Hata ve tekrar deneme kaydı",
    "Test siparişi ile canlı öncesi prova",
    "Hangi alanın taşınmayacağının yazılması",
  ],
  separate: [
    "Pazaryeri hesap açılışı ve onay süreci",
    "Komisyon, reklam ve ceza yönetimi",
    "Her yeni pazaryerinin otomatik eklenmesi",
    "Avcı’nın sizin yerinize satıcı olması",
  ],
};

export default function MarketplaceChannelsPage() {
  return (
    <main className="catalog-page">
      <a className="skip-link" href="#kanal-katman">Kanal katmanına geç</a>
      <header className="catalog-header">
        <SiteBrand />
        <nav aria-label="Sayfa menüsü">
          <Link href="/eticaret-altyapisi">E-Ticaret</Link>
          <Link className="active" href="/pazaryeri-kanallari">Pazaryeri</Link>
          <Link href="/entegrasyonlar">Entegrasyonlar</Link>
          <Link href="/b2b-c2c">B2B & C2C</Link>
          <Link href="/e-ihracat">E-İhracat</Link>
        </nav>
        <HeaderCtaCluster>
          <Link className="header-cta" href="/teklif?cozum=entegrasyon">Kanal kapsamı isteyin</Link>
        </HeaderCtaCluster>
      </header>

      <section className="catalog-hero">
        <div>
          <span className="kicker kicker-light">SATIŞ KANALLARI</span>
          <h1>
            Pazaryeri Avcı değildir.
            <br />
            <em>Kanal bağlanır.</em>
          </h1>
        </div>
        <p>
          Avcı kendi vitrininde ürün satmaz. Bu sayfa; sizin mağazanızın stok ve siparişini dış
          satış kanallarına nasıl bağladığını anlatır. Marka adları örnektir, hazır uyumluluk değildir.
        </p>
      </section>

      <section className="solution-list" id="kanal-katman">
        {layers.map((layer) => (
          <article className="solution-detail" id={`kanal-${layer.number}`} key={layer.number}>
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

      <section className="package-scope-section" aria-labelledby="kanal-sinir">
        <div className="section-heading">
          <div>
            <span className="kicker">KAPSAM SINIRI</span>
            <h2 id="kanal-sinir">
              Bağlantı yazılır.
              <br />
              Hesap sizde kalır.
            </h2>
          </div>
          <p>Hangi kanal, hangi veri yönü ve hangi API sürümü doğrulanmadan kapsam kapanmaz.</p>
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
        <h2>Hangi kanal gerçekten gerekli?</h2>
        <p>İlk yayında bir kanal yeter; ikincisi ayrı doğrulama ve ayrı kalem olabilir.</p>
        <div>
          <Link className="button button-primary" href="/teklif?cozum=entegrasyon">
            Kanal görüşmesi
          </Link>
          <Link className="button button-ghost" href="/entegrasyonlar">
            Tüm entegrasyonlar
          </Link>
        </div>
      </section>
    </main>
  );
}
