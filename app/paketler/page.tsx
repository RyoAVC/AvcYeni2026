import type { Metadata } from "next";
import Link from "next/link";
import { HeaderCtaCluster } from "../header-cta-cluster";
import { SiteBrand } from "../site-brand";
import { ECOSYSTEM_LAYERS } from "../ecosystem-options";
import {
  PACKAGE_PRICE_DISCLOSURE,
  PACKAGE_SCOPE_COMPARISON_ROWS,
  PACKAGE_SCOPE_DETAILS,
  packageScopeTitle,
} from "../package-scope-details";
import { getPackageName, type PackageId } from "../package-options";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "E-Ticaret Paketleri | Avcı E-Ticaret",
  description: "Start, Scale ve Enterprise e-ticaret paketlerini özellik, destek ve ticari model açısından karşılaştırın.",
  alternates: { canonical: "/paketler" },
};

const rows = [
  ["Web mağazası ve katalog", "Başlangıç kapsamı", "Genişletilmiş", "Kuruma özel"],
  ["Sipariş ve müşteri operasyonu", "Temel akış", "Gelişmiş akış", "Kuruma özel"],
  ["Ödeme ve kargo bağlantıları", "Seçilen sağlayıcılar", "Çoklu bağlantı", "Kuruma özel"],
  ["Pazaryeri ve satış kanalları", "Ek modül", "İhtiyaca göre", "Çoklu operasyon"],
  ["B2B satış araçları", "Ek modül", "Dahil", "Kuruma özel"],
  ["AI modülleri", "İsteğe bağlı", "İsteğe bağlı", "Kuruma özel"],
  ["Raporlama", "Temel", "Gelişmiş", "Özel paneller"],
  ["Entegrasyon kapsamı", "Standart", "Genişletilmiş", "Özel API"],
  ["Destek modeli", "Standart", "Öncelikli", "Özel hizmet seviyesi"],
];

const packages = [
  { id: "start", label: "HIZLI BAŞLANGIÇ", text: "Kendi web mağazasıyla dijital satışa kontrollü bir başlangıç yapmak isteyen işletmeler için.", features: ["Mağaza ve katalog başlangıç yapısı", "Temel sipariş ve müşteri akışı", "Seçilen ödeme ve kargo bağlantıları"] },
  { id: "scale", label: "BÜYÜME ODAĞI", text: "Kataloğunu, satış kanallarını ve günlük operasyonunu genişleten markalar için.", features: ["Gelişmiş katalog ve kampanya araçları", "İhtiyaca göre çoklu satış kanalı", "Gelişmiş raporlama ve otomasyon"], featured: true },
  { id: "enterprise", label: "KURUMA ÖZEL", text: "Özel süreçleri, yüksek hacmi ve birden çok ekip veya satış kanalı olan şirketler için.", features: ["Kuruma özel ticaret ve rol akışları", "Kurumsal API ve veri bağlantıları", "Özel destek ve operasyon modeli"] },
] satisfies ReadonlyArray<{
  id: PackageId;
  label: string;
  text: string;
  features: ReadonlyArray<string>;
  featured?: boolean;
}>;

const scopeById = Object.fromEntries(PACKAGE_SCOPE_DETAILS.map((item) => [item.id, item]));

