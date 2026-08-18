import type { Metadata } from "next";
import Link from "next/link";
import { HeaderCtaCluster } from "../header-cta-cluster";
import { SiteBrand } from "../site-brand";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "E-Ticaret Yazılımları | Avcı E-Ticaret",
  description: "E-ticaret, B2B, C2C, e-ihracat, mobil uygulama ve sektörel yazılım çözümlerini karşılaştırın.",
  alternates: { canonical: "/yazilimlar" },
};

const solutions = [
  {
    id: "e-ticaret",
    quote: "eticaret",
    detail: "/eticaret-altyapisi",
    number: "01",
    title: "E-Ticaret Altyapısı",
    lead: "Dijital satışın tüm temel operasyonlarını tek yönetim alanında birleştirin.",
    capabilities: ["Ürün, varyant ve kategori yönetimi", "Kampanya, kupon ve fiyat kuralları", "Ödeme, kargo ve pazaryeri bağlantıları", "Sipariş ve müşteri operasyonları", "Mobil uyumlu mağaza deneyimi", "SEO ve dönüşüm araçları"],
    fit: "Kendi markasıyla internetten satışa başlamak veya mevcut mağazasını daha yönetilebilir bir altyapıya taşımak isteyen işletmeler.",
  },
  {
    id: "b2b",
    quote: "b2b",
    detail: "/b2b-c2c",
    number: "02",
    title: "B2B & Bayi Sistemi",
    lead: "Bayi ve kurumsal müşterilerinize özel koşullarla çalışan dijital satış ağı kurun.",
    capabilities: ["Bayi ve müşteri grubu bazlı fiyat", "Özel iskonto ve ödeme vadeleri", "Teklif, sipariş ve tahsilat akışı", "Bayi limitleri ve yetkilendirme", "Temsilci ve bölge yapıları", "ERP ve muhasebe bağlantıları"],
    fit: "Toptan satış yapan, bayi ağı yöneten veya her müşteriye farklı ticari koşullar sunan üretici ve distribütörler.",
  },
  {
    id: "c2c",
    quote: "c2c",
    detail: "/b2b-c2c",
    number: "03",
    title: "C2C Pazaryeri",
    lead: "Birden çok satıcıyı, ürünü ve hakedişi kontrollü bir pazaryeri çatısında yönetin.",
    capabilities: ["Satıcı başvuru ve onay süreçleri", "Satıcı paneli ve ürün yönetimi", "Kategori bazlı komisyon kuralları", "Sipariş bölme ve hakediş takibi", "İade ve uyuşmazlık operasyonları", "Pazaryeri performans raporları"],
    fit: "Kendi dikey pazaryerini kurmak, bağımsız satıcıları bir araya getirmek ve işlem üzerinden gelir üretmek isteyen girişimler.",
  },
  {
    id: "e-ihracat",
    quote: "eihracat",
    detail: "/e-ihracat",
    number: "04",
    title: "E-İhracat",
    lead: "Ülke, dil ve para birimine göre şekillenen uluslararası satış deneyimi oluşturun.",
    capabilities: ["Çoklu dil ve para birimi", "Ülke bazlı fiyat ve katalog", "Global ödeme seçenekleri", "Uluslararası kargo akışları", "Yerelleştirilmiş SEO alanları", "Kur, vergi ve pazar kuralları"],
    fit: "Ürünlerini yeni ülkelere açmak veya farklı pazarlardaki satış operasyonlarını tek merkezden izlemek isteyen markalar.",
  },
  {
    id: "mobil",
    quote: "mobil",
    detail: "/mobil-sektorel#mobil",
    number: "05",
    title: "Mobil Uygulama",
    lead: "Müşteri veya ekip görevlerini mobil deneyime taşıyan, gerekli sistemlerle veri paylaşan uygulamalar planlayın.",
    capabilities: ["Kullanıcı ve görev odaklı deneyim", "Bildirim ve cihaz yetenekleri", "Web, PWA veya mağaza dağıtımı", "API ve veri senkronizasyonu", "Rol ve erişim yönetimi", "Sürüm ve bakım planı"],
    fit: "Sık kullanılan müşteri, sipariş, rezervasyon veya saha işlemlerini mobil cihazlarda erişilebilir kılmak isteyen işletmeler.",
  },
  {
    id: "sektorel",
    quote: "sektorel",
    detail: "/mobil-sektorel#sektorel",
    number: "06",
    title: "Sektörel Yazılım",
    lead: "İşletmenize özgü roller, kayıtlar ve onay adımlarını yönetilebilir bir operasyon sistemine dönüştürün.",
    capabilities: ["İş akışı ve rol modelleme", "Rezervasyon veya kapasite", "Servis ve iş emri", "Teklif ve onay süreçleri", "Rapor ve kayıt izlenebilirliği", "Kuruma özel entegrasyon"],
    fit: "Genel amaçlı paketlerin karşılamadığı iş kuralları, onaylar veya sektörel veri yapıları olan kurumlar.",
  },
];

