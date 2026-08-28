import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
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
  hata: "E-posta veya panel parolası doğrulanamadı.",
  kapali: "Müşteri paneli girişi şu anda kapalı.",
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

  const requestHeaders = await headers();
  const host = requestHeaders.get("host");
  const forwardedProto = requestHeaders.get("x-forwarded-proto")?.split(",", 1)[0].trim();
  const protocol = forwardedProto === "https" ? "https" : "http";
  const requestUrl = host ? `${protocol}://${host}/musteri-panel/giris` : "http://127.0.0.1:4115/musteri-panel/giris";
  const loginOpen = canUseCustomerPortalLogin(new Request(requestUrl, { headers: forwardedProto ? { "x-forwarded-proto": forwardedProto } : undefined }), env);
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
          <span className="kicker kicker-light">AVCI MÜŞTERİ PANELİ</span>
          <h1>
            Yazılım müşterisi
            <br />
            <em>güvenli hesap görünümü.</em>
          </h1>
          <p>
            Yönetimde kayıtlı aktif işletme e-postanız ve güvenli panel parolanız birlikte doğrulanır. Panel;
            lisans, fatura, destek ve sistem durumunu güvenli biçimde gösterir.
          </p>
          <ul>
            <li>
              <span>✓</span>Müşteri hesabı güvenli parola ile doğrulanır
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
          <small>GÜVENLİ MÜŞTERİ OTURUMU</small>
          {loginOpen ? (
            <>
              <h2>Hesabınıza giriş yapın</h2>
              <p>Kayıtlı e-postanızı ve Avcı tarafından oluşturulan panel parolanızı kullanın.</p>
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
              <h2>Müşteri paneli girişi kapalı.</h2>
              <p>Giriş kanalı geçici olarak kapatılmıştır. Destek ekibinden erişim durumunu öğrenebilirsiniz.</p>
              <Link className="button button-primary" href="/musteri-girisi">
                Müşteri girişine dön
              </Link>
            </>
          )}
        </aside>
      </section>
    </main>
  );
}
