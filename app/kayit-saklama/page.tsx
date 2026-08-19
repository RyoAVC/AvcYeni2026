import type { Metadata } from "next";
import Link from "next/link";
import { HeaderCtaCluster } from "../header-cta-cluster";
import { SiteBrand } from "../site-brand";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kayıt Saklama Süresi | Avcı E-Ticaret",
  description:
    "Yedek, panel günlüğü ve sipariş kaydı ne kadar tutulur. Avcı sınırsız arşiv vaadi vermez; süre teklifte yazılır.",
  alternates: { canonical: "/kayit-saklama" },
};

const layers = [
  {
    number: "01",
    title: "Yedek",
    text: "Yedek kaç gün geri alınır, teklifte gün sayısı yazılır. Yazılmayan ‘son beş yıl her an geri gelir’ demek değildir.",
  },
  {
    number: "02",
    title: "Panel günlüğü",
    text: "Kim neyi değiştirdi kaydı erişim sayfasındaki denetimle birlikte durur. Saklama süresi ayrı yazılır; sonsuz log yoktur.",
  },
  {
    number: "03",
    title: "Sipariş kaydı",
    text: "Mağaza siparişi sizin iş kaydınızdır. Muhasebe ve iade süresi sizin politikanızdır. Avcı /yonetim bir kasa arşivi değildir.",
  },
  {
    number: "04",
    title: "Silme",
    text: "Süre dolunca veya sözleşme bitince ne silinir, veri sahipliği ve çıkış dışa aktarımıyla bağlanır. Avcı sizin arşivinizde süresiz bekçi değildir.",
  },
];

const bounds = {
  included: [
    "Kararlaştırılan yedek gün sayısı",
    "Denetim günlüğü saklama süresi (yazılırsa)",
    "Sözleşme bitişinde dışa aktarım penceresi",
    "Silme / anonimleştirme yolunun yazılması",
  ],
  separate: [
    "Yasal muhasebe arşivinin Avcı’da tutulması",
    "Sınırsız ‘her şey sonsuza kadar’ yedek",
    "Pazaryeri ve kargo firmasının kendi kayıt süresi",
    "Avcı’nın sizin KEP veya e-Defter arşiviniz olması",
  ],
};

export default function RetentionPage() {
  return (
    <main className="catalog-page">
      <a className="skip-link" href="#saklama-katman">Saklama katmanına geç</a>
      <header className="catalog-header">
        <SiteBrand />
        <nav aria-label="Sayfa menüsü">
          <Link href="/veri-sahipligi">Veri Sahipliği</Link>
          <Link className="active" href="/kayit-saklama">Saklama</Link>
          <Link href="/veri-konumu">Veri Konumu</Link>
          <Link href="/magaza-kvkk">Mağaza KVKK</Link>
          <Link href="/guvenlik">Güvenlik</Link>
        </nav>
        <HeaderCtaCluster>
          <Link className="header-cta" href="/teklif?cozum=eticaret">Saklama süresi isteyin</Link>
        </HeaderCtaCluster>
      </header>

      <section className="catalog-hero">
        <div>
          <span className="kicker kicker-light">MÜŞTERİ SORUSU</span>
          <h1>
            Kayıt ne kadar
            <br />
            <em>tutulur?</em>
          </h1>
        </div>
        <p>
          Yazılım müşterisi bunu sormadan yayın yapmamalı. Avcı sınırsız arşiv vaadi vermez; gün
          sayısı teklifte durur.
        </p>
      </section>

      <section className="solution-list" id="saklama-katman">
        {layers.map((layer) => (
          <article className="solution-detail" id={`saklama-${layer.number}`} key={layer.number}>
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

      <section className="package-scope-section" aria-labelledby="saklama-sinir">
        <div className="section-heading">
          <div>
            <span className="kicker">KAPSAM SINIRI</span>
            <h2 id="saklama-sinir">
              Gün yazılır.
              <br />
              Sonsuz yoktur.
            </h2>
          </div>
          <p>Yasal arşiv sizin muhasebenizdedir; altyapı yedeği onun kopyası değildir.</p>
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
        <h2>Yedek kaç gün geri alınsın?</h2>
        <p>7, 14 veya 30 yazılır. ‘Hepsini sonsuza kadar’ teklifte yoktur.</p>
        <div>
          <Link className="button button-primary" href="/teklif?cozum=hosting">
            Saklama görüşmesi
          </Link>
          <Link className="button button-ghost" href="/veri-sahipligi">
            Veri sahipliği
          </Link>
        </div>
      </section>
    </main>
  );
}