export default function PackagesPage() {
  return (
    <main className="catalog-page package-page">
      <a className="skip-link" href="#karsilastirma">Karşılaştırmaya geç</a>
      <header className="catalog-header">
        <SiteBrand />
        <nav aria-label="Sayfa menüsü"><Link href="/eticaret-altyapisi">E-Ticaret</Link><Link href="/yazilimlar">Yazılımlar</Link><Link className="active" href="/paketler">Paketler</Link><Link href="/fiyatlandirma">Fiyatlandırma</Link><Link href="/entegrasyonlar">Entegrasyonlar</Link><Link href="/hizmetler">Hizmetler</Link></nav>
        <HeaderCtaCluster><Link className="header-cta" href="/teklif?cozum=eticaret">Mağaza kapsamı isteyin</Link></HeaderCtaCluster>
      </header>

      <section className="catalog-hero package-hero">
        <div><span className="kicker kicker-light">ESNEK TİCARİ MODEL</span><h1>İhtiyacınız kadar başlayın.<br /><em>Büyüdükçe geliştirin.</em></h1></div>
        <p>Mağaza çekirdeği, kurulum, entegrasyon, özel geliştirme, destek ve isteğe bağlı modüller işletmenizin kapsamına göre ayrı ve şeffaf biçimde planlanır.</p>
      </section>

      <section className="package-detail-grid">
        {packages.map((item) => {
          const scope = scopeById[item.id];
          return (
            <article className={item.featured ? "featured" : ""} id={item.id} key={item.id}>
              {item.featured && <b>KAPSAMI GENİŞ</b>}
              <small>{item.label}</small>
              <h2>{getPackageName(item.id)}</h2>
              {scope && (
                <div className="package-scope-price">
                  <span className="package-scope-list">{scope.listPrice}</span>
                  <strong>{scope.salePrice}</strong>
                  <small>örnek band</small>
                </div>
              )}
              <p>{item.text}</p>
              <ul>{item.features.map((feature) => <li key={feature}><span>✓</span>{feature}</li>)}</ul>
              <Link href={`/teklif?cozum=eticaret&paket=${item.id}`}>Kapsamı birlikte belirleyin</Link>
            </article>
          );
        })}
      </section>

      <section className="package-journey" aria-labelledby="paket-yolculugu">
        <div className="section-heading"><div><span className="kicker">MÜŞTERİ YOLCULUĞU</span><h2 id="paket-yolculugu">Paketten doğru<br />çözüm katmanına.</h2></div><p>Önce AVC E-Ticaret çekirdeğini seçeriz. İş ihtiyacı doğrulanırsa özel geliştirme veya görünürlük desteğini ayrı kapsam olarak ekleriz.</p></div>
        <div>{ECOSYSTEM_LAYERS.map((layer, index) => <article key={layer.id}><span>0{index + 1}</span><small>{layer.label}</small><h3>{layer.name}</h3><p>{layer.focus}</p></article>)}</div>
        <aside><strong>Şeffaf kapsam</strong><p>Adana360 ve SEOEksper, AVC paketine otomatik dahil veya teknik olarak bağlı hizmetler değildir. İhtiyaç, sorumluluk ve ticari model teklif aşamasında ayrı değerlendirilir.</p></aside>
      </section>

      <section className="comparison-section" id="karsilastirma">
        <div className="section-heading"><div><span className="kicker">KARŞILAŞTIRMA</span><h2>Üç başlangıç noktası.<br />Tek, genişleyebilir altyapı.</h2></div><p>Tablo standart yaklaşımı gösterir. Kesin kapsam, iş analizi sonrasında hazırlanacak teklifte netleşir.</p></div>
        <div className="comparison-wrap"><table><caption className="visually-hidden">Start, Scale ve Enterprise paket kapsamlarının karşılaştırması</caption><thead><tr><th scope="col">Kapsam</th><th scope="col">Start</th><th scope="col">Scale</th><th scope="col">Enterprise</th></tr></thead><tbody>{rows.map(([name, start, scale, enterprise]) => <tr key={name}><th scope="row">{name}</th><td>{start}</td><td>{scale}</td><td>{enterprise}</td></tr>)}</tbody></table></div>
      </section>

      <section className="package-scope-section" id="kapsam-detayi" aria-labelledby="kapsam-detay-baslik">
        <div className="section-heading">
          <div>
            <span className="kicker">DETAYLI KAPSAM</span>
            <h2 id="kapsam-detay-baslik">Her pakette neler<br />planlanır?</h2>
          </div>
          <p>
            Start, Scale ve Enterprise için özellik özeti ve örnek fiyat bandı.
            Tam liste ve kesin tutar, iş analiziniz sonrasında teklifte netleşir.
          </p>
        </div>

        <aside className="package-scope-disclosure" role="note">
          <strong>Örnek fiyat bandı</strong>
          <p>{PACKAGE_PRICE_DISCLOSURE}</p>
        </aside>

        <div className="package-scope-grid">
          {PACKAGE_SCOPE_DETAILS.map((item) => (
            <article className={item.featured ? "featured" : ""} id={`kapsam-${item.id}`} key={item.id}>
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
                {item.features.map((feature) => (
                  <li key={feature}><span>✓</span>{feature}</li>
                ))}
              </ul>
              <Link href={`/teklif?cozum=eticaret&paket=${item.id}`}>
                Bu kapsam için teklif isteyin
              </Link>
            </article>
          ))}
        </div>

        <div className="package-scope-compare">
          <div className="section-heading">
            <div>
              <span className="kicker">KAPASİTE FARKLARI</span>
              <h3>Start · Scale · Enterprise</h3>
            </div>
            <p>Öne çıkan kapasite ve kanal satırları. Opsiyonel maddeler teklifte ayrıca yazılmadıkça dahil sayılmaz.</p>
          </div>
          <div className="comparison-wrap">
            <table>
              <caption className="visually-hidden">Start, Scale ve Enterprise paketlerinin seçilmiş karşılaştırma satırları</caption>
              <thead>
                <tr>
                  <th scope="col">Kapsam</th>
                  <th scope="col">Start</th>
                  <th scope="col">Scale</th>
                  <th scope="col">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {PACKAGE_SCOPE_COMPARISON_ROWS.map(([name, start, scale, enterprise]) => (
                  <tr key={name}>
                    <th scope="row">{name}</th>
                    <td>{start}</td>
                    <td>{scale}</td>
                    <td>{enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="commercial-models"><div><span className="kicker">SATIŞ MODELLERİ</span><h2>Abonelikten fazlası.</h2></div><div>{["Aylık lisans", "Yıllık lisans", "Tek seferlik proje", "Özel teklif", "Modül aboneliği", "Kullanım bazlı ek hizmet"].map((model, index) => <article key={model}><span>0{index + 1}</span><strong>{model}</strong></article>)}</div></section>

      <aside className="scope-note"><strong>Paket sınırı</strong><p>Paket adları bir başlangıç çerçevesidir. Ödeme, kargo, pazaryeri, B2B, mobil uygulama, ERP veya AI modülü yalnızca teklifte açıkça adı ve kapsamı yazıldığında dahil kabul edilir. Örnek fiyat bandı güncel teklif taahhüdü değildir.</p></aside>

      <section className="decision-cta"><span className="kicker">NET BİR TEKLİF</span><h2>Fiyatı değil, doğru kapsamı konuşarak başlayalım.</h2><p>İhtiyacınız olmayan modüllerle başlamazsınız; mağaza ve operasyon altyapınız işiniz büyüdükçe genişler.</p><div><Link className="button button-primary" href="/teklif?cozum=eticaret">Mağaza kapsamı isteyin</Link><Link className="button button-ghost" href="/eticaret-altyapisi">E-ticaret altyapısını inceleyin</Link><Link className="button button-ghost" href="/fiyatlandirma">Fiyatın nasıl oluştuğunu görün</Link></div></section>
    </main>
  );
}
