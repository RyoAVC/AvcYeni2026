import type { Metadata } from "next";
import Link from "next/link";
import { HeaderCtaCluster } from "../header-cta-cluster";
import { SiteBrand } from "../site-brand";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "E-Ticaret Karar Rehberi ve SSS | Avcı E-Ticaret",
  description: "E-ticaret altyapısı, lisans modeli, entegrasyon, veri geçişi, yapay zekâ ve destek süreçleri hakkında sık sorulan sorular.",
  alternates: { canonical: "/kaynaklar" },
};

const questions = [
  { question: "Hazır paket mi, özel proje mi seçmeliyim?", answer: "Standart satış, ödeme ve kargo akışları yeterliyse hazır modüllerle başlamak daha doğrudur. İşletmenize özgü onaylar, veri yapıları veya sektör süreçleri varsa kapsam analizinden sonra özel geliştirme planlanır. Aynı projede iki yaklaşım birlikte de kullanılabilir." },
  { question: "Fiyatlar neden sitede sabit rakam olarak verilmedi?", answer: "Kurulum, lisans, entegrasyon, özel geliştirme ve AI kullanımı birbirinden farklı maliyet kalemleridir. İhtiyacınız olmayan modülleri fiyatın içine gizlememek için kesin teklif; ürün, kapsam ve kullanım modeli netleştirildikten sonra hazırlanır." },
  { question: "Aylık lisans dışında satış modeli var mı?", answer: "Evet. Aylık veya yıllık lisansın yanında tek seferlik proje, özel teklif, modül aboneliği ve kullanım bazlı ek hizmet planlanabilir. Ticari model ürünün bakım, destek ve güncelleme ihtiyacıyla birlikte belirlenir." },
  { question: "Mevcut ürün ve müşteri verilerim taşınabilir mi?", answer: "Taşınabilirlik; kaynak sistemin dışa aktarım imkânına, veri kalitesine ve hedef alan eşlemelerine bağlıdır. Önce örnek veri incelenir, dönüşüm kuralları hazırlanır ve canlı geçişten önce kontrollü prova yapılır." },
  { question: "Her pazaryeri, ödeme veya muhasebe sistemi hazır bağlı mı?", answer: "Hayır. Sağlayıcının güncel API erişimi, hesap türü, sürümü ve ticari koşulları doğrulanmadan hazır uyumluluk sözü verilmez. Entegrasyon kapsamı analiz edilir; yetki, veri yönü, hata yönetimi ve sürüm değişikliği planı teklifte belirtilir." },
  { question: "Yapay zekâ modülleri verilerimi nasıl kullanır?", answer: "Her modül yalnızca tanımlanan iş amacı ve izin verilen veri kaynaklarıyla sınırlandırılır. Kritik yayın veya karar adımlarında insan onayı korunabilir. Veri kaynakları, kullanım kotası ve sağlayıcı sınırları uygulama öncesinde açıkça belirlenir." },
  { question: "AVC'nin ana ürünü yapay zekâ mı?", answer: "Hayır. AVC'nin ana ürünü mağaza, katalog, sipariş, ödeme, teslimat, müşteri ve satış kanallarını kapsayan e-ticaret altyapısıdır. Yapay zekâ yalnızca ürün açıklaması, arama ve öneri, destek veya raporlama gibi belirli ihtiyaçlarda eklenen isteğe bağlı modül katmanıdır." },
  { question: "Kurulum ne kadar sürer?", answer: "Süre; veri geçişi, entegrasyon sayısı, özel geliştirme ve onay adımlarına göre değişir. Gerçekçi takvim ancak ihtiyaç analizi ve teknik doğrulamadan sonra aşamalara ayrılarak paylaşılır; doğrulanmadan sabit teslim tarihi sözü verilmez." },
  { question: "Lisans bittiğinde ne olur?", answer: "Davranış ürün ve sözleşme modeline göre tanımlanır. Yenileme ve geçerlilik, bağlı lisans platformu varsa oradan; yoksa yetkili iletişim kanalından izlenir. Bu tanıtım sitesi parola veya ham lisans anahtarı işlemez. Kesin lisans koşulları teklif ve sözleşmede açıkça yer alır." },
  { question: "Müşteri portalında neleri görebilirim?", answer: "Bu sitedeki demo yalnız örnek Start / Scale / Enterprise satırıdır; yönetimdeki gerçek müşteri kaydı orada açılmaz. Ayrı lisans platformu bağlandıysa geçiş oraya gider ve ham lisans anahtarı gösterilmez. Parola bu tanıtım sitesinde yazılmaz." },
  { question: "Destek ve geliştirme aynı hizmet mi?", answer: "Hayır. Hata düzeltme, bakım, kullanım desteği, yeni modül geliştirme ve yönetilen operasyon farklı kapsamlardır. Hangi hizmetin dahil olduğu ve yanıt önceliği teklif veya hizmet sözleşmesinde ayrı tanımlanır." },
  { question: "Alan adı ve hosting yenilemesini kim takip eder?", answer: "Hesap sahibi, ödeme sorumlusu, teknik sorumlu ve yenileme tarihi teklif veya sözleşmede açıkça belirlenmelidir. AVC yalnızca kararlaştırılan hizmet kapsamındaki işlemleri yürütür; otomatik yenileme veya geçmiş bir hatırlatma, ticari onayın yerine geçmez." },
  { question: "Bir proje ne zaman tamamlanmış sayılır?", answer: "Projenin tamamlanması, yalnızca geliştirme çalışmasının durmasına değil; onaylı kapsamın, kabul ölçütlerinin ve açık maddelerin yetkili kişilerce doğrulanmasına bağlıdır. Yeni veya kapsam dışı talepler ayrı değişiklik kaydıyla değerlendirilir." },
  { question: "Mobil uygulama mı, mobil uyumlu web sitesi mi gerekir?", answer: "Sık kullanılan görev, çevrimdışı çalışma, bildirim, kamera veya konum gibi cihaz yetenekleri gerekmiyorsa mobil uyumlu web veya PWA yeterli olabilir. Mağaza dağıtımı ve cihaz özellikleri gerçek bir kullanıcı ihtiyacına dayanıyorsa mobil uygulama ayrıca kapsamlandırılır." },
];

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: questions.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })),
};

