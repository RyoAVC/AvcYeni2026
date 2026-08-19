import type { Metadata } from "next";
import Link from "next/link";
import { HeaderCtaCluster } from "../header-cta-cluster";
import { SiteBrand } from "../site-brand";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Müşteri Vitrin Tasarımı | Avcı E-Ticaret",
  description:
    "Müşteri mağazasının vitrini: sayfa yapısı, marka, mobil. Avcı kendi sitesini kopya SaaS’a çevirmez; müşteri vitrinini altyapıya bağlar.",
  alternates: { canonical: "/vitrin-tasarim" },
};

const layers = [
  {
    number: "01",
    title: "Sayfa iskeleti",
    text: "Ana sayfa, kategori, ürün, sepet ve hesap ekranlarının hangi blokları taşıyacağı teklifte yazılır. Hazır şablon varsa onun üzerine, yoksa özel iskelet ayrı kalemdir.",
  },
  {
    number: "02",
    title: "Marka yüzü",
    text: "Logo, renk ve tipografi müşteri markasına aittir. Avcı’nın kendi paleti vitrine zorlanmaz; müşteri kimliği altyapıdaki vitrin temasına bağlanır.",
  },
  {
    number: "03",
    title: "Mobil düzen",
    text: "Dokunma, sepet ve ödeme adımı küçük ekranda ayrı kontrol edilir. Uygulama mağazası istenirse mobil yazılım sayfası ayrıca açılır.",
  },
  {
    number: "04",
    title: "İçerik sınırı",
    text: "Ürün fotoğrafı, metin ve kampanya görseli müşterinin işidir. Avcı vitrin iskeletini kurar; katalog içeriğini uydurmaz.",
  },
];

const bounds = {
  included: [
    "Kararlaştırılan sayfa listesi ve blok düzeni",
    "Müşteri logosunun ve renklerinin vitrine uygulanması",
    "Mobil uyum kontrolü (web)",
    "Onaylı taslak üzerinden düzeltme turu sayısı",
  ],
  separate: [
    "Fotoğraf çekimi, metin yazarlığı, reklam görseli",
    "Sınırsız tasarım revizyonu",
    "Avcı tanıtım sitesinin paletini değiştirmek",
    "Her sezon yeni tema vaadi",
  ],
};

export default function StorefrontDesignPage() {
  return (
    <main className="catalog-page">
      <a className="skip-link" href="#vitrin-katman">Vitrin katmanına geç</a>
      <header className="catalog-header">
        <SiteBrand />
        <nav aria-label="Sayfa menüsü">
          <Link href="/eticaret-altyapisi">E-Ticaret</Link>
          <Link className="active" href="/vitrin-tasarim">Vitrin</Link>
          <Link href="/seo-gorunurluk">SEO</Link>
          <Link href="/ozel-yazilim">Özel Modül</Link>
          <Link href="/paketler">Paketler</Link>
        </nav>
        <HeaderCtaCluster>
          <Link className="header-cta" href="/teklif?cozum=eticaret">Vitrin kapsamı isteyin</Link>
        </HeaderCtaCluster>
      </header>

      <section className="catalog-hero">
        <div>
          <span className="kicker kicker-light">MÜŞTERİ VİTRİNİ</span>
          <h1>
            Sizin mağazanızın yüzü.
            <br />
            <em>Bizim altyapımız.</em>
          </h1>
        </div>
        <p>
          Avcı kıyafet satmaz. Vitrin; müşteri markasının katalog ve sepet ekranıdır. Avcı sitesinin
          görsel kimliği burada kopyalanmaz, değiştirilmez.
        </p>
      </section>

      <section className="solution-list" id="vitrin-katman">
        {layers.map((layer) => (
          <article className="solution-detail" id={`vitrin-${layer.number}`} key={layer.number}>
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

      <section className="package-scope-section" aria-labelledby="vitrin-sinir">
        <div className="section-heading">
          <div>
            <span className="kicker">KAPSAM SINIRI</span>
            <h2 id="vitrin-sinir">
              İskelet dahil olabilir.
              <br />
              İçerik sizde kalır.
            </h2>
          </div>
          <p>Sayfa listesi ve revizyon turu yazılmadan “sınırsız tasarım” denmez.</p>
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
        <h2>Hangi sayfalar ilk yayında olacak?</h2>
        <p>Ana, kategori, ürün, sepet: bu dörtlü yeter; gerisi faz olarak ayrılır.</p>
        <div>
          <Link className="button button-primary" href="/teklif?cozum=eticaret">
            Vitrin görüşmesi
          </Link>
          <Link className="button button-ghost" href="/eticaret-altyapisi">
            E-ticaret altyapısı
          </Link>
        </div>
      </section>
    </main>
  );
}
