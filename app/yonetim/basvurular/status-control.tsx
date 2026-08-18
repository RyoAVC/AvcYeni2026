"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LEAD_STATUS_OPTIONS } from "../../lead-statuses";

export function StatusControl({ id, label, initialStatus, initialUpdatedAt }: { id: number; label: string; initialStatus: string; initialUpdatedAt: string }) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [updatedAt, setUpdatedAt] = useState(initialUpdatedAt);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const hasError = Boolean(message) && message !== "Kaydedildi" && message !== "Kaydediliyor…";

  async function updateStatus(nextStatus: string) {
    const previousStatus = status;
    setStatus(nextStatus);
    setSaving(true);
    setMessage("Kaydediliyor…");

    try {
      const response = await fetch(`/api/yonetim/basvurular/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus, expectedUpdatedAt: updatedAt }),
      });
      const result = (await response.json()) as { error?: string; lead?: { status: string; updatedAt: string }; current?: { status: string; updatedAt: string } };
      if (response.status === 409 && result.current) {
        setStatus(result.current.status);
        setUpdatedAt(result.current.updatedAt);
        setMessage(result.error || "Kayıt başka bir yönetici tarafından güncellendi. Güncel durum yüklendi.");
        router.refresh();
        return;
      }
      if (!response.ok) throw new Error(result.error || "Durum güncellenemedi.");
      if (result.lead) setUpdatedAt(result.lead.updatedAt);
      setMessage("Kaydedildi");
      router.refresh();
    } catch (cause) {
      setStatus(previousStatus);
      setMessage(cause instanceof Error ? cause.message : "Durum güncellenemedi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="status-control" aria-busy={saving}>
      <select
        aria-label={label}
        aria-describedby={`lead-status-message-${id}`}
        aria-invalid={hasError}
        className={`lead-status ${status}`}
        value={status}
        disabled={saving}
        onChange={(event) => updateStatus(event.target.value)}
      >
        {LEAD_STATUS_OPTIONS.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
      </select>
      <small
        id={`lead-status-message-${id}`}
        className={hasError ? "error" : ""}
        role={hasError ? "alert" : "status"}
        aria-live={hasError ? "assertive" : "polite"}
        aria-atomic="true"
      >
        {message}
      </small>
    </div>
  );
}
