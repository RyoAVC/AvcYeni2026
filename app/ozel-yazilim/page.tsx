import type { Metadata } from "next";
import Link from "next/link";
import { HeaderCtaCluster } from "../header-cta-cluster";
import { SiteBrand } from "../site-brand";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Özel Modül ve Yazılım | Avcı E-Ticaret",
  description:
    "Hazır paketin yetmediği iş kuralı, onay ve entegrasyon için Avcı özel modül yazılımı. Mağaza ürünü değil; altyapıya eklenen geliştirme.",
  alternates: { canonical: "/ozel-yazilim" },
};

const steps = [
  {
    number: "01",
    title: "İş kuralını ayırın",
    text: "Hazır katalog, sipariş ve ödeme yeterliyse yeni yazılım açılmaz. Özel iş; onay zinciri, sektörel kayıt, fiyat istisnası veya tek yönlü entegrasyon gibi pakette olmayan kuraldır.",
  },
  {
    number: "02",
    title: "Modül olarak bağlayın",
    text: "Özel kod mağaza çekirdeğinin yanına eklenir. Lisans, sürüm ve destek hattı teklifte ayrı kalır. Avcı’nın kendi /yonetim paneli bu işin kasası değildir.",
  },
  {
    number: "03",
    title: "Kabul ölçütü yazın",
    text: "Ne teslim edileceği, hangi ekranın kimde olduğu ve neyin sonraki faz olduğu baştan yazılır. Açık madde olmadan “her şey dahil özel yazılım” vaadi verilmez.",
  },
  {
    number: "04",
    title: "Bakımı ayırın",
    text: "Yeni istek, hata düzeltme ve sürüm yükseltme ayrı kalemdir. Teslim bitince kapsam kapanır; yeni kural değişiklik kaydıyla gelir.",
  },
];

export default function CustomSoftwarePage() {
  return (
    <main className="catalog-page">
      <a className="skip-link" href="#ozel-adim">Özel yazılım adımlarına geç</a>
      <header className="catalog-header">
        <SiteBrand />
        <nav aria-label="Sayfa menüsü">
          <Link href="/yazilimlar">Yazılımlar</Link>
          <Link href="/mobil-sektorel">Sektörel</Link>
          <Link className="active" href="/ozel-yazilim">Özel Modül</Link>
          <Link href="/proje-sureci">Proje Süreci</Link>
          <Link href="/guvenlik">Güvenlik</Link>
        </nav>
        <HeaderCtaCluster>
          <Link className="header-cta" href="/teklif?cozum=ozel">Özel kapsam isteyin</Link>
        </HeaderCtaCluster>
      </header>

      <section className="catalog-hero">
        <div>
          <span className="kicker kicker-light">ÖZEL MODÜL</span>
          <h1>
            Paket yetmezse
            <br />
            <em>çekirdeğe eklenir.</em>
          </h1>
        </div>
        <p>
          Avcı vitrinde kıyafet satmaz. Özel yazılım; müşteri mağazasının ihtiyacı olan kuralın,
          mevcut e-ticaret omurgasına modül olarak yazılmasıdır.
        </p>
      </section>

      <section className="solution-list" id="ozel-adim">
        {steps.map((step) => (
          <article className="solution-detail" id={`ozel-${step.number}`} key={step.number}>
            <div className="solution-title">
              <span>{step.number}</span>
              <div>
                <h2>{step.title}</h2>
                <p>{step.text}</p>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="decision-cta">
        <span className="kicker">SONRAKİ ADIM</span>
        <h2>Özel kuralı tek cümleyle yazın.</h2>
        <p>Hangi ekran, kim onaylar, hangi sistemden veri gelir: bunu netleştirince kapsam çıkar.</p>
        <div>
          <Link className="button button-primary" href="/teklif?cozum=ozel">
            Özel yazılım görüşmesi
          </Link>
          <Link className="button button-ghost" href="/yazilimlar">
            Hazır yazılımlar
          </Link>
        </div>
      </section>
    </main>
  );
}
