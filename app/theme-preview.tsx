"use client";

import { useEffect, useState } from "react";
import { withBasePath } from "./base-path";

const PARAM = "onizleme";
const VALUE = "logo";
const ATTR = "data-theme-preview";
const LOGO_LIGHT = withBasePath("/brand/avci-logo-light-transparent.png");
const LOGO_DARK = withBasePath("/brand/avci-logo-dark-transparent.png");

function isLogoPreview(search: string) {
  return new URLSearchParams(search).get(PARAM) === VALUE;
}

function injectBrandLogos() {
  const brands = document.querySelectorAll<HTMLElement>(".brand");
  brands.forEach((brand) => {
    if (brand.querySelector(".brand-logo-img")) return;

    const mark = brand.querySelector(".brand-mark");
    const copy = brand.querySelector(".brand-copy");
    if (mark) mark.setAttribute("hidden", "");
    if (copy) copy.setAttribute("hidden", "");

    const onLightChrome = Boolean(
      brand.closest(".catalog-header, .admin-shell, .offer-header, .status-card")
    );

    const img = document.createElement("img");
    img.className = "brand-logo-img";
    img.src = onLightChrome ? LOGO_DARK : LOGO_LIGHT;
    img.alt = "avci e-ticaret.com";
    img.width = 220;
    img.height = 50;
    img.decoding = "async";
    brand.prepend(img);
  });
}

function removeBrandLogos() {
  document.querySelectorAll(".brand-logo-img").forEach((el) => el.remove());
  document.querySelectorAll(".brand .brand-mark[hidden], .brand .brand-copy[hidden]").forEach((el) => {
    el.removeAttribute("hidden");
  });
}

/**
 * Sadece ?onizleme=logo ile açılır.
 * Gerçek logo PNG + siyah/kırmızı palet. Varsayılan siteyi bozmaz.
 */
export function ThemePreviewBanner() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const apply = () => {
      const on = isLogoPreview(window.location.search);
      setActive(on);
      if (on) {
        document.documentElement.setAttribute(ATTR, "logo");
        injectBrandLogos();
      } else {
        document.documentElement.removeAttribute(ATTR);
        removeBrandLogos();
      }
    };

    apply();
    window.addEventListener("popstate", apply);
    return () => {
      window.removeEventListener("popstate", apply);
      document.documentElement.removeAttribute(ATTR);
      removeBrandLogos();
    };
  }, []);

  if (!active) return null;

  return (
    <div className="theme-preview-banner" role="status">
      <span>
        <strong>Logo önizleme</strong>
        {" — "}
        Gerçek logo + siyah/kırmızı palet. Ana tema kalıcı değişmedi.
      </span>
      <span className="theme-preview-banner-actions">
        <a href={withBasePath("/?onizleme=logo")}>Yenile</a>
        <a href={withBasePath("/")}>Normal görünüm</a>
      </span>
    </div>
  );
}

export const BRAND_LOGO_PATHS = { light: LOGO_LIGHT, dark: LOGO_DARK };
