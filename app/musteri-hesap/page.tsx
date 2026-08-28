import type { Metadata } from "next";
import Link from "next/link";
import { HeaderCtaCluster } from "../header-cta-cluster";
import { SiteBrand } from "../site-brand";
import { loadSiteSettings } from "../site-settings.mjs";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Müşteri Hesabı ve Şifre | Avcı E-Ticaret",
  description:
    "Avcı yazılım müşterisi hesabının açılması, panel parolası ve güvenli parola sıfırlama süreci.",
  alternates: { canonical: "/musteri-hesap" },
};

const layers = [
  {
    number: "01",
    title: "İlk hesap",
    text: "Herkese açık üyelik bulunmaz. Sözleşme ve teslim sonrası Avcı yönetimi müşteri kaydını açar, güvenli panel parolasını oluşturur ve giriş bilgilerini müşteriye iletir.",
  },
  {
    number: "02",
    title: "Şifre",
    text: "Müşteri, kayıtlı e-posta ve kendisine verilen panel parolasıyla güvenli giriş ekranında oturum açar. Avcı /yonetim hesabı ve mağaza yönetim hesabı bu paroladan ayrıdır.",
  },
  {
    number: "03",
    title: "Unuttum",
    text: "Parolanızı unuttuğunuzda destek ekibinden sıfırlama talep edin. Kimlik ve müşteri kaydı doğrulandıktan sonra yönetim yeni parola oluşturur. Mevcut parolanızı destek mesajına yazmayın.",
  },
  {
    number: "04",
    title: "Mağaza üyesi ayrı",
    text: "Vitrindeki alışveriş üyeliği sizin müşterinizin hesabıdır. Avcı müşteri girişi lisans ve fatura içindir. İkisini karıştırmayın.",
  },
];

const bounds = {
  included: [
    "Sözleşme sonrası yazılım müşterisi kaydı",
    "İlk giriş yolunun yazılı iletilmesi",
    "Yönetimden güvenli panel parolası oluşturulması",
    "Müşteri panelinde e-posta ve parola doğrulaması",
  ],
  separate: [
    "Tanıtım sitesinden herkese açık üye ol formu",
    "Mağaza ziyaretçisinin Avcı hesabı açması",
    "Parolanın e-posta veya Tofy sohbetine yazılması",
    "/yonetim ile mağaza panelinin aynı şifre olması",
  ],
};

export default async function CustomerAccountPage() {
  const settings = await loadSiteSettings();

  return (
    <main className="catalog-page">
      <a className="skip-link" href="#hesap-katman">Hesap katmanına geç</a>
      <header className="catalog-header">
        <SiteBrand />
        <nav aria-label="Sayfa menüsü">
          <Link href="/musteri-merkezi">Müşteri Merkezi</Link>
          <Link className="active" href="/musteri-hesap">Hesap & Şifre</Link>
          {settings.customerLoginEnabled ? <Link href="/musteri-girisi">Giriş</Link> : null}
          <Link href="/oturum-politika">Oturum</Link>
          <Link href="/eposta-teslim">E-posta</Link>
        </nav>
        <HeaderCtaCluster>
          {settings.customerLoginEnabled ? (
            <Link className="header-cta" href="/musteri-girisi">Müşteri girişi</Link>
          ) : (
            <Link className="header-cta" href="/teklif">Teklif</Link>
          )}
        </HeaderCtaCluster>
      </header>

      <section className="catalog-hero">
        <div>
          <span className="kicker kicker-light">MÜŞTERİ SORUSU</span>
          <h1>
            Hesabı kim açar,
            <br />
            <em>şifre nereye yazılır?</em>
          </h1>
        </div>
        <p>
          Müşteri hesabı satış sözleşmesi sonrasında Avcı yönetimi tarafından açılır. Panel girişi,
          mağaza yöneticisi ve mağaza ziyaretçisi hesaplarından tamamen ayrıdır.
        </p>
      </section>

      <section className="solution-list" id="hesap-katman">
        {layers.map((layer) => (
          <article className="solution-detail" id={layer.number === "03" ? "sifre" : `hesap-${layer.number}`} key={layer.number}>
            <div className="solution-title">
              <span>{layer.number}</span>
              <div>
                <h2>{layer.title}</h2>
                <p>{layer.text}</p>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="package-scope-section" aria-labelledby="hesap-sinir">
        <div className="section-heading">
          <div>
            <span className="kicker">KAPSAM SINIRI</span>
            <h2 id="hesap-sinir">
              Hesap teslimde açılır.
              <br />
              Panel erişimi güvenle teslim edilir.
            </h2>
          </div>
          <p>Parola yalnız müşteri paneli girişinde doğrulanır; düz metin olarak saklanmaz ve yönetimden tekrar okunamaz.</p>
        </div>
        <div className="package-scope-grid">
          <article>
            <small>TEKLİFTE YAZILIRSA DAHİL</small>
            <ul>
              {bounds.included.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
          <article>
            <small>AYRI KALIR</small>
            <ul>
              {bounds.separate.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="decision-cta">
        <span className="kicker">SONRAKİ ADIM</span>
        <h2>Giriş adresiniz var mı?</h2>
        <p>Hesabınız varsa doğrudan giriş yapın. Parolanızı unuttuysanız destekten güvenli sıfırlama isteyin.</p>
        <div>
          {settings.customerLoginEnabled ? (
            <Link className="button button-primary" href="/musteri-girisi">
              Müşteri girişine gidin
            </Link>
          ) : (
            <Link className="button button-primary" href="/teklif">
              Teklif formuna yazın
            </Link>
          )}
          <Link className="button button-ghost" href="/musteri-merkezi">
            Müşteri merkezi
          </Link>
          {settings.supportEnabled ? <Link className="button button-ghost" href="/destek">Parola desteği</Link> : null}
        </div>
      </section>
    </main>
  );
}
