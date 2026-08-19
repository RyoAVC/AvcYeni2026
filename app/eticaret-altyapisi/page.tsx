import type { Metadata } from "next";
import Link from "next/link";
import { HeaderCtaCluster } from "../header-cta-cluster";
import { SiteBrand } from "../site-brand";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "E-Ticaret Altyapısı | Avcı E-Ticaret",
  description: "Web mağazası, mobil uygulama, katalog, sipariş, ödeme, teslimat, müşteri ve operasyon süreçlerini kapsayan modüler AVC e-ticaret altyapısını inceleyin.",
  alternates: { canonical: "/eticaret-altyapisi" },
};

const capabilities = [
  { number: "01", title: "Ürün ve katalog", text: "Ürün, varyant, kategori, marka, görsel, fiyat ve içerik kayıtlarını ortak katalog yapısında yönetir.", tag: "Ürün · Varyant · Kategori" },
  { number: "02", title: "Fiyat ve kampanya", text: "Liste fiyatı, müşteri grubu, kupon, kampanya ve kanal bazlı ticari kuralları tanımlı kapsamda uygular.", tag: "Fiyat · Kupon · Kural" },
  { number: "03", title: "Sepet ve sipariş", text: "Sepetten siparişe, durum değişiminden iptal ve iadeye kadar satış yaşam döngüsünü izlenebilir tutar.", tag: "Sepet · Sipariş · İade" },
  { number: "04", title: "Ödeme ve tahsilat", text: "Seçilen ödeme sağlayıcılarını, ödeme sonuçlarını ve gerekli tahsilat kayıtlarını sipariş akışına bağlar.", tag: "Ödeme · Tahsilat" },
  { number: "05", title: "Teslimat ve kargo", text: "Adres, teslimat seçeneği, kargo bağlantısı ve gönderi durumlarını operasyon ihtiyacına göre planlar.", tag: "Adres · Kargo · Teslimat" },
  { number: "06", title: "Müşteri ve operasyon", text: "Müşteri kayıtları, roller, izinler, destek bağlamı ve yönetim görünümünü yetki sınırlarıyla birleştirir.", tag: "Müşteri · Rol · Yönetim" },
];

const orderLifecycle = [
  ["01", "Keşif", "Müşteri web mağazası veya mobil kanalda katalog, arama ve ürün detayını kullanır."],
  ["02", "Sepet", "Ürün, fiyat, kampanya, teslimat ve uygunluk kuralları sipariş öncesinde doğrulanır."],
  ["03", "Ödeme", "Seçilen sağlayıcının sonucu sipariş kaydıyla ilişkilendirilir; başarısız işlem tamamlanmış sayılmaz."],
  ["04", "Hazırlık", "Sipariş durumu, stok ve operasyon adımları tanımlı iş akışına göre ilerletilir."],
  ["05", "Teslimat", "Kargo veya teslimat kaydı müşteri ve operasyon görünümüne kontrollü biçimde yansıtılır."],
  ["06", "Satış sonrası", "İptal, iade, destek ve mutabakat adımları kayıt bütünlüğü korunarak yönetilir."],
];

const channelModels = [
  ["Web mağazası", "Markaya ait alan adı, mobil uyumlu vitrin, sepet ve ödeme deneyimi."],
  ["Mobil uygulama", "Sık kullanılan alışveriş ve müşteri işlemleri için API ile bağlı cihaz deneyimi."],
  ["B2B ve bayi", "Müşteri grubuna özel fiyat, vade, teklif, limit ve yetkilendirme akışları."],
  ["Pazaryeri ve e-ihracat", "Satıcı veya ülke bazlı kuralların ayrı kapsamlandırıldığı çok kanallı satış modeli."],
];

