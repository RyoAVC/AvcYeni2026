import type { Metadata } from "next";
import Link from "next/link";
import { HeaderCtaCluster } from "../header-cta-cluster";
import { SiteBrand } from "../site-brand";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Çözüm Senaryoları ve Marka Ekosistemi | Avcı E-Ticaret",
  description: "E-ticaret, B2B, pazaryeri ve e-ihracat için örnek çözüm kurgularını ve AVC marka ekosistemini inceleyin.",
  alternates: { canonical: "/cozum-senaryolari" },
};

const scenarios: Array<{
  number: string;
  quote: string;
  type: string;
  title: string;
  challenge: string;
  structure: string[];
  target: string;
  draftHref?: string;
  draftLabel?: string;
}> = [
  {
    number: "01",
    quote: "eticaret",
    type: "GIDA MARKASI & SOĞUK ZİNCİR",
    title: "Peynir markasının mağaza, sipariş ve teslimatını aynı akışta yönetmek",
    challenge: "Gramaj ve paket seçenekleri, stok uygunluğu, ödeme, teslimat bölgesi ve soğuk zincir koşulları birbirinden kopuk yönetildiğinde sipariş hatası ve müşteri iletişimi yükü artar.",
    structure: ["Web mağazası ve mobil uyum", "Gramaj ve varyant kataloğu", "Stok ve sipariş akışı", "Ödeme ve bölge bazlı teslimat", "İsteğe bağlı içerik/öneri AI modülü"],
    target: "Müşterinin doğru ürünü ve teslimat seçeneğini gördüğü; ekibin sipariş, ödeme ve gönderi durumunu ortak kayıttan izlediği modüler mağaza operasyonu.",
    draftHref: "/cozum-senaryolari/peynir",
    draftLabel: "Demo mağazayı gez",
  },
  {
    number: "02",
    quote: "eticaret",
    type: "ÇOK KANALLI PERAKENDE",
    title: "Büyüyen markanın satış operasyonunu tek merkezde toplamak",
    challenge: "Web mağazası, pazaryerleri, stok ve kargo süreçleri farklı ekranlarda ilerlediğinde ekip aynı veriyi tekrar tekrar işler.",
    structure: ["E-ticaret yönetimi", "Pazaryeri bağlantıları", "Merkezi stok ve sipariş", "Kargo durum akışı", "Satış raporları"],
    target: "Elle veri taşıma ihtiyacını azaltan, kanalları birlikte izlenebilir hâle getiren ve yeni satış noktalarına genişleyebilen bir operasyon.",
  },
  {
    number: "03",
    quote: "b2b",
    type: "B2B & BAYİ AĞI",
    title: "Her bayiye doğru fiyatı ve tahsilat akışını sunmak",
    challenge: "Müşteri grupları, iskonto oranları, vadeler ve sipariş onayları telefon veya dosyalar üzerinden yürüdüğünde ticari hata riski artar.",
    structure: ["Bayi hesapları", "Grup bazlı fiyat", "Teklif ve sipariş", "Limit ve tahsilat", "ERP/muhasebe bağlantısı"],
    target: "Bayinin kendi koşullarını gördüğü, satış ekibinin siparişleri kontrol ettiği ve ticari kuralların merkezi yönetildiği dijital kanal.",
  },
  {
    number: "04",
    quote: "c2c",
    type: "DİKEY PAZARYERİ",
    title: "Satıcıları, komisyonu ve hakedişi aynı platformda yönetmek",
    challenge: "Çok satıcılı yapılarda başvuru, ürün onayı, sipariş bölme ve hakediş birbirinden kopuk ilerlediğinde ölçeklenme zorlaşır.",
    structure: ["Satıcı başvuru akışı", "Satıcı paneli", "Komisyon kuralları", "Sipariş bölme", "Hakediş takibi"],
    target: "Satıcı yaşam döngüsünün ve platform gelir modelinin baştan sona izlenebildiği kontrollü bir pazaryeri omurgası.",
  },
  {
    number: "05",
    quote: "eihracat",
    type: "E-İHRACAT",
    title: "Ülkeye göre yerelleşen uluslararası satış deneyimi kurmak",
    challenge: "Dil, para birimi, fiyat, ödeme ve gönderi koşulları pazar bazında değişirken tek tip mağaza deneyimi dönüşümü sınırlar.",
    structure: ["Çoklu dil", "Para birimi ve fiyat", "Ülke kataloğu", "Global ödeme", "Uluslararası kargo"],
    target: "Her hedef pazarın ticari ve içerik ihtiyaçlarına uyarlanan, merkezi operasyonla yönetilen genişleyebilir satış yapısı.",
  },
];

