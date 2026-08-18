import type { Metadata } from "next";
import Link from "next/link";
import { HeaderCtaCluster } from "../header-cta-cluster";
import { SiteBrand } from "../site-brand";
import { loadSiteSettings } from "../site-settings.mjs";

export const metadata: Metadata = {
  title: "Destek Merkezi | Avcı E-Ticaret",
  description: "Portal erişimi, lisans ve yenileme, teknik sorun veya yeni geliştirme talepleri için güvenli destek yönlendirmelerini inceleyin.",
  alternates: { canonical: "/destek" },
};

const supportTopics = [
  { number: "01", title: "Portal erişimi", text: "Hesap onayı, giriş adresi veya oturum sorunu yaşıyorsanız firma ve yetkili iletişim bilginizle ulaşın.", subject: "Müşteri Portalı Erişim Desteği", label: "Erişim desteği isteyin" },
  { number: "02", title: "Lisans ve yenileme", text: "Ürün, plan, durum, bitiş tarihi, fatura veya yenileme kapsamıyla ilgili kayıt kontrolü isteyin.", subject: "Lisans ve Yenileme Desteği", label: "Lisans desteği isteyin" },
  { number: "03", title: "Teknik sorun", text: "Çalışmayan işlevi, görüldüğü zamanı, etkilenen sayfayı ve tekrar adımlarını güvenli biçimde paylaşın.", subject: "Teknik Destek Talebi", label: "Teknik destek isteyin" },
  { number: "04", title: "Yeni talep", text: "Yeni modül, entegrasyon, rapor veya değişiklik isteğini mevcut destekten ayrı kapsamlandırın.", subject: "Yeni Geliştirme Talebi", label: "Yeni talebi anlatın" },
];

const priorities = [
  ["Kritik", "Canlı satış veya temel operasyon geniş ölçüde kullanılamıyor.", "Etkilenen ürün, başlangıç zamanı ve iş etkisini ilk mesajda belirtin."],
  ["Yüksek", "Temel bir işlev çalışmıyor ancak sınırlı bir alternatif mevcut.", "Tekrar adımlarını, hata metnini ve etkilenen kullanıcı grubunu yazın."],
  ["Normal", "Kullanım sorusu, küçük hata, ayar isteği veya planlı değişiklik.", "Beklenen sonucu ve uygun değerlendirme zamanını açıklayın."],
];

const safeDetails = [
  "Firma adı ve yetkili iletişim bilgisi",
  "İlgili ürün ve alan adı",
  "Sorunun görüldüğü tarih ve saat",
  "Beklenen davranış ile gerçekleşen durum",
  "Sorunu tekrar etmek için izlenen adımlar",
  "Gizli verileri kapatılmış ekran görüntüsü",
  "Varsa hata mesajının aynen yazılmış metni",
];

const forbiddenDetails = [
  "Hesap parolası",
  "Ham lisans anahtarı",
  "API anahtarı, erişim tokenı veya webhook sırrı",
  "Ödeme kartı bilgisi",
  "Gereksiz müşteri veya kişisel veri",
  "Sunucu özel anahtarı veya yedek dosyası",
];

export const dynamic = "force-dynamic";

