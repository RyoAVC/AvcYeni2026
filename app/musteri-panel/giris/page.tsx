import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { withBasePath } from "../../base-path";
import { getCustomerUser } from "../../customer-auth";
import { canUseCustomerPortalLogin } from "../../customer-portal-dev.mjs";
import { safeCustomerNextPath } from "../../customer-session.mjs";
import { SiteBrand } from "../../site-brand";
import { CustomerPortalLoginForm } from "./customer-portal-login-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Müşteri Paneli Girişi | Avcı E-Ticaret",
  robots: { index: false, follow: false },
};

const ERRORS = {
  hata: "Bu e-posta ile aktif yazılım müşterisi bulunamadı.",
  kapali: "Yerel müşteri paneli girişi bu ortamda kapalı.",
  ayar: "Oturum anahtarı henüz ayarlanmadı.",
} as const;

export default async function CustomerPortalLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getCustomerUser();
  const params = await searchParams;
  const next = safeCustomerNextPath(typeof params.next === "string" ? params.next : "/musteri-panel");
  if (session.authorized && session.customer) redirect(next);

  let env: Record<string, unknown> = {};
  try {
    ({ env } = await import("cloudflare:workers") as unknown as { env: Record<string, unknown> });
  } catch {
    env = typeof process !== "undefined" ? process.env : {};
  }

  const host = (await headers()).get("host");
  const requestUrl = host ? `http://${host}/musteri-panel/giris` : "http://127.0.0.1:4115/musteri-panel/giris";
  const loginOpen = canUseCustomerPortalLogin(new Request(requestUrl), env);
  const durum = typeof params.durum === "string" && params.durum in ERRORS
    ? ERRORS[params.durum as keyof typeof ERRORS]
    : "";

  return (
    <main className="customer-login-page customer-portal-login-page">
      <a className="skip-link" href="#musteri-panel-giris">
        Müşteri paneli girişine geç
      </a>
      <header>
        <SiteBrand />
        <Link href="/">Ana sayfaya dön</Link>
      </header>
      <section id="musteri-panel-giris">
        <div className="customer-login-copy">
          <span className="kicker kicker-light">MÜŞTERİ PANELİ · YEREL</span>
          <h1>
            Yazılım müşterisi
            <br />
            <em>salt okunur görünüm.</em>
          </h1>
          <p>
            Bu adım parola toplamaz. Yalnızca yerel geliştirmede, yönetimde kayıtlı aktif işletme e-postası ile D1
            verisini okur. Kart çekimi, e-Fatura veya kayıt değiştirme yoktur.
          </p>
          <ul>
            <li>
              <span>✓</span>Veri kaynağı: Avcı yönetimindeki yazılım müşterisi
            </li>
            <li>
              <span>✓</span>Sipariş, destek ve fatura: salt okunur
            </li>
            <li>
              <span>✓</span>Örnek vitrin için demo portal ayrıdır
            </li>
          </ul>
          <Link className="portal-scope-link" href="/demo-portal">
            Demo portalı (örnek veri) inceleyin
          </Link>
        </div>
        <aside className="customer-login-card">
          <small>YEREL TEST OTURUMU</small>
          {loginOpen ? (
            <>
              <h2>Kayıtlı e-posta ile girin</h2>
              <p>Yönetimdeki müşteri kartında görünen e-postayı yazın. Şifre kutusu yoktur.</p>
              {durum ? (
                <div className="portal-notice" role="status">
                  <strong>{durum}</strong>
                </div>
              ) : null}
              <CustomerPortalLoginForm nextPath={next} />
              <Link className="demo-portal-link" href="/musteri-girisi">
                Genel müşteri giriş sayfasına dön
              </Link>
            </>
          ) : (
            <>
              <h2>Yerel panel girişi kapalı.</h2>
              <p>Bu giriş yalnızca yerel geliştirme ve `CUSTOMER_PORTAL_DEV` / `LOCAL_ADMIN_BYPASS` ile açılır.</p>
              <Link className="button button-primary" href="/musteri-girisi">
                Müşteri girişine dön
              </Link>
            </>
          )}
        </aside>
      </section>
      <footer>
        <span>Canlıda parola yine ayrı lisans platformunda işlenir.</span>
        <Link href={withBasePath("/api/musteri-panel/cikis")}>Oturumu kapat</Link>
      </footer>
    </main>
  );
}
