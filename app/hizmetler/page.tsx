import type { Metadata } from "next";
import Link from "next/link";
import { HeaderCtaCluster } from "../header-cta-cluster";
import { SiteBrand } from "../site-brand";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dijital Hizmetler ve Teknik Destek | Avcı E-Ticaret",
  description: "E-ticaret altyapısı, mağaza kurulumu, özel yazılım, SEO, reklam, hosting, bakım ve teknik destek hizmetlerini inceleyin.",
  alternates: { canonical: "/hizmetler" },
};

const services = [
  { number: "01", title: "E-ticaret altyapısı ve mağaza", quote: "eticaret", text: "Katalogdan siparişe, ödemeden teslimata kadar yönetilebilir web mağazası ve ticaret operasyonu kurulumu.", items: ["Web mağazası ve katalog yapısı", "Sipariş ve müşteri akışı", "Ödeme ve kargo bağlantıları", "Mobil uyum ve teknik SEO temeli"] },
  { number: "02", title: "Özel yazılım", quote: "ozel", text: "Hazır modüllerin karşılamadığı iş kurallarını mevcut sistemlerinizle birlikte çalışan çözümlere dönüştürme.", items: ["İhtiyaç ve süreç analizi", "Özel modül geliştirme", "Yönetim ekranları", "API ve veri akışları"] },
  { number: "03", title: "SEO ve görünürlük", quote: "seo", text: "Teknik altyapı, içerik ve ölçüm katmanlarını organik büyüme hedefi etrafında birleştirme.", items: ["Teknik SEO", "İçerik mimarisi", "Arama görünürlüğü", "Ölçüm ve iyileştirme"] },
  { number: "04", title: "Reklam ve büyüme", quote: "reklam", text: "Kampanya hedefi, açılış deneyimi ve başvuru ölçümünü aynı satış yolculuğunda planlama.", items: ["Kampanya altyapısı", "Açılış sayfaları", "Kaynak ölçümü", "Dönüşüm iyileştirme"] },
  { number: "05", title: "Hosting ve alan adı", quote: "hosting", text: "Yayın altyapısı, DNS, SSL ve yenileme sorumluluklarını açık bir envanter ve takvimle yönetme.", items: ["Hosting kurulumu", "Alan adı ve DNS", "SSL yapılandırması", "Yenileme planı"] },
  { number: "06", title: "Bakım ve teknik destek", quote: "destek", text: "Yazılımı güvenli ve güncel tutan bakım; kapsamı ve önceliği açıkça tanımlanmış destek modeli.", items: ["Güncelleme ve bakım", "Hata inceleme", "Yedekleme planı", "Kapsamlı destek kaydı"] },
];

const responsibilities = {
  avc: ["İhtiyaç analizi ve teknik mimari", "Kararlaştırılan kurulum ve yapılandırma", "Kapsamdaki entegrasyonların geliştirilmesi", "Test ve canlıya geçiş planı", "Sözleşmedeki bakım ve destek hizmetleri"],
  customer: ["Ürün, fiyat ve içerik verisinin doğruluğu", "Günlük sipariş ve müşteri operasyonu", "Ticari, hukuki ve iç onay kararları", "Üçüncü taraf hesap ve erişim izinleri", "Kapsam dışı değişiklikler için yeni onay"],
};

const models = [
  ["01", "Tek seferlik proje", "Tanımlı teslim kapsamı ve kabul ölçütleri olan kurulum veya geliştirme işi."],
  ["02", "Yazılım lisansı", "Ürün, plan ve modül kapsamına bağlı aylık veya yıllık kullanım modeli."],
  ["03", "Bakım & destek", "Dahil hizmetler, öncelik ve iletişim kanalının sözleşmede açıklandığı devamlı hizmet."],
  ["04", "Yönetilen hizmet", "Günlük operasyonun belirli bölümünün yalnızca ayrıca tanımlanan özel kapsamla üstlenilmesi."],
];

