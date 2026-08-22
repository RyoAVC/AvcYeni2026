"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type DemoPortalNavItem = {
  id: string;
  label: string;
};

type PortalNavContextValue = {
  items: DemoPortalNavItem[];
  activeId: string;
  mobileOpen: boolean;
  setActiveId: (id: string) => void;
  setMobileOpen: (open: boolean) => void;
  selectSection: (id: string) => void;
};

const PortalNavContext = createContext<PortalNavContextValue | null>(null);

function readHashSection(items: DemoPortalNavItem[]) {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.replace(/^#/, "");
  return items.some((item) => item.id === hash) ? hash : null;
}

export function DemoPortalNavProvider({
  items,
  defaultId = "ozet",
  children,
}: {
  items: DemoPortalNavItem[];
  defaultId?: string;
  children: ReactNode;
}) {
  const initialId = items.some((item) => item.id === defaultId) ? defaultId : items[0]?.id ?? "ozet";
  const [activeId, setActiveId] = useState(initialId);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fromHash = readHashSection(items);
    if (fromHash) setActiveId(fromHash);

    const onHashChange = () => {
      const next = readHashSection(items);
      if (next) {
        setActiveId(next);
        setMobileOpen(false);
      }
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [items]);

  const selectSection = useCallback(
    (id: string) => {
      if (!items.some((item) => item.id === id)) return;
      setActiveId(id);
      setMobileOpen(false);
      if (typeof window !== "undefined") {
        const nextHash = `#${id}`;
        if (window.location.hash !== nextHash) {
          window.history.replaceState(null, "", nextHash);
        }
      }
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "auto" });
      }
    },
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      activeId,
      mobileOpen,
      setActiveId,
      setMobileOpen,
      selectSection,
    }),
    [items, activeId, mobileOpen, selectSection],
  );

  return <PortalNavContext.Provider value={value}>{children}</PortalNavContext.Provider>;
}

function usePortalNav() {
  const ctx = useContext(PortalNavContext);
  if (!ctx) {
    throw new Error("DemoPortalNavProvider gerekli");
  }
  return ctx;
}

export function DemoPortalNav() {
  const { items, activeId, selectSection } = usePortalNav();

  return (
    <div className="cp-sidebar-nav-shell">
      <p className="cp-sidebar-nav-label">Bölümler</p>
      <nav aria-label="Panel bölümleri" className="cp-sidebar-nav-track">
        {items.map((item, index) => (
          <a
            aria-current={activeId === item.id ? "page" : undefined}
            className={activeId === item.id ? "active" : undefined}
            href={`#${item.id}`}
            key={item.id}
            onClick={(event) => {
              event.preventDefault();
              selectSection(item.id);
            }}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            {item.label}
          </a>
        ))}
      </nav>
    </div>
  );
}

export function DemoPortalMobileToggle() {
  const { mobileOpen, setMobileOpen, items, activeId } = usePortalNav();
  const activeLabel = items.find((item) => item.id === activeId)?.label ?? "Özet";

  return (
    <button
      aria-controls="cp-mobile-nav"
      aria-expanded={mobileOpen}
      className="cp-mobile-nav-toggle"
      onClick={() => setMobileOpen(!mobileOpen)}
      type="button"
    >
      <span className="cp-mobile-nav-toggle-bars" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span className="cp-mobile-nav-toggle-copy">
        <small>Bölüm</small>
        <strong>{activeLabel}</strong>
      </span>
    </button>
  );
}

export function DemoPortalMobileDrawer() {
  const { items, activeId, mobileOpen, setMobileOpen, selectSection } = usePortalNav();

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen, setMobileOpen]);

  return (
    <>
      <button
        aria-hidden={!mobileOpen}
        aria-label="Menüyü kapat"
        className={mobileOpen ? "cp-mobile-nav-backdrop is-open" : "cp-mobile-nav-backdrop"}
        hidden={!mobileOpen}
        onClick={() => setMobileOpen(false)}
        tabIndex={mobileOpen ? 0 : -1}
        type="button"
      />
      <div
        aria-hidden={!mobileOpen}
        className={mobileOpen ? "cp-mobile-nav-drawer is-open" : "cp-mobile-nav-drawer"}
        id="cp-mobile-nav"
      >
        <div className="cp-mobile-nav-drawer-head">
          <span className="kicker">PANEL BÖLÜMLERİ</span>
          <button className="cp-mobile-nav-close" onClick={() => setMobileOpen(false)} type="button">
            Kapat
          </button>
        </div>
        <nav aria-label="Mobil panel bölümleri">
          {items.map((item, index) => (
            <a
              aria-current={activeId === item.id ? "page" : undefined}
              className={activeId === item.id ? "active" : undefined}
              href={`#${item.id}`}
              key={item.id}
              onClick={(event) => {
                event.preventDefault();
                selectSection(item.id);
              }}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </>
  );
}

export function DemoPortalPanel({
  id,
  children,
  className,
  as: Tag = "section",
  ...rest
}: {
  id: string;
  children: ReactNode;
  className?: string;
  as?: "section" | "article" | "div";
  "aria-label"?: string;
}) {
  const { activeId } = usePortalNav();
  const isActive = activeId === id;
  return (
    <Tag
      {...rest}
      aria-hidden={!isActive}
      className={["cp-panel", className, isActive ? "is-active" : undefined].filter(Boolean).join(" ")}
      data-cp-panel={id}
      hidden={!isActive}
      id={id}
    >
      {children}
    </Tag>
  );
}
