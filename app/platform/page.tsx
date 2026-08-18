import type { Metadata } from "next";
import Link from "next/link";
import { HeaderCtaCluster } from "../header-cta-cluster";
import { SiteBrand } from "../site-brand";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "E-Ticaret Altyapısı ve Merkezi Platform | Avcı E-Ticaret",
  description: "AVC web mağazası, mobil uygulama, katalog, sipariş, ödeme, müşteri, satış kanalı, entegrasyon ve operasyon süreçlerini birleştiren merkezi platformu inceleyin.",
  alternates: { canonical: "/platform" },
};

const capabilities = [
  { number: "01", title: "Mağaza ve katalog", text: "Ürün, varyant, kategori, fiyat, stok, kampanya ve içerik kayıtlarını satış kanalları için ortaklaştırır.", tag: "Ürün · Fiyat · Stok" },
  { number: "02", title: "Sipariş ve müşteri", text: "Sepet, sipariş, müşteri, adres, iade ve satış sonrası adımlarını izlenebilir bir akışta tutar.", tag: "Sipariş · CRM" },
  { number: "03", title: "Ödeme ve teslimat", text: "Ödeme sağlayıcısı, tahsilat, kargo, teslimat ve iade bağlantılarını mağaza operasyonuna bağlar.", tag: "Ödeme · Kargo" },
  { number: "04", title: "Çoklu satış kanalı", text: "Web, mobil, B2B, C2C, pazaryeri ve e-ihracat deneyimlerini ortak ticaret verisiyle besler.", tag: "Web · Mobil · Kanal" },
  { number: "05", title: "Modül ve entegrasyon", text: "ERP, muhasebe, pazaryeri ve isteğe bağlı AI eklentilerini tanımlı veri ve yetki sınırlarıyla çalıştırır.", tag: "API · Modül · Olay" },
  { number: "06", title: "Platform operasyonu", text: "Lisans, güncelleme, fatura, destek, audit, sistem sağlığı ve yedek bütünlüğünü yönetim katmanında toplar.", tag: "Lisans · Sağlık · Audit" },
];

const securityControls = [
  ["Ed25519 lisans imzası", "İstemci, imzayı doğrulamadan lisans cevabını güvenilir saymaz."],
  ["Fail-closed modül yetkisi", "Bilinmeyen veya açıkça verilmeyen modül erişime kapalı kalır."],
  ["SHA-256 + paket imzası", "Güncelleme dosyası yayın ve indirme anında bütünlük kontrollerinden geçer."],
  ["Tek kullanımlık indirme", "Dağıtım bağlantısı kısa ömürlüdür ve lisans/kurulum kapsamına bağlanır."],
  ["HMAC webhook", "Olay kimliği, imza, idempotency ve retry/backoff ile teslimat denetlenir."],
  ["Zincirli audit", "Kritik işlemler aktör, hedef ve sonuç bağlamıyla değişiklik izine yazılır."],
];

const lifecycle = [
  ["01", "Katalog", "Ürün, varyant, kategori, fiyat ve stok yapısı hazırlanır."],
  ["02", "Mağaza", "Web, mobil ve gerekli satış kanalları ortak ticaret çekirdeğine bağlanır."],
  ["03", "Sipariş", "Sepet, sipariş, müşteri ve satış sonrası kuralları işletilir."],
  ["04", "Ödeme ve teslimat", "Tahsilat, kargo, teslimat ve iade akışları doğrulanır."],
  ["05", "Modüller", "Entegrasyon ve isteğe bağlı AI eklentileri ihtiyaca göre etkinleştirilir."],
  ["06", "Operasyon", "Lisans, fatura, destek, güncelleme ve platform sağlığı izlenir."],
];

