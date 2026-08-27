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
      </body>
    </html>
  );
}
