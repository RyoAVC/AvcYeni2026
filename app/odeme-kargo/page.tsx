import type { Metadata } from "next";
import Link from "next/link";
import { HeaderCtaCluster } from "../header-cta-cluster";
import { SiteBrand } from "../site-brand";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ödeme ve Kargo Bağlantısı | Avcı E-Ticaret",
  description:
    "Müşteri mağazasında tahsilat ve gönderi: ödeme kuruluşu ve kargo API’si bağlanır. Avcı kart çekmez, kargo şirketi değildir.",
  alternates: { canonical: "/odeme-kargo" },
};

const layers = [
  {
    number: "01",
    title: "Ödeme kuruluşu",
    text: "iyzico, PayTR veya banka sanal POS hesabı size aittir. Avcı siparişi sağlayıcı sonucuna bağlar; kart verisi Avcı’da tutulmaz.",
  },
  {
    number: "02",
    title: "3D ve sonuç",
    text: "Başarısız veya yarım kalan tahsilat tamamlanmış sipariş sayılmaz. İade ve iptal, sağlayıcının kuralı ve teklifteki akış kadardır.",
  },
  {
    number: "03",
    title: "Kargo etiketi",
    text: "Gönderi, takip numarası ve durum güncellemesi bağlanan kargo API’sinden gelir. Avcı kurye çalıştırmaz.",
  },
  {
    number: "04",
    title: "Kural ayrımı",
    text: "Hangi ürüne hangi kargo, desi ve kapıda ödeme teklifte yazılır. Yazılmayan kural varsayılmaz.",
  },
];

const bounds = {
  included: [
    "Doğrulanmış ödeme sağlayıcısı bağlantısı",
    "Sipariş kaydı ile tahsilat sonucu eşlemesi",
    "Kararlaştırılan kargo hesabı ve etiket akışı",
    "Test ödemesi / test gönderisi prova notu",
  ],
  separate: [
    "PCI ve 3D Secure yükümlülüğü (ödeme kuruluşu)",
    "Kargo sözleşmesi, desi tarifesi ve kayıp kargo tazmini",
    "Avcı’nın sizin yerinize tahsilat yapması",
    "Her yeni sağlayıcının otomatik eklenmesi",
  ],
};

export default function PaymentShippingPage() {
  return (
    <main className="catalog-page">
      <a className="skip-link" href="#odeme-katman">Ödeme ve kargo katmanına geç</a>
      <header className="catalog-header">
        <SiteBrand />
        <nav aria-label="Sayfa menüsü">
          <Link href="/eticaret-altyapisi">E-Ticaret</Link>
          <Link className="active" href="/odeme-kargo">Ödeme & Kargo</Link>
          <Link href="/entegrasyonlar">Entegrasyonlar</Link>
          <Link href="/stok-operasyon">Stok</Link>
          <Link href="/guvenlik">Güvenlik</Link>
        </nav>
        <HeaderCtaCluster>
          <Link className="header-cta" href="/teklif?cozum=entegrasyon">Bağlantı kapsamı isteyin</Link>
        </HeaderCtaCluster>
      </header>

      <section className="catalog-hero">
        <div>
          <span className="kicker kicker-light">TAHSİLAT VE GÖNDERİ</span>
          <h1>
            Avcı kasa değildir.
            <br />
            <em>Sağlayıcı bağlanır.</em>
          </h1>
        </div>
        <p>
          Avcı vitrinde ürün satmaz ve kart çekmez. Bu sayfa; müşteri mağazasının siparişini ödeme
          kuruluşu ve kargo hesabına nasıl bağladığını anlatır. Marka adları örnektir.
        </p>
      </section>

      <section className="solution-list" id="odeme-katman">
        {layers.map((layer) => (
          <article className="solution-detail" id={`odeme-${layer.number}`} key={layer.number}>
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

      <section className="package-scope-section" aria-labelledby="odeme-sinir">
        <div className="section-heading">
          <div>
            <span className="kicker">KAPSAM SINIRI</span>
            <h2 id="odeme-sinir">
              Bağlantı yazılır.
              <br />
              Hesap sizde kalır.
            </h2>
          </div>
          <p>Hangi POS, hangi kargo, hangi test hesabı doğrulanmadan kapsam kapanmaz.</p>
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
        <h2>Hangi POS ve kargo hesabı var?</h2>
        <p>Hesap türü ve API erişimi netleşince bağlantı kalemi yazılır.</p>
        <div>
          <Link className="button button-primary" href="/teklif?cozum=entegrasyon">
            Ödeme ve kargo görüşmesi
          </Link>
          <Link className="button button-ghost" href="/entegrasyonlar">
            Tüm entegrasyonlar
          </Link>
        </div>
      </section>
    </main>
  );
}