export default async function SupportPage() {
  const settings = await loadSiteSettings();
  const supportMailto = (subject: string) => `mailto:${settings.supportEmail}?subject=${encodeURIComponent(subject)}`;

  return (
    <main className="catalog-page support-page">
      <a className="skip-link" href="#destek-konulari">Destek konularına geç</a>
      <header className="catalog-header">
        <SiteBrand />
        <nav aria-label="Sayfa menüsü"><Link href="/hizmetler">Hizmetler</Link><Link href="/musteri-merkezi">Müşteri Merkezi</Link><Link className="active" href="/destek">Destek</Link><Link href="/kaynaklar">Kaynaklar</Link>{settings.customerLoginEnabled && <Link href="/musteri-girisi">Müşteri Girişi</Link>}</nav>
        {settings.supportEnabled ? <a className="header-cta" href={supportMailto("Destek Talebi")}>Destek isteyin</a> : <HeaderCtaCluster><Link className="header-cta" href="/">Ana sayfa</Link></HeaderCtaCluster>}
      </header>

      <section className="catalog-hero support-hero">
        <div><span className="kicker kicker-light">DESTEK MERKEZİ</span><h1>Doğru bilgiyle<br /><em>daha hızlı inceleme.</em></h1></div>
        <p>Portal erişimi, lisans, yenileme, teknik sorun ve yeni geliştirme taleplerini doğru konu ve güvenli teşhis bilgisiyle iletin.</p>
      </section>

      <aside className="support-disclosure"><strong>Mevcut kanal</strong><p>{settings.supportEnabled ? "Müşteri portalında henüz ayrı ticket ekranı bulunmuyor. Destek kayıtları şu anda e-posta ve sözleşmede belirlenen iletişim kanalı üzerinden yürütülür; yanıt süresi ve öncelik hizmet sözleşmesine bağlıdır." : "Destek e-posta kanalı şu anda kapalı. Mevcut sözleşmeniz varsa yetkili iletişim kişinizden ilerleyin."}</p></aside>

      <section className="support-topics" id="destek-konulari">
        <div><span className="kicker">KONUNUZU SEÇİN</span><h2>Talebi doğru<br />başlığa yönlendirin.</h2><p>Birden çok konu varsa, teknik sorun ile yeni geliştirme talebini ayrı mesajlarda iletmek kapsamı ve önceliği net tutar.</p></div>
        <div>{supportTopics.map((topic) => <article key={topic.number}><span>{topic.number}</span><h3>{topic.title}</h3><p>{topic.text}</p>{settings.supportEnabled ? <a href={supportMailto(topic.subject)}>{topic.label}</a> : <span>Kanal kapalı</span>}</article>)}</div>
      </section>

      <section className="support-priority">
        <div><span className="kicker kicker-light">ÖNCELİK REHBERİ</span><h2>İş etkisini<br />açık anlatın.</h2><p>“Acil” ifadesi tek başına yeterli değildir. Etkilenen süreç, kullanıcı sayısı, başlangıç zamanı ve mevcut alternatif değerlendirmeyi belirler.</p></div>
        <div>{priorities.map(([level, meaning, action]) => <article key={level}><strong>{level}</strong><p>{meaning}</p><span>{action}</span></article>)}</div>
      </section>

      <section className="support-payload">
        <div><span className="kicker">GÜVENLİ TEŞHİS PAKETİ</span><h2>Ne gönderilmeli,<br />ne gönderilmemeli?</h2><p>İncelemeye yetecek bağlamı paylaşın; erişim sırrı veya gereksiz kişisel veri göndermeyin.</p></div>
        <div className="support-columns"><article><small>PAYLAŞILABİLİR BİLGİLER</small><ul>{safeDetails.map((item) => <li key={item}><span>✓</span>{item}</li>)}</ul></article><article><small>MESAJDA PAYLAŞMAYIN</small><ul>{forbiddenDetails.map((item) => <li key={item}><span>×</span>{item}</li>)}</ul></article></div>
      </section>

      <section className="support-flow">
        <div><span className="kicker">İNCELEME AKIŞI</span><h2>Talep nasıl<br />ilerler?</h2></div>
        <div>{[
          ["01", "Kayıt", "Konu, firma ve iletişim bilgisiyle talep alınır."],
          ["02", "Sınıflandırma", "Hata, kullanım desteği, yenileme veya yeni geliştirme olarak ayrılır."],
          ["03", "Doğrulama", "Gerekli bağlam ve güvenli teşhis bilgileri tamamlanır."],
          ["04", "Sonuç", "Çözüm, yönlendirme veya ayrı kapsam/teklif gereksinimi bildirilir."],
        ].map(([number, title, text]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
      </section>

      <aside className="scope-note"><strong>Destek sınırı</strong><p>Hata düzeltme, kullanım desteği, bakım, üçüncü taraf sağlayıcı incelemesi ve yeni geliştirme aynı hizmet değildir. Dahil kapsam ve hedef yanıt süresi geçerli sözleşmeye göre belirlenir.</p></aside>

      <section className="decision-cta"><span className="kicker">DESTEK TALEBİ</span><h2>Konuyu ve iş etkisini güvenli biçimde iletin.</h2><p>Parola, lisans anahtarı veya erişim sırrı göndermeden gerekli bağlamı paylaşın.</p><div>{settings.supportEnabled ? <a className="button button-primary" href={supportMailto("Destek Talebi")}>Destek ekibine yazın</a> : <Link className="button button-primary" href="/teklif">Teklif isteyin</Link>}<Link className="button button-ghost" href="/musteri-merkezi">Müşteri merkezini inceleyin</Link></div></section>
    </main>
  );
}
