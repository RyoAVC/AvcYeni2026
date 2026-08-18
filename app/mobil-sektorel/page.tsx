import type { Metadata } from "next";
import Link from "next/link";
import { HeaderCtaCluster } from "../header-cta-cluster";
import { SiteBrand } from "../site-brand";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mobil Uygulama ve Sektörel Yazılım | Avcı E-Ticaret",
  description: "Mobil uygulama, PWA ve sektöre özel yazılım ihtiyaçlarını; kullanıcı, süreç, entegrasyon ve yaşam döngüsü kararlarıyla kapsamlandırın.",
  alternates: { canonical: "/mobil-sektorel" },
};

const solutionFamilies = [
  {
    number: "01",
    title: "Mobil uygulama",
    text: "Müşterinizin veya ekibinizin sık kullandığı işlemleri mobil deneyime taşıyan, mevcut sistemlerle veri paylaşan uygulamalar.",
    examples: ["Müşteri ve üyelik uygulaması", "Sipariş ve saha operasyonu", "Rezervasyon ve bildirim", "E-ticaret yardımcı uygulaması"],
    quote: "mobil",
  },
  {
    number: "02",
    title: "Sektörel yazılım",
    text: "Genel amaçlı paketlerin karşılamadığı iş kurallarını, rolleri ve kayıt akışlarını sektöre uygun yönetim ekranlarında birleştiren çözümler.",
    examples: ["Rezervasyon ve kapasite", "Servis ve iş emri", "Teklif ve onay akışları", "Üyelik ve saha takibi"],
    quote: "sektorel",
  },
];

const decisions = [
  ["Kullanıcı", "Müşteri, bayi, saha ekibi, yönetici veya birden fazla rol mü kullanacak?"],
  ["Temel görev", "Kullanıcının en sık ve en kritik tamamlayacağı işlem nedir?"],
  ["Bağlantılar", "E-ticaret, ERP, ödeme, harita, bildirim veya üçüncü taraf API gerekli mi?"],
  ["Çevrimdışı kullanım", "Bağlantı olmadığında hangi verinin görülmesi veya kaydedilmesi gerekiyor?"],
  ["Cihaz yetenekleri", "Kamera, konum, bildirim, biyometri veya dosya erişimi gerçekten gerekli mi?"],
  ["Yayın modeli", "Web/PWA yeterli mi; yoksa mağaza dağıtımı ve cihaz özellikleri gerekiyor mu?"],
];

const lifecycle = [
  ["01", "Keşif", "Kullanıcı rolleri, iş adımları, mevcut veri ve başarı ölçütleri çıkarılır."],
  ["02", "Prototip", "Kritik ekranlar ve görev akışı, geliştirme başlamadan incelenebilir hâle getirilir."],
  ["03", "Entegrasyon", "Veri sahipliği, API yetkisi, hata yönetimi ve senkronizasyon kuralları doğrulanır."],
  ["04", "Yayın", "Test, mağaza veya web dağıtımı, sürüm ve geri dönüş yaklaşımı kapsamla birlikte planlanır."],
  ["05", "Yaşam döngüsü", "İşletim sistemi, sağlayıcı API’si, güvenlik ve ürün ihtiyaçları değiştikçe bakım ayrıca yürütülür."],
];

const boundaries = [
  ["Hazır ürün varsayımı", "Bu sayfadaki örnekler, her modülün bugün hazır veya her projeye dahil olduğu anlamına gelmez."],
  ["Mağaza onayı", "Apple App Store veya Google Play değerlendirmesi üçüncü taraf kurallarına bağlıdır; yayın onayı garanti edilemez."],
  ["Cihaz ve sürüm", "Desteklenecek cihaz, tarayıcı ve işletim sistemi sürümleri proje kapsamında açıkça belirlenir."],
  ["Hukuk ve içerik", "Gizlilik metni, izin gerekçesi, ticari içerik ve sektörel mevzuat müşteri tarafından yetkili uzmanlarla doğrulanır."],
];

