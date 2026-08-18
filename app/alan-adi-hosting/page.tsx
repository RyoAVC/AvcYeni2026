import type { Metadata } from "next";
import Link from "next/link";
import { HeaderCtaCluster } from "../header-cta-cluster";
import { SiteBrand } from "../site-brand";
import { DomainLookupForm } from "../domain-lookup-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Alan Adı, Hosting ve Yenileme Yönetimi | Avcı E-Ticaret",
  description: "Alan adı, DNS, SSL, hosting, yedekleme ve yenileme sorumluluklarını açık bir envanter ve devir planıyla yönetin.",
  alternates: { canonical: "/alan-adi-hosting" },
};

const layers = [
  { number: "01", title: "Alan adı", text: "Kayıt kuruluşu, hesap sahibi, yetkili e-posta ve bitiş tarihi tek envanterde tutulur." },
  { number: "02", title: "DNS ve SSL", text: "DNS kayıtlarının amacı, değişiklik yetkisi ve sertifika yenileme yöntemi açıkça belirlenir." },
  { number: "03", title: "Hosting", text: "Uygulama gereksinimine uygun kaynak, erişim sınırı ve izleme kapsamı tanımlanır." },
  { number: "04", title: "Yedekleme", text: "Neyin, hangi sıklıkla ve ne kadar süreyle yedeklendiği; geri dönüş testinin kapsamı yazılır." },
];

const inventory = [
  ["Varlık", "Alan adı, sunucu, SSL, DNS, e-posta veya bağlı üçüncü taraf servis"],
  ["Sahip", "Hesabın ve ticari kaydın hangi gerçek veya tüzel kişiye ait olduğu"],
  ["Sağlayıcı", "Kayıt kuruluşu, hosting firması ve gerekli destek kanalı"],
  ["Bitiş tarihi", "Yenilemenin tamamlanması gereken tarih ve varsa sağlayıcı tolerans süresi"],
  ["Ödeme sorumlusu", "Ücreti kimin onaylayacağı ve hangi yöntemle ödeyeceği"],
  ["Teknik sorumlu", "DNS, SSL, yayın ve geri dönüş işlemini kimin yürüteceği"],
];

const renewalSteps = [
  ["01", "Envanteri doğrulayın", "Sahiplik, sağlayıcı, bitiş tarihi ve iletişim adreslerinin güncel olduğunu kontrol edin."],
  ["02", "Kapsamı onaylayın", "Devam edecek servisleri, süreyi, bedeli ve ödeme sorumlusunu yazılı olarak netleştirin."],
  ["03", "Yenilemeyi tamamlayın", "İşlemi son güne bırakmadan sağlayıcı kaydından doğrulayın; yalnızca ödeme belgesine güvenmeyin."],
  ["04", "Yayını kontrol edin", "Alan adı çözümlemesi, HTTPS, uygulama ve kritik e-posta akışlarını işlem sonrasında sınayın."],
];

const boundaries = {
  avc: [
    "Sözleşmede yer alan kurulum ve teknik yapılandırma",
    "Yetki verilmiş hesaplarda DNS ve SSL işlemleri",
    "Kararlaştırılmış hosting, izleme ve yedekleme kapsamı",
    "Yenileme kaydının teknik doğrulaması ve durum bildirimi",
  ],
  customer: [
    "Ticari hesap ve alan adı sahipliği bilgilerinin doğruluğu",
    "Yenileme ve üçüncü taraf ücretlerinin zamanında onayı",
    "Yetkili kişi, fatura ve ödeme bilgilerinin güncelliği",
    "Kapsam dışı servisler için gerekli sağlayıcı erişimi ve kararlar",
  ],
};

