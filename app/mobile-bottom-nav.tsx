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

const GROUPS = [
  {
    title: "Hesap",
    items: [
      { href: "/musteri-merkezi", label: "Müşteri merkezi" },
      { href: "/musteri-hesap", label: "Hesap ve şifre" },
    ],
  },
  {
    title: "Mağaza yazılımı",
    items: [
      { href: "/eticaret-altyapisi", label: "E-Ticaret" },
      { href: "/vitrin-tasarim", label: "Vitrin" },
      { href: "/odeme-kargo", label: "Ödeme & Kargo" },
      { href: "/iade-iptal", label: "İade & İptal" },
      { href: "/stok-operasyon", label: "Stok" },
      { href: "/pazaryeri-kanallari", label: "Pazaryeri" },
    ],
  },
  {
    title: "Güvenlik",
    items: [
      { href: "/guvenlik", label: "Güvenlik" },
      { href: "/erisim-denetim", label: "Erişim" },
      { href: "/oturum-politika", label: "Oturum" },
      { href: "/magaza-kvkk", label: "Mağaza KVKK" },
    ],
  },
  {
    title: "Rehber",
    items: [
      { href: "/kaynaklar", label: "Kaynaklar ve SSS" },
      { href: "/hizmetler", label: "Hizmetler" },
      { href: "/teslim-egitim", label: "Teslim & Eğitim" },
      { href: "/en", label: "English", hrefLang: "en" as const },
    ],
  },
] as const;

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
    const html = document.documentElement;
    const previousOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      html.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (pathname === "/yonetim" || pathname.startsWith("/yonetim/")) return null;
  if (pathname === "/en" || pathname.startsWith("/en/")) return null;

  const groups = GROUPS.map((group) => {
    if (group.title !== "Hesap" || !customerLoginEnabled) return group;
    return {
      ...group,
      items: [{ href: "/musteri-girisi", label: "Müşteri girişi" }, ...group.items],
    };
  });

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
          {groups.map((group) => (
            <div className="mobile-bottom-nav-group" key={group.title}>
              <p className="mobile-bottom-nav-label">{group.title}</p>
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  hrefLang={"hrefLang" in item ? item.hrefLang : undefined}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
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
