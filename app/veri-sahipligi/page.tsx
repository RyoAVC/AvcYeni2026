import type { Metadata } from "next";
import Link from "next/link";
import { HeaderCtaCluster } from "../header-cta-cluster";
import { SiteBrand } from "../site-brand";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Veri Sahipliği ve Çıkış | Avcı E-Ticaret",
  description:
    "Mağaza verisi kimin, Avcı ne görür, ayrılırken dışa aktarım nasıl planlanır. Kilit altında tutma vaadi yok; kapsam teklifte yazılır.",
  alternates: { canonical: "/veri-sahipligi" },
};

const layers = [
  {
    number: "01",
    title: "İki katman",
    text: "Avcı tanıtım sitesindeki teklif formu ayrıdır. Canlı mağazadaki ürün, sipariş ve müşteri kaydı sizin ticaret verinizdir. Karıştırılmaz.",
  },
  {
    number: "02",
    title: "Avcı ne görür",
    text: "Kurulum ve destek için gereken kadar. Destek kaydına parola, kart ve ham anahtar yazılmaz. Tofy sohbeti mağaza veritabanına gitmez.",
  },
  {
    number: "03",
    title: "Yedekten dönüş",
    text: "Neyin, hangi sıklıkla yedeklendiği ve bir kez prova edilip edilmediği teklifte yazılır. ‘Hiç düşmeyiz’ cümlesi ölçüm olmadan yoktur.",
  },
  {
    number: "04",
    title: "Ayrılık",
    text: "Sözleşme bitince katalog ve sipariş dışa aktarımı hangi formatta, kaç gün içinde: bu yazılır. Yazılmayan ‘her şeyi USB ile veririz’ sözü geçersizdir.",
  },
];

const bounds = {
  included: [
    "Mağaza kaydının size ait olduğunun sözleşmede durması",
    "Kararlaştırılan yedek sıklığı ve saklama yeri",
    "Ayrılıkta ürün / sipariş dışa aktarım formatı",
    "Destek erişiminin kapanması",
  ],
  separate: [
    "Ödeme kuruluşundaki kart tokuları",
    "Pazaryeri hesabınızdaki satıcı puanı ve fatura",
    "Avcı kaynak kodunun tamamının devri (yazılmadıysa yoktur)",
    "Anında silinme; yasal saklama süresi varsa bekler",
  ],
};

export default function DataOwnershipPage() {
  return (
    <main className="catalog-page">
      <a className="skip-link" href="#veri-katman">Veri katmanına geç</a>
      <header className="catalog-header">
        <SiteBrand />
        <nav aria-label="Sayfa menüsü">
          <Link href="/guvenlik">Güvenlik</Link>
          <Link href="/erisim-denetim">Erişim</Link>
          <Link className="active" href="/veri-sahipligi">Veri Sahipliği</Link>
          <Link href="/gizlilik">Gizlilik</Link>
          <Link href="/veri-gecisi">Veri Geçişi</Link>
        </nav>
        <HeaderCtaCluster>
          <Link className="header-cta" href="/teklif?cozum=eticaret">Veri kapsamı isteyin</Link>
        </HeaderCtaCluster>
      </header>

      <section className="catalog-hero">
        <div>
          <span className="kicker kicker-light">MÜŞTERİ SORUSU</span>
          <h1>
            Veri kimin?
            <br />
            <em>Ayrılınca ne olur?</em>
          </h1>
        </div>
        <p>
          Yazılım müşterisi bunu sormadan ilerlemesin. Avcı mağaza verisini rehin tutmaz; dışa aktarım
          ve yedek maddesi yazılmadan da ‘sonsuz kilit’ uydurulmaz.
        </p>
      </section>

      <section className="solution-list" id="veri-katman">
        {layers.map((layer) => (
          <article className="solution-detail" id={`veri-${layer.number}`} key={layer.number}>
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

      <section className="package-scope-section" aria-labelledby="veri-sinir">
        <div className="section-heading">
          <div>
            <span className="kicker">KAPSAM SINIRI</span>
            <h2 id="veri-sinir">
              Sahiplik yazılır.
              <br />
              Rehin yoktur.
            </h2>
          </div>
          <p>Format, süre ve yedek prova maddesi olmadan kesin çıkış tarihi verilmez.</p>
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
        <h2>Çıkış formatını baştan yazın.</h2>
        <p>Ürün ve sipariş CSV/XML yeter; görsel arşivi ayrı kalem olabilir.</p>
        <div>
          <Link className="button button-primary" href="/teklif?cozum=eticaret">
            Veri görüşmesi
          </Link>
          <Link className="button button-ghost" href="/kayit-saklama">
            Kayıt saklama
          </Link>
          <Link className="button button-ghost" href="/veri-konumu">
            Veri konumu
          </Link>
        </div>
      </section>
    </main>
  );
}