const brands = [
  { name: "HATAY360", role: "Hatay odaklı web tasarım, yazılım, reklam, SEO ve dijital hizmetler.", href: "https://hatay360.com" },
  { name: "ADANA360", role: "Adana odaklı dijital ajans, hazır paketler, özel projeler ve partner modeli.", href: "https://adana360.com" },
  { name: "SEOEKSPER", role: "Arama görünürlüğü, teknik SEO ve organik büyüme uzmanlık markası.", href: "https://seoeksper.com" },
  { name: "AVCI PLATFORM", role: "Markaları, ürünleri, müşterileri, lisansları, satış ve destek süreçlerini birleştiren ortak merkez.", href: null },
];

export default function SolutionScenariosPage() {
  return (
    <main className="catalog-page scenarios-page">
      <a className="skip-link" href="#senaryolar">Senaryolara geç</a>
      <header className="catalog-header"><SiteBrand /><nav aria-label="Sayfa menüsü"><Link href="/eticaret-altyapisi">E-Ticaret</Link><Link href="/yazilimlar">Yazılımlar</Link><Link href="/paketler">Paketler</Link><Link href="/entegrasyonlar">Entegrasyonlar</Link><Link href="/hizmetler">Hizmetler</Link></nav><HeaderCtaCluster><Link className="header-cta" href="/teklif?cozum=eticaret">Mağazanızı anlatın</Link></HeaderCtaCluster></header>

      <section className="catalog-hero scenario-hero"><div><span className="kicker kicker-light">ÇÖZÜM SENARYOLARI</span><h1>Teknolojiyi değil,<br /><em>iş akışını tasarlarız.</em></h1></div><p>Benzer iş modelleri farklı ihtiyaçlarla çalışır. Aşağıdaki örnekler, AVC modüllerinin gerçek bir operasyon problemi etrafında nasıl kurgulanabileceğini gösterir.</p></section>

      <aside className="scenario-disclosure"><strong>Şeffaflık notu</strong><p>Bu içerikler müşteri referansı, tamamlanmış proje veya ölçülmüş başarı sonucu değildir. Satın alma kararını kolaylaştırmak için hazırlanmış örnek çözüm senaryolarıdır.</p></aside>

      <section className="scenario-list" id="senaryolar">{scenarios.map((scenario) => <article id={`senaryo-${scenario.number}`} key={scenario.number}><header><span>{scenario.number}</span><div><small>ÖRNEK SENARYO · {scenario.type}</small><h2>{scenario.title}</h2></div></header><div className="scenario-columns"><section><small>OPERASYON İHTİYACI</small><p>{scenario.challenge}</p></section><section><small>ÇÖZÜM KURGUSU</small><ul>{scenario.structure.map((item) => <li key={item}><span>✓</span>{item}</li>)}</ul></section><section><small>HEDEFLENEN YAPI</small><p>{scenario.target}</p></section></div><div className="scenario-actions">{scenario.draftHref ? <Link href={scenario.draftHref}>{scenario.draftLabel}</Link> : null}<Link href={`/teklif?cozum=${scenario.quote}`}>Benzer ihtiyacınızı konuşalım</Link></div></article>)}</section>

      <section className="ecosystem-section"><div><span className="kicker kicker-light">MARKA EKOSİSTEMİ</span><h2>Uzmanlıklar ayrı.<br />Teknoloji omurgası ortak.</h2><p>AVC ekosistemi; bölgesel dijital hizmetleri, SEO uzmanlığını ve merkezi ürün/lisans yaklaşımını ortak bir teknoloji vizyonunda buluşturur.</p></div><div>{brands.map((brand, index) => { const content = <><span>0{index + 1}</span><h3>{brand.name}</h3><p>{brand.role}</p><small>{brand.href ? "Siteyi ziyaret edin" : "Ortak işletim merkezi"}</small></>; return brand.href ? <a href={brand.href} target="_blank" rel="noopener noreferrer" key={brand.name}>{content}</a> : <article key={brand.name}>{content}</article>; })}</div></section>

      <section className="reference-ready"><span className="kicker">GERÇEK VAKA ÇALIŞMALARI</span><h2>Doğrulanabilir sonuçlar hazır olduğunda burada yer alacak.</h2><p>Müşteri adı, kapsamı ve performans sonucu yalnızca açık yayın izni ve doğrulanmış veriyle paylaşılacaktır. <Link href="/referanslar">Referans yaklaşımını inceleyin</Link></p></section>

      <section className="decision-cta"><span className="kicker">SİZE ÖZEL KURGU</span><h2>İş modelinizi birlikte çözüm haritasına dönüştürelim.</h2><p>Mevcut sistemlerinizi, darboğazları ve büyüme hedefinizi anlayıp doğru yazılım, entegrasyon ve lisans modelini netleştirelim.</p><div><Link className="button button-primary" href="/teklif">Ücretsiz görüşme isteyin</Link><Link className="button button-ghost" href="/yazilimlar">Yazılımları inceleyin</Link></div></section>
    </main>
  );
}
