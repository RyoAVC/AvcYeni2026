import type { Metadata } from "next";
import Link from "next/link";
import { HeaderCtaCluster } from "../header-cta-cluster";
import { SiteBrand } from "../site-brand";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Veri Geçişi ve Mağaza Taşıma | Avcı E-Ticaret",
  description:
    "Mevcut mağazadan Avcı altyapısına ürün, müşteri ve sipariş taşıma nasıl planlanır. Kesin süre vaadi yok; örnek veri, eşleme ve prova ile.",
  alternates: { canonical: "/veri-gecisi" },
};

const stages = [
  {
    number: "01",
    title: "Kaynağı görün",
    text: "Eski panel, Excel veya pazaryeri dışa aktarımı ne veriyor? Alan adları, varyant, stok ve müşteri kaydı örnek dosyadan okunur. Dosya yoksa geçiş kapsamı daraltılır.",
  },
  {
    number: "02",
    title: "Alanları eşleyin",
    text: "Ürün kodu, Barkod, KDV, görsel, adres ve sipariş durumu hedef altyapıdaki karşılığına yazılır. Eşlenemeyen alan teklifte “taşınmaz” veya “sonra” diye ayrılır.",
  },
  {
    number: "03",
    title: "Prova yapın",
    text: "Canlıdan önce sınırlı bir katalog ve birkaç sipariş kopyası yüklenir. Sayı, fiyat ve stok sapması burada yakalanır. Provasız toplu taşıma yapılmaz.",
  },
  {
    number: "04",
    title: "Kesme penceresi",
    text: "Yayın gününde eski satış durur veya salt okunur kalır. Yeni sipariş hangi dakikadan sonra Avcı’da doğar, geri dönüş planı nedir: bunlar yazılıdır.",
  },
];

const bounds = {
  included: [
    "Kararlaştırılan ürün, varyant ve kategori aktarımı",
    "Örnek veri incelemesi ve alan eşleme tablosu",
    "Prova yüklemesi ve sapma notu",
    "Canlı kesme penceresindeki teknik yükleme",
  ],
  separate: [
    "Eski sistemin dışa aktarım kilidi veya ücretli API’si",
    "Kirli veri temizliği (yanlış KDV, çift barkod) ayrı iştir",
    "Geçmiş siparişin birebir muhasebe kopyası sözü",
    "Müşteri parolasının düz metin olarak taşınması",
  ],
};

export default function DataMigrationPage() {
  return (
    <main className="catalog-page">
      <a className="skip-link" href="#gecis-adim">Geçiş adımlarına geç</a>
      <header className="catalog-header">
        <SiteBrand />
        <nav aria-label="Sayfa menüsü">
          <Link href="/eticaret-altyapisi">E-Ticaret</Link>
          <Link href="/proje-sureci">Proje Süreci</Link>
          <Link className="active" href="/veri-gecisi">Veri Geçişi</Link>
          <Link href="/guvenlik">Güvenlik</Link>
          <Link href="/entegrasyonlar">Entegrasyonlar</Link>
        </nav>
        <HeaderCtaCluster>
          <Link className="header-cta" href="/teklif?cozum=eticaret">Geçiş kapsamı isteyin</Link>
        </HeaderCtaCluster>
      </header>

      <section className="catalog-hero">
        <div>
          <span className="kicker kicker-light">MAĞAZA TAŞIMA</span>
          <h1>
            Veri sihirle gelmez.
            <br />
            <em>Eşlenir, prova edilir.</em>
          </h1>
        </div>
        <p>
          Avcı başka bir mağazanın stoğunu kendi vitrininde satmaz. Bu sayfa; mevcut katalog ve
          sipariş kaydının yeni altyapıya nasıl taşınacağını anlatır.
        </p>
      </section>

      <section className="solution-list" id="gecis-adim">
        {stages.map((stage) => (
          <article className="solution-detail" id={`gecis-${stage.number}`} key={stage.number}>
            <div className="solution-title">
              <span>{stage.number}</span>
              <div>
                <h2>{stage.title}</h2>
                <p>{stage.text}</p>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="package-scope-section" aria-labelledby="gecis-sinir">
        <div className="section-heading">
          <div>
            <span className="kicker">KAPSAM SINIRI</span>
            <h2 id="gecis-sinir">
              Taşınan.
              <br />
              Ayrı kalan.
            </h2>
          </div>
          <p>Kesin kayıt sayısı ve gün, örnek dosya görülmeden yazılmaz.</p>
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
        <h2>Örnek dışa aktarımı paylaşın.</h2>
        <p>Ürün ve sipariş satırından birkaç örnek yeter; tüm arşivi ilk günde istemeyiz.</p>
        <div>
          <Link className="button button-primary" href="/teklif?cozum=eticaret">
            Geçiş görüşmesi
          </Link>
          <Link className="button button-ghost" href="/proje-sureci">
            Proje süreci
          </Link>
        </div>
      </section>
    </main>
  );
}
