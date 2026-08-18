"use client";

import { withBasePath } from "../base-path";
import { FormEvent, useState } from "react";

type LookupStatus = { type: "idle" | "loading" | "error" | "miss" | "found"; message: string };
type LookupResult = {
  domain?: string;
  company?: string;
  domainExpiresAt?: string;
  hostingExpiresAt?: string;
  domainDaysLeft?: number | null;
  hostingDaysLeft?: number | null;
  urgency?: string;
};

function daysLabel(value: number | null | undefined, empty: string) {
  if (typeof value !== "number") return empty;
  if (value < 0) return `${Math.abs(value)} gün önce bitti`;
  if (value === 0) return "Bugün bitiyor";
  return `${value} gün kaldı`;
}

export function DomainLookupForm() {
  const [status, setStatus] = useState<LookupStatus>({ type: "idle", message: "" });
  const [result, setResult] = useState<LookupResult | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status.type === "loading") return;
    setStatus({ type: "loading", message: "Kayıtlı envanter bakılıyor…" });
    setResult(null);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch(withBasePath("/api/alan-adi/sorgula"), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: String(form.get("email") ?? ""),
          domain: String(form.get("domain") ?? ""),
          website: String(form.get("website") ?? ""),
        }),
      });
      const payload = (await response.json()) as LookupResult & { ok?: boolean; found?: boolean; error?: string };
      if (!response.ok || !payload.ok) throw new Error(payload.error || "Sorgu yapılamadı.");
      if (!payload.found) {
        setStatus({ type: "miss", message: payload.error || "Kayıt bulunamadı." });
        return;
      }
      setResult(payload);
      setStatus({ type: "found", message: "Avcı kaydındaki süreler." });
    } catch (cause) {
      setStatus({ type: "error", message: cause instanceof Error ? cause.message : "Sorgu yapılamadı." });
    }
  }

  return (
    <form className="hosting-lookup-form" onSubmit={onSubmit} aria-busy={status.type === "loading"}>
      <label>
        <span>Kayıtlı e-posta</span>
        <input name="email" type="email" required maxLength={180} autoComplete="email" placeholder="musteri@firma.com" />
      </label>
      <label>
        <span>Alan adı</span>
        <input name="domain" type="text" required maxLength={80} autoComplete="off" placeholder="ornek.com" />
      </label>
      <input className="visually-hidden" type="text" name="website" tabIndex={-1} autoComplete="off" />
      <button className="button button-primary" type="submit" disabled={status.type === "loading"}>
        {status.type === "loading" ? "Bakılıyor…" : "Süreyi sor"}
      </button>
      {status.message ? (
        <p className={status.type === "error" || status.type === "miss" ? "form-status error" : "form-status"} role="status">
          {status.message}
        </p>
      ) : null}
      {result ? (
        <dl className={`hosting-lookup-result is-${result.urgency || "unknown"}`}>
          <div>
            <dt>Alan adı</dt>
            <dd>{result.domain}{result.company ? ` · ${result.company}` : ""}</dd>
          </div>
          <div>
            <dt>Alan adı süresi</dt>
            <dd>{daysLabel(result.domainDaysLeft, "Bitiş tarihi henüz yazılmamış")}</dd>
          </div>
          <div>
            <dt>Yayın / hosting</dt>
            <dd>{daysLabel(result.hostingDaysLeft, "Bitiş tarihi henüz yazılmamış")}</dd>
          </div>
        </dl>
      ) : null}
    </form>
  );
}
