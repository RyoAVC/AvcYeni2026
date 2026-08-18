"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { isAdminPath } from "./cookie-notice-choice.mjs";
import { parseSiteTheme, themeCookie } from "./site-theme.mjs";

function currentTheme() {
  if (typeof document === "undefined") return "night";
  return parseSiteTheme(document.documentElement.getAttribute("data-theme"));
}

export function ThemeToggle() {
  const pathname = usePathname() || "/";
  const [theme, setTheme] = useState<"night" | "day">(currentTheme);
  const english = pathname === "/en" || pathname.startsWith("/en/");

  useEffect(() => {
    const next = currentTheme();
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
  }, []);

  if (isAdminPath(pathname)) return null;

  function apply(next: "night" | "day") {
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    document.cookie = themeCookie(next);
  }

  return (
    <div className="theme-toggle" role="group" aria-label={english ? "Appearance" : "Görünüm"}>
      <button type="button" aria-pressed={theme === "night"} aria-label={english ? "Night" : "Gece"} onClick={() => apply("night")}>
        <svg className="theme-toggle-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M15.4 3.2a.8.8 0 0 0-1.1.9 7.6 7.6 0 1 1-8.2 10.6.8.8 0 0 0-1.1.9A9.2 9.2 0 1 0 16.4 3a.8.8 0 0 0-1-.8z"
          />
        </svg>
      </button>
      <button type="button" aria-pressed={theme === "day"} aria-label={english ? "Day" : "Gündüz"} onClick={() => apply("day")}>
        <svg className="theme-toggle-icon" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="4.2" fill="currentColor" />
          <path
            fill="currentColor"
            d="M11.2 2.4h1.6v3.1h-1.6zm0 16.1h1.6v3.1h-1.6zM2.4 11.2h3.1v1.6H2.4zm16.1 0h3.1v1.6h-3.1zM5.1 4.2l1.1-1.1 2.2 2.2-1.1 1.1zm10.5 10.5 1.1-1.1 2.2 2.2-1.1 1.1zM4.2 18.9l1.1 1.1 2.2-2.2-1.1-1.1zm10.5-10.5 1.1 1.1 2.2-2.2-1.1-1.1z"
          />
        </svg>
      </button>
    </div>
  );
}