const checkpoints = [
  ["01", "İş modeli", "B2C, B2B, pazaryeri veya e-ihracat akışınızın hangileri gerekli?"],
  ["02", "Operasyon", "Bugün en çok zaman kaybettiren sipariş, stok, fiyat veya destek adımı hangisi?"],
  ["03", "Bağlantılar", "Hangi pazaryeri, ödeme, kargo, muhasebe veya ERP sistemleri kullanılacak?"],
  ["04", "Veri", "Taşınacak ürün, müşteri, sipariş ve içerik verisi hangi formatta tutuluyor?"],
  ["05", "Büyüme", "İlk sürümün çözmesi gereken ihtiyaç ile sonraki aşama hedefleri neler?"],
  ["06", "Ticari model", "Lisans, tek seferlik proje ve destek kapsamı nasıl ayrılmalı?"],
];

const guides = [
  { href: "/eticaret-altyapisi", title: "E-ticaret altyapısı", text: "Mağaza, katalog, sipariş, ödeme ve teslimat çekirdeğini inceleyin.", action: "Altyapıyı görün" },
  { href: "/yazilimlar", title: "Yazılım modelleri", text: "B2C, B2B, C2C, e-ihracat ve özel çözüm seçeneklerini karşılaştırın.", action: "İnceleyin" },
  { href: "/paketler", title: "Paket karşılaştırması", text: "Start, Scale ve Enterprise başlangıç noktalarını görün.", action: "Karşılaştırın" },
  { href: "/fiyatlandirma", title: "Fiyatlandırma yapısı", text: "Lisans, kurulum ve hizmet maliyetlerinin nasıl ayrıldığını görün.", action: "Kalemleri görün" },
  { href: "/entegrasyonlar", title: "Entegrasyon süreci", text: "Bağlantı kapsamının nasıl doğrulandığını öğrenin.", action: "Süreci görün" },
  { href: "/yapay-zeka", title: "İsteğe bağlı AI", text: "Mağaza akışına eklenebilen içerik, destek ve karar modüllerini inceleyin.", action: "Modülleri görün" },
  { href: "/musteri-merkezi", title: "Müşteri merkezi", text: "Portalda görünen kayıtları ve güvenlik sınırlarını öğrenin.", action: "Kapsamı görün" },
  { href: "/destek", title: "Destek merkezi", text: "Talebinizi güvenli teşhis bilgisi ve doğru öncelikle iletin.", action: "Destek alın" },
  { href: "/alan-adi-hosting", title: "Alan adı ve hosting", text: "Sahiplik, yenileme, güvenlik ve devir sorumluluklarını netleştirin.", action: "Rehberi görün" },
  { href: "/proje-sureci", title: "Proje süreci", text: "Aşamaları, değişiklik yönetimini, kabul ve ticari kayıtları inceleyin.", action: "Süreci görün" },
  { href: "/mobil-sektorel", title: "Mobil & sektörel", text: "Mobil uygulama ve kuruma özel iş akışı kararlarını netleştirin.", action: "Seçenekleri görün" },
];

