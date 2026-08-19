import type { Metadata } from "next";
import Link from "next/link";
import { HeaderCtaCluster } from "../header-cta-cluster";
import { SiteBrand } from "../site-brand";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Teknik SEO ve Görünürlük | Avcı E-Ticaret",
  description:
    "Avcı altyapısında teknik SEO: sayfa adresi, hız, şema, ölçüm. Sıralama vaadi yok; arama görünürlüğü içerik ve bağlantıyla birlikte planlanır.",
  alternates: { canonical: "/seo-gorunurluk" },
};

const layers = [
  {
    number: "01",
    title: "Adres ve tarama",
    text: "Sayfa adresi, yönlendirme, sitemap ve robots teklifte yazılan yayın modeline göre kurulur. Yanlış kanonik veya çift URL, içerik işi değil altyapı işidir.",
  },
  {
    number: "02",
    title: "Sayfa iskeleti",
    text: "Başlık, açıklama alanı, ürün şeması ve dil etiketi vitrinle birlikte gelir. Metni kim yazar ayrıdır; boş şablon sıralama üretmez.",
  },
  {
    number: "03",
    title: "Hız ve yayın",
    text: "Görsel ağırlığı, önbellek ve barındırma kararı yayın katmanındadır. Kesin ‘ilk sıradayız’ sözü ölçülmemiş bir vaattir; verilmez.",
  },
  {
    number: "04",
    title: "Ölçüm bağlantısı",
    text: "Arama ve reklam pikseli, hesabınız ve izninizle bağlanır. Avcı sizin Ads hesabınızı sahiplenmez; erişim teklifte sınırlanır.",
  },
];

const bounds = {
  included: [
    "Kararlaştırılan teknik SEO iskeleti",
    "Sitemap, robots ve temel yönlendirme",
    "Ürün/kategori sayfa şablonundaki başlık alanları",
    "Ölçüm kodunun sizin hesabınıza bağlanması",
  ],
  separate: [
    "Binlerce ürün metninin yazılması",
    "Backlink satışı veya sahte referans",
    "Sabit Google sıralaması veya trafik rakamı",
    "Reklam bütçesi yönetimi (ayrı hizmet kalemi)",
  ],
};

export default function SeoVisibilityPage() {
  return (
    <main className="catalog-page">
      <a className="skip-link" href="#seo-katman">SEO katmanına geç</a>
      <header className="catalog-header">
        <SiteBrand />
        <nav aria-label="Sayfa menüsü">
          <Link href="/eticaret-altyapisi">E-Ticaret</Link>
          <Link href="/vitrin-tasarim">Vitrin</Link>
          <Link className="active" href="/seo-gorunurluk">SEO</Link>
          <Link href="/hizmetler">Hizmetler</Link>
          <Link href="/entegrasyonlar">Entegrasyonlar</Link>
        </nav>
        <HeaderCtaCluster>
          <Link className="header-cta" href="/teklif?cozum=seo">SEO kapsamı isteyin</Link>
        </HeaderCtaCluster>
      </header>

      <section className="catalog-hero">
        <div>
          <span className="kicker kicker-light">TEKNİK GÖRÜNÜRLÜK</span>
          <h1>
            Sıralama satılmaz.
            <br />
            <em>Altyapı taratılır.</em>
          </h1>
        </div>
        <p>
          Avcı arama motoru değildir. Bu sayfa; mağaza sayfalarının taranabilir, ölçülebilir ve
          şema ile okunabilir kurulmasını anlatır.
        </p>
      </section>

      <section className="solution-list" id="seo-katman">
        {layers.map((layer) => (
          <article className="solution-detail" id={`seo-${layer.number}`} key={layer.number}>
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

      <section className="package-scope-section" aria-labelledby="seo-sinir">
        <div className="section-heading">
          <div>
            <span className="kicker">KAPSAM SINIRI</span>
            <h2 id="seo-sinir">
              Teknik iskelet.
              <br />
              İçerik ayrı.
            </h2>
          </div>
          <p>Sıralama, rakip ve bağlantı vaadi teklife yazılmaz.</p>
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
        <h2>Hangi sayfalar aramada görünsün?</h2>
        <p>Kategori ve ürün şablonu netleşince teknik iskelet yazılır; metin işi ayrı kalır.</p>
        <div>
          <Link className="button button-primary" href="/teklif?cozum=seo">
            SEO görüşmesi
          </Link>
          <Link className="button button-ghost" href="/vitrin-tasarim">
            Vitrin tasarımı
          </Link>
        </div>
      </section>
    </main>
  );
}
