"use client";

import { useEffect, useState } from "react";
import styles from "./demo-portal-theme-widget.module.css";

type PortalTheme = "avci" | "graphite" | "energy";
type PortalMode = "day" | "night";

const themes: readonly { id: PortalTheme; label: string; note: string }[] = [
  { id: "avci", label: "Avcı", note: "Kurumsal bordo" },
  { id: "graphite", label: "Kömür", note: "Sakin ve güçlü" },
  { id: "energy", label: "Enerji", note: "Sıcak vurgu" },
] as const;

const storageKey = "avci-demo-portal-theme";
const modeStorageKey = "avci-demo-portal-mode";

function isPortalTheme(value: string | null): value is PortalTheme {
  return themes.some((theme) => theme.id === value);
}

export function DemoPortalThemeWidget() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<PortalTheme>("avci");
  const [mode, setMode] = useState<PortalMode>("day");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const saved = window.localStorage.getItem(storageKey);
      if (isPortalTheme(saved)) setTheme(saved);
      const savedMode = window.localStorage.getItem(modeStorageKey);
      if (savedMode === "day" || savedMode === "night") setMode(savedMode);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const portal = document.querySelector<HTMLElement>(".cp-page");
    if (!portal) return;
    portal.dataset.portalTheme = theme;
    window.localStorage.setItem(storageKey, theme);
  }, [theme]);

  useEffect(() => {
    const portal = document.querySelector<HTMLElement>(".cp-page");
    if (!portal) return;
    portal.dataset.portalMode = mode;
    window.localStorage.setItem(modeStorageKey, mode);
  }, [mode]);

  return (
    <aside className={`${styles.widget}${open ? ` ${styles.open}` : ""}`} aria-label="Panel görünüm ayarları">
      <button
        className={styles.trigger}
        type="button"
        aria-label={open ? "Panel temasını kapat" : "Panel temasını aç"}
        aria-expanded={open}
        aria-controls="portal-theme-panel"
        onClick={() => setOpen((current) => !current)}
      >
        <span aria-hidden="true">◐</span>
        <b>Tema</b>
      </button>
      <div className={styles.panel} id="portal-theme-panel" hidden={!open}>
        <div className={styles.head}>
          <div><small>PANEL GÖRÜNÜMÜ</small><strong>Renk temasını seçin</strong></div>
          <button type="button" aria-label="Tema panelini kapat" onClick={() => setOpen(false)}>×</button>
        </div>
        <p>Seçiminiz yalnız bu tarayıcıdaki demo panelinde saklanır.</p>
        <div className={styles.modeBlock}>
          <small>GÖRÜNÜM MODU</small>
          <div className={styles.modes} role="group" aria-label="Panel görünüm modu">
            <button type="button" aria-pressed={mode === "day"} onClick={() => setMode("day")}>
              <span aria-hidden="true">☀</span><b>Gündüz</b>
            </button>
            <button type="button" aria-pressed={mode === "night"} onClick={() => setMode("night")}>
              <span aria-hidden="true">◒</span><b>Gece</b>
            </button>
          </div>
        </div>
        <small className={styles.paletteLabel}>RENK PALETİ</small>
        <div className={styles.options} role="group" aria-label="Panel renk temaları">
          {themes.map((item) => (
            <button
              className={styles[item.id]}
              type="button"
              aria-pressed={theme === item.id}
              key={item.id}
              onClick={() => setTheme(item.id)}
            >
              <span aria-hidden="true"><i /><i /><i /></span>
              <span><strong>{item.label}</strong><small>{item.note}</small></span>
              <b aria-hidden="true">{theme === item.id ? "✓" : ""}</b>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
