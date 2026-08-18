import type { Metadata } from "next";
import Link from "next/link";
import { HeaderCtaCluster } from "../header-cta-cluster";
import { SiteBrand } from "../site-brand";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "E-İhracat Altyapısı | Avcı E-Ticaret",
  description: "Çoklu dil, para birimi, ülke kataloğu, global ödeme ve uluslararası kargo kapsamıyla e-ihracat altyapısını planlayın.",
  alternates: { canonical: "/e-ihracat" },
};

const pillars = [
  { number: "01", title: "Yerelleştirilmiş mağaza", text: "Dil, para birimi, alan adı ve içerik yapısını hedef pazar deneyimine göre kurgulayın.", items: ["Çoklu dil ve para birimi", "Ülke bazlı katalog ve fiyat", "Yerel SEO alanları", "Bölgesel kampanya içeriği"] },
  { number: "02", title: "Ödeme ve fiyat", text: "Desteklenen ödeme yöntemlerini, kur yaklaşımını ve fiyat gösterimini pazar bazında yönetin.", items: ["Global ödeme bağlantıları", "Kur ve fiyat güncelleme kuralı", "Para birimi gösterimi", "Başarısız ödeme senaryoları"] },
  { number: "03", title: "Teslimat operasyonu", text: "Kargo seçeneği, takip, teslimat süresi ve iade bilgisini ülkeye göre açıklaştırın.", items: ["Uluslararası kargo bağlantısı", "Ülke ve desi bazlı kural", "Takip ve bildirim", "İade yönlendirmesi"] },
  { number: "04", title: "Ölçüm ve yönetim", text: "Pazar, kanal, ürün ve para birimi bazında satış performansını ortak görünümde izleyin.", items: ["Ülke bazlı satış görünümü", "Dönüşüm ve sepet analizi", "Kanal maliyeti takibi", "Ürün ve stok sinyalleri"] },
];

export default function EExportPage() {
  return (
    <main className="catalog-page vertical-page">
      <a className="skip-link" href="#kapsam">E-ihracat kapsamına geç</a>
      <header className="catalog-header">
        <SiteBrand />
        <nav aria-label="Sayfa menüsü"><Link href="/yazilimlar">Yazılımlar</Link><Link href="/b2b-c2c">B2B & C2C</Link><Link className="active" href="/e-ihracat">E-İhracat</Link><Link href="/paketler">Paketler</Link><Link href="/entegrasyonlar">Entegrasyonlar</Link></nav>
        <HeaderCtaCluster><Link className="header-cta" href="/teklif?cozum=eihracat">Pazar planı isteyin</Link></HeaderCtaCluster>
      </header>

      <section className="catalog-hero vertical-hero export-hero">
        <div><span className="kicker kicker-light">SINIR ÖTESİ DİJİTAL TİCARET</span><h1>Yeni pazara<br /><em>yerel gibi girin.</em></h1></div>
        <p>E-ihracat yalnızca çeviri değildir. Katalog, fiyat, ödeme, teslimat, iade ve ölçüm kararlarını hedef ülkenin müşteri deneyimine göre birlikte planlarız.</p>
      </section>

      <section className="readiness-strip" aria-label="E-ihracat hazırlık başlıkları">
        {[["01", "Pazar"], ["02", "Katalog"], ["03", "Ödeme"], ["04", "Teslimat"], ["05", "Ölçüm"]].map(([number, title]) => <span key={number}><small>{number}</small>{title}</span>)}
      </section>

      <section className="readiness-grid" id="kapsam">
        {pillars.map((pillar) => <article key={pillar.number}><header><span>{pillar.number}</span><h2>{pillar.title}</h2></header><p>{pillar.text}</p><ul>{pillar.items.map((item) => <li key={item}><i>✓</i>{item}</li>)}</ul></article>)}
      </section>

      <section className="market-rollout">
        <div><span className="kicker">KADEMELİ YAYILIM</span><h2>Önce doğrulayın.<br />Sonra ölçekleyin.</h2><p>Her ülkeyi aynı anda açmak yerine ürün, operasyon ve kanal uyumunu ölçülebilir aşamalarla ilerletmek riski azaltır.</p></div>
        <ol>
          <li><span>01</span><div><strong>Hedef pazar ve ürün seçimi</strong><p>Talep, rekabet, marj ve operasyon kapasitesine göre ilk pazar kapsamı belirlenir.</p></div></li>
          <li><span>02</span><div><strong>Teknik ve içerik hazırlığı</strong><p>Katalog, dil, fiyat, ödeme, kargo, ölçüm ve bildirim akışları yapılandırılır.</p></div></li>
          <li><span>03</span><div><strong>Pilot yayın ve ölçüm</strong><p>Sınırlı ürün veya pazarla sipariş akışı doğrulanır; sorunlar ve maliyetler ölçülür.</p></div></li>
          <li><span>04</span><div><strong>Kanal ve ülke genişlemesi</strong><p>Doğrulanan model yeni ürünlere, satış kanallarına ve ülkelere kontrollü biçimde taşınır.</p></div></li>
        </ol>
      </section>

      <aside className="scope-note"><strong>Mevzuat ve operasyon notu</strong><p>Vergi, gümrük, tüketici hukuku, ürün uygunluğu ve ülkeye özel satış koşulları profesyonel danışmanlarla müşteri tarafından doğrulanmalıdır. AVC, kararlaştırılan teknik altyapı ve entegrasyon kapsamını uygular; hukuki veya mali danışmanlık vermez.</p></aside>

      <section className="decision-cta"><span className="kicker">PAZAR HAZIRLIK GÖRÜŞMESİ</span><h2>İlk ülkeniz için uygulanabilir kapsamı çıkaralım.</h2><p>Ürün, dil, ödeme, teslimat ve ölçüm ihtiyaçlarını birlikte haritalayalım.</p><div><Link className="button button-primary" href="/teklif?cozum=eihracat">E-ihracat görüşmesi isteyin</Link><Link className="button button-ghost" href="/entegrasyonlar">Entegrasyonları inceleyin</Link></div></section>
    </main>
  );
}
