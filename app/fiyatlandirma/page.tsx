import type { Metadata } from "next";
import Link from "next/link";
import { HeaderCtaCluster } from "../header-cta-cluster";
import { SiteBrand } from "../site-brand";
import { ECOSYSTEM_LAYERS } from "../ecosystem-options";
import {
  PACKAGE_PRICE_DISCLOSURE,
  PACKAGE_SCOPE_DETAILS,
  packageScopeTitle,
} from "../package-scope-details";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Fiyatlandırma ve Teklif Yapısı | Avcı E-Ticaret",
  description: "E-ticaret lisansı, kurulum, entegrasyon, özel geliştirme, destek ve AI kullanım maliyetlerinin teklifte nasıl ayrıldığını inceleyin.",
  alternates: { canonical: "/fiyatlandirma" },
};

const costLayers = [
  { number: "01", title: "Ticaret ürünü ve lisans", text: "Seçilen mağaza çekirdeği, plan, satış kanalı, modül ve kullanım dönemi.", details: ["Mağaza, katalog ve sipariş kapsamı", "Aylık, yıllık veya tek seferlik model", "Kullanıcı, kanal veya modül sınırı"] },
  { number: "02", title: "Kurulum ve geçiş", text: "Altyapının işletmeye hazırlanması ve mevcut verinin taşınması.", details: ["Temel yapılandırma", "Tema ve içerik yerleşimi", "Veri analizi, eşleme ve aktarım"] },
  { number: "03", title: "Entegrasyon", text: "Dış sistemlerin güncel teknik sözleşmesine göre kurulan bağlantılar.", details: ["Ödeme, kargo ve pazaryeri", "Muhasebe veya ERP", "Özel API ve veri akışları"] },
  { number: "04", title: "Özel geliştirme", text: "Standart kapsamın dışında işletmeye özgü ekran ve iş kuralları.", details: ["Özel modül veya iş akışı", "Laravel odaklı proje kapsamı gerektiğinde", "Ek test ve kabul kapsamı"] },
  { number: "05", title: "İçerik ve görünürlük", text: "Mağaza çekirdeğinden ayrı planlanan WordPress, SEO ve içerik desteği ihtiyaçları.", details: ["Teknik SEO ve içerik planı", "WordPress odaklı çalışma gerektiğinde", "Ölçüm ve yayın kapsamı"] },
  { number: "06", title: "Sürekli hizmetler", text: "Yayından sonra devam eden kullanım ve hizmet kalemleri.", details: ["Bakım ve destek modeli", "Hosting ve yenilemeler", "AI kotası, aboneliği veya ek kredi"] },
];

const quoteRows = [
  ["Ürün / plan", "Seçilen temel ürün ve dahil modüller", "Lisans veya proje", "Aylık, yıllık ya da tek seferlik"],
  ["Kurulum", "Tanımlı başlangıç yapılandırması", "Proje", "Genellikle tek seferlik"],
  ["Entegrasyon", "Sağlayıcı ve veri yönü bazında bağlantı", "Bağlantı", "Kurulum + varsa devamlı hizmet"],
  ["Veri geçişi", "Kaynak, kayıt hacmi ve dönüşüm kuralı", "Kapsam", "Tek seferlik"],
  ["Özel geliştirme", "Kabul kriteri belirlenmiş ek işlev", "İş paketi", "Tek seferlik veya aşamalı"],
  ["İçerik / SEO", "Onaylanmış içerik, WordPress veya görünürlük çalışması", "Hizmet kapsamı", "Tek seferlik veya dönemsel"],
  ["Destek / bakım", "Kanal, öncelik, süre ve dahil iş türleri", "Hizmet dönemi", "Aylık veya yıllık"],
  ["AI kullanımı", "Modül, sağlayıcı, kota ve aşım kuralı", "Kullanım", "Abonelik, kredi veya kurumsal model"],
];

const boundaries = {
  included: ["Teklifte adı ve kapsamı yazan ürün/modüller", "Kararlaştırılan kurulum ve yapılandırma", "Belirtilen entegrasyon ve veri yönleri", "Tanımlı test ve kabul adımları", "Sözleşmede yer alan destek seviyesi"],
  separate: ["Üçüncü taraf sağlayıcı ücretleri", "Ödeme kuruluşu ve pazaryeri komisyonları", "Kapsam dışı içerik/veri düzenleme", "Sonradan istenen yeni modül veya entegrasyon", "Müşterinin ticari, hukuki ve operasyonel işleri"],
};

