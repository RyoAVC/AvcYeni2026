"use client";

import { withBasePath } from "../../base-path";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { VITRINE_TOAST_STATUS_OPTIONS } from "../../vitrine-signal-admin.mjs";

type ToastFormValues = {
  title: string;
  slug: string;
  text: string;
  sortOrder: number;
  status: string;
  expectedUpdatedAt?: string;
};

export function ToastForm({
  mode,
  toastId,
  initial,
}: {
  mode: "create" | "edit";
  toastId?: number;
  initial?: ToastFormValues;
}) {
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
      title: String(form.get("title") ?? ""),
      slug: String(form.get("slug") ?? ""),
      text: String(form.get("text") ?? ""),
      sortOrder: String(form.get("sortOrder") ?? "0"),
      status: String(form.get("status") ?? "hidden"),
      expectedUpdatedAt: initial?.expectedUpdatedAt,
    };

    try {
      const response = await fetch(withBasePath(mode === "create" ? "/api/yonetim/vitrin/bildirimler" : `/api/yonetim/vitrin/bildirimler/${toastId}`), {
        method: mode === "create" ? "POST" : "PATCH",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { error?: string; id?: number };
      if (!response.ok) throw new Error(result.error || "Kayıt yapılamadı.");
      setMessage("Kaydedildi.");
      router.push(`/yonetim/vitrin/bildirim/${result.id ?? toastId}`);
      router.refresh();
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Kayıt yapılamadı.");
    } finally {
      setSaving(false);
    }
  }

  const hasError = Boolean(message) && message !== "Kaydediliyor…" && message !== "Kaydedildi.";

  return (
    <form className="admin-record-form" onSubmit={onSubmit} aria-busy={saving}>
      <label>
        <span>Başlık</span>
        <input name="title" type="text" required minLength={2} maxLength={60} defaultValue={initial?.title ?? ""} placeholder="Örn. Yeni sipariş" />
      </label>
      <label>
        <span>Kısa kod</span>
        <input name="slug" type="text" maxLength={60} defaultValue={initial?.slug ?? ""} placeholder="Boş bırakırsanız başlıktan üretilir" />
      </label>
      <label className="admin-record-wide">
        <span>Bildirim metni</span>
        <input name="text" type="text" required minLength={4} maxLength={160} defaultValue={initial?.text ?? ""} placeholder="Örn. Müşteri mağazasında 1.240 ₺ tahsilat" />
      </label>
      <label>
        <span>Sıra</span>
        <input name="sortOrder" type="number" min={0} max={999} defaultValue={initial?.sortOrder ?? 0} />
      </label>
      <label>
        <span>Sitede</span>
        <select name="status" defaultValue={initial?.status ?? "live"}>
          {VITRINE_TOAST_STATUS_OPTIONS.map((option) => (
            <option value={option.value} key={option.value}>{option.label}</option>
          ))}
        </select>
      </label>
      <div className="admin-record-actions">
        <small className={hasError ? "error" : ""} role={hasError ? "alert" : "status"}>{message}</small>
        <button type="submit" disabled={saving}>{saving ? "Kaydediliyor…" : mode === "create" ? "Bildirimi kaydet" : "Değişiklikleri kaydet"}</button>
      </div>
    </form>
  );
}
