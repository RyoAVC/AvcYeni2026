import type { Metadata } from "next";
import Link from "next/link";
import { HeaderCtaCluster } from "../header-cta-cluster";
import { SiteBrand } from "../site-brand";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "İade ve İptal Akışı | Avcı E-Ticaret",
  description:
    "Müşteri mağazasında sipariş iptali ve iade kaydı. Avcı butik kasa değildir; /yonetim iade kuyruğu değildir. Cayma metni avukat işidir.",
  alternates: { canonical: "/iade-iptal" },
};

const layers = [
  {
    number: "01",
    title: "Kim basar",
    text: "İptal ve iade, mağaza panelindeki yetkili roldedir. Avcı sizin müşterinize iade onaylamaz. /yonetim lisans paneli kasa değildir.",
  },
  {
    number: "02",
    title: "Stok ve kargo",
    text: "İade kabul edilince satılabilir adet kuralı stok sayfasındaki ana kayda bağlanır. İade kargo etiketi kargo firmasındadır; Avcı koli taşımaz.",
  },
  {
    number: "03",
    title: "Para dönüşü",
    text: "Kart iadesi ödeme kuruluşunun işidir. Avcı tahsilat yapmaz, iade tutarını kendi kasasından ödemez. PSP sonucu sipariş kaydına yazılır.",
  },
  {
    number: "04",
    title: "Cayma metni",
    text: "Mesafeli satış ve cayma süresi sizin hukuki metninizdir. Yazılım iskeleti (form, süre alanı) teklifte yazılırsa kurulur; avukat onayı ayrı kalır.",
  },
];

const bounds = {
  included: [
    "Panelde iptal / iade kaydı (yazılırsa)",
    "Yetkili rolün iade basması",
    "PSP iade sonucunun siparişe işlenmesi (bağlantı yazılırsa)",
    "Cayma / iade bilgi sayfası iskeleti (yazılırsa)",
  ],
  separate: [
    "Avcı’nın sizin müşterinize iade kararı vermesi",
    "/yonetim içinde mağaza iade kuyruğu",
    "Kayıp koli ve kargo tazmini",
    "Avukat onaylı cayma ve mesafeli satış sözleşmesi",
  ],
};

export default function ReturnCancelPage() {
  return (
    <main className="catalog-page">
      <a className="skip-link" href="#iade-katman">İade katmanına geç</a>
      <header className="catalog-header">
        <SiteBrand />
        <nav aria-label="Sayfa menüsü">
          <Link href="/stok-operasyon">Stok</Link>
          <Link className="active" href="/iade-iptal">İade & İptal</Link>
          <Link href="/odeme-kargo">Ödeme & Kargo</Link>
          <Link href="/erisim-denetim">Erişim</Link>
          <Link href="/oturum-politika">Oturum</Link>
        </nav>
        <HeaderCtaCluster>
          <Link className="header-cta" href="/teklif?cozum=eticaret">İade kapsamı isteyin</Link>
        </HeaderCtaCluster>
      </header>

      <section className="catalog-hero">
        <div>
          <span className="kicker kicker-light">MÜŞTERİ SORUSU</span>
          <h1>
            İadeyi kim
            <br />
            <em>onaylar?</em>
          </h1>
        </div>
        <p>
          Yazılım müşterisi bunu sormadan yayın yapmamalı. Avcı kıyafet satmaz ve kasa tutmaz; iade
          mağaza yazılımınızın işidir.
        </p>
      </section>

      <section className="solution-list" id="iade-katman">
        {layers.map((layer) => (
          <article className="solution-detail" id={`iade-${layer.number}`} key={layer.number}>
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

      <section className="package-scope-section" aria-labelledby="iade-sinir">
        <div className="section-heading">
          <div>
            <span className="kicker">KAPSAM SINIRI</span>
            <h2 id="iade-sinir">
              Kayıt yazılır.
              <br />
              Kasa Avcı’da değil.
            </h2>
          </div>
          <p>Para PSP’de döner. Avcı butik iadesi yürütmez.</p>
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
        <h2>İade hangi rolde açılsın?</h2>
        <p>Siparişçi görür, muhasebe onaylar yeter; süper yönetici herkese verilmez.</p>
        <div>
          <Link className="button button-primary" href="/teklif?cozum=eticaret">
            İade görüşmesi
          </Link>
          <Link className="button button-ghost" href="/erisim-denetim">
            Erişim ve denetim
          </Link>
        </div>
      </section>
    </main>
  );
}
