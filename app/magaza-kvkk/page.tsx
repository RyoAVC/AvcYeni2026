import type { Metadata } from "next";
import Link from "next/link";
import { HeaderCtaCluster } from "../header-cta-cluster";
import { SiteBrand } from "../site-brand";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mağaza Ziyaretçisi KVKK | Avcı E-Ticaret",
  description:
    "Müşteri mağazasındaki üye, sipariş ve çerez verisi kimin sorumluluğu. Avcı tanıtım sitesi gizliliği ayrıdır. Avcı sizin ziyaretçinizin veri sorumlusu değildir, yazılmadıysa.",
  alternates: { canonical: "/magaza-kvkk" },
};

const layers = [
  {
    number: "01",
    title: "İki metin",
    text: "Avcı tanıtım sitesindeki form gizliliği /gizlilik sayfasındadır. Sizin vitrininizdeki üye kaydı, sipariş ve çerez ayrı aydınlatma metnidir. Karıştırılmaz.",
  },
  {
    number: "02",
    title: "Kim sorumlu",
    text: "Ziyaretçinin kişisel verisinde veri sorumlusu kural olarak sizsiniz. Avcı işleyen (altyapı) olabilir; bu sözleşme maddesinde yazılır. Yazılmayan ‘Avcı her şeyi üstlenir’ demek değildir.",
  },
  {
    number: "03",
    title: "Çerez ve izin",
    text: "Ölçüm ve pazarlama çerezi vitrinde ayrı onay ister. Avcı’nın tanıtım sayacı sizin mağazanıza kopyalanmaz. Metin ve banner teklifte yazılırsa kurulur.",
  },
  {
    number: "04",
    title: "Talep kanalı",
    text: "Ziyaretçi silme/erişim talebini size yazar. Avcı’ya gelen Avcı formu talebi sizin mağaza kaydınızı otomatik silmez. Aktarım yolu veri sahipliği ve destek sayfalarındadır.",
  },
];

const bounds = {
  included: [
    "Vitrin aydınlatma / çerez metni iskeleti (yazılırsa)",
    "Hesap silme veya dışa aktarımın teknik yolu (yazılırsa)",
    "Avcı’nın işleyen sıfatının sözleşmede durması",
    "Tanıtım sitesi ile mağaza metninin ayrı tutulması",
  ],
  separate: [
    "Avukat onayı ve resmî KVKK politikası yazımı",
    "Her pazaryeri hesabınızdaki aydınlatma",
    "Avcı’nın sizin ziyaretçinize doğrudan cevap vermesi",
    "Çocuklara yönelik özel işleme (yazılmadıysa yoktur)",
  ],
};

export default function StoreKvkkPage() {
  return (
    <main className="catalog-page">
      <a className="skip-link" href="#kvkk-katman">KVKK katmanına geç</a>
      <header className="catalog-header">
        <SiteBrand />
        <nav aria-label="Sayfa menüsü">
          <Link href="/gizlilik">Gizlilik</Link>
          <Link className="active" href="/magaza-kvkk">Mağaza KVKK</Link>
          <Link href="/veri-sahipligi">Veri Sahipliği</Link>
          <Link href="/oturum-politika">Oturum</Link>
          <Link href="/guvenlik">Güvenlik</Link>
        </nav>
        <HeaderCtaCluster>
          <Link className="header-cta" href="/teklif?cozum=eticaret">KVKK kapsamı isteyin</Link>
        </HeaderCtaCluster>
      </header>

      <section className="catalog-hero">
        <div>
          <span className="kicker kicker-light">MÜŞTERİ SORUSU</span>
          <h1>
            Üye kaydı kimin
            <br />
            <em>KVKK’sı?</em>
          </h1>
        </div>
        <p>
          Yazılım müşterisi bunu sormadan yayın yapmamalı. Avcı sizin ziyaretçinizin mağazasını
          işletmez; aydınlatma ve sorumluluk teklifte ayrılır.
        </p>
      </section>

      <section className="solution-list" id="kvkk-katman">
        {layers.map((layer) => (
          <article className="solution-detail" id={`kvkk-${layer.number}`} key={layer.number}>
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

      <section className="package-scope-section" aria-labelledby="kvkk-sinir">
        <div className="section-heading">
          <div>
            <span className="kicker">KAPSAM SINIRI</span>
            <h2 id="kvkk-sinir">
              İskelet yazılır.
              <br />
              Hukuk ayrıdır.
            </h2>
          </div>
          <p>Avukat metni ve resmî politika, yazılım iskeletinin yerine geçmez.</p>
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
        <h2>Vitrinde hangi metin duracak?</h2>
        <p>Üyelik, sipariş, çerez: üç başlık yeter. Avcı gizlilik sayfası bunun kopyası değildir.</p>
        <div>
          <Link className="button button-primary" href="/teklif?cozum=eticaret">
            Mağaza KVKK görüşmesi
          </Link>
          <Link className="button button-ghost" href="/gizlilik">
            Avcı gizlilik metni
          </Link>
        </div>
      </section>
    </main>
  );
}
