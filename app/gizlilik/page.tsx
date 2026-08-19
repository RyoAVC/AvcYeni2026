import type { Metadata } from "next";
import Link from "next/link";
import { HeaderCtaCluster } from "../header-cta-cluster";
import { SiteBrand } from "../site-brand";
import { loadSiteSettings } from "../site-settings.mjs";

export const metadata: Metadata = {
  title: "Gizlilik ve Kişisel Veriler | Avcı E-Ticaret",
  description: "Avcı E-Ticaret web sitesi üzerinden iletilen kişisel verilerin işlenmesine ilişkin bilgilendirme.",
  alternates: { canonical: "/gizlilik", languages: { "tr-TR": "/gizlilik", en: "/en/privacy", "x-default": "/gizlilik" } },
};

const sections = [
  {
    title: "Hangi verileri topluyoruz?",
    content: "Demo ve teklif formunda paylaştığınız ad soyad, telefon, e-posta, firma, ilgilendiğiniz çözüm ve proje mesajı bilgilerini toplarız. Form güvenliği için gönderim zamanı ve teknik hata kayıtları da sınırlı süreyle işlenebilir.",
  },
  {
    title: "Verileri neden kullanıyoruz?",
    content: "Bilgilerinizi talebinizi değerlendirmek, size ulaşmak, uygun ürün veya hizmeti önermek, teklif sürecini yürütmek ve kötüye kullanımı önlemek amacıyla kullanırız. Açık bir izniniz veya hukuki dayanak olmadan ilgisiz pazarlama süreçlerine aktarmayız.",
  },
  {
    title: "Ne kadar süre saklıyoruz?",
    content: "Başvuru kayıtları, talebin sonuçlandırılması ve olası ticari ilişkinin yönetimi için gereken süre boyunca; ardından geçerli hukuki yükümlülükler ve zamanaşımı süreleri dikkate alınarak saklanır. Süresi dolan kayıtlar silinir veya anonimleştirilir.",
  },
  {
    title: "Kimlerle paylaşabiliriz?",
    content: "Veriler yalnızca talebinize yanıt vermesi gereken yetkili ekip üyeleriyle ve altyapının güvenli işletilmesi için zorunlu hizmet sağlayıcılarla, amaçla sınırlı olarak paylaşılabilir. Kanunen gerekli durumlarda yetkili kamu kurumlarına aktarım yapılabilir.",
  },
  {
    title: "Haklarınız nelerdir?",
    content: "Kişisel verilerinizin işlenip işlenmediğini öğrenme, bilgi talep etme, düzeltme, silme veya yok etme isteme, aktarılan üçüncü kişileri öğrenme ve kanuni şartları oluştuğunda işleme faaliyetlerine itiraz etme haklarına sahipsiniz.",
  },
  {
    title: "Ziyaret çerezi nedir?",
    content: "Onaylarsanız tanıtım sayfalarını saymak için rastgele bir ilk taraf çerez (avci_vid) bırakırız. IP adresi saklanmaz. Yönetim sayfaları sayılmaz. Reddederseniz bu sayaç çalışmaz. Teklif formundaki bilgiler ayrıdır ve form onayıyla alınır.",
  },
  {
    title: "Tofy soruları saklanır mı?",
    content: "Tofy sağdaki tanıtım asistanıdır. Sohbet kaydı veritabanına yazılmaz. Yapılandırmaya göre soru OpenAI veya Google hizmetine gidebilir; güncel web araştırması kullanılırsa kaynaklar gösterilir. Kesin fiyat, süre veya sözleşme vaadi içermez. Teklif formu ayrı bir başvurudur.",
  },
  {
    title: "Canlı mağaza verisi bu metnin konusu mu?",
    content: "Bu gizlilik metni Avcı tanıtım sitesindeki form, çerez ve Tofy için geçerlidir. Müşteri mağazasındaki sipariş ve üye kaydı ayrı sözleşmeyle işlenir. Sahiplik, yedek ve ayrılıkta dışa aktarım veri sahipliği sayfasında anlatılır.",
  },
];

export const dynamic = "force-dynamic";

export default async function PrivacyPage() {
  const settings = await loadSiteSettings();

  return (
    <main className="legal-page">
      <a className="skip-link" href="#legal-content">Ana içeriğe geç</a>
      <header className="legal-header">
        <SiteBrand />
        <HeaderCtaCluster><Link className="legal-back" href="/">Ana sayfaya dön</Link></HeaderCtaCluster>
      </header>

      <article className="legal-content" id="legal-content">
        <div className="legal-hero">
          <span className="kicker kicker-light">GİZLİLİK VE KİŞİSEL VERİLER</span>
          <h1>Bilgilerinizi neden aldığımızı ve nasıl koruduğumuzu açıkça anlatıyoruz.</h1>
          <p>Son güncelleme: 16 Ağustos 2026</p>
        </div>

        <div className="legal-body">
          <section className="legal-summary">
            <h2>Kısa özet</h2>
            <p>Teklif formundaki bilgilerinizi yalnızca talebinize yanıt vermek, uygun çözümü planlamak ve başvuru güvenliğini sağlamak için kullanırız. Bilgilerinizi satmayız.</p>
          </section>
          {sections.map((section, index) => (
            <section className="legal-section" key={section.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><h2>{section.title}</h2><p>{section.content}</p></div>
            </section>
          ))}
          <section className="legal-contact">
            <span className="kicker">TALEP VE SORULAR</span>
            <h2>Verilerinizle ilgili bize ulaşın.</h2>
            <p>Kimliğinizi doğrulamamıza yardımcı olacak bilgilerle birlikte talebinizi aşağıdaki iletişim kanallarından iletebilirsiniz.</p>
            <div>
              <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a>
              <a href={`tel:${settings.contactPhoneHref}`}>{settings.contactPhone}</a>
            </div>
          </section>
        </div>
      </article>
    </main>
  );
}
