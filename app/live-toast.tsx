"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { isAdminPath } from "./cookie-notice-choice.mjs";

export type LiveToastItem = {
  title: string;
  text: string;
};

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function LiveToast({ items }: { items: LiveToastItem[] }) {
  const pathname = usePathname() || "/";
  const [index, setIndex] = useState(0);
  const [side, setSide] = useState<"left" | "right">("left");
  const [leaving, setLeaving] = useState(false);
  const [shown, setShown] = useState(false);
  const [motionOff, setMotionOff] = useState(false);

  useEffect(() => {
    if (!items.length || prefersReducedMotion()) {
      setMotionOff(true);
      return;
    }

    setMotionOff(false);
    const timers: number[] = [];
    let cancelled = false;
    let nextIndex = 0;
    let nextSide: "left" | "right" = "left";

    function show() {
      if (cancelled) return;
      setIndex(nextIndex);
      setSide(nextSide);
      setLeaving(false);
      setShown(true);
      timers.push(window.setTimeout(hide, 3400));
    }

    function hide() {
      if (cancelled) return;
      setLeaving(true);
      timers.push(window.setTimeout(() => {
        if (cancelled) return;
        setShown(false);
        nextIndex = (nextIndex + 1) % items.length;
        nextSide = nextSide === "left" ? "right" : "left";
        timers.push(window.setTimeout(show, 2200));
      }, 400));
    }

    timers.push(window.setTimeout(show, 800));

    return () => {
      cancelled = true;
      for (const timer of timers) window.clearTimeout(timer);
    };
  }, [pathname, items]);

  if (isAdminPath(pathname) || motionOff || !shown || !items.length) return null;

  const toast = items[index % items.length];
  if (!toast) return null;

  return (
    <div className={`live-toast is-${side}${leaving ? " is-out" : ""}`} aria-hidden="true">
      <i className="status-dot" />
      <div>
        <small>Örnek · {toast.title}</small>
        <strong>{toast.text}</strong>
      </div>
    </div>
  );
}
