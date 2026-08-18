import type { Metadata } from "next";
import Link from "next/link";
import { HeaderCtaCluster } from "../header-cta-cluster";
import { SiteBrand } from "../site-brand";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Marka Ekosistemi ve Referans Yaklaşımı | Avcı E-Ticaret",
  description: "AVC marka ekosistemini, canlı dijital yüzeyleri ve doğrulanabilir müşteri vaka çalışmalarının yayın standardını inceleyin.",
  alternates: { canonical: "/referanslar" },
};

const brands = [
  {
    number: "01",
    name: "HATAY360",
    focus: "Bölgesel dijital hizmetler",
    description: "Hatay merkezli web tasarım, yazılım, e-ticaret, reklam, SEO, hosting ve teknik destek hizmetleri.",
    href: "https://hatay360.com/",
    label: "Canlı siteyi ziyaret edin",
  },
  {
    number: "02",
    name: "ADANA360",
    focus: "Dijital ajans ve hizmet mağazası",
    description: "Adana odaklı web tasarım, yazılım, reklam ve dijital hizmetleri hazır paketler, özel işler ve partner yaklaşımıyla sunan marka.",
    href: "https://adana360.com/",
    label: "Canlı siteyi ziyaret edin",
  },
  {
    number: "03",
    name: "SEOEKSPER",
    focus: "SEO ve dijital görünürlük",
    description: "Teknik SEO, arama görünürlüğü ve organik büyüme uzmanlığını ayrı bir odakta konumlandıran marka yüzeyi.",
    href: "https://seoeksper.com/",
    label: "Marka sitesini ziyaret edin",
  },
  {
    number: "04",
    name: "AVCI PLATFORM",
    focus: "Ortak teknoloji omurgası",
    description: "Ürün, müşteri, lisans, satış ve destek süreçlerini farklı dikey yazılımlar için ortak merkezde birleştiren platform yaklaşımı.",
    href: null,
    label: "Bu platformun merkezi",
  },
];

const caseStandards = [
  ["01", "Yayın izni", "Müşteri adı, marka görseli ve proje ayrıntısı açık izin olmadan paylaşılmaz."],
  ["02", "Başlangıç noktası", "Proje öncesi durum ve ölçüm yöntemi kayıt altına alınmadan sonuç iddiası kurulmaz."],
  ["03", "Net kapsam", "Hangi yazılım, entegrasyon ve hizmetin AVC tarafından sağlandığı açıkça belirtilir."],
  ["04", "Doğrulanmış sonuç", "Süre, veri kaynağı ve bağlamı belli olmayan yüzde veya başarı ifadesi yayınlanmaz."],
];

const structuredData = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "AVC marka ekosistemi",
  itemListElement: brands.filter((brand) => brand.href).map((brand, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: { "@type": "Organization", name: brand.name, url: brand.href },
  })),
};

export default function ReferencesPage() {
  return (
    <main className="catalog-page references-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <a className="skip-link" href="#markalar">Markalara geç</a>
      <header className="catalog-header">
        <SiteBrand />
        <nav aria-label="Sayfa menüsü"><Link href="/yazilimlar">Yazılımlar</Link><Link href="/hizmetler">Hizmetler</Link><Link className="active" href="/referanslar">Referanslar</Link><Link href="/cozum-senaryolari">Senaryolar</Link><Link href="/kaynaklar">Kaynaklar</Link></nav>
        <HeaderCtaCluster><Link className="header-cta" href="/teklif">Projenizi anlatın</Link></HeaderCtaCluster>
      </header>

      <section className="catalog-hero references-hero">
        <div><span className="kicker kicker-light">MARKA EKOSİSTEMİ & KANIT</span><h1>Gösterilebilir iş.<br /><em>Doğrulanabilir sonuç.</em></h1></div>
        <p>AVC’nin canlı marka yüzeylerini açıkça gösteriyor; müşteri referansı, örnek senaryo ve ölçülmüş vaka çalışmasını birbirine karıştırmıyoruz.</p>
      </section>

      <aside className="scenario-disclosure"><strong>Şeffaflık notu</strong><p>Bu sayfadaki markalar AVC ekosisteminin dijital yüzeyleridir; tek başlarına müşteri referansı veya performans kanıtı sayılmaz. Doğrulanmış müşteri vaka çalışmaları yalnızca yayın izni ve ölçülebilir veriyle paylaşılır.</p></aside>

      <section className="portfolio-brands" id="markalar">
        <div><span className="kicker">CANLI MARKA YÜZEYLERİ</span><h2>Uzmanlıklar ayrı.<br />Vizyon ortak.</h2><p>Bölgesel hizmet markaları, SEO uzmanlığı ve merkezi ürün platformu aynı teknoloji ve operasyon yaklaşımını farklı ihtiyaçlara taşır.</p></div>
        <div>{brands.map((brand) => {
          const content = <><header><span>{brand.number}</span><small>{brand.focus}</small></header><h3>{brand.name}</h3><p>{brand.description}</p><b>{brand.label}</b></>;
          return brand.href ? <a href={brand.href} target="_blank" rel="noopener noreferrer" key={brand.name}>{content}</a> : <article key={brand.name}>{content}</article>;
        })}</div>
      </section>

      <section className="case-standard">
        <div><span className="kicker kicker-light">VAKA ÇALIŞMASI STANDARDI</span><h2>Başarı iddiasından önce<br />kanıt zinciri.</h2><p>Bir müşteri projesi yayınlanabilir olduğunda vaka çalışması bu dört kontrolü birlikte taşıyacak.</p></div>
        <ol>{caseStandards.map(([number, title, text]) => <li key={number}><span>{number}</span><div><strong>{title}</strong><p>{text}</p></div></li>)}</ol>
      </section>

      <section className="portfolio-next"><div><span className="kicker">ŞİMDİ NEYİ İNCELEYEBİLİRSİNİZ?</span><h2>İhtiyacınıza benzeyen çözüm kurgularını görün.</h2><p>Yayın izni verilmiş müşteri vakaları oluşana kadar, ürünlerin farklı iş modellerinde nasıl kurgulandığını açıkça “örnek” olarak işaretlediğimiz senaryolardan inceleyebilirsiniz.</p></div><Link className="button button-primary" href="/cozum-senaryolari">Örnek senaryoları inceleyin</Link></section>

      <section className="decision-cta"><span className="kicker">YENİ BİR ÇALIŞMA BAŞLATIN</span><h2>Sizin projeniz için ölçülebilir bir başlangıç kuralım.</h2><p>İhtiyacı, kapsamı ve başarı ölçütünü en başta birlikte netleştirelim.</p><div><Link className="button button-primary" href="/teklif">Projenizi anlatın</Link><Link className="button button-ghost" href="/hizmetler">Hizmetleri inceleyin</Link></div></section>
    </main>
  );
}
