"use client";

import { withBasePath } from "../../base-path";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { TICKET_STATUS_OPTIONS, TICKET_TOPIC_OPTIONS } from "../../support-ticket-admin.mjs";

type Option = { id: number; name: string; extra?: string };

type TicketFormValues = {
  customerId: number;
  topic: string;
  subject: string;
  message: string;
  note: string;
  status: string;
  expectedUpdatedAt?: string;
};

export function TicketForm({
  mode,
  ticketId,
  initial,
  customers,
}: {
  mode: "create" | "edit";
  ticketId?: number;
  initial?: TicketFormValues;
  customers: Option[];
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
      customerId: String(form.get("customerId") ?? ""),
      topic: String(form.get("topic") ?? "diger"),
      subject: String(form.get("subject") ?? ""),
      message: String(form.get("message") ?? ""),
      note: String(form.get("note") ?? ""),
      status: String(form.get("status") ?? "open"),
      expectedUpdatedAt: initial?.expectedUpdatedAt,
    };

    try {
      const response = await fetch(withBasePath(mode === "create" ? "/api/yonetim/destek" : `/api/yonetim/destek/${ticketId}`), {
        method: mode === "create" ? "POST" : "PATCH",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { error?: string; id?: number };
      if (!response.ok) {
        if (response.status === 409 && result.id) {
          throw new Error(`${result.error || "Açık kayıt zaten var."} Mevcut kayıt #${result.id}.`);
        }
        throw new Error(result.error || "Kayıt yapılamadı.");
      }
      setMessage("Kaydedildi.");
      router.push(`/yonetim/destek/${result.id ?? ticketId}`);
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
        <span>Yazılım müşterisi</span>
        <select name="customerId" required defaultValue={initial?.customerId ? String(initial.customerId) : ""}>
          <option value="">Müşteri seçin</option>
          {customers.map((item) => (
            <option value={item.id} key={item.id}>{item.extra ? `${item.name} · ${item.extra}` : item.name}</option>
          ))}
        </select>
      </label>
      <label>
        <span>Konu başlığı</span>
        <select name="topic" defaultValue={initial?.topic ?? "diger"}>
          {TICKET_TOPIC_OPTIONS.map((option) => (
            <option value={option.value} key={option.value}>{option.label}</option>
          ))}
        </select>
      </label>
      <label>
        <span>Durum</span>
        <select name="status" defaultValue={initial?.status ?? "open"}>
          {TICKET_STATUS_OPTIONS.map((option) => (
            <option value={option.value} key={option.value}>{option.label}</option>
          ))}
        </select>
      </label>
      <label className="admin-record-wide">
        <span>Konu</span>
        <input name="subject" type="text" required minLength={3} maxLength={140} defaultValue={initial?.subject ?? ""} placeholder="Örn. Trendyol stok eşitlemesi" />
      </label>
      <label className="admin-record-wide">
        <span>Talep</span>
        <textarea name="message" maxLength={4000} rows={5} defaultValue={initial?.message ?? ""} placeholder="Müşterinin bildirdiği sorun. Mağaza iadesi değil." />
      </label>
      <label className="admin-record-wide">
        <span>İç not</span>
        <textarea name="note" maxLength={2000} rows={3} defaultValue={initial?.note ?? ""} placeholder="Ekip notu. Müşteri görmez." />
      </label>
      <div className="admin-record-actions">
        <small className={hasError ? "error" : ""} role={hasError ? "alert" : "status"}>{message}</small>
        <button type="submit" disabled={saving}>{saving ? "Kaydediliyor…" : mode === "create" ? "Kaydı aç" : "Değişiklikleri kaydet"}</button>
      </div>
    </form>
  );
}
