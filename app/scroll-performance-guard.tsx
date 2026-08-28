"use client";

import { useEffect } from "react";

const SCROLL_IDLE_DELAY = 140;

/**
 * Ağır dekoratif efektleri yalnız aktif kaydırma boyunca dondurur.
 * Pasif dinleyici kaydırmayı engellemez; içerik ve etkileşimler değişmez.
 */
export function ScrollPerformanceGuard() {
  useEffect(() => {
    let idleTimer = 0;
    let frame = 0;

    const finishScrolling = () => {
      document.documentElement.classList.remove("is-page-scrolling");
    };

    const handleScroll = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(() => {
          document.documentElement.classList.add("is-page-scrolling");
          frame = 0;
        });
      }

      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(finishScrolling, SCROLL_IDLE_DELAY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.clearTimeout(idleTimer);
      if (frame) window.cancelAnimationFrame(frame);
      finishScrolling();
    };
  }, []);

  return null;
}
