import type { Metadata } from "next";
import Link from "next/link";
import { HeaderCtaCluster } from "../header-cta-cluster";
import { SiteBrand } from "../site-brand";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Veri Konumu ve Alt İşleyen | Avcı E-Ticaret",
  description:
    "Mağaza verisi nerede durur, kim alt işleyendir. Avcı ‘her şey yalnızca Türkiye’de’ demez; konum ve aktarım teklifte yazılır.",
  alternates: { canonical: "/veri-konumu" },
};

const layers = [
  {
    number: "01",
    title: "Uygulama ve yedek",
    text: "Panel ve veritabanı hangi ülkede / hangi barındırmada durur, teklifte yazılır. Yazılmayan cümle konum vaadi değildir.",
  },
  {
    number: "02",
    title: "Alt işleyen",
    text: "E-posta, yedek diski, CDN, ödeme yönlendirmesi ayrı firmalar olabilir. Liste sözleşme ekinde durur; gizli ‘üçüncü ülke’ yoktur, yazılır.",
  },
  {
    number: "03",
    title: "Kart ve kargo",
    text: "Kart verisi PSP’dedir; Avcı kasa değildir. Kargo takip numarası kargo firmasındadır. Bu aktarımlar mağaza KVKK’sında sizin metninizle görünür.",
  },
  {
    number: "04",
    title: "Değişiklik",
    text: "Barındırma veya alt işleyen değişirse size yazılır. Avcı sizin haberiniz olmadan ‘sunucuyu başka kıtaya aldık’ dememelidir; süreç teklifte bağlanır.",
  },
];

const bounds = {
  included: [
    "Uygulama / yedek konumunun teklifte durması",
    "Bilinen alt işleyen listesi (yazılırsa)",
    "Konum değişince bildirim yolu",
    "PSP ve kargonun Avcı kasası olmadığının ayrılması",
  ],
  separate: [
    "Her tedarikçinin kendi KVKK metninin Avcı tarafından yazılması",
    "‘Veri asla yurt dışına çıkmaz’ garantisi (yazılmadıysa yoktur)",
    "Pazaryeri hesabınızdaki stok ve siparişin Avcı sunucusunda tutulması",
    "Avcı’nın sizin avukatınıza alt işleyen denetimi yapması",
  ],
};

export default function DataLocationPage() {
  return (
    <main className="catalog-page">
      <a className="skip-link" href="#konum-katman">Konum katmanına geç</a>
      <header className="catalog-header">
        <SiteBrand />
        <nav aria-label="Sayfa menüsü">
          <Link href="/kayit-saklama">Saklama</Link>
          <Link className="active" href="/veri-konumu">Veri Konumu</Link>
          <Link href="/ortam-ayrimi">Ortam</Link>
          <Link href="/magaza-kvkk">Mağaza KVKK</Link>
          <Link href="/guvenlik">Güvenlik</Link>
        </nav>
        <HeaderCtaCluster>
          <Link className="header-cta" href="/teklif?cozum=hosting">Konum kapsamı isteyin</Link>
        </HeaderCtaCluster>
      </header>

      <section className="catalog-hero">
        <div>
          <span className="kicker kicker-light">MÜŞTERİ SORUSU</span>
          <h1>
            Veri hangi
            <br />
            <em>ülkede durur?</em>
          </h1>
        </div>
        <p>
          Yazılım müşterisi bunu sormadan yayın yapmamalı. Avcı konum ve alt işleyeni teklifte yazar;
          yazılmayan ‘hepsi yalnızca burada’ demek değildir.
        </p>
      </section>

      <section className="solution-list" id="konum-katman">
        {layers.map((layer) => (
          <article className="solution-detail" id={`konum-${layer.number}`} key={layer.number}>
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

      <section className="package-scope-section" aria-labelledby="konum-sinir">
        <div className="section-heading">
          <div>
            <span className="kicker">KAPSAM SINIRI</span>
            <h2 id="konum-sinir">
              Konum yazılır.
              <br />
              Gizli aktarım yok.
            </h2>
          </div>
          <p>Ödeme ve kargo kendi sistemlerindedir; Avcı onları barındırmaz.</p>
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
        <h2>Sunucu ve yedek nerede?</h2>
        <p>Ülke ve sağlayıcı teklifte durur. Kart yine PSP’dedir.</p>
        <div>
          <Link className="button button-primary" href="/teklif?cozum=hosting">
            Konum görüşmesi
          </Link>
          <Link className="button button-ghost" href="/kayit-saklama">
            Kayıt saklama
          </Link>
        </div>
      </section>
    </main>
  );
}
