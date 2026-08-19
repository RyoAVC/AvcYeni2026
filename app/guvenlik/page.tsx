import type { Metadata } from "next";
import Link from "next/link";
import { HeaderCtaCluster } from "../header-cta-cluster";
import { SiteBrand } from "../site-brand";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Altyapı Güvenliği ve Operasyon | Avcı E-Ticaret",
  description:
    "Avcı e-ticaret altyapısında erişim, yedek, KVKK ve yayın güvenliği nasıl planlanır. Mağaza kasası değil; sağlayıcı güvenlik kapsamı.",
  alternates: { canonical: "/guvenlik" },
};

const layers = [
  {
    number: "01",
    title: "Erişim ve yetki",
    text: "Yönetim paneli Avcı’nın kendi işi için ayrıdır. Müşteri mağazası yetkileri rol, oturum ve işlem kaydıyla sınırlanır. Parola veya API anahtarı vitrine yazılmaz.",
  },
  {
    number: "02",
    title: "Yedek ve süreklilik",
    text: "Yedek sıklığı, saklama yeri ve geri dönüş denemesi teklifte yazılır. Kesin kesinti süresi vaadi, ölçülmemiş bir SLA uydurularak verilmez.",
  },
  {
    number: "03",
    title: "KVKK ve form verisi",
    text: "Teklif ve destek formları amaçla sınırlı işlenir. Tofy sohbeti veritabanına yazılmaz. Çerez sayacı reddedilebilir. Ayrıntı gizlilik metnindedir.",
  },
  {
    number: "04",
    title: "Yayın yüzeyi",
    text: "Tanıtım sitesi tıklama hırsızlığına karşı çerçeve kilidi, MIME sıkılaştırması ve sıkı içerik politikası taşır. Canlı mağaza kapsamı müşteri sözleşmesinde ayrıdır.",
  },
];

const bounds = {
  included: [
    "Teklifte adı geçen barındırma ve yedek modeli",
    "Kararlaştırılan SSL / alan adı / DNS işi",
    "Yönetim paneli oturum ve yetki sınırları",
    "Form ve gizlilik metnindeki veri işleme",
  ],
  separate: [
    "Ödeme kuruluşunun PCI ve 3D Secure yükümlülüğü",
    "Müşterinin kendi personel şifre hijyeni",
    "Kapsam dışı sızma testi veya SOC raporu",
    "Üçüncü taraf pazaryeri hesap güvenliği",
  ],
};

export default function SecurityPage() {
  return (
    <main className="catalog-page">
      <a className="skip-link" href="#guvenlik-katman">Güvenlik katmanına geç</a>
      <header className="catalog-header">
        <SiteBrand />
        <nav aria-label="Sayfa menüsü">
          <Link href="/eticaret-altyapisi">E-Ticaret</Link>
          <Link href="/yazilimlar">Yazılımlar</Link>
          <Link href="/erisim-denetim">Erişim</Link>
          <Link className="active" href="/guvenlik">Güvenlik</Link>
          <Link href="/veri-sahipligi">Veri Sahipliği</Link>
          <Link href="/gizlilik">Gizlilik</Link>
        </nav>
        <HeaderCtaCluster>
          <Link className="header-cta" href="/teklif?cozum=eticaret">Güvenlik kapsamı isteyin</Link>
        </HeaderCtaCluster>
      </header>

      <section className="catalog-hero">
        <div>
          <span className="kicker kicker-light">SAĞLAYICI GÜVENLİĞİ</span>
          <h1>
            Mağaza kasası değil.
            <br />
            <em>Altyapı güvenliği.</em>
          </h1>
        </div>
        <p>
          Avcı kıyafet veya stok satmaz. Satılan şey e-ticaret altyapısıdır. Bu sayfa; erişim, yedek,
          kişisel veri ve yayın yüzeyinin teklifte nasıl ayrıldığını anlatır.
        </p>
      </section>

      <section className="solution-list" id="guvenlik-katman">
        {layers.map((layer) => (
          <article className="solution-detail" id={`katman-${layer.number}`} key={layer.number}>
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

      <section className="package-scope-section" aria-labelledby="guvenlik-sinir">
        <div className="section-heading">
          <div>
            <span className="kicker">KAPSAM SINIRI</span>
            <h2 id="guvenlik-sinir">
              Dahil olan.
              <br />
              Ayrı kalan.
            </h2>
          </div>
          <p>Kesin kontrol listesi doğrulanmış barındırma ve sözleşme maddesinden sonra yazılır.</p>
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
        <h2>Barındırma ve yedek modelini netleştirelim.</h2>
        <p>Sabit kesinti vaadi yok. Kapsamı yazıp teklife bağlarız.</p>
        <div>
          <Link className="button button-primary" href="/teklif?cozum=eticaret">
            Teklif formuna yazın
          </Link>
          <Link className="button button-ghost" href="/erisim-denetim">
            Erişim ve denetim
          </Link>
          <Link className="button button-ghost" href="/veri-sahipligi">
            Veri sahipliği
          </Link>
        </div>
      </section>
    </main>
  );
}
