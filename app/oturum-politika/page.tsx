import type { Metadata } from "next";
import Link from "next/link";
import { HeaderCtaCluster } from "../header-cta-cluster";
import { SiteBrand } from "../site-brand";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Oturum ve Kilit Politikası | Avcı E-Ticaret",
  description:
    "Mağaza paneli oturumu: süre, boşta kilit, eşzamanlı giriş, personel çıkışı. Avcı /yonetim sizin kasanızın kilidi değildir.",
  alternates: { canonical: "/oturum-politika" },
};

const layers = [
  {
    number: "01",
    title: "Süre",
    text: "Panel oturumu sonsuz açık kalmaz. Dakika cinsinden süre teklifte yazılır. Yazılmayan ‘hiç düşmez’ demek değildir.",
  },
  {
    number: "02",
    title: "Boşta kilit",
    text: "Ekran başında kimse yokken kasa veya iade açık kalmasın diye boşta kilit yazılabilir. Avcı sizin mağaza kasasında nöbet tutmaz.",
  },
  {
    number: "03",
    title: "Aynı anda giriş",
    text: "Bir hesap iki cihazda mı, yoksa tek oturum mu: bu seçilir. Paylaşılan ‘magaza123’ hesabı güvenlik açığıdır; rol sayfası ayrıdır.",
  },
  {
    number: "04",
    title: "Personel çıkışı",
    text: "İşten ayrılanın hesabı sizin kapatmanızdır. Avcı her çıkışı bilemez. Destek talebinde parola istenmez; olay bildirimi sayfası geçerlidir.",
  },
];

const bounds = {
  included: [
    "Kararlaştırılan oturum süresi",
    "Boşta kilit (yazılırsa)",
    "Eşzamanlı oturum kuralı",
    "Hesap kapatma / şifre sıfırlama yolu",
  ],
  separate: [
    "Personelin cihaz şifresi ve ekran kilidi",
    "Avcı’nın sizin İK sisteminizle otomatik senkron",
    "Paylaşılan tek şifrenin ‘güvenli’ sayılması",
    "/yonetim panelinin mağaza kilidi gibi kurulması",
  ],
};

export default function SessionPolicyPage() {
  return (
    <main className="catalog-page">
      <a className="skip-link" href="#oturum-katman">Oturum katmanına geç</a>
      <header className="catalog-header">
        <SiteBrand />
        <nav aria-label="Sayfa menüsü">
          <Link href="/erisim-denetim">Erişim</Link>
          <Link className="active" href="/oturum-politika">Oturum</Link>
          <Link href="/olay-bildirim">Olay</Link>
          <Link href="/magaza-kvkk">Mağaza KVKK</Link>
          <Link href="/guvenlik">Güvenlik</Link>
        </nav>
        <HeaderCtaCluster>
          <Link className="header-cta" href="/teklif?cozum=eticaret">Oturum kapsamı isteyin</Link>
        </HeaderCtaCluster>
      </header>

      <section className="catalog-hero">
        <div>
          <span className="kicker kicker-light">MÜŞTERİ SORUSU</span>
          <h1>
            Panel açık kalırsa
            <br />
            <em>kim iade basar?</em>
          </h1>
        </div>
        <p>
          Yazılım müşterisi bunu sormadan personel şifresi paylaşmamalı. Avcı kasa nöbeti tutmaz;
          oturum süresi ve kilit teklifte yazılır.
        </p>
      </section>

      <section className="solution-list" id="oturum-katman">
        {layers.map((layer) => (
          <article className="solution-detail" id={`oturum-${layer.number}`} key={layer.number}>
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

      <section className="package-scope-section" aria-labelledby="oturum-sinir">
        <div className="section-heading">
          <div>
            <span className="kicker">KAPSAM SINIRI</span>
            <h2 id="oturum-sinir">
              Süre yazılır.
              <br />
              Cihaz sizde kalır.
            </h2>
          </div>
          <p>Oturum dakikası yazılmadan ‘kilitli panel’ denmez.</p>
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
        <h2>Kaç dakika boşta kalsın?</h2>
        <p>Kasa ve iade için kısa; rapor için uzun olabilir. Tek süre herkese uymayabilir.</p>
        <div>
          <Link className="button button-primary" href="/teklif?cozum=eticaret">
            Oturum görüşmesi
          </Link>
          <Link className="button button-ghost" href="/erisim-denetim">
            Erişim ve denetim
          </Link>
        </div>
      </section>
    </main>
  );
}
