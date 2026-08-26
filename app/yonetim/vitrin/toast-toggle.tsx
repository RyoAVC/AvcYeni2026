"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { withBasePath } from "../../base-path";

export function ToastToggle({
  id,
  title,
  slug,
  text,
  sortOrder,
  status,
  expectedUpdatedAt,
}: {
  id: number;
  title: string;
  slug: string;
  text: string;
  sortOrder: number;
  status: string;
  expectedUpdatedAt: string;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const isLive = status === "live";
  const nextStatus = isLive ? "hidden" : "live";

  async function toggle() {
    if (saving) return;
    setSaving(true);
    setMessage("Kaydediliyor…");

    try {
      const response = await fetch(withBasePath(`/api/yonetim/vitrin/bildirimler/${id}`), {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          text,
          sortOrder,
          status: nextStatus,
          expectedUpdatedAt,
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Durum değiştirilemedi.");
      setMessage("Kaydedildi.");
      router.refresh();
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Durum değiştirilemedi.");
    } finally {
      setSaving(false);
    }
  }

  const hasError = Boolean(message) && message !== "Kaydediliyor…" && message !== "Kaydedildi.";

  return (
    <div className="vitrine-toggle">
      <button type="button" className={isLive ? "button button-ghost" : "button button-primary"} onClick={toggle} disabled={saving}>
        {saving ? "Kaydediliyor…" : isLive ? "Kapat" : "Aç"}
      </button>
      <small className={hasError ? "error" : ""} role={hasError ? "alert" : "status"}>{message}</small>
    </div>
  );
}