export default function PlatformPage() {
  return (
    <main className="catalog-page platform-page">
      <a className="skip-link" href="#platform-yetenekleri">Platform yeteneklerine geç</a>
      <header className="catalog-header">
        <SiteBrand />
        <nav aria-label="Sayfa menüsü"><Link className="active" href="/platform">Platform</Link><Link href="/yazilimlar">Yazılımlar</Link><Link href="/entegrasyonlar">Entegrasyonlar</Link><Link href="/musteri-merkezi">Müşteri Merkezi</Link><Link href="/kaynaklar">Kaynaklar</Link></nav>
        <HeaderCtaCluster><Link className="header-cta" href="/teklif?cozum=eticaret">Platform görüşmesi</Link></HeaderCtaCluster>
      </header>

      <section className="catalog-hero platform-hero">
        <div><span className="kicker kicker-light">MERKEZİ E-TİCARET & ÜRÜN OMURGASI</span><h1>Tüm satış kanalları.<br /><em>Tek ticaret merkezi.</em></h1></div>
        <p>Web mağazası, mobil uygulama, katalog, sipariş, ödeme, müşteri ve operasyon verisini; modül, entegrasyon ve güvenli platform hizmetleriyle birleştiren e-ticaret çekirdeği.</p>
      </section>

      <section className="platform-map" aria-label="Platform mimarisi">
        <article><small>01 · TALEP</small><strong>AVCI şirket sitesi</strong><span>Ürün keşfi ve teklif başvurusu</span></article>
        <article className="core"><small>02 · MERKEZ</small><strong>AVCI PLATFORM</strong><span>Mağaza · Katalog · Sipariş · Ödeme</span></article>
        <article><small>03 · KANALLAR</small><strong>Web, mobil, B2B & C2C</strong><span>Ortak veri ve modüler deneyim</span></article><i>↔</i>
        <article><small>04 · ERİŞİM</small><strong>Müşteri portalı</strong><span>Firma bazlı lisans ve fatura görünümü</span></article>
      </section>

      <section className="platform-capabilities" id="platform-yetenekleri">
        <div><span className="kicker">PLATFORM YETENEKLERİ</span><h2>Katalogdan teslimata<br />aynı ticaret zinciri.</h2><p>Her kanal, entegrasyon ve modül mağazanın iş modeli, müşteri rolü ve sözleşme kapsamına göre etkinleştirilir; tüm kurulumlarda otomatik olarak açık kabul edilmez.</p></div>
        <div>{capabilities.map((item) => <article key={item.number}><header><span>{item.number}</span><small>{item.tag}</small></header><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
      </section>

      <section className="platform-security">
        <div><span className="kicker kicker-light">GÜVENLİK SÖZLEŞMESİ</span><h2>Yetki varsayılmaz.<br />Doğrulanır.</h2><p>Lisans, modül ve paket erişimi yalnızca ad, plan veya arayüz durumuna bakılarak verilmez; imza ve kapsam kontrolleri birlikte uygulanır.</p></div>
        <div>{securityControls.map(([title, text], index) => <article key={title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
      </section>

      <section className="platform-lifecycle">
        <div><span className="kicker">ÜRÜN YAŞAM DÖNGÜSÜ</span><h2>Katalogdan yenilemeye<br />izlenebilir akış.</h2></div>
        <ol>{lifecycle.map(([number, title, text]) => <li key={number}><span>{number}</span><div><strong>{title}</strong><p>{text}</p></div></li>)}</ol>
      </section>

      <section className="platform-isolation">
        <div><span className="kicker kicker-light">İZOLASYON</span><h2>Bir ürünün kuralı<br />diğerine taşmaz.</h2><p>Ürün, müşteri ve rol sınırları ayrı doğrulanır. Yönetim görünümü ile müşteri portalı aynı veriye aynı yetkiyle erişmez.</p></div>
        <div>{[
          ["Ürün sınırı", "Plan, modül, sürüm ve paket kayıtları ürün kimliğiyle ayrılır."],
          ["Müşteri sınırı", "Portal sorguları oturumdaki müşteriye bağlı kayıtlarla sınırlandırılır."],
          ["Rol sınırı", "Kritik yönetim işlemleri kullanıcı rolü ve açık izinle kontrol edilir."],
          ["Gizli veri sınırı", "Ham lisans anahtarı, webhook sırrı ve özel imza anahtarı operasyon ekranlarında ifşa edilmez."],
        ].map(([title, text], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
      </section>

      <aside className="scope-note"><strong>Kapsam notu</strong><p>Platform yetenekleri ürünün teknik entegrasyonuna, müşteri sözleşmesine ve ortam yapılandırmasına bağlıdır. Bu sayfa herhangi bir özelliğin belirli bir müşteri kurulumunda otomatik olarak etkin olduğu anlamına gelmez.</p></aside>

      <section className="decision-cta"><span className="kicker">PLATFORM KAPSAMI</span><h2>Mağazanızı ve satış operasyonunuzu ortak ticaret omurgasına bağlayın.</h2><p>Katalog, sipariş, ödeme, kanal, entegrasyon ve gerekli modül kapsamını birlikte değerlendirelim.</p><div><Link className="button button-primary" href="/teklif?cozum=eticaret">E-ticaret görüşmesi isteyin</Link><Link className="button button-ghost" href="/musteri-merkezi">Müşteri merkezini inceleyin</Link></div></section>
    </main>
  );
}
