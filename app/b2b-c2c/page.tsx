import type { Metadata } from "next";
import Link from "next/link";
import { HeaderCtaCluster } from "../header-cta-cluster";
import { SiteBrand } from "../site-brand";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "B2B Bayi Sistemi ve C2C Pazaryeri | Avcı E-Ticaret",
  description: "B2B bayi satış ağı ile C2C çok satıcılı pazaryeri modellerini operasyon, yetki, fiyat ve hakediş kapsamlarıyla karşılaştırın.",
  alternates: { canonical: "/b2b-c2c" },
};

const models = [
  {
    number: "01",
    eyebrow: "B2B & BAYİ SATIŞI",
    title: "Her müşteriye doğru ticari koşul.",
    text: "Üretici, distribütör ve toptancılar için bayi grubu, fiyat, iskonto, vade ve sipariş yetkilerini tek satış akışında birleştirin.",
    items: ["Bayi ve müşteri grubu bazlı fiyat", "İskonto, vade ve sipariş limiti", "Tekliften siparişe kontrollü akış", "Temsilci, bölge ve kullanıcı yetkileri", "Cari, stok ve tahsilat bağlantıları", "Bayi performansı ve sipariş raporları"],
    quote: "b2b",
  },
  {
    number: "02",
    eyebrow: "C2C & ÇOK SATICILI YAPI",
    title: "Satıcıdan hakedişe izlenebilir pazaryeri.",
    text: "Bağımsız satıcıları, ürünleri, komisyonları ve sipariş sorumluluğunu platform kurallarınızla yönetin.",
    items: ["Satıcı başvuru, belge ve onay akışı", "Satıcı paneli ve katalog yetkileri", "Kategori veya satıcı bazlı komisyon", "Sipariş bölme ve hakediş kaydı", "İade ve uyuşmazlık iş akışları", "Satıcı kalite ve performans görünümü"],
    quote: "c2c",
  },
];

const decisionRows = [
  ["Ana ilişki", "İşletme ile bayi/kurumsal müşteri", "Platform ile bağımsız satıcı ve alıcı"],
  ["Fiyat mantığı", "Müşteri grubuna özel fiyat ve iskonto", "Satıcı fiyatı, komisyon ve platform kuralı"],
  ["Sipariş sahibi", "Tek işletme veya dağıtıcı", "Siparişe göre bir ya da birden çok satıcı"],
  ["Finans akışı", "Cari, vade, limit ve tahsilat", "Komisyon, hakediş ve satıcı mutabakatı"],
  ["Yönetim odağı", "Bayi ağı, temsilci ve ticari koşullar", "Satıcı onayı, katalog kalitesi ve uyuşmazlık"],
];

export default function B2bC2cPage() {
  return (
    <main className="catalog-page vertical-page">
      <a className="skip-link" href="#modeller">Modellere geç</a>
      <header className="catalog-header">
        <SiteBrand />
        <nav aria-label="Sayfa menüsü"><Link href="/yazilimlar">Yazılımlar</Link><Link className="active" href="/b2b-c2c">B2B & C2C</Link><Link href="/e-ihracat">E-İhracat</Link><Link href="/paketler">Paketler</Link><Link href="/entegrasyonlar">Entegrasyonlar</Link></nav>
        <HeaderCtaCluster><Link className="header-cta" href="/teklif?cozum=b2b">Projenizi anlatın</Link></HeaderCtaCluster>
      </header>

      <section className="catalog-hero vertical-hero b2b-hero">
        <div><span className="kicker kicker-light">KURUMSAL & ÇOK SATICILI TİCARET</span><h1>Tek vitrin değil.<br /><em>Doğru iş modeli.</em></h1></div>
        <p>B2B bayi satışı ile C2C pazaryeri benzer görünür; fiyat, sipariş, tahsilat ve sorumluluk yapıları ise farklıdır. Altyapıyı bu farklara göre kuruyoruz.</p>
      </section>

      <section className="model-compare" id="modeller">
        {models.map((model) => (
          <article key={model.number}>
            <header><span>{model.number}</span><small>{model.eyebrow}</small></header>
            <h2>{model.title}</h2>
            <p>{model.text}</p>
            <ul>{model.items.map((item) => <li key={item}><span>✓</span>{item}</li>)}</ul>
            <Link href={`/teklif?cozum=${model.quote}`}>Bu modeli konuşalım</Link>
          </article>
        ))}
      </section>

      <section className="decision-matrix">
        <div><span className="kicker">MODEL KARŞILAŞTIRMASI</span><h2>Benzer ekranlar,<br />farklı operasyonlar.</h2><p>İki yapı birlikte de kurulabilir. Kesin kapsam; satıcı, müşteri, finans ve entegrasyon sorumlulukları netleştirildikten sonra belirlenir.</p></div>
        <div className="comparison-wrap"><table><caption className="visually-hidden">B2B bayi ve C2C pazaryeri modellerinin karar alanlarına göre karşılaştırması</caption><thead><tr><th scope="col">Karar alanı</th><th scope="col">B2B / Bayi</th><th scope="col">C2C / Pazaryeri</th></tr></thead><tbody>{decisionRows.map(([name, b2b, c2c]) => <tr key={name}><th scope="row">{name}</th><td>{b2b}</td><td>{c2c}</td></tr>)}</tbody></table></div>
      </section>

      <section className="operating-flow">
        <div><span className="kicker kicker-light">UYGULAMA AKIŞI</span><h2>Kuraldan çalışan<br />operasyona.</h2></div>
        <div>{[
          ["01", "Ticari kurallar", "Fiyat, komisyon, limit, vade ve yetki kurallarını gerçek operasyonla eşleştiririz."],
          ["02", "Rol ve sorumluluk", "Merkez, bayi, satıcı, temsilci ve destek rollerinin görebileceği işlemleri tanımlarız."],
          ["03", "Bağlantılar", "Muhasebe, ERP, ödeme, kargo ve bildirim akışlarının veri sözleşmesini kurarız."],
          ["04", "Kontrollü geçiş", "Test verisi ve pilot kullanıcılarla akışı doğrular, ardından kademeli yayına alırız."],
        ].map(([number, title, text]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
      </section>

      <aside className="scope-note"><strong>Kapsam notu</strong><p>AVC yazılımı ve kararlaştırılan teknik hizmetleri sağlar. Satıcı kabulü, ürün doğruluğu, ticari sözleşmeler, tahsilat kararları ve mevzuat yükümlülükleri müşterinin operasyonel sorumluluğundadır.</p></aside>

      <section className="decision-cta"><span className="kicker">DOĞRU MODELİ SEÇİN</span><h2>Bayi ağı mı, pazaryeri mi, yoksa ikisi birlikte mi?</h2><p>Mevcut satış ilişkinizi ve finans akışınızı inceleyip doğru başlangıç kapsamını çıkaralım.</p><div><Link className="button button-primary" href="/teklif?cozum=b2b">B2B görüşmesi isteyin</Link><Link className="button button-ghost" href="/teklif?cozum=c2c">C2C görüşmesi isteyin</Link></div></section>
    </main>
  );
}