export default function MobileVerticalPage() {
  return (
    <main className="catalog-page mobile-vertical-page">
      <a className="skip-link" href="#cozum-aileleri">Çözüm ailelerine geç</a>
      <header className="catalog-header">
        <SiteBrand />
        <nav aria-label="Sayfa menüsü"><Link href="/yazilimlar">Yazılımlar</Link><Link className="active" href="/mobil-sektorel">Mobil & Sektörel</Link><Link href="/entegrasyonlar">Entegrasyonlar</Link><Link href="/platform">Platform</Link><Link href="/proje-sureci">Proje Süreci</Link></nav>
        <HeaderCtaCluster><Link className="header-cta" href="/teklif?cozum=mobil">Çözümü konuşun</Link></HeaderCtaCluster>
      </header>

      <section className="catalog-hero mobile-vertical-hero">
        <div><span className="kicker kicker-light">MOBİL & SEKTÖREL ÇÖZÜMLER</span><h1>İş akışınızı<br /><em>doğru ekrana taşıyın.</em></h1></div>
        <p>Hazır bir uygulama kalıbından önce kullanıcıyı, kritik görevi ve veri akışını belirleyin; mobil veya sektörel çözümü gerçek ihtiyaca göre kapsamlandırın.</p>
      </section>

      <aside className="mobile-vertical-disclosure"><strong>Kapsam notu</strong><p>Bu sayfa ürün ve proje seçeneklerini açıklar; hazır modül, mağaza onayı, belirli entegrasyon veya teslim süresi taahhüdü değildir. Kesin kapsam teknik keşif ve teklif sonrasında belirlenir.</p></aside>

      <section className="solution-families" id="cozum-aileleri">
        <div><span className="kicker">İKİ ÇÖZÜM AİLESİ</span><h2>Aynı amaç değil,<br />doğru problem türü.</h2><p>Mobil uygulama erişim biçimini; sektörel yazılım ise işletmenize özgü süreç ve kayıt modelini önceliklendirir. Gerektiğinde aynı proje içinde birlikte çalışabilirler.</p></div>
        <div>{solutionFamilies.map((solution) => <article id={solution.quote} key={solution.number}><span>{solution.number}</span><h2>{solution.title}</h2><p>{solution.text}</p><ul>{solution.examples.map((item) => <li key={item}><span>✓</span>{item}</li>)}</ul><Link href={`/teklif?cozum=${solution.quote}`}>Bu çözümü konuşun</Link></article>)}</div>
      </section>

      <section className="mobile-decisions">
        <div><span className="kicker kicker-light">TEKNOLOJİDEN ÖNCE</span><h2>Altı ürün kararı.</h2><p>“Mobil uygulama istiyorum” başlangıçtır. Doğru mimari, kullanıcı görevi ve operasyon sınırı netleştirildikten sonra seçilir.</p></div>
        <div>{decisions.map(([title, text]) => <article key={title}><strong>{title}</strong><span>{text}</span></article>)}</div>
      </section>

      <section className="mobile-lifecycle">
        <div><span className="kicker">ÜRÜN YAŞAM DÖNGÜSÜ</span><h2>Yayın, projenin<br />son adımı değildir.</h2></div>
        <div>{lifecycle.map(([number, title, text]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
      </section>

      <section className="mobile-platform-link">
        <div><span className="kicker kicker-light">ORTAK OMURGA</span><h2>Ürünü tek başına değil,<br />yaşam döngüsüyle planlayın.</h2><p>Uygun projelerde müşteri, ürün, plan, modül ve lisans ilişkisi merkezi platforma bağlanabilir. Bu bağlantı ürünün teknik entegrasyonuna ve sözleşme kapsamına bağlıdır.</p></div>
        <div className="architecture-flow"><span>Mobil / sektörel ürün</span><strong>AVCI PLATFORM</strong><span>Lisans · Sürüm · Operasyon</span></div>
      </section>

      <section className="mobile-boundaries">
        <div><span className="kicker">SORUMLULUK SINIRLARI</span><h2>Bağımlılıkları<br />başlangıçta görün.</h2></div>
        <div>{boundaries.map(([title, text], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
      </section>

      <section className="decision-cta"><span className="kicker">İLK ÜRÜN HARİTASI</span><h2>Kullanıcıyı, görevi ve gerekli bağlantıları birlikte çıkaralım.</h2><p>Mobil deneyim veya sektörel süreç ihtiyacınızı anlatın; uygulanabilir ilk kapsamı ve sonraki fazları ayıralım.</p><div><Link className="button button-primary" href="/teklif?cozum=mobil">Mobil uygulamayı konuşun</Link><Link className="button button-ghost" href="/teklif?cozum=sektorel">Sektörel yazılımı konuşun</Link><Link className="button button-ghost" href="/proje-sureci">Proje sürecini inceleyin</Link></div></section>
    </main>
  );
}
