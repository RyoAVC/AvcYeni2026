import type { Metadata } from "next";
import Link from "next/link";
import { HeaderCtaCluster } from "../header-cta-cluster";
import { SiteBrand } from "../site-brand";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Stok ve Mağaza Operasyonu | Avcı E-Ticaret",
  description:
    "Müşteri mağazasında stok, depo ve sipariş hazırlık akışı. Avcı /yonetim paneli kasa veya depo değildir.",
  alternates: { canonical: "/stok-operasyon" },
};

const layers = [
  {
    number: "01",
    title: "Satılabilir adet",
    text: "Varyant bazlı stok, rezerve ve satışa açık miktar mağaza çekirdeğinde durur. Avcı’nın kendi yönetim ekranı bu stoğu işletmez.",
  },
  {
    number: "02",
    title: "Depo ve kanal",
    text: "Tek depo veya kanal bazlı kota teklifte yazılırsa açılır. Yazılmayan ikinci depo varsayılmaz.",
  },
  {
    number: "03",
    title: "Sipariş hazırlık",
    text: "Toplanacak, paketlenmiş, kargoda durumları sizin ekibinizin işidir. Avcı personeli sizin deponuzda çalışmaz.",
  },
  {
    number: "04",
    title: "Eşzaman",
    text: "Pazaryeri veya ERP stoğu ayrı bağlantıdır. Çift satış riski, hangi kaydın ana stok olduğu netleşmeden kapanmaz.",
  },
];

const bounds = {
  included: [
    "Kararlaştırılan stok alanı ve varyant kırılımı",
    "Siparişte stok düşümü / iade ile dönüş",
    "Kritik eşik uyarısı (yazılırsa)",
    "Ana stok kaydının hangi sistem olduğu",
  ],
  separate: [
    "Fiziksel sayım, raf etiketi, el terminali filotayı",
    "Avcı’nın günlük paketleme operasyonu",
    "WMS / 3PL’nin kendi yazılım ücreti",
    "/yonetim ekranının mağaza kasası gibi kurulması",
  ],
};

export default function StockOperationsPage() {
  return (
    <main className="catalog-page">
      <a className="skip-link" href="#stok-katman">Stok katmanına geç</a>
      <header className="catalog-header">
        <SiteBrand />
        <nav aria-label="Sayfa menüsü">
          <Link href="/eticaret-altyapisi">E-Ticaret</Link>
          <Link className="active" href="/stok-operasyon">Stok</Link>
          <Link href="/kampanya-fiyat">Kampanya</Link>
          <Link href="/odeme-kargo">Ödeme & Kargo</Link>
          <Link href="/pazaryeri-kanallari">Pazaryeri</Link>
        </nav>
        <HeaderCtaCluster>
          <Link className="header-cta" href="/teklif?cozum=eticaret">Stok kapsamı isteyin</Link>
        </HeaderCtaCluster>
      </header>

      <section className="catalog-hero">
        <div>
          <span className="kicker kicker-light">MAĞAZA STOKU</span>
          <h1>
            Depo sizin işiniz.
            <br />
            <em>Kayıt altyapıda durur.</em>
          </h1>
        </div>
        <p>
          Avcı kıyafet veya mobilya stoklamaz. Bu sayfa; müşteri yazılımındaki stok kaydını ve
          sipariş hazırlık durumunu anlatır. Avcı yönetim paneli mağaza kasası değildir.
        </p>
      </section>

      <section className="solution-list" id="stok-katman">
        {layers.map((layer) => (
          <article className="solution-detail" id={`stok-${layer.number}`} key={layer.number}>
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

      <section className="package-scope-section" aria-labelledby="stok-sinir">
        <div className="section-heading">
          <div>
            <span className="kicker">KAPSAM SINIRI</span>
            <h2 id="stok-sinir">
              Kayıt dahil olabilir.
              <br />
              Raf sizde kalır.
            </h2>
          </div>
          <p>Ana stok sistemi ve depo sayısı yazılmadan ‘tam WMS’ denmez.</p>
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
        <h2>Stok nerede doğacak?</h2>
        <p>Mağaza mı, ERP mi, pazaryeri mi ana kayıt: bunu netleştirince düşüm kuralı yazılır.</p>
        <div>
          <Link className="button button-primary" href="/teklif?cozum=eticaret">
            Stok görüşmesi
          </Link>
          <Link className="button button-ghost" href="/pazaryeri-kanallari">
            Pazaryeri kanalları
          </Link>
        </div>
      </section>
    </main>
  );
}