export default function PricingPage() {
  return (
    <main className="catalog-page pricing-page">
      <a className="skip-link" href="#maliyet-kalemleri">Maliyet kalemlerine geç</a>
      <header className="catalog-header">
        <SiteBrand />
        <nav aria-label="Sayfa menüsü"><Link href="/eticaret-altyapisi">E-Ticaret</Link><Link href="/yazilimlar">Yazılımlar</Link><Link href="/paketler">Paketler</Link><Link className="active" href="/fiyatlandirma">Fiyatlandırma</Link><Link href="/hizmetler">Hizmetler</Link><Link href="/kaynaklar">Kaynaklar</Link></nav>
        <HeaderCtaCluster><Link className="header-cta" href="/teklif?cozum=eticaret">Mağaza kapsamı isteyin</Link></HeaderCtaCluster>
      </header>

      <section className="catalog-hero pricing-hero">
        <div><span className="kicker kicker-light">ŞEFFAF FİYATLANDIRMA</span><h1>Tek rakam değil.<br /><em>Açıklanmış kapsam.</em></h1></div>
        <p>Kurulum, lisans, entegrasyon, özel geliştirme, destek ve AI kullanımı aynı kalem değildir. Teklifte her birini ayrı göstererek neye ödeme yaptığınızı açıklarız.</p>
      </section>

      <aside className="pricing-disclosure"><strong>Neden sabit rakam yok?</strong><p>Aynı paket; veri geçişi, bağlantı sayısı, özel iş kuralları ve hizmet seviyesi değiştiğinde farklı emek ve devamlı maliyet üretir. İhtiyacınız olmayan işleri fiyata gizlememek için kesin tutar doğrulanmış kapsamdan sonra verilir.</p></aside>

      <section className="package-scope-section pricing-bands" id="ornek-band" aria-labelledby="ornek-band-baslik">
        <div className="section-heading">
          <div>
            <span className="kicker">ÖRNEK FİYAT BANDI</span>
            <h2 id="ornek-band-baslik">Başlangıç çerçeveleri.<br />Kesin tutar teklifte.</h2>
          </div>
          <p>
            Start, Scale ve Enterprise için örnek satış bandı. Kurulum, entegrasyon ve özel iş bu rakama otomatik dahil değildir.
          </p>
        </div>
        <aside className="package-scope-disclosure" role="note">
          <strong>Örnek fiyat bandı</strong>
          <p>{PACKAGE_PRICE_DISCLOSURE}</p>
        </aside>
        <div className="package-scope-grid">
          {PACKAGE_SCOPE_DETAILS.map((item) => (
            <article className={item.featured ? "featured" : ""} key={item.id}>
              {item.featured && <b>KAPSAMI GENİŞ</b>}
              <small>{item.label}</small>
              <h3>{packageScopeTitle(item.id)}</h3>
              <div className="package-scope-price">
                <span className="package-scope-list">{item.listPrice}</span>
                <strong>{item.salePrice}</strong>
                <small>örnek band</small>
              </div>
              <p>{item.summary}</p>
              <ul>
                <li><span>✓</span>{item.traffic} trafik kapasitesi</li>
                <li><span>✓</span>{item.emailAccounts} e-posta hesabı</li>
              </ul>
              <Link href={`/paketler#kapsam-${item.id}`}>Pakette neler planlanır</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="cost-layers" id="maliyet-kalemleri">
        <div><span className="kicker">MALİYETİ OLUŞTURAN KATMANLAR</span><h2>Fiyat nereden<br />oluşur?</h2><p>Teklifinizde yalnızca projeniz için geçerli katmanlar yer alır. Her kalemin kapsamı ve ödeme dönemi ayrıca belirtilir.</p></div>
        <div>{costLayers.map((layer) => <article key={layer.number}><header><span>{layer.number}</span><h3>{layer.title}</h3></header><p>{layer.text}</p><ul>{layer.details.map((detail) => <li key={detail}><span>✓</span>{detail}</li>)}</ul></article>)}</div>
      </section>

      <section className="quote-anatomy">
        <div className="section-heading"><div><span className="kicker">TEKLİF ANATOMİSİ</span><h2>Her kalem dört soruya<br />yanıt vermeli.</h2></div><p>Nedir, neleri kapsar, nasıl ölçülür ve hangi dönemde ücretlendirilir?</p></div>
        <div className="comparison-wrap"><table><caption className="visually-hidden">E-ticaret projesi maliyet kalemlerinin kapsam ve ücretlendirme karşılaştırması</caption><thead><tr><th scope="col">Kalem</th><th scope="col">Kapsam açıklaması</th><th scope="col">Ölçü</th><th scope="col">Ücretlendirme</th></tr></thead><tbody>{quoteRows.map(([item, scope, unit, billing]) => <tr key={item}><th scope="row">{item}</th><td>{scope}</td><td>{unit}</td><td>{billing}</td></tr>)}</tbody></table></div>
      </section>

      <section className="pricing-ecosystem" aria-labelledby="ekosistem-teklif">
        <div><span className="kicker">TEKLİFTE EKOSİSTEM SINIRI</span><h2 id="ekosistem-teklif">Tek teklif.<br /><em>Ayrı sorumluluklar.</em></h2><p>Her katman, ihtiyacın sahibi ve teslim ölçütüyle birlikte ayrı kalem olarak gösterilir.</p></div>
        <div>{ECOSYSTEM_LAYERS.map((layer, index) => <article key={layer.id}><span>0{index + 1}</span><small>{layer.label}</small><h3>{layer.name}</h3><p>{layer.focus}</p></article>)}</div>
        <aside>Bu görünüm teknik entegrasyon, ortak kullanıcı hesabı veya veri paylaşımı vaadi değildir. Uygulanacak çalışma, tarafı ve sınırı teklif ile netleşir.</aside>
      </section>

      <section className="included-scope">
        <div><span className="kicker kicker-light">KAPSAM SINIRI</span><h2>Dahil olan ile ayrı<br />ücretlenen iş karışmasın.</h2></div>
        <div className="scope-columns"><article><small>TEKLİFTE TANIMLANDIĞINDA DAHİL</small><ul>{boundaries.included.map((item) => <li key={item}><span>✓</span>{item}</li>)}</ul></article><article><small>AKSİ YAZILMADIKÇA AYRI KAPSAM</small><ul>{boundaries.separate.map((item) => <li key={item}>{item}</li>)}</ul></article></div>
      </section>

      <section className="pricing-path">
        <div><span className="kicker">FİYATA GİDEN YOL</span><h2>Belirsiz talebi<br />net teklife çevirin.</h2></div>
        <div>{[
          ["01", "Kısa ihtiyaç görüşmesi", "İş modeli, hedef ve öncelikli sorun anlaşılır."],
          ["02", "Kapsam doğrulama", "Ürün, veri, entegrasyon ve özel iş kuralları ayrılır."],
          ["03", "Kalemli teklif", "Dahil/hariç sınırı, varsayım, takvim ve ticari model yazılır."],
          ["04", "Onay ve başlangıç", "Kabul ölçütleri ve sorumluluklar netleştikten sonra çalışma başlar."],
        ].map(([number, title, text]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
      </section>

      <aside className="scope-note"><strong>Ticari not</strong><p>Vergiler, teklif geçerlilik süresi, ödeme planı, üçüncü taraf ücretleri ve yenileme koşulları kesin teklifte ayrıca belirtilir. Bu sayfa fiyat taahhüdü veya sözleşme yerine geçmez.</p></aside>

      <section className="decision-cta"><span className="kicker">KALEMLİ TEKLİF İSTEYİN</span><h2>İhtiyacınızı anlatın; maliyeti görünür kalemlere ayıralım.</h2><p>Önce doğru kapsamı belirleyip ürün, proje ve devamlı hizmet maliyetlerini ayrı sunalım.</p><div><Link className="button button-primary" href="/teklif?cozum=eticaret">Mağaza kapsamı isteyin</Link><Link className="button button-ghost" href="/paketler">Paketleri karşılaştırın</Link></div></section>
    </main>
  );
}
