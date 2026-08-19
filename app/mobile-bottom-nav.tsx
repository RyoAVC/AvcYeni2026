"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const PRIMARY = [
  { href: "/", label: "Ana sayfa" },
  { href: "/yazilimlar", label: "Yazılımlar" },
  { href: "/paketler", label: "Paketler" },
  { href: "/teklif", label: "Demo" },
] as const;

const MORE = [
  { href: "/eticaret-altyapisi", label: "E-Ticaret" },
  { href: "/yapay-zeka", label: "Yapay Zekâ" },
  { href: "/entegrasyonlar", label: "Entegrasyonlar" },
  { href: "/pazaryeri-kanallari", label: "Pazaryeri" },
  { href: "/vitrin-tasarim", label: "Vitrin" },
  { href: "/seo-gorunurluk", label: "SEO" },
  { href: "/ozel-yazilim", label: "Özel Modül" },
  { href: "/guvenlik", label: "Güvenlik" },
  { href: "/veri-gecisi", label: "Veri Geçişi" },
  { href: "/teslim-egitim", label: "Teslim & Eğitim" },
  { href: "/hizmetler", label: "Hizmetler" },
  { href: "/cozum-senaryolari", label: "Çözüm Senaryoları" },
  { href: "/kaynaklar", label: "Kaynaklar ve SSS" },
  { href: "/musteri-merkezi", label: "Müşteri merkezi" },
  { href: "/en", label: "English", hrefLang: "en" as const },
];

function pathActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileBottomNav({ customerLoginEnabled = false }: { customerLoginEnabled?: boolean }) {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return undefined;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (pathname === "/yonetim" || pathname.startsWith("/yonetim/")) return null;
  if (pathname === "/en" || pathname.startsWith("/en/")) return null;

  const extra = customerLoginEnabled
    ? [...MORE.slice(0, -1), { href: "/musteri-girisi", label: "Müşteri girişi" }, MORE[MORE.length - 1]]
    : MORE;

  return (
    <div className={open ? "mobile-bottom-nav is-open" : "mobile-bottom-nav"}>
      {open ? (
        <button
          type="button"
          className="mobile-bottom-nav-scrim"
          aria-label="Menüyü kapat"
          onClick={() => setOpen(false)}
        />
      ) : null}
      {open ? (
        <nav className="mobile-bottom-nav-sheet" aria-label="Tüm sayfalar">
          {extra.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              hrefLang={"hrefLang" in item ? item.hrefLang : undefined}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <a className="mobile-bottom-nav-cta" href="/#iletisim" onClick={() => setOpen(false)}>
            Demo isteyin
          </a>
        </nav>
      ) : null}
      <nav className="mobile-bottom-nav-bar" aria-label="Mobil menü">
        {PRIMARY.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={pathActive(pathname, item.href) ? "is-active" : undefined}
            onClick={() => setOpen(false)}
          >
            {item.label}
          </Link>
        ))}
        <button
          type="button"
          className={open ? "is-open" : undefined}
          aria-expanded={open}
          aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
          onClick={() => setOpen((value) => !value)}
        >
          Menü
        </button>
      </nav>
    </div>
  );
}
