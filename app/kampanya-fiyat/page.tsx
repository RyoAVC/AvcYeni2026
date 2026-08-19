import type { Metadata } from "next";
import Link from "next/link";
import { HeaderCtaCluster } from "../header-cta-cluster";
import { SiteBrand } from "../site-brand";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kampanya ve Fiyat Kuralları | Avcı E-Ticaret",
  description:
    "Müşteri mağazasında kupon, kanal fiyatı ve kampanya kuralı. Avcı indirim satmaz; kural altyapıda tanımlanır.",
  alternates: { canonical: "/kampanya-fiyat" },
};

const layers = [
  {
    number: "01",
    title: "Liste ve kanal fiyatı",
    text: "Aynı SKU web, bayi ve pazaryerinde farklı fiyata çıkabilir. Hangi kanalın hangi listeyi okuduğu teklifte yazılır.",
  },
  {
    number: "02",
    title: "Kupon ve sepet kuralı",
    text: "Kod, minimum sepet, kategori hariç ve tek kullanımlık sınırlar tanımlı kapsamdadır. Yazılmayan kombinasyon ‘her şey geçer’ demek değildir.",
  },
  {
    number: "03",
    title: "Tarih ve stok bağı",
    text: "Kampanya bitişi, stok bitince kapanma ve çakışan kural önceliği baştan seçilir. Çakışma çözülmeden canlıya alınmaz.",
  },
  {
    number: "04",
    title: "Rapor sınırı",
    text: "Hangi indirimin siparişe işlendiği görünür. Reklam ROAS’ı veya ‘satış artacak’ vaadi bu katmanın işi değildir.",
  },
];

const bounds = {
  included: [
    "Kararlaştırılan fiyat listesi ve müşteri grubu",
    "Tanımlı kupon tipleri ve sepet koşulları",
    "Kampanya başlangıç/bitiş ve çakışma kuralı",
    "Siparişte görünen indirim kaydı",
  ],
  separate: [
    "Reklam metni, görsel ve bütçe yönetimi",
    "Sınırsız yeni kupon tipi her hafta",
    "Satış sonucu veya ciro artışı sözü",
    "Avcı’nın sizin yerinize kampanya kurgulaması",
  ],
};

export default function CampaignPricingPage() {
  return (
    <main className="catalog-page">
      <a className="skip-link" href="#kampanya-katman">Kampanya katmanına geç</a>
      <header className="catalog-header">
        <SiteBrand />
        <nav aria-label="Sayfa menüsü">
          <Link href="/eticaret-altyapisi">E-Ticaret</Link>
          <Link className="active" href="/kampanya-fiyat">Kampanya</Link>
          <Link href="/stok-operasyon">Stok</Link>
          <Link href="/odeme-kargo">Ödeme & Kargo</Link>
          <Link href="/paketler">Paketler</Link>
        </nav>
        <HeaderCtaCluster>
          <Link className="header-cta" href="/teklif?cozum=eticaret">Kural kapsamı isteyin</Link>
        </HeaderCtaCluster>
      </header>

      <section className="catalog-hero">
        <div>
          <span className="kicker kicker-light">TİCARİ KURALLAR</span>
          <h1>
            İndirimi siz tanımlarsınız.
            <br />
            <em>Altyapı uygular.</em>
          </h1>
        </div>
        <p>
          Avcı kendi vitrininde kampanya yapmaz. Bu sayfa; müşteri mağazasının fiyat, kupon ve
          kanal kuralının nasıl yazıldığını anlatır.
        </p>
      </section>

      <section className="solution-list" id="kampanya-katman">
        {layers.map((layer) => (
          <article className="solution-detail" id={`kampanya-${layer.number}`} key={layer.number}>
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

      <section className="package-scope-section" aria-labelledby="kampanya-sinir">
        <div className="section-heading">
          <div>
            <span className="kicker">KAPSAM SINIRI</span>
            <h2 id="kampanya-sinir">
              Kural dahil olabilir.
              <br />
              Kurgu sizde kalır.
            </h2>
          </div>
          <p>Hangi kupon tipi ve hangi kanal fiyatı yazılmadan ‘tüm kampanyalar hazır’ denmez.</p>
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
        <h2>İlk yayında hangi kural şart?</h2>
        <p>Tek kupon tipi ve tek kanal fiyatı yeter; gerisi faz olarak ayrılır.</p>
        <div>
          <Link className="button button-primary" href="/teklif?cozum=eticaret">
            Kampanya görüşmesi
          </Link>
          <Link className="button button-ghost" href="/eticaret-altyapisi">
            E-ticaret altyapısı
          </Link>
        </div>
      </section>
    </main>
  );
}
