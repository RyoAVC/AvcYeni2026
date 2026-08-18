import type { Metadata } from "next";
import Link from "next/link";
import { HeaderCtaCluster } from "../header-cta-cluster";
import { SiteBrand } from "../site-brand";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bayi ve Çözüm Partneri Modeli | Avcı E-Ticaret",
  description: "AVC yazılım ürünleri için bayi, dijital ajans ve çözüm partneri iş birliği yaklaşımını, değerlendirme sürecini ve sorumluluk sınırlarını inceleyin.",
  alternates: { canonical: "/bayi-partner" },
};

const partnerModels = [
  { number: "01", title: "Satış yönlendirme", text: "Kendi müşteri ağındaki uygun ihtiyacı AVC’ye yönlendirmek ve satış sürecini tanımlı iletişim modeliyle takip etmek isteyen profesyoneller." },
  { number: "02", title: "Bayi modeli", text: "Belirlenen ürün ve kapsamları kendi müşteri ilişkisi içinde sunmak isteyen dijital ajans veya teknoloji firmaları." },
  { number: "03", title: "Çözüm partnerliği", text: "Analiz, içerik, kurulum veya sektörel uzmanlığını AVC ürün ve lisans altyapısıyla birlikte konumlandırmak isteyen ekipler." },
];

const responsibilities = {
  avc: ["Ürün, paket ve lisans kapsamını açık tanımlamak", "Kararlaştırılan teknik doküman ve tanıtım bilgisini sağlamak", "Lisans, güncelleme ve ürün güvenliği altyapısını işletmek", "Sözleşmedeki teknik destek ve eskalasyon sınırını uygulamak", "Ürün değişikliklerini belirlenen kanaldan bildirmek"],
  partner: ["Müşteri ihtiyacını ve iletişim iznini doğru aktarmak", "Onaylanmamış fiyat, özellik veya teslim sözü vermemek", "Kendi hizmeti ile AVC ürün kapsamını ayırmak", "Müşteri verisini yalnızca izin verilen amaçla işlemek", "Satış ve destek kayıtlarını kararlaştırılan süreçte tutmak"],
};

const evaluationSteps = [
  ["01", "Tanışma ve profil", "Hizmet alanı, müşteri profili, bölge ve beklenen iş birliği biçimi anlaşılır."],
  ["02", "Uyum değerlendirmesi", "Ürün bilgisi, satış yaklaşımı, teknik kapasite ve marka uyumu birlikte değerlendirilir."],
  ["03", "Yazılı ticari çerçeve", "Yetki, fiyatlama, komisyon, müşteri sahipliği, destek ve fesih koşulları sözleşmede netleştirilir."],
  ["04", "Kontrollü başlangıç", "Eğitim ve gerekli materyal sonrası ilk fırsat veya pilot müşteriyle süreç doğrulanır."],
];

export default function PartnerPage() {
  return (
    <main className="catalog-page partner-page">
      <a className="skip-link" href="#partner-modelleri">Partner modellerine geç</a>
      <header className="catalog-header">
        <SiteBrand />
        <nav aria-label="Sayfa menüsü"><Link href="/yazilimlar">Yazılımlar</Link><Link href="/hizmetler">Hizmetler</Link><Link href="/referanslar">Ekosistem</Link><Link className="active" href="/bayi-partner">Bayi & Partner</Link><Link href="/kaynaklar">Kaynaklar</Link></nav>
        <HeaderCtaCluster><Link className="header-cta" href="/teklif?cozum=partner">İş birliği başvurusu</Link></HeaderCtaCluster>
      </header>

      <section className="catalog-hero partner-hero">
        <div><span className="kicker kicker-light">BAYİ & ÇÖZÜM PARTNERİ</span><h1>Birlikte satıştan önce<br /><em>net sorumluluk.</em></h1></div>
        <p>AVC ürünlerini kendi müşteri ağına taşımak isteyen ajans, danışman ve teknoloji ekipleri için yetki, fiyat, destek ve müşteri ilişkisinin yazılı olarak ayrıldığı iş birliği yaklaşımı.</p>
      </section>

      <aside className="partner-disclosure"><strong>Ticari sınır</strong><p>Partnerlik otomatik onay, belirli komisyon, bölge münhasırlığı veya satış garantisi vermez. Tüm ticari hak ve sorumluluklar değerlendirme sonrasında imzalanacak ayrı sözleşmeyle geçerli olur.</p></aside>

      <section className="partner-models" id="partner-modelleri">
        <div><span className="kicker">İŞ BİRLİĞİ BİÇİMLERİ</span><h2>Tek tip kanal değil,<br />doğru çalışma modeli.</h2><p>Başlangıç modeli; müşteri ilişkisi, teknik kapasite, satış sorumluluğu ve verilecek hizmete göre belirlenir.</p></div>
        <div>{partnerModels.map((model) => <article key={model.number}><span>{model.number}</span><h3>{model.title}</h3><p>{model.text}</p></article>)}</div>
      </section>

      <section className="partner-responsibilities">
        <div><span className="kicker kicker-light">SORUMLULUK MATRİSİ</span><h2>Kim, hangi sözü<br />verebilir?</h2><p>Müşteriye tek sesle ama sınırları karıştırmadan hizmet vermek için ürün ve ilişki sorumluluğu başlangıçta ayrılır.</p></div>
        <div className="partner-columns"><article><small>AVC SORUMLULUĞU</small><ul>{responsibilities.avc.map((item) => <li key={item}><span>✓</span>{item}</li>)}</ul></article><article><small>PARTNER SORUMLULUĞU</small><ul>{responsibilities.partner.map((item) => <li key={item}>{item}</li>)}</ul></article></div>
      </section>

      <section className="partner-evaluation">
        <div><span className="kicker">DEĞERLENDİRME SÜRECİ</span><h2>Başvurudan kontrollü<br />başlangıca.</h2></div>
        <ol>{evaluationSteps.map(([number, title, text]) => <li key={number}><span>{number}</span><div><strong>{title}</strong><p>{text}</p></div></li>)}</ol>
      </section>

      <section className="partner-rules"><div><span className="kicker">YAZILI ÇERÇEVE</span><h2>Ticari model sözleşmede netleşir.</h2></div><div>{["Yetkili ürün ve müşteri segmenti", "Fiyatlama ve varsa komisyon yöntemi", "Teklif ve müşteri sahipliği", "Marka ve tanıtım kullanım kuralları", "Kurulum, destek ve eskalasyon sınırı", "Veri gizliliği ve kayıt sorumluluğu", "Ödeme, faturalama ve yenileme", "Süre, fesih ve devir koşulları"].map((item, index) => <span key={item}><small>{String(index + 1).padStart(2, "0")}</small>{item}</span>)}</div></section>

      <section className="decision-cta"><span className="kicker">İŞ BİRLİĞİNİZİ ANLATIN</span><h2>Müşteri ağınızı ve çalışma modelinizi birlikte değerlendirelim.</h2><p>Başvurunuz otomatik sözleşme oluşturmaz; uygunluk ve ticari çerçeve karşılıklı görüşmeyle netleşir.</p><div><Link className="button button-primary" href="/teklif?cozum=partner">Partner başvurusu yapın</Link><Link className="button button-ghost" href="/yazilimlar">Ürünleri inceleyin</Link></div></section>
    </main>
  );
}
