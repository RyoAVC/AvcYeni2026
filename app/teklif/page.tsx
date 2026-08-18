import type { Metadata } from "next";
import Link from "next/link";
import { HeaderCtaCluster } from "../header-cta-cluster";
import { SiteBrand } from "../site-brand";
import { OfferForm } from "../offer-form";
import { OFFER_SOLUTION_SLUGS } from "../offer-options";
import { getPackageName } from "../package-options";
import { loadSiteSettings } from "../site-settings.mjs";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Teklif İsteyin | Avcı E-Ticaret",
  description: "İhtiyacınızı paylaşın; doğru yazılım, entegrasyon ve hizmet kapsamını birlikte belirleyelim.",
  alternates: { canonical: "/teklif" },
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function QuotePage({
  searchParams,
}: {
  searchParams: Promise<{ cozum?: string | string[]; paket?: string | string[] }>;
}) {
  const params = await searchParams;
  const solutionSlug = first(params.cozum) ?? "";
  const solution = Object.hasOwn(OFFER_SOLUTION_SLUGS, solutionSlug)
    ? OFFER_SOLUTION_SLUGS[solutionSlug as keyof typeof OFFER_SOLUTION_SLUGS]
    : "";
  const packageName = getPackageName(first(params.paket) ?? "");
  const defaultMessage = packageName
    ? `${packageName} paketi${solution ? ` ve ${solution}` : ""} hakkında görüşmek istiyorum.`
    : "";
  const settings = await loadSiteSettings();

  return (
    <main className="quote-page">
      <a className="skip-link" href="#teklif-formu">Teklif formuna geç</a>
      <header>
        <SiteBrand />
        <nav aria-label="Sayfa menüsü">
          <Link href="/eticaret-altyapisi">E-Ticaret</Link>
          <Link href="/yazilimlar">Yazılımlar</Link>
          <Link href="/yapay-zeka">Yapay Zekâ</Link>
          <Link href="/entegrasyonlar">Entegrasyonlar</Link>
          <Link href="/paketler">Paketler</Link>
          <Link href="/hizmetler">Hizmetler</Link>
        </nav>
        <HeaderCtaCluster><Link className="header-cta" href="/">Ana sayfa</Link></HeaderCtaCluster>
      </header>

      <section>
        <div className="quote-copy">
          <span className="kicker kicker-light">İHTİYAÇ ANALİZİ</span>
          <h1>Doğru kapsamı<br /><em>birlikte belirleyelim.</em></h1>
          <p>Formu gönderdiğinizde ihtiyacınızı inceler, uygulanabilir çözüm ve ticari model için sizinle iletişime geçeriz.</p>
          {(solution || packageName) && (
            <div className="quote-context" aria-label="Seçiminiz">
              <small>SEÇİMİNİZ</small>
              {solution && <strong>{solution}</strong>}
              {packageName && <span>{packageName} paketi</span>}
            </div>
          )}
          <div className="quote-steps">
            <span><b>01</b> İhtiyaçların kısa değerlendirmesi</span>
            <span><b>02</b> Ürün, entegrasyon ve hizmet kapsamı</span>
            <span><b>03</b> Net teklif ve yol haritası</span>
          </div>
          <p className="quote-contact">Doğrudan iletişim: <a href={`tel:${settings.contactPhoneHref}`}>{settings.contactPhone}</a> · <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a></p>
        </div>

        <div id="teklif-formu">
          <OfferForm defaultInterest={solution} defaultMessage={defaultMessage} />
        </div>
      </section>
    </main>
  );
}
