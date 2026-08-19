import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SITE_OPEN_GRAPH } from "./site-social-metadata";
import { cookies } from "next/headers";
import { ThemePreviewBanner } from "./theme-preview";
import { CookieNotice } from "./cookie-notice";
import { LiveToastHost } from "./live-toast-host";
import { SiteVisitBeacon } from "./site-visit-beacon";
import { AvcaiMascot } from "./avcai-mascot";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { parseSiteTheme } from "./site-theme.mjs";
import { loadSiteSettings } from "./site-settings.mjs";
import { SITE_BASE_URL, withBasePath } from "./base-path";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_BASE_URL),
  applicationName: "Avcı E-Ticaret",
  title: "Avcı E-Ticaret | E-Ticaret Altyapısı ve Ticaret Platformu",
  description: "Web mağazası, mobil uygulama, katalog, sipariş, ödeme, B2B, C2C, e-ihracat, entegrasyon ve isteğe bağlı yapay zekâ modülleri.",
  alternates: { canonical: SITE_BASE_URL },
  manifest: withBasePath("/manifest.webmanifest"),
  authors: [{ name: "Avcı E-Ticaret", url: SITE_BASE_URL }],
  creator: "Avcı E-Ticaret",
  publisher: "Avcı E-Ticaret",
  category: "technology",
  formatDetection: { email: false, address: false, telephone: false },
  robots: { index: true, follow: true },
  openGraph: SITE_OPEN_GRAPH,
  twitter: {
    card: "summary_large_image",
    title: "Avcı E-Ticaret | Ticaretinizi tek merkezden yönetin",
    description: "Mağaza, mobil uygulama, katalog, sipariş, ödeme ve operasyon ihtiyaçlarını tek modüler e-ticaret altyapısında yönetin.",
    images: [withBasePath("/og.png")],
  },
  icons: {
    icon: withBasePath("/favicon.svg"),
    shortcut: withBasePath("/favicon.svg"),
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#14151a",
  colorScheme: "light dark",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let theme = "night";
  try {
    theme = parseSiteTheme((await cookies()).get("avci_theme")?.value);
  } catch {
    theme = "night";
  }
  const settings = await loadSiteSettings();

  return (
    <html lang="tr" data-theme={theme}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemePreviewBanner />
        <SiteVisitBeacon />
        <CookieNotice />
        <LiveToastHost />
        <AvcaiMascot
          exitPopup={{
            enabled: settings.tofyPopupEnabled,
            title: settings.tofyPopupTitle,
            text: settings.tofyPopupText,
            button: settings.tofyPopupButton,
            href: settings.tofyPopupHref,
          }}
        />
        <MobileBottomNav customerLoginEnabled={settings.customerLoginEnabled} />
        {children}
        <style>{`
          .avc-header {
            position: fixed;
            top: 26px;
            right: 22px;
            z-index: 9998;
            display: inline-block;
          }
          .avc-header summary {
            list-style: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 12px;
            border-radius: 12px;
            border: 1px solid color-mix(in srgb, var(--mint) 45%, transparent);
            background: color-mix(in srgb, var(--ink) 78%, black);
            color: var(--white);
            box-shadow: 0 8px 24px color-mix(in srgb, var(--mint) 28%, transparent);
          }
          .avc-header summary::-webkit-details-marker {
            display: none;
          }
          .avc-dot {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            border: 1px solid color-mix(in srgb, var(--lime) 35%, transparent);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--lime);
            font-weight: 900;
          }
          .avc-header b {
            display: block;
            font-size: 11px;
            letter-spacing: 0.16em;
            text-transform: uppercase;
          }
          .avc-header small {
            display: block;
            margin-top: 3px;
            font-size: 8px;
            color: rgba(255, 255, 255, 0.65);
          }
          .avc-header .avc-panel {
            position: absolute;
            left: 0;
            top: 54px;
            z-index: 70;
            width: 330px;
            border-radius: 22px;
            border: 1px solid color-mix(in srgb, var(--cyan) 25%, transparent);
            background: color-mix(in srgb, var(--ink) 92%, black);
            color: var(--white);
            overflow: hidden;
            box-shadow: 0 30px 90px color-mix(in srgb, var(--cyan) 20%, transparent);
          }
          .avc-header .avc-panel p {
            margin: 8px 0 0;
            font-size: 12px;
            line-height: 1.5;
            color: rgba(255, 255, 255, 0.58);
          }
          .avc-header a {
            display: block;
            margin: 14px;
            padding: 12px;
            border-radius: 12px;
            background: var(--mint);
            color: var(--white);
            font-weight: 800;
            text-align: center;
            text-decoration: none;
          }

          .avc-side {
            position: fixed;
            left: 0;
            bottom: 90px;
            z-index: 9999;
          }
          .avc-side summary {
            list-style: none;
            cursor: pointer;
            width: 56px;
            height: 148px;
            margin-left: -10px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 10px;
            border: 1px solid color-mix(in srgb, var(--cyan) 30%, transparent);
            border-left: 0;
            border-radius: 0 16px 16px 0;
            background: color-mix(in srgb, var(--ink) 78%, black);
            color: var(--white);
            box-shadow:
              0 0 0 1px color-mix(in srgb, var(--cyan) 35%, transparent),
              0 16px 40px color-mix(in srgb, var(--mint) 42%, transparent);
            animation: float 8s ease-in-out infinite;
          }
          .avc-side[open] summary,
          .avc-side summary:hover {
            margin-left: 0;
            animation: none;
          }
          .avc-side summary::-webkit-details-marker {
            display: none;
          }
          .avc-side .ok {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: color-mix(in srgb, var(--lime) 65%, var(--mint));
            color: var(--ink);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 900;
            box-shadow: 0 0 16px color-mix(in srgb, var(--lime) 55%, transparent);
          }
          .avc-side .txt {
            writing-mode: vertical-rl;
            font-size: 9px;
            font-weight: 900;
            letter-spacing: 0.22em;
            text-transform: uppercase;
          }
          .avc-side .panel {
            position: absolute;
            left: 60px;
            bottom: 0;
            width: 300px;
            border-radius: 22px;
            border: 1px solid color-mix(in srgb, var(--cyan) 25%, transparent);
            background: color-mix(in srgb, var(--ink) 92%, black);
            color: var(--white);
            overflow: hidden;
            box-shadow: 0 26px 75px color-mix(in srgb, var(--mint) 30%, transparent);
          }
          .avc-side .panel p {
            margin: 10px 0 0;
            font-size: 12px;
            line-height: 1.5;
            color: rgba(255, 255, 255, 0.62);
          }
          .avc-side .panel a {
            display: block;
            padding: 14px 20px;
            background: var(--mint);
            color: var(--white);
            font-weight: 800;
            text-decoration: none;
          }
        `}</style>
        <details className="avc-header">
          <summary>
            <span className="avc-dot">✓</span>
            <span>
              <b>AVC Kayıtlı</b>
              <small>Dijital ekosistem kimliği</small>
            </span>
          </summary>
          <div className="avc-panel" style={{ padding: 18 }}>
            <b style={{ fontSize: 16 }}>AVC Dijital Ekosistem Kaydı</b>
            <p>
              <strong style={{ color: "var(--white)" }}>Avcı E-Ticaret</strong>, ortak marka ve
              üretim standartlarıyla AVC ağı içinde yayınlanır.
            </p>
            <a
              href="https://hub.avcieticaret.com"
              target="_blank"
              rel="noreferrer"
            >
              Sahiplik kaydını doğrula
            </a>
          </div>
        </details>

        <details className="avc-side">
          <summary>
            <span className="ok">✓</span>
            <span className="txt">AVC Kayıtlı</span>
          </summary>
          <div className="panel">
            <div style={{ padding: 20 }}>
              <b style={{ fontSize: 15 }}>AVC sahiplik kaydı</b>
              <p>
                SİTE_ADI tasarımı, yazılımı ve marka görünümü Mahir Avcı / Avcı E-Ticaret’e
                aittir. İzinsiz kopya hukuka aykırıdır.
              </p>
            </div>
            <a
              href="https://hub.avcieticaret.com"
              target="_blank"
              rel="noreferrer"
            >
              Kaydı doğrula
            </a>
          </div>
        </details>
      </body>
    </html>
  );
}
