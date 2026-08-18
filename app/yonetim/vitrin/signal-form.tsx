"use client";

import { withBasePath } from "../../base-path";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { VITRINE_SIGNAL_STATUS_OPTIONS } from "../../vitrine-signal-admin.mjs";

type SignalFormValues = {
  label: string;
  slug: string;
  value: string;
  sortOrder: number;
  status: string;
  expectedUpdatedAt?: string;
};

export function SignalForm({
  mode,
  signalId,
  initial,
}: {
  mode: "create" | "edit";
  signalId?: number;
  initial?: SignalFormValues;
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
      label: String(form.get("label") ?? ""),
      slug: String(form.get("slug") ?? ""),
      value: String(form.get("value") ?? ""),
      sortOrder: String(form.get("sortOrder") ?? "0"),
      status: String(form.get("status") ?? "hidden"),
      expectedUpdatedAt: initial?.expectedUpdatedAt,
    };

    try {
      const response = await fetch(withBasePath(mode === "create" ? "/api/yonetim/vitrin" : `/api/yonetim/vitrin/${signalId}`), {
        method: mode === "create" ? "POST" : "PATCH",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { error?: string; id?: number };
      if (!response.ok) throw new Error(result.error || "Kayıt yapılamadı.");
      setMessage("Kaydedildi.");
      router.push(`/yonetim/vitrin/${result.id ?? signalId}`);
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
        <span>Şerit metni</span>
        <input name="label" type="text" required minLength={2} maxLength={80} defaultValue={initial?.label ?? ""} placeholder="Örn. Müşteri Çevrimiçi" />
      </label>
      <label>
        <span>Gösterilen değer</span>
        <input name="value" type="text" required maxLength={40} defaultValue={initial?.value ?? ""} placeholder="Örn. 48 veya canlıda" />
      </label>
      <label>
        <span>Kısa kod</span>
        <input name="slug" type="text" maxLength={60} defaultValue={initial?.slug ?? ""} placeholder="Boş bırakırsanız metinden üretilir" />
      </label>
      <label>
        <span>Sıra</span>
        <input name="sortOrder" type="number" min={0} max={999} defaultValue={initial?.sortOrder ?? 0} />
      </label>
      <label>
        <span>Ana sayfada</span>
        <select name="status" defaultValue={initial?.status ?? "live"}>
          {VITRINE_SIGNAL_STATUS_OPTIONS.map((option) => (
            <option value={option.value} key={option.value}>{option.label}</option>
          ))}
        </select>
      </label>
      <div className="admin-record-actions">
        <small className={hasError ? "error" : ""} role={hasError ? "alert" : "status"}>{message}</small>
        <button type="submit" disabled={saving}>{saving ? "Kaydediliyor…" : mode === "create" ? "Satırı kaydet" : "Değişiklikleri kaydet"}</button>
      </div>
    </form>
  );
}