export default function DomainHostingPage() {
  return (
    <main className="catalog-page hosting-page">
      <a className="skip-link" href="#alan-adi-sorgu">Alan adı sorgusuna geç</a>
      <header className="catalog-header">
        <SiteBrand />
        <nav aria-label="Sayfa menüsü"><Link href="/hizmetler">Hizmetler</Link><Link className="active" href="/alan-adi-hosting">Alan Adı & Hosting</Link><Link href="/destek">Destek</Link><Link href="/musteri-merkezi">Müşteri Merkezi</Link></nav>
        <HeaderCtaCluster><Link className="header-cta" href="/teklif?cozum=hosting">Altyapı görüşmesi</Link></HeaderCtaCluster>
      </header>

      <section className="catalog-hero hosting-hero">
        <div><span className="kicker kicker-light">YAYIN ALTYAPISI</span><h1>Alan adınız ve yayınınız<br /><em>son güne kalmasın.</em></h1></div>
        <p>Alan adı, DNS, SSL, hosting ve yedekleme varlıklarını; sahiplik, erişim, yenileme ve devir sorumluluklarıyla birlikte yönetin.</p>
      </section>

      <aside className="hosting-disclosure"><strong>Önemli sınır</strong><p>AVC’nin bir alan adı veya hosting hizmetini yönetmesi, ticari sahipliğin AVC’ye geçtiği anlamına gelmez. Hesap sahibi, ücret, süre, teknik kapsam ve devir koşulları teklif veya sözleşmede ayrıca tanımlanır.</p></aside>

      <section className="hosting-lookup" id="alan-adi-sorgu">
        <div>
          <span className="kicker">KAYITLI MÜŞTERİ SORGUSU</span>
          <h2>Alan adınızın kaç günü kaldığını görün.</h2>
          <p>Bu kutu genel WHOIS değildir. Yalnız Avcı yönetimindeki yazılım müşterisi kaydı ve o kayda yazılmış alan adı / yayın bitişi sorulur.</p>
        </div>
        <DomainLookupForm />
      </section>

      <section className="hosting-layers" id="altyapi-kapsami">
        <div><span className="kicker">DÖRT KATMAN</span><h2>Yayın sürekliliğini<br />bir bütün olarak görün.</h2><p>Bir web sitesinin erişilebilir kalması yalnızca hosting ödemesine bağlı değildir. Her katmanın sahibi, sağlayıcısı ve yenileme yöntemi ayrı izlenir.</p></div>
        <div>{layers.map((layer) => <article key={layer.number}><span>{layer.number}</span><h3>{layer.title}</h3><p>{layer.text}</p></article>)}</div>
      </section>

      <section className="hosting-inventory">
        <div><span className="kicker kicker-light">YENİLEME ENVANTERİ</span><h2>Her varlık için<br />altı net kayıt.</h2><p>Hatırlatma tek başına kontrol değildir. İşlemden önce ticari ve teknik sorumlulukların doğrulanabileceği ortak bir kayıt gerekir.</p></div>
        <div>{inventory.map(([title, text]) => <article key={title}><strong>{title}</strong><span>{text}</span></article>)}</div>
      </section>

      <section className="hosting-renewal">
        <div><span className="kicker">YENİLEME AKIŞI</span><h2>Onaydan teknik<br />kontrole dört adım.</h2></div>
        <div>{renewalSteps.map(([number, title, text]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
      </section>

      <section className="hosting-boundary">
        <div><span className="kicker">SORUMLULUK MATRİSİ</span><h2>Kim neyi<br />takip ediyor?</h2><p>Otomatik yenileme, kayıtlı kart veya geçmişte gönderilmiş bir hatırlatma sorumluluk matrisi yerine geçmez.</p></div>
        <div className="hosting-columns"><article><small>AVC — YALNIZCA KARARLAŞTIRILAN KAPSAMDA</small><ul>{boundaries.avc.map((item) => <li key={item}><span>✓</span>{item}</li>)}</ul></article><article><small>MÜŞTERİ — TİCARİ SAHİPLİK VE ONAY</small><ul>{boundaries.customer.map((item) => <li key={item}>{item}</li>)}</ul></article></div>
      </section>

      <aside className="scope-note"><strong>Güvenlik ve devir</strong><p>Parolaları e-postayla paylaşmayın. Mümkün olduğunda kişiye özel kullanıcı, sınırlı yetki ve çok faktörlü doğrulama kullanın. Hizmet sona erdiğinde müşteri varlıklarına ait erişim, DNS kayıtları ve gerekli teknik belgeler sözleşmedeki devir kapsamına göre teslim edilir.</p></aside>

      <section className="decision-cta"><span className="kicker">ALTYAPI ENVANTERİ</span><h2>Alan adı, hosting ve yenileme sorumluluklarını netleştirelim.</h2><p>Mevcut sağlayıcılarınızı ve bitiş tarihlerinizi paylaşın; gerekli teknik kapsamı ve sorumlu tarafları birlikte çıkaralım.</p><div><Link className="button button-primary" href="/teklif?cozum=hosting">Altyapı görüşmesi isteyin</Link><Link className="button button-ghost" href="/destek">Yenileme desteği alın</Link></div></section>
    </main>
  );
}
