"use client";

import { withBasePath } from "../../base-path";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { INVOICE_STATUS_OPTIONS } from "../../software-invoice-admin.mjs";

type CustomerOption = { id: number; name: string; extra?: string };
type OrderOption = { id: number; customerId: number; label: string };

type InvoiceFormValues = {
  customerId: number;
  orderId: number | null;
  title: string;
  amountNote: string;
  status: string;
  note: string;
  expectedUpdatedAt?: string;
};

export function InvoiceForm({
  mode,
  invoiceId,
  initial,
  customers,
  orders,
}: {
  mode: "create" | "edit";
  invoiceId?: number;
  initial?: InvoiceFormValues;
  customers: CustomerOption[];
  orders: OrderOption[];
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [customerId, setCustomerId] = useState(initial?.customerId ? String(initial.customerId) : "");

  const visibleOrders = useMemo(
    () => orders.filter((item) => String(item.customerId) === customerId),
    [orders, customerId],
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setMessage("Kaydediliyor…");

    const form = new FormData(event.currentTarget);
    const payload = {
      customerId: String(form.get("customerId") ?? ""),
      orderId: String(form.get("orderId") ?? ""),
      title: String(form.get("title") ?? ""),
      amountNote: String(form.get("amountNote") ?? ""),
      status: String(form.get("status") ?? "draft"),
      note: String(form.get("note") ?? ""),
      expectedUpdatedAt: initial?.expectedUpdatedAt,
    };

    try {
      const response = await fetch(withBasePath(mode === "create" ? "/api/yonetim/faturalar" : `/api/yonetim/faturalar/${invoiceId}`), {
        method: mode === "create" ? "POST" : "PATCH",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { error?: string; id?: number };
      if (!response.ok) {
        if (response.status === 409 && result.id) {
          if (mode === "create") {
            router.push(`/yonetim/faturalar/${result.id}`);
            return;
          }
          throw new Error(`${result.error || "Taslak zaten var."} Mevcut kayıt #${result.id}.`);
        }
        throw new Error(result.error || "Kayıt yapılamadı.");
      }
      setMessage("Kaydedildi.");
      router.push(`/yonetim/faturalar/${result.id ?? invoiceId}`);
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
        <select name="customerId" required value={customerId} onChange={(event) => setCustomerId(event.target.value)}>
          <option value="">Müşteri seçin</option>
          {customers.map((item) => (
            <option value={item.id} key={item.id}>{item.extra ? `${item.name} · ${item.extra}` : item.name}</option>
          ))}
        </select>
      </label>
      <label>
        <span>Bağlı sipariş</span>
        <select name="orderId" defaultValue={initial?.orderId ? String(initial.orderId) : ""}>
          <option value="">Sipariş yok / sonra bağlanır</option>
          {visibleOrders.map((item) => (
            <option value={item.id} key={item.id}>{item.label}</option>
          ))}
        </select>
      </label>
      <label>
        <span>Durum</span>
        <select name="status" defaultValue={initial?.status ?? "draft"}>
          {INVOICE_STATUS_OPTIONS.map((option) => (
            <option value={option.value} key={option.value}>{option.label}</option>
          ))}
        </select>
      </label>
      <label className="admin-record-wide">
        <span>Başlık</span>
        <input name="title" type="text" required minLength={3} maxLength={140} defaultValue={initial?.title ?? ""} placeholder="Örn. Start paket kurulumu" />
      </label>
      <label>
        <span>Tutar notu</span>
        <input name="amountNote" type="text" maxLength={80} defaultValue={initial?.amountNote ?? ""} placeholder="Örn. 12.000 TL + KDV" />
      </label>
      <label className="admin-record-wide">
        <span>İç not</span>
        <textarea name="note" maxLength={2000} rows={3} defaultValue={initial?.note ?? ""} placeholder="Ödeme veya sözleşme notu. Müşteri görmez." />
      </label>
      <div className="admin-record-actions">
        <small className={hasError ? "error" : ""} role={hasError ? "alert" : "status"}>{message}</small>
        <button type="submit" disabled={saving}>{saving ? "Kaydediliyor…" : mode === "create" ? "Faturayı kaydet" : "Değişiklikleri kaydet"}</button>
      </div>
    </form>
  );
}
