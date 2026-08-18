"use client";

import { withBasePath } from "../../base-path";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";

type LogoSlot = {
  exists: boolean;
  uploaded: boolean;
};

async function sendLogo(kind: "night" | "day", file: File) {
  const body = new FormData();
  body.set("logo", file);
  body.set("kind", kind);
  const response = await fetch(withBasePath("/api/yonetim/logo"), {
    method: "POST",
    credentials: "same-origin",
    body,
  });
  const result = (await response.json()) as { error?: string };
  if (!response.ok) throw new Error(result.error || "Logo yüklenemedi.");
}

async function removeLogo(kind: "night" | "day") {
  const response = await fetch(withBasePath(`/api/yonetim/logo?kind=${kind}`), {
    method: "DELETE",
    credentials: "same-origin",
  });
  const result = (await response.json()) as { error?: string };
  if (!response.ok) throw new Error(result.error || "Logo çıkarılamadı.");
}

function LogoSlotForm({
  kind,
  title,
  hint,
  slot,
}: {
  kind: "night" | "day";
  title: string;
  hint: string;
  slot: LogoSlot;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function onUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const form = event.currentTarget;
    const input = form.elements.namedItem("logo");
    const file = input instanceof HTMLInputElement ? input.files?.[0] : null;
    if (!file) {
      setMessage("Logo dosyası seçin.");
      return;
    }
    setSaving(true);
    setMessage("Yükleniyor…");
    try {
      await sendLogo(kind, file);
      setMessage("Kaydedildi.");
      form.reset();
      router.refresh();
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Logo yüklenemedi.");
    } finally {
      setSaving(false);
    }
  }

  async function onRemove() {
    if (saving) return;
    setSaving(true);
    setMessage("Çıkarılıyor…");
    try {
      await removeLogo(kind);
      setMessage("Çıkarıldı.");
      router.refresh();
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Logo çıkarılamadı.");
    } finally {
      setSaving(false);
    }
  }

  const busy = message === "Yükleniyor…" || message === "Çıkarılıyor…";
  const hasError = Boolean(message) && !busy && message !== "Kaydedildi." && message !== "Çıkarıldı.";

  return (
    <form className="admin-record-form admin-logo-slot" onSubmit={onUpload} aria-busy={saving}>
      <p className="admin-record-wide"><strong>{title}</strong><br />{hint}</p>
      {slot.exists ? (
        <div className="admin-record-wide admin-logo-box">
          <img
            className={`admin-logo-preview admin-logo-preview--${kind}`}
            src={`/api/site-logo?kind=${kind}&v=${Date.now()}`}
            alt={`${title} önizleme`}
          />
          <small>{slot.uploaded ? "Bu moda özel yüklendi." : "Henüz ayrı dosya yok; diğer logo gösterilir."}</small>
        </div>
      ) : (
        <p className="admin-record-wide">Bu mod için logo yok. Yüklemezseniz A harfi kalır.</p>
      )}
      <label>
        <span>Dosya</span>
        <input name="logo" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" />
      </label>
      <div className="admin-record-actions">
        <small className={hasError ? "error" : ""} role={hasError ? "alert" : "status"}>{message}</small>
        <button type="submit" disabled={saving}>{saving ? "İşleniyor…" : "Kaydet"}</button>
        {slot.uploaded ? (
          <button type="button" disabled={saving} onClick={onRemove}>Çıkar</button>
        ) : null}
      </div>
    </form>
  );
}

export function LogoSettingsForm({
  night,
  day,
}: {
  night: LogoSlot;
  day: LogoSlot;
}) {
  return (
    <div className="admin-logo-pair">
      <p className="admin-record-wide">Logo ayarları. Gece logosu koyu zeminde, gündüz logosu açık zeminde görünür. PNG, JPG, WebP veya SVG; en fazla 220 KB. Renk paleti değişmez.</p>
      <LogoSlotForm
        kind="night"
        title="Gece logosu"
        hint="Koyu hero / footer için. Şeffaf PNG iyi durur."
        slot={night}
      />
      <LogoSlotForm
        kind="day"
        title="Gündüz logosu"
        hint="Açık zemin için. Yoksa gece logosu kullanılır."
        slot={day}
      />
    </div>
  );
}