export default function SoftwarePage() {
  return (
    <main className="catalog-page">
      <a className="skip-link" href="#cozumler">Çözümlere geç</a>
      <header className="catalog-header">
        <SiteBrand />
        <nav aria-label="Sayfa menüsü"><Link href="/eticaret-altyapisi">E-Ticaret</Link><Link className="active" href="/yazilimlar">Yazılımlar</Link><Link href="/paketler">Paketler</Link><Link href="/entegrasyonlar">Entegrasyonlar</Link><Link href="/hizmetler">Hizmetler</Link></nav>
        <HeaderCtaCluster><Link className="header-cta" href="/teklif">Teklif isteyin</Link></HeaderCtaCluster>
      </header>

      <section className="catalog-hero">
        <div><span className="kicker kicker-light">YAZILIM AİLESİ</span><h1>İş modelinize uyan<br /><em>dijital ticaret altyapısı.</em></h1></div>
        <p>Hazır bir kalıba sığmak zorunda değilsiniz. Satış kanalınızı, müşteri yapınızı ve büyüme hedefinizi anlayıp doğru modülleri birlikte kurguluyoruz.</p>
      </section>

      <nav className="solution-index" aria-label="Yazılım çözümleri">
        {solutions.map((solution) => <a href={`#${solution.id}`} key={solution.id}><span>{solution.number}</span>{solution.title}</a>)}
      </nav>

      <section className="solution-list" id="cozumler">
        {solutions.map((solution) => (
          <article className="solution-detail" id={solution.id} key={solution.id}>
            <div className="solution-title"><span>{solution.number}</span><div><h2>{solution.title}</h2><p>{solution.lead}</p></div></div>
            <div className="solution-body"><div><small>ÖNE ÇIKAN YETENEKLER</small><ul>{solution.capabilities.map((capability) => <li key={capability}><span>✓</span>{capability}</li>)}</ul></div><aside><small>KİMLER İÇİN?</small><p>{solution.fit}</p><Link href={"detail" in solution ? solution.detail : `/teklif?cozum=${solution.quote}`}>{"detail" in solution ? "Detaylı inceleyin" : "Bu çözümü konuşalım"}</Link></aside></div>
          </article>
        ))}
      </section>

      <section className="catalog-platform">
        <div><span className="kicker kicker-light">ORTAK OMURGA</span><h2>Farklı satış modelleri.<br />Tek ticaret merkezi.</h2></div>
        <div className="architecture-flow"><span>Web · Mobil · B2B · C2C</span><strong>AVCI PLATFORM</strong><span>Katalog · Sipariş · Ödeme</span></div>
        <p>Seçtiğiniz çözüm; ticaret verisini, müşteri rollerini, modülleri, lisans ve destek süreçlerini ortak bir işletim merkezine bağlayacak şekilde planlanır. <Link href="/platform">Platform mimarisini inceleyin</Link></p>
      </section>

      <section className="decision-cta"><span className="kicker">SONRAKİ ADIM</span><h2>Hangi modelin doğru olduğundan emin değil misiniz?</h2><p>İş modelinizi dinleyip ürün, entegrasyon ve ticari model kapsamını netleştirelim.</p><div><Link className="button button-primary" href="/teklif">Ücretsiz görüşme isteyin</Link><Link className="button button-ghost" href="/paketler">Paketleri karşılaştırın</Link></div></section>
    </main>
  );
}
