import type { Metadata } from "next";
import Link from "next/link";
import { HeaderCtaCluster } from "../../header-cta-cluster";
import { SiteBrand } from "../../site-brand";
import { CheeseDraft } from "./cheese-draft";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Peynir Mağazası Örneği | Avcı E-Ticaret",
  description: "Peynir markasının Avcı ile kurulan demo mağazası: banner, ürün, sepete ekle, ödeme ve siparişin panele düşmesi. Örnek veridir.",
  alternates: { canonical: "/cozum-senaryolari/peynir" },
};

export default function CheeseScenarioDraftPage() {
  return (
    <main className="catalog-page cheese-draft-page">
      <a className="skip-link" href="#peynir-taslak">Demo mağazaya geç</a>
      <header className="catalog-header">
        <SiteBrand />
        <nav aria-label="Sayfa menüsü">
          <Link href="/eticaret-altyapisi">E-Ticaret</Link>
          <Link href="/yazilimlar">Yazılımlar</Link>
          <Link href="/paketler">Paketler</Link>
          <Link className="active" href="/cozum-senaryolari">Senaryolar</Link>
        </nav>
        <HeaderCtaCluster>
          <Link className="header-cta" href="/teklif?cozum=eticaret">Mağazanızı anlatın</Link>
        </HeaderCtaCluster>
      </header>

      <section className="catalog-hero scenario-hero cheese-draft-hero">
        <div>
          <span className="kicker kicker-light">CANLI TASLAK · ÖRNEK VERİ</span>
          <h1>Demo mağaza,<br /><em>üç boyutlu vitrin.</em></h1>
        </div>
        <p>Avcı peynir satmaz. Müşterinin gördüğü site: banner, slayt, ürün, sepete ekle, ödeme. Ödeme düşünce sipariş mağaza paneline düşer. Rehber robot eliyle gösterir. Sağdaki Tofy maskotu soruları alır.</p>
      </section>

      <aside className="scenario-disclosure">
        <strong>Şeffaflık notu</strong>
        <p>Köy Peyniri, sipariş numaraları (#PYN-104) ve tutarlar örnektir. Sorular sağdaki Tofy maskotundadır. Gerçek kart çekimi yoktur. Satın alma kararı için referans değildir.</p>
      </aside>

      <section className="cheese-draft-stage" id="peynir-taslak">
        <CheeseDraft />
      </section>

      <section className="decision-cta">
        <span className="kicker">SİZE ÖZEL KURGU</span>
        <h2>Kendi vitrininiz için aynı akışı kuralım.</h2>
        <p>Banner, katalog, sepet, ödeme ve panel sizin ürününüze göre kurulur. Bu taslak yalnız gıda demosunu gösterir. Gerçek kart çekilmez.</p>
        <div>
          <Link className="button button-primary" href="/teklif?cozum=eticaret">E-ticaret görüşmesi isteyin</Link>
          <Link className="button button-ghost" href="/cozum-senaryolari">Senaryolara dön</Link>
        </div>
      </section>
    </main>
  );
}
