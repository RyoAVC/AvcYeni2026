import type { Metadata } from "next";
import Link from "next/link";
import { HeaderCtaCluster } from "../header-cta-cluster";
import { SiteBrand } from "../site-brand";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Canlı Teslim ve Ekip Eğitimi | Avcı E-Ticaret",
  description:
    "Yayın gününde altyapı nasıl teslim edilir, kim eğitilir, günlük satış kimin işidir. Avcı mağazayı sizin yerinize işletmez.",
  alternates: { canonical: "/teslim-egitim" },
};

const stages = [
  {
    number: "01",
    title: "Yayın kontrolü",
    text: "Alan adı, HTTPS, ödeme denemesi ve örnek sipariş teklifte yazılan kadarıyla doğrulanır. “Her şey bitti” sözü, kabul listesi olmadan verilmez.",
  },
  {
    number: "02",
    title: "Yetkili ekip",
    text: "Eğitim; katalog, sipariş, kargo etiketi ve iade gibi sizin personelinizin kullanacağı ekranlar içindir. Avcı’nın /yonetim paneli müşteri kasası değildir.",
  },
  {
    number: "03",
    title: "Oturum sayısı",
    text: "Kaç kişi, hangi konular, uzaktan mı yerinde mi teklifte yazılır. Sınırsız tekrar eğitim vaadi yoktur; yeni tur ayrı kalemdir.",
  },
  {
    number: "04",
    title: "Sonra destek",
    text: "Yayın sonrası hata kaydı destek kapsamındadır. Yeni kampanya kuralı, yeni entegrasyon veya tasarım değişikliği ayrı talep olur.",
  },
];

const bounds = {
  included: [
    "Kararlaştırılan yayın kontrol listesi",
    "Yetkili kişilere verilen oturum sayısı",
    "Kayıtlı ekran adımları veya kısa not",
    "Kapsamdaki ilk hata incelemesi kanalı",
  ],
  separate: [
    "Günlük sipariş paketleme ve kargo operasyonu",
    "İçerik yazımı, ürün fotoğrafı, reklam yönetimi",
    "Personel değişince otomatik yeni eğitim",
    "Avcı’nın sizin yerinize mağaza çalıştırması",
  ],
};

export default function HandoverTrainingPage() {
  return (
    <main className="catalog-page">
      <a className="skip-link" href="#teslim-adim">Teslim adımlarına geç</a>
      <header className="catalog-header">
        <SiteBrand />
        <nav aria-label="Sayfa menüsü">
          <Link href="/proje-sureci">Proje Süreci</Link>
          <Link href="/veri-gecisi">Veri Geçişi</Link>
          <Link className="active" href="/teslim-egitim">Teslim & Eğitim</Link>
          <Link href="/hizmetler">Hizmetler</Link>
          <Link href="/destek">Destek</Link>
        </nav>
        <HeaderCtaCluster>
          <Link className="header-cta" href="/teklif?cozum=eticaret">Teslim kapsamı isteyin</Link>
        </HeaderCtaCluster>
      </header>

      <section className="catalog-hero">
        <div>
          <span className="kicker kicker-light">CANLI TESLİM</span>
          <h1>
            Altyapıyı teslim ederiz.
            <br />
            <em>Satışı siz yürütürsünüz.</em>
          </h1>
        </div>
        <p>
          Avcı kıyafet veya sipariş kuyruğu işletmez. Teslim; yazılımın yayınlandığı, sizin ekibinizin
          ekranı kullanmayı öğrendiği ve günlük ticaretin sizde kaldığı andır.
        </p>
      </section>

      <section className="solution-list" id="teslim-adim">
        {stages.map((stage) => (
          <article className="solution-detail" id={`teslim-${stage.number}`} key={stage.number}>
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

      <section className="package-scope-section" aria-labelledby="teslim-sinir">
        <div className="section-heading">
          <div>
            <span className="kicker">KAPSAM SINIRI</span>
            <h2 id="teslim-sinir">
              Eğitim dahilse yazarız.
              <br />
              Operasyon sizde kalır.
            </h2>
          </div>
          <p>Oturum sayısı ve katılımcı rolleri teklifte netleşmeden “sınırsız eğitim” denmez.</p>
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
        <h2>Yayın gününde kim oturacak?</h2>
        <p>Katalog, sipariş ve kargo için yetkili kişileri yazın; eğitimi ona göre planlarız.</p>
        <div>
          <Link className="button button-primary" href="/teklif?cozum=eticaret">
            Teslim görüşmesi
          </Link>
          <Link className="button button-ghost" href="/proje-sureci">
            Proje süreci
          </Link>
        </div>
      </section>
    </main>
  );
}
