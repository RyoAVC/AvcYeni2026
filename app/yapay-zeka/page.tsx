import type { Metadata } from "next";
import Link from "next/link";
import { HeaderCtaCluster } from "../header-cta-cluster";
import { SiteBrand } from "../site-brand";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "E-Ticaret Yapay Zekâ Modülleri | Avcı E-Ticaret",
  description: "İçerik üretimi, müşteri deneyimi, pazarlama, tahminleme ve doğal dille raporlama için e-ticaret yapay zekâ modülleri.",
  alternates: { canonical: "/yapay-zeka" },
};

const moduleGroups = [
  { number: "01", title: "Ürün ve katalog", text: "Katalog hazırlığını hızlandıran ve ürün verisini zenginleştiren araçlar.", modules: ["Ürün açıklaması oluşturma", "SEO başlığı ve meta açıklaması", "Fotoğraf iyileştirme ve arka plan üretimi", "Otomatik kategori ve etiket önerileri", "Çoklu dil çevirisi"] },
  { number: "02", title: "Pazarlama ve büyüme", text: "Kampanya üretiminden geri kazanıma kadar pazarlama ekibine destek olan modüller.", modules: ["Kampanya metni oluşturma", "E-posta ve SMS içeriği hazırlama", "Terk edilmiş sepet geri kazanma önerileri", "Müşteri segmentasyonu"] },
  { number: "03", title: "Müşteri deneyimi", text: "Ziyaretçilerin doğru ürünü bulmasına ve daha hızlı destek almasına yardımcı olan deneyimler.", modules: ["Akıllı müşteri destek asistanı", "Ürün karşılaştırma ve öneri motoru", "Firmaya özel bilgiyle çalışan satış asistanı"] },
  { number: "04", title: "Karar ve operasyon", text: "Veriyi günlük kararlara dönüştüren analiz ve yönetim yardımcıları.", modules: ["Satış ve müşteri davranışı analizi", "Stok ve talep tahmini", "Yönetim panelinde AI yardımcısı", "Doğal dille raporlama"] },
];

const safeguards = [
  ["Veri sınırı", "Her modül yalnızca tanımlanan iş verisi ve izin verilen kaynaklarla çalışacak şekilde kurgulanır."],
  ["İnsan kontrolü", "Yayın, kampanya veya kritik karar adımlarında onay akışı korunabilir."],
  ["Ölçülebilir çıktı", "Modül; süre kazanımı, içerik üretimi veya dönüşüm gibi somut bir hedefe bağlanır."],
  ["Esnek kullanım", "AI kullanımı kota, abonelik, ek kredi veya kuruma özel çözüm olarak planlanabilir."],
];

export default function AiPage() {
  return (
    <main className="catalog-page ai-detail-page">
      <a className="skip-link" href="#moduller">AI modüllerine geç</a>
      <header className="catalog-header"><SiteBrand /><nav aria-label="Sayfa menüsü"><Link href="/eticaret-altyapisi">E-Ticaret</Link><Link href="/yazilimlar">Yazılımlar</Link><Link className="active" href="/yapay-zeka">Yapay Zekâ</Link><Link href="/entegrasyonlar">Entegrasyonlar</Link><Link href="/paketler">Paketler</Link></nav><HeaderCtaCluster><Link className="header-cta" href="/teklif?cozum=ai">AI modülü görüşmesi</Link></HeaderCtaCluster></header>

      <section className="catalog-hero ai-catalog-hero"><div><span className="kicker kicker-light">E-TİCARET İÇİN AVCI AI KATMANI</span><h1>Mağazanıza eklenen<br /><em>akıllı modüller.</em></h1></div><p>AVCI AI bağımsız bir model veya ayrı bir ana ürün değildir; AVC e-ticaret altyapısında katalog, satış, destek ve karar süreçleri için ihtiyaca göre etkinleştirilen modül/eklenti katmanıdır.</p><div className="ai-hero-orbit" aria-hidden="true"><i /><i /></div></section>

      <section className="ai-principle"><span>01</span><h2>Önce mağaza ve operasyon,<br />sonra doğru AI modülü.</h2><p>Örneğin peynir satan bir marka için AI; ürün açıklaması hazırlayabilir, müşterinin doğru ürünü bulmasına yardım edebilir veya stok talebini yorumlayabilir. Katalog, sipariş ve ödeme altyapısının yerini almaz; onunla birlikte çalışır.</p></section>

      <section className="ai-module-grid" id="moduller">{moduleGroups.map((group) => <article key={group.number}><header><span>{group.number}</span><div><h2>{group.title}</h2><p>{group.text}</p></div></header><ul>{group.modules.map((module) => <li key={module}><i aria-hidden="true"></i>{module}</li>)}</ul></article>)}</section>

      <section className="ai-safeguards"><div><span className="kicker kicker-light">UYGULAMA İLKELERİ</span><h2>Kontrollü, ölçülebilir<br />ve işinize özel.</h2><p>Modüllerin kapsamı, veri kaynakları ve kullanım maliyeti proje başında açıkça tanımlanır.</p></div><div>{safeguards.map(([title, text], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>

      <section className="ai-use-model"><div><span className="kicker">ESNEK KULLANIM</span><h2>İş yükünüze uyan ticari model.</h2></div><div className="model-pills"><span>Aylık kota</span><span>Abonelik</span><span>Ek kredi</span><span>Kurumsal özel çözüm</span></div><p>Kesin model, seçilen modülün işlem yoğunluğu ve veri ihtiyacı belirlendikten sonra tekliflendirilir.</p></section>

      <section className="decision-cta"><span className="kicker">DOĞRU BAŞLANGIÇ</span><h2>Mağazanızda hangi süreci hızlandırmak istersiniz?</h2><p>Önce e-ticaret akışınızı netleştirip içerik, satış, destek veya raporlama ihtiyacına uygun modülü seçelim. Tofy tanıtım asistanıdır; model satışı değildir.</p><div><Link className="button button-primary" href="/teklif?cozum=ai">Yapay zekâ modülü görüşmesi isteyin</Link><Link className="button button-ghost" href="/avcai">Tofy’ye sorun</Link></div></section>
    </main>
  );
}
