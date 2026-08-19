"use client";

import { useEffect, useMemo, useState } from "react";

export type LiveSignal = {
  id: number;
  label: string;
  value: string;
};

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function parseBase(value: string) {
  const cleaned = value.replace(",", ".").trim();
  if (/^\d+$/.test(cleaned)) return { kind: "num" as const, n: Number(cleaned) };
  return { kind: "text" as const, t: value };
}

function liveNumber(base: number, seed: number, tick: number) {
  const swing = Math.max(2, Math.round(base * 0.1));
  const wave = Math.sin((tick + seed) * 1.37) * swing;
  const step = ((tick * 17 + seed * 13) % 5) - 2;
  return Math.max(1, Math.round(base + wave + step));
}

export function LiveStripPulse({ items }: { items: LiveSignal[] }) {
  const bases = useMemo(
    () => items.map((item) => ({ ...item, parsed: parseBase(item.value) })),
    [items],
  );
  const [tick, setTick] = useState(0);
  const [position, setPosition] = useState(0);
  const [motionOff, setMotionOff] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setMotionOff(true);
      return;
    }

    const numbers = window.setInterval(() => setTick((current) => current + 1), 1600);
    const rotation = window.setInterval(
      () => setPosition((current) => (items.length > 0 ? (current + 1) % items.length : 0)),
      2800,
    );
    return () => {
      window.clearInterval(numbers);
      window.clearInterval(rotation);
    };
  }, [items.length]);

  const visible = Array.from({ length: Math.min(3, bases.length) }, (_, offset) => (
    bases[(position + offset) % bases.length]
  ));

  return (
    <div className="live-strip-wrap">
      <aside className="live-strip" aria-label="AVCVERİ temsili canlı vitrin göstergeleri">
        <p className="live-strip-kicker">AVCVERİ</p>
        <div className="live-strip-viewport">
          <div className="live-strip-track" key={motionOff ? "static" : position}>
            {visible.map((item, index) => {
              if (!item) return null;
              const shown = item.parsed.kind === "num"
                ? String(motionOff ? item.parsed.n : liveNumber(item.parsed.n, item.id, tick + index))
                : item.parsed.t;
              return (
                <span className="live-strip-item" key={item.id}>
                  <i className="status-dot" aria-hidden="true" />
                  <span>{item.label}</span>
                  <strong>{shown}</strong>
                </span>
              );
            })}
          </div>
        </div>
      </aside>
    </div>
  );
}
