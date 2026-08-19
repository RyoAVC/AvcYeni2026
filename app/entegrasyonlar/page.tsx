import type { Metadata } from "next";
import Link from "next/link";
import { HeaderCtaCluster } from "../header-cta-cluster";
import { SiteBrand } from "../site-brand";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "E-Ticaret Entegrasyonları | Avcı E-Ticaret",
  description: "Pazaryeri, ödeme, kargo, muhasebe ve işletmenize özel API entegrasyonlarının kapsamını inceleyin.",
  alternates: { canonical: "/entegrasyonlar" },
};

const groups = [
  { number: "01", title: "Pazaryerleri", text: "Ürün, stok, fiyat ve sipariş verisinin satış kanallarıyla kontrollü akışı.", examples: ["Trendyol", "Hepsiburada", "N11", "Özel pazaryerleri"] },
  { number: "02", title: "Ödeme", text: "İş modeline uygun ödeme kuruluşları ve tahsilat senaryolarının mağazaya bağlanması.", examples: ["iyzico", "PayTR", "Banka sanal POS", "Özel tahsilat akışı"] },
  { number: "03", title: "Kargo", text: "Siparişten etikete, takip numarasından durum güncellemesine kadar gönderi akışı.", examples: ["Yurtiçi Kargo", "Aras Kargo", "Çoklu kargo kuralı", "Özel lojistik bağlantısı"] },
  { number: "04", title: "Muhasebe ve ERP", text: "Sipariş, cari, fatura, stok ve tahsilat verisinin işletme sistemleriyle eşleştirilmesi.", examples: ["Paraşüt", "ERP bağlantıları", "E-fatura akışları", "Özel API"] },
];

const steps = [
  ["01", "Sistemi doğrularız", "Kullandığınız ürünün sürümünü, API erişimini ve veri kapsamını inceleriz."],
  ["02", "Veri sözleşmesini kurarız", "Alan eşlemelerini, yetkileri, hata senaryolarını ve senkron yönünü netleştiririz."],
  ["03", "Kontrollü test ederiz", "Gerçek yayına geçmeden örnek veri ve güvenli test senaryolarıyla akışı doğrularız."],
  ["04", "İzler ve geliştiririz", "Hata kayıtları, tekrar deneme davranışı ve operasyon görünürlüğünü takip ederiz."],
];

export default function IntegrationsPage() {
  return (
    <main className="catalog-page integrations-page">
      <a className="skip-link" href="#baglantilar">Bağlantı türlerine geç</a>
      <header className="catalog-header"><SiteBrand /><nav aria-label="Sayfa menüsü"><Link href="/eticaret-altyapisi">E-Ticaret</Link><Link href="/yazilimlar">Yazılımlar</Link><Link href="/paketler">Paketler</Link><Link className="active" href="/entegrasyonlar">Entegrasyonlar</Link><Link href="/hizmetler">Hizmetler</Link></nav><HeaderCtaCluster><Link className="header-cta" href="/teklif?cozum=entegrasyon">Bağlantı analizi</Link></HeaderCtaCluster></header>

      <section className="catalog-hero integration-hero"><div><span className="kicker kicker-light">TİCARET ÇEKİRDEĞİNE BAĞLI AKIŞLAR</span><h1>Sistemleriniz konuşsun.<br /><em>Ekibiniz hızlansın.</em></h1></div><p>AVC mağazasındaki katalog ve sipariş akışını pazaryeri, ödeme, kargo ve muhasebe sistemleriyle güvenli ve izlenebilir biçimde bağlayın.</p></section>

      <section className="integration-groups" id="baglantilar">{groups.map((group) => <article key={group.number}><header><span>{group.number}</span><h2>{group.title}</h2></header><p>{group.text}</p><div>{group.examples.map((example) => <span key={example}>{example}</span>)}</div></article>)}</section>

      <section className="integration-contract"><div><span className="kicker kicker-light">GÜVENLİ SÖZLEŞME</span><h2>Bağlamak kadar,<br />doğru bağlamak önemli.</h2></div><div>{["Yetki ve erişim sınırları", "Alan ve veri eşlemeleri", "Hata ve tekrar deneme akışı", "Kayıt ve izlenebilirlik", "Sürüm değişikliği planı", "Canlıya geçiş kontrolü"].map((item) => <span key={item}>✓ {item}</span>)}</div></section>

      <section className="integration-process"><div className="section-heading"><div><span className="kicker">ENTEGRASYON SÜRECİ</span><h2>Varsayımla değil,<br />doğrulayarak ilerleriz.</h2></div><p>Her bağlantının API imkânı ve ticari koşulu farklıdır. Uygulanabilirliği proje başlangıcında doğrularız.</p></div><div>{steps.map(([number, title, text]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>

      <aside className="scope-note"><strong>Sistem sınırı</strong><p>Entegrasyonlar e-ticaret çekirdeğini genişletir; katalog, sipariş ve müşteri kayıtlarının hangi sistemde ana kayıt olduğu proje başında belirlenir. Dış sağlayıcı kesintisi, kota, API değişikliği ve erişim koşulları AVC mağaza çekirdeğinden ayrı bağımlılıklardır. AI bağlantıları da yalnızca açıkça kapsamlandırıldığında isteğe bağlı modül olarak ele alınır.</p></aside>

      <aside className="integration-disclaimer"><strong>Şeffaflık notu</strong><p>Bu sayfadaki marka adları bağlantı türlerini örneklemek için kullanılır; onaylı partnerlik veya her sürümle hazır uyumluluk iddiası değildir. Kesin kapsam, ilgili sağlayıcının güncel API ve erişim koşulları doğrulandıktan sonra belirlenir.</p></aside>

      <section className="decision-cta"><span className="kicker">BAĞLANTI ANALİZİ</span><h2>Kullandığınız sistemleri birlikte haritalayalım.</h2><p>Hangi verinin, ne sıklıkla ve hangi yönde akması gerektiğini netleştirip uygulanabilir entegrasyon planını çıkaralım.</p><div><Link className="button button-primary" href="/teklif?cozum=entegrasyon">Entegrasyon görüşmesi isteyin</Link><Link className="button button-ghost" href="/api-guvenlik">API güvenliğini inceleyin</Link><Link className="button button-ghost" href="/pazaryeri-kanallari">Pazaryeri kanallarını inceleyin</Link></div></section>
    </main>
  );
}
