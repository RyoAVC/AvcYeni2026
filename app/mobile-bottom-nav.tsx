"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const PRIMARY = [
  { href: "/", label: "Ana", title: "Ana sayfa", icon: "home" },
  { href: "/yazilimlar", label: "Yazılım", title: "Yazılımlar", icon: "layers" },
  { href: "/paketler", label: "Paket", title: "Paketler", icon: "box" },
  { href: "/teklif", label: "Demo", title: "Demo iste", icon: "spark" },
] as const;

const ICONS = {
  home: "M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z",
  layers: "M4 8l8-4 8 4-8 4-8-4Zm0 5 8 4 8-4M4 16l8 4 8-4",
  box: "M4 8l8-4 8 4v10l-8 4-8-4V8Zm0 0 8 4 8-4M12 12v10",
  spark: "M12 3v4M12 17v4M4.2 6.2l2.8 2.8M17 15l2.8 2.8M3 12h4M17 12h4M4.2 17.8 7 15M17 9l2.8-2.8",
  menu: "M5 7h14M5 12h14M5 17h14",
} as const;

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

function NavGlyph({ name }: { name: keyof typeof ICONS }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={ICONS[name]}
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
            title={item.title}
            aria-current={pathActive(pathname, item.href) ? "page" : undefined}
            className={pathActive(pathname, item.href) ? "is-active" : undefined}
            onClick={() => setOpen(false)}
          >
            <NavGlyph name={item.icon} />
            <span>{item.label}</span>
          </Link>
        ))}
        <button
          type="button"
          className={open ? "is-open" : undefined}
          aria-expanded={open}
          aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
          onClick={() => setOpen((value) => !value)}
        >
          <NavGlyph name="menu" />
          <span>Menü</span>
        </button>
      </nav>
    </div>
  );
}
