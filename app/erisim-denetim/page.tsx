import type { Metadata } from "next";
import Link from "next/link";
import { HeaderCtaCluster } from "../header-cta-cluster";
import { SiteBrand } from "../site-brand";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Erişim, Yetki ve Denetim Kaydı | Avcı E-Ticaret",
  description:
    "Mağaza paneli rolleri, oturum, iki adımlı doğrulama ve işlem kaydı. Avcı /yonetim sizin kasanız değildir. Kim iade açar, kim fiyat değiştirir.",
  alternates: { canonical: "/erisim-denetim" },
};

const layers = [
  {
    number: "01",
    title: "Rol ayrımı",
    text: "Katalog, sipariş, iade, fiyat ve rapor aynı kişiye verilmek zorunda değildir. Kim neyi görür teklifte yazılır. Yazılmayan yetki açık sayılmaz.",
  },
  {
    number: "02",
    title: "Oturum ve şifre",
    text: "Mağaza paneli parolası sizin personelinizindir. Avcı tanıtım sitesi bu parolayı istemez. İki adımlı doğrulama teklifte yazılırsa açılır; yazılmazsa varsayılmaz.",
  },
  {
    number: "03",
    title: "İşlem kaydı",
    text: "Kim fiyat değiştirdi, kim iade onayladı: bu kayıt denetim içindir. Avcı’nın kendi /yonetim ekranı sizin kasa fişiniz değildir.",
  },
  {
    number: "04",
    title: "Avcı erişimi",
    text: "Destek için geçici erişim istenir, amacı ve süresi yazılır. Kart, ham lisans anahtarı veya müşteri parolası e-postayla istenmez.",
  },
];

const bounds = {
  included: [
    "Kararlaştırılan roller ve ekran sınırları",
    "Teklifte yazılan iki adımlı doğrulama",
    "Fiyat / iade / kullanıcı değişikliği kaydı",
    "Destek erişiminin amaç ve süre notu",
  ],
  separate: [
    "Personelinizin şifre yöneticisi ve cihaz kilidi",
    "Ayrılan çalışanın hesabını sizin kapatmanız",
    "SOC 2 / ISO belgesi (yazılmadıysa yoktur)",
    "Avcı’nın sizin yerinize günlük iade onaylaması",
  ],
};

export default function AccessAuditPage() {
  return (
    <main className="catalog-page">
      <a className="skip-link" href="#erisim-katman">Erişim katmanına geç</a>
      <header className="catalog-header">
        <SiteBrand />
        <nav aria-label="Sayfa menüsü">
          <Link href="/guvenlik">Güvenlik</Link>
          <Link className="active" href="/erisim-denetim">Erişim</Link>
          <Link href="/veri-sahipligi">Veri Sahipliği</Link>
          <Link href="/musteri-merkezi">Müşteri Merkezi</Link>
          <Link href="/gizlilik">Gizlilik</Link>
        </nav>
        <HeaderCtaCluster>
          <Link className="header-cta" href="/teklif?cozum=eticaret">Yetki kapsamı isteyin</Link>
        </HeaderCtaCluster>
      </header>

      <section className="catalog-hero">
        <div>
          <span className="kicker kicker-light">MÜŞTERİ SORUSU</span>
          <h1>
            Kim iade açar?
            <br />
            <em>Kim fiyat değiştirir?</em>
          </h1>
        </div>
        <p>
          Bir yazılım müşterisi bunu sormadan imza atmamalı. Avcı mağaza işletmez; sizin panelinizdeki
          rol, oturum ve denetim kaydı teklifte ayrılır.
        </p>
      </section>

      <section className="solution-list" id="erisim-katman">
        {layers.map((layer) => (
          <article className="solution-detail" id={`erisim-${layer.number}`} key={layer.number}>
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

      <section className="package-scope-section" aria-labelledby="erisim-sinir">
        <div className="section-heading">
          <div>
            <span className="kicker">KAPSAM SINIRI</span>
            <h2 id="erisim-sinir">
              Yetki yazılır.
              <br />
              Personel sizde kalır.
            </h2>
          </div>
          <p>Rol listesi ve 2FA maddesi olmadan ‘her şey kilitli’ denmez.</p>
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
        <h2>İlk yayında kaç rol var?</h2>
        <p>Katalog, sipariş, muhasebe: üç rol yeter; süper yönetici herkese verilmez.</p>
        <div>
          <Link className="button button-primary" href="/teklif?cozum=eticaret">
            Erişim görüşmesi
          </Link>
          <Link className="button button-ghost" href="/veri-sahipligi">
            Veri sahipliği
          </Link>
        </div>
      </section>
    </main>
  );
}