export default function ResourcesPage() {
  return (
    <main className="catalog-page resources-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }} />
      <a className="skip-link" href="#sss">Sık sorulan sorulara geç</a>
      <header className="catalog-header"><SiteBrand /><nav aria-label="Sayfa menüsü"><Link href="/eticaret-altyapisi">E-Ticaret</Link><Link href="/yazilimlar">Yazılımlar</Link><Link href="/paketler">Paketler</Link><Link href="/entegrasyonlar">Entegrasyonlar</Link><Link href="/hizmetler">Hizmetler</Link></nav><HeaderCtaCluster><Link className="header-cta" href="/teklif">Sorunuzu iletin</Link></HeaderCtaCluster></header>

      <section className="catalog-hero resources-hero"><div><span className="kicker kicker-light">KARAR REHBERİ</span><h1>Doğru sorularla<br /><em>doğru altyapıyı seçin.</em></h1></div><p>Mağaza, katalog, sipariş, ödeme, paket, entegrasyon ve geçiş kararlarını netleştirmek için satın alma öncesinde bilmeniz gerekenleri tek yerde topladık.</p></section>

      <section className="resource-path"><div><span className="kicker">NEREDEN BAŞLAMALI?</span><h2>Önce teknoloji listesi değil,<br />iş haritası çıkarın.</h2><p>İlk görüşmeden önce bu altı başlığı düşünmeniz, gereksiz modül ve belirsiz entegrasyon maliyetlerini azaltır.</p></div><div>{checkpoints.map(([number, title, text]) => <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div></section>

      <section className="resource-guides"><div className="section-heading"><div><span className="kicker">HIZLI YÖNLENDİRME</span><h2>İhtiyacınıza göre<br />doğru bölüme ilerleyin.</h2></div></div><div>{guides.map((guide, index) => <Link href={guide.href} key={guide.href}><span>{String(index + 1).padStart(2, "0")}</span><h3>{guide.title}</h3><p>{guide.text}</p><small>{guide.action}</small></Link>)}</div></section>

      <section className="faq-section" id="sss"><div><span className="kicker kicker-light">SIK SORULAN SORULAR</span><h2>Karar vermeden<br />önce netleştirin.</h2><p>Yanıtı projenize göre değişen noktalar kesin vaat yerine açık koşullarla anlatılmıştır.</p></div><div className="faq-list">{questions.map((item, index) => <details key={item.question}><summary><span>{String(index + 1).padStart(2, "0")}</span><strong>{item.question}</strong><i aria-hidden="true">+</i></summary><p>{item.answer}</p></details>)}</div></section>

      <section className="decision-cta"><span className="kicker">YANITI PROJENİZE ÖZELLEŞTİRİN</span><h2>Hazır olduğunuzda ihtiyaç haritanızı birlikte çıkaralım.</h2><p>Kısa bir görüşmeyle ürün, entegrasyon, veri geçişi ve ticari model başlıklarını netleştirelim.</p><div><Link className="button button-primary" href="/teklif">Ücretsiz görüşme isteyin</Link><Link className="button button-ghost" href="/musteri-girisi">Müşteri girişi</Link></div></section>
    </main>
  );
}
