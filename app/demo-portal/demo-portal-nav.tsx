"use client";

import { useEffect, useState } from "react";

export type DemoPortalNavItem = {
  id: string;
  label: string;
};

type DemoPortalNavProps = {
  items: DemoPortalNavItem[];
};

export function DemoPortalNav({ items }: DemoPortalNavProps) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "ozet");

  useEffect(() => {
    const sectionIds = items.map((item) => item.id);
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => node !== null);

    if (sections.length === 0) return;

    const syncFromHash = () => {
      const hash = window.location.hash.replace(/^#/, "");
      if (hash && sectionIds.includes(hash)) {
        setActiveId(hash);
      }
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const nextId = visible[0]?.target.id;
        if (nextId && sectionIds.includes(nextId)) {
          setActiveId(nextId);
        }
      },
      {
        rootMargin: "-28% 0px -58% 0px",
        threshold: [0, 0.15, 0.35, 0.55],
      },
    );

    for (const section of sections) {
      observer.observe(section);
    }

    return () => {
      window.removeEventListener("hashchange", syncFromHash);
      observer.disconnect();
    };
  }, [items]);

  useEffect(() => {
    if (!window.matchMedia("(max-width: 1100px)").matches) return;

    const link = document.querySelector<HTMLAnchorElement>(`.cp-sidebar nav a[href="#${activeId}"]`);
    if (!link) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    link.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeId]);

  return (
    <div className="cp-sidebar-nav-shell">
      <p className="cp-sidebar-nav-label">Bölümler</p>
      <nav aria-label="Panel bölümleri" className="cp-sidebar-nav-track">
        {items.map((item, index) => (
          <a
            aria-current={activeId === item.id ? "location" : undefined}
            className={activeId === item.id ? "active" : undefined}
            href={`#${item.id}`}
            key={item.id}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            {item.label}
          </a>
        ))}
      </nav>
    </div>
  );
}