export default function ServicesPage() {
  return (
    <main className="catalog-page services-page">
      <a className="skip-link" href="#hizmetler">Hizmetlere geç</a>
      <header className="catalog-header"><SiteBrand /><nav aria-label="Sayfa menüsü"><Link href="/eticaret-altyapisi">E-Ticaret</Link><Link href="/yazilimlar">Yazılımlar</Link><Link href="/paketler">Paketler</Link><Link href="/entegrasyonlar">Entegrasyonlar</Link><Link className="active" href="/hizmetler">Hizmetler</Link><Link href="/proje-sureci">Proje Süreci</Link><Link href="/destek">Destek</Link></nav><HeaderCtaCluster><Link className="header-cta" href="/teklif?cozum=eticaret">Mağaza görüşmesi</Link></HeaderCtaCluster></header>

      <section className="catalog-hero services-hero"><div><span className="kicker kicker-light">E-TİCARET & DİJİTAL HİZMETLER</span><h1>Mağaza kurulumundan büyümeye<br /><em>aynı teknik ekip.</em></h1></div><p>E-ticaret altyapısı, entegrasyon, özel yazılım, SEO, reklam, hosting, bakım ve destek ihtiyaçlarını aynı ticaret hedefi etrafında planlıyoruz.</p></section>

      <section className="service-grid" id="hizmetler">{services.map((service) => <article key={service.number}><header><span>{service.number}</span><h2>{service.title}</h2></header><p>{service.text}</p><ul>{service.items.map((item) => <li key={item}><span>✓</span>{item}</li>)}</ul><Link className="service-quote-link" href={`/teklif?cozum=${service.quote}`}>Bu hizmet için görüşelim</Link></article>)}</section>

      <section className="responsibility-section"><div><span className="kicker kicker-light">SORUMLULUK SINIRI</span><h2>Altyapıyı kurarız.<br />İşletmenizin kontrolü sizde kalır.</h2><p>AVC normal koşullarda müşterinin ticari operasyonunu onun yerine yürütmez. Yönetilen hizmet yalnızca ayrıca kararlaştırılan görev, yetki ve hizmet seviyesiyle sunulur.</p></div><div className="responsibility-cards"><article><small>AVC’NİN SORUMLULUĞU</small><ul>{responsibilities.avc.map((item) => <li key={item}><span>✓</span>{item}</li>)}</ul></article><article><small>MÜŞTERİNİN SORUMLULUĞU</small><ul>{responsibilities.customer.map((item) => <li key={item}>{item}</li>)}</ul></article></div></section>

      <section className="infrastructure-care"><div><span className="kicker">YAYIN ALTYAPISI</span><h2>Alan adı, hosting ve yenileme<br />sürprize bırakılmaz.</h2><Link className="infrastructure-link" href="/alan-adi-hosting">Altyapı ve yenileme rehberi</Link></div><div>{[["Envanter", "Alan adı, hosting, SSL ve bağlı servislerin sahibi ve yenileme sorumlusu belirlenir."], ["Güvenlik", "Erişimler, yedekleme yaklaşımı ve güncelleme sınırları proje kapsamına yazılır."], ["Yenileme", "Bitiş tarihleri ve bildirim kanalları destek modeline göre açık bir takvimle izlenir."], ["Devir", "Müşteriye ait hesap ve verilerin erişim/devir koşulları başlangıçta netleştirilir."]].map(([title, text], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>

      <section className="service-models"><div className="section-heading"><div><span className="kicker">ÇALIŞMA MODELLERİ</span><h2>Hizmet ile lisansı<br />birbirine karıştırmayın.</h2></div><p>Her kalem ayrı tanımlanır; böylece neyi satın aldığınız, hangi desteğin dahil olduğu ve yeni talebin nasıl ele alınacağı nettir.</p></div><div>{models.map(([number, title, text]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>

      <section className="decision-cta"><span className="kicker">DOĞRU HİZMET KAPSAMI</span><h2>İhtiyacınızı altyapı, kurulum, hizmet ve destek olarak ayıralım.</h2><p>Mevcut satış modelinizi ve sorumlulukları inceleyip uygulanabilir, ölçülebilir ve açık bir çalışma kapsamı hazırlayalım.</p><div><Link className="button button-primary" href="/teklif?cozum=eticaret">Mağaza görüşmesi isteyin</Link><Link className="button button-ghost" href="/eticaret-altyapisi">E-ticaret altyapısını inceleyin</Link><Link className="button button-ghost" href="/proje-sureci">Proje akışını inceleyin</Link><Link className="button button-ghost" href="/destek">Destek merkezine gidin</Link></div></section>
    </main>
  );
}
