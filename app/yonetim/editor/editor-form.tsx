"use client";

import { withBasePath } from "../../base-path";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";

type EditorFormValues = {
  footerTagline: string;
  heroCtaPrimary: string;
  heroCtaSecondary: string;
  showLiveStrip: boolean;
  showTrustStrip: boolean;
};

function flag(value: boolean) {
  return value ? "on" : "off";
}

export function EditorForm({ initial }: { initial: EditorFormValues }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setMessage("Kaydediliyor…");

    const form = new FormData(event.currentTarget);
    const payload = {
      footerTagline: String(form.get("footerTagline") ?? ""),
      heroCtaPrimary: String(form.get("heroCtaPrimary") ?? ""),
      heroCtaSecondary: String(form.get("heroCtaSecondary") ?? ""),
      showLiveStrip: String(form.get("showLiveStrip") ?? "off"),
      showTrustStrip: String(form.get("showTrustStrip") ?? "off"),
    };

    try {
      const response = await fetch(withBasePath("/api/yonetim/ayarlar"), {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Kayıt yapılamadı.");
      setMessage("Kaydedildi. Ana sayfada görünür.");
      router.refresh();
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Kayıt yapılamadı.");
    } finally {
      setSaving(false);
    }
  }

  const hasError = Boolean(message) && message !== "Kaydediliyor…" && !message.startsWith("Kaydedildi");

  return (
    <form className="admin-record-form" onSubmit={onSubmit} aria-busy={saving}>
      <p className="admin-record-wide">Site düzenleyici. Alanı değiştirip Kaydet’e basın; ana sayfa hemen güncellenir. Sürükle-bırak tuval yoktur. Renk ve font değişmez.</p>
      <label>
        <span>Hero birinci düğme</span>
        <input name="heroCtaPrimary" type="text" required maxLength={40} defaultValue={initial.heroCtaPrimary} />
      </label>
      <label>
        <span>Hero ikinci düğme</span>
        <input name="heroCtaSecondary" type="text" required maxLength={40} defaultValue={initial.heroCtaSecondary} />
      </label>
      <label className="admin-record-wide">
        <span>Footer cümlesi</span>
        <input name="footerTagline" type="text" required maxLength={180} defaultValue={initial.footerTagline} />
      </label>
      <label>
        <span>Canlı şerit</span>
        <select name="showLiveStrip" defaultValue={flag(initial.showLiveStrip)}>
          <option value="on">Açık — ana sayfada görünsün</option>
          <option value="off">Kapalı</option>
        </select>
      </label>
      <label>
        <span>Marka şeridi</span>
        <select name="showTrustStrip" defaultValue={flag(initial.showTrustStrip)}>
          <option value="on">Açık — Hatay360 / Adana360 satırı</option>
          <option value="off">Kapalı</option>
        </select>
      </label>
      <div className="admin-record-actions">
        <small className={hasError ? "error" : ""} role={hasError ? "alert" : "status"}>{message}</small>
        <button type="submit" disabled={saving}>{saving ? "Kaydediliyor…" : "Kaydet"}</button>
      </div>
    </form>
  );
}
