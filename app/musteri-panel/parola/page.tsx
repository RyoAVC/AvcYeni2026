import type { Metadata } from "next";
import Link from "next/link";
import { SiteBrand } from "../../site-brand";
import { CustomerSetupPasswordForm } from "./customer-setup-password-form";

export const metadata: Metadata = {
  title: "Panel Parolanızı Belirleyin | Avcı E-Ticaret",
  robots: { index: false, follow: false },
};

export default function CustomerSetupPasswordPage() {
  return (
    <main className="customer-login-page customer-portal-login-page">
      <a className="skip-link" href="#musteri-parola-belirle">
        Parola belirleme formuna geç
      </a>
      <header>
        <SiteBrand />
        <Link href="/">Ana sayfaya dön</Link>
      </header>
      <section id="musteri-parola-belirle">
        <div className="customer-login-copy">
          <span className="kicker kicker-light">DEMO ERİŞİMİ</span>
          <h1>
            Panelinize
            <br />
            <em>ilk parolanızı belirleyin.</em>
          </h1>
          <p>
            E-postanızdaki tek kullanımlık bağlantı sizi buraya getirdi. Bir parola belirleyin, doğrudan kendi
            işletme adınızla açılan müşteri panelinize yönlendirileceksiniz.
          </p>
          <ul>
            <li>
              <span>✓</span>Bağlantı tek kullanımlıktır
            </li>
            <li>
              <span>✓</span>Gerçek ödeme, kargo ve müşteri mesajı kapalıdır
            </li>
            <li>
              <span>✓</span>Panel yalnız kendi firma bilgilerinizi gösterir
            </li>
          </ul>
        </div>
        <aside className="customer-login-card">
          <small>GÜVENLİ HESAP KURULUMU</small>
          <CustomerSetupPasswordForm />
        </aside>
      </section>
    </main>
  );
}
