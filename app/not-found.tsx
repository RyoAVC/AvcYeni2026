import Link from "next/link";
import { SiteBrand } from "./site-brand";
import { loadSiteSettings } from "./site-settings.mjs";

export const dynamic = "force-dynamic";

export default async function NotFound() {
  const settings = await loadSiteSettings();

  return (
    <main className="status-page">
      <div className="status-grid" aria-hidden="true" />
      <div className="status-code" aria-hidden="true">404</div>
      <section>
        <SiteBrand />
        <span className="kicker kicker-light">SAYFA BULUNAMADI</span>
        <h1>Aradığınız sayfa taşınmış veya artık burada olmayabilir.</h1>
        <p>Bağlantıyı kontrol edebilir ya da ana sayfadan yazılımlarımızı ve platform çözümlerimizi keşfedebilirsiniz.</p>
        <div className="status-actions">
          <Link className="button button-primary" href="/">Ana sayfaya dön</Link>
          <a className="button button-ghost" href={`mailto:${settings.contactEmail}`}>Bize ulaşın</a>
        </div>
      </section>
    </main>
  );
}
