"use client";

import type { CSSProperties, PointerEvent, ReactNode } from "react";
import { useRef } from "react";

type BrandLogoFxProps = {
  children: ReactNode;
  className?: string;
  maskUrl: string;
  interactive?: boolean;
};

export function BrandLogoFx({
  children,
  className = "brand-logo-stack brand-logo-fx",
  maskUrl,
  interactive = true,
}: BrandLogoFxProps) {
  const ref = useRef<HTMLSpanElement>(null);

  function onPointerMove(event: PointerEvent<HTMLSpanElement>) {
    if (!interactive) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    el.style.setProperty("--my", `${event.clientY - rect.top}px`);
  }

  return (
    <span
      ref={ref}
      className={className}
      style={{ "--logo-mask": `url("${maskUrl}")` } as CSSProperties}
      onPointerMove={onPointerMove}
    >
      {children}
    </span>
  );
}
