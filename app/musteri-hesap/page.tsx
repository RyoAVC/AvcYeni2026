import type { Metadata } from "next";
import Link from "next/link";
import { HeaderCtaCluster } from "../header-cta-cluster";
import { SiteBrand } from "../site-brand";
import { loadSiteSettings } from "../site-settings.mjs";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Müşteri Hesabı ve Şifre | Avcı E-Ticaret",
  description:
    "Yazılım müşterisi hesabı nasıl açılır, şifre nerede yazılır. Avcı tanıtım sitesi parola toplamaz; mağaza üyeliği ayrıdır.",
  alternates: { canonical: "/musteri-hesap" },
};

const layers = [
  {
    number: "01",
    title: "İlk hesap",
    text: "Yazılım müşterisi hesabı bu siteden ‘üye ol’ ile açılmaz. Sözleşme ve teslim sonrası Avcı kaydı oluşur. İlk giriş adresi e-posta veya lisans platformunda durur.",
  },
  {
    number: "02",
    title: "Şifre",
    text: "Parola tanıtım sitesine yazılmaz. Bağlı lisans platformunda belirlenir veya sıfırlanır. Avcı /yonetim şifresi sizin mağaza şifreniz değildir.",
  },
  {
    number: "03",
    title: "Unuttum",
    text: "Şifre sıfırlama işlemsel e-postadır; kimin alan adından gittiği e-posta teslim sayfasındadır. Bu sayfaya parola yapıştırmayın. Destek kanalına sır yazılmaz.",
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
    "Şifre sıfırlamanın lisans platformunda durması (bağlandıysa)",
    "Bu sitede parola alanı olmaması",
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
          Yazılım müşterisi bunu sormadan yayın yapmamalı. Avcı tanıtım sitesi üye ol / şifre formu
          değildir. Mağaza üyeliği ayrıdır.
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
              Parola burada yok.
            </h2>
          </div>
          <p>Kayıt formu vitrin alışverişi değildir. Şifre yalnızca bağlı platformda işlenir.</p>
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
        <p>Yoksa teklif veya destek yazın. Parolayı bu forma yapıştırmayın.</p>
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
        </div>
      </section>
    </main>
  );
}
