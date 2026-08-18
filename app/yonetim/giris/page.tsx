import { withBasePath } from "../../base-path";
import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminUser } from "../../admin-auth";
import { localAdminPrefillEmail, safeAdminNextPath } from "../../admin-session.mjs";
import { SiteBrand } from "../../site-brand";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Yönetim Girişi | Avcı",
  robots: { index: false, follow: false },
};

const ERRORS = {
  hata: "E-posta veya şifre hatalı.",
  kilit: "Çok fazla deneme. 15 dakika sonra tekrar deneyin.",
  ayar: "Giriş henüz sunucuda ayarlanmamış.",
} as const;

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await getAdminUser();
  const params = await searchParams;
  const next = safeAdminNextPath(typeof params.next === "string" ? params.next : "/yonetim");
  if (admin.authorized && admin.user) redirect(next);

  const durum = typeof params.durum === "string" && params.durum in ERRORS
    ? ERRORS[params.durum as keyof typeof ERRORS]
    : "";

  let env: Record<string, unknown> = {};
  try {
    ({ env } = await import("cloudflare:workers") as unknown as { env: Record<string, unknown> });
  } catch {
    env = typeof process !== "undefined" ? process.env : {};
  }
  const localEmail = localAdminPrefillEmail(env, (await headers()).get("host"));

  return (
    <main className="admin-access-page admin-login-page">
      <section>
        <SiteBrand label="Avcı ana sayfa" />
        <span className="kicker kicker-light">SAĞLAYICI PANELİ</span>
        <h1>Yönetim girişi</h1>
        <p>Bu ekran Avcı’nın kendi işi içindir: teklif, lisans ve modül. Mağaza kasası değildir.</p>
        {durum ? <p className="admin-login-error" role="alert">{durum}</p> : null}
        <form className="admin-login-form" method="post" action={withBasePath("/api/yonetim/giris")}>
          <input type="hidden" name="next" value={next} />
          <label>
            <span>E-posta</span>
            <input type="email" name="email" autoComplete="username" required maxLength={180} defaultValue={localEmail} autoFocus={!localEmail} />
          </label>
          <label>
            <span>Şifre</span>
            <input type="password" name="password" autoComplete="current-password" required minLength={10} maxLength={200} autoFocus={Boolean(localEmail)} />
          </label>
          <input className="visually-hidden" type="text" name="website" tabIndex={-1} autoComplete="off" />
          <button className="button button-primary" type="submit">Giriş yap</button>
        </form>
        <p className="admin-login-foot"><Link href="/">Siteye dön</Link></p>
      </section>
    </main>
  );
}