export default function CommerceInfrastructurePage() {
  return (
    <main className="catalog-page platform-page">
      <a className="skip-link" href="#ticaret-yetenekleri">E-ticaret yeteneklerine geç</a>
      <header className="catalog-header">
        <SiteBrand />
        <nav aria-label="Sayfa menüsü"><Link className="active" href="/eticaret-altyapisi">E-Ticaret</Link><Link href="/yazilimlar">Yazılımlar</Link><Link href="/platform">Platform</Link><Link href="/entegrasyonlar">Entegrasyonlar</Link><Link href="/paketler">Paketler</Link></nav>
        <HeaderCtaCluster><Link className="header-cta" href="/teklif?cozum=eticaret">E-ticaret görüşmesi</Link></HeaderCtaCluster>
      </header>

      <section className="catalog-hero platform-hero">
        <div><span className="kicker kicker-light">MODÜLER E-TİCARET ALTYAPISI</span><h1>Mağazadan teslimata.<br /><em>Tek ticaret sistemi.</em></h1></div>
        <p>Web mağazası ve mobil deneyimden katalog, sipariş, ödeme, teslimat ve müşteri operasyonuna kadar temel ticaret akışlarını aynı veri ve yetki omurgasında birleştirin.</p>
      </section>

      <section className="platform-map" aria-label="E-ticaret altyapısı mimarisi">
        <article><small>01 · DENEYİM</small><strong>Web & mobil mağaza</strong><span>Keşif · Sepet · Hesap</span></article>
        <article className="core"><small>02 · TİCARET ÇEKİRDEĞİ</small><strong>AVCI COMMERCE</strong><span>Katalog · Sipariş · Ödeme</span></article>
        <article><small>03 · OPERASYON</small><strong>Teslimat & satış sonrası</strong><span>Kargo · İade · Destek</span></article><i>↔</i>
        <article><small>04 · BAĞLANTILAR</small><strong>Modül & entegrasyonlar</strong><span>ERP · Pazaryeri · İsteğe bağlı AI</span></article>
      </section>

      <section className="platform-capabilities" id="ticaret-yetenekleri">
        <div><span className="kicker">TİCARET ÇEKİRDEĞİ</span><h2>Günlük mağaza işinin<br />ortak veri omurgası.</h2><p>Yetenekler mağazanın satış modeli, işlem hacmi, seçilen paket, üçüncü taraf bağlantıları ve sözleşme kapsamına göre etkinleştirilir.</p></div>
        <div>{capabilities.map((item) => <article key={item.number}><header><span>{item.number}</span><small>{item.tag}</small></header><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
      </section>

      <section className="platform-lifecycle">
        <div><span className="kicker">SİPARİŞ YAŞAM DÖNGÜSÜ</span><h2>Keşiften satış sonrasına<br />izlenebilir akış.</h2></div>
        <ol>{orderLifecycle.map(([number, title, text]) => <li key={number}><span>{number}</span><div><strong>{title}</strong><p>{text}</p></div></li>)}</ol>
      </section>

      <section className="platform-isolation">
        <div><span className="kicker kicker-light">SATIŞ KANALLARI</span><h2>Tek kalıp değil,<br />iş modeline uygun kanal.</h2><p>Her kanal aynı özellik setini kullanmak zorunda değildir. Deneyim, fiyat, rol ve entegrasyon kuralları ihtiyaca göre ayrılır.</p></div>
        <div>{channelModels.map(([title, text], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
      </section>

      <aside className="scope-note"><strong>Kapsam notu</strong><p>Bu sayfa AVC e-ticaret altyapısının çözüm mimarisini açıklar. Belirli bir ödeme, kargo, pazaryeri, ERP, mobil mağaza özelliği veya AI modülünün hazır ve otomatik olarak dahil olduğu anlamına gelmez. Kesin kapsam; teknik doğrulama, sağlayıcı koşulları, paket ve yazılı sözleşmeyle belirlenir.</p></aside>

      <section className="decision-cta"><span className="kicker">MAĞAZA KAPSAMI</span><h2>Önce satış modelinizi ve operasyonunuzu netleştirelim.</h2><p>Katalog, sipariş, ödeme, teslimat, kanal ve entegrasyon ihtiyaçlarınızı birlikte çıkarıp doğru altyapı kapsamına dönüştürelim.</p><div><Link className="button button-primary" href="/teklif?cozum=eticaret">E-ticaret görüşmesi isteyin</Link><Link className="button button-ghost" href="/vitrin-tasarim">Vitrin tasarımını inceleyin</Link><Link className="button button-ghost" href="/paketler">Paketleri karşılaştırın</Link></div></section>
    </main>
  );
}
