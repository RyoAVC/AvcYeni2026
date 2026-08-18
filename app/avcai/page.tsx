import type { Metadata } from "next";
import Link from "next/link";
import { HeaderCtaCluster } from "../header-cta-cluster";
import { SiteBrand } from "../site-brand";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tofy | Avcı E-Ticaret",
  description: "Tofy, Avcı E-Ticaret tarafından geliştirilen sesli ve yazılı asistandır; paket, demo ve fiyat sorularına yanıt verir.",
  alternates: { canonical: "/avcai" },
};

export default function AvcaiPage() {
  return (
    <main className="catalog-page avcai-page">
      <a className="skip-link" href="#avcai-sohbet">Tofy anlatımına geç</a>
      <header className="catalog-header">
        <SiteBrand />
        <nav aria-label="Sayfa menüsü">
          <Link href="/eticaret-altyapisi">E-Ticaret</Link>
          <Link href="/yazilimlar">Yazılımlar</Link>
          <Link href="/yapay-zeka">Yapay Zekâ</Link>
          <Link href="/paketler">Paketler</Link>
        </nav>
        <HeaderCtaCluster>
          <Link className="header-cta" href="/teklif">Teklif isteyin</Link>
        </HeaderCtaCluster>
      </header>

      <section className="catalog-hero avcai-hero">
        <div>
          <span className="kicker kicker-light">TOFY · SESLİ ASİSTAN</span>
          <h1>Avcı sistemini<br /><em>sağdan anlatır.</em></h1>
        </div>
        <p>Tofy menüde durmaz. Küçük ikon altta zıplar, tıklanınca konuşur. Tofy’yi Avcı E-Ticaret geliştirdi; canlı ses yapılandırılmışsa doğal görüşme yapar, yoksa kayıtlı bilgilerle güvenli biçimde yanıtlar.</p>
      </section>

      <aside className="scenario-disclosure">
        <strong>Şeffaflık notu</strong>
        <p>Tofy tanıtım asistanıdır; katalog, sipariş veya ödemenin yerini almaz. Avcı E-Ticaret peynir, kıyafet veya mobilya satmaz. Kesin fiyat, teslim süresi, SLA veya referans uydurmaz. Sohbet D1’e yazılmaz; güncel firma araştırması yapılırsa kaynak bağlantıları gösterilir.</p>
      </aside>

      <section className="avcai-stage" id="avcai-sohbet">
        <article className="avcai-side">
          <small>SAĞDAKİ İKON</small>
          <strong>Maskota tıkla, yaz.</strong>
          <p>Avcı logosundaki A, küçük cam kutu olarak altta durur. Tıklanınca sohbet açılır. Ses için `.dev.vars` içine ücretsiz Gemini anahtarı yazılır.</p>
        </article>
      </section>

      <section className="decision-cta">
        <span className="kicker">KESİN KAPSAM</span>
        <h2>Sorunuz teklife dönüşsün.</h2>
        <p>Tofy yönlendirir; başvuru kaydı açmaz. Net fiyat ve kapsam formla yazılır.</p>
        <div>
          <Link className="button button-primary" href="/teklif">Teklif formuna gidin</Link>
          <Link className="button button-ghost" href="/cozum-senaryolari/peynir">Peynir demosunu gez</Link>
        </div>
      </section>
    </main>
  );
}
