"use client";

import { withBasePath } from "../../base-path";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { SOFTWARE_ORDER_KIND_OPTIONS, SOFTWARE_ORDER_STATUS_OPTIONS } from "../../software-order-admin.mjs";

type Option = { id: number; name: string; extra?: string };

type OrderFormValues = {
  customerId: number;
  kind: string;
  packageId: number | null;
  moduleId: number | null;
  status: string;
  priceNote: string;
  note: string;
  expectedUpdatedAt?: string;
};

export function OrderForm({
  mode,
  orderId,
  initial,
  customers,
  packages,
  modules,
}: {
  mode: "create" | "edit";
  orderId?: number;
  initial?: OrderFormValues;
  customers: Option[];
  packages: Option[];
  modules: Option[];
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [kind, setKind] = useState(initial?.kind ?? "package");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setMessage("Kaydediliyor…");

    const form = new FormData(event.currentTarget);
    const payload = {
      customerId: String(form.get("customerId") ?? ""),
      kind: String(form.get("kind") ?? "package"),
      packageId: String(form.get("packageId") ?? ""),
      moduleId: String(form.get("moduleId") ?? ""),
      status: String(form.get("status") ?? "draft"),
      priceNote: String(form.get("priceNote") ?? ""),
      note: String(form.get("note") ?? ""),
      expectedUpdatedAt: initial?.expectedUpdatedAt,
    };

    try {
      const response = await fetch(withBasePath(mode === "create" ? "/api/yonetim/siparisler" : `/api/yonetim/siparisler/${orderId}`), {
        method: mode === "create" ? "POST" : "PATCH",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { error?: string; id?: number };
      if (!response.ok) {
        if (response.status === 409 && result.id) {
          const customerId = String(form.get("customerId") ?? "");
          if (mode === "create" && customerId) {
            router.push(`/yonetim/faturalar/yeni?musteri=${customerId}&siparis=${result.id}`);
            return;
          }
          throw new Error(`${result.error || "Açık sipariş zaten var."} Mevcut kayıt #${result.id}.`);
        }
        throw new Error(result.error || "Kayıt yapılamadı.");
      }
      setMessage("Kaydedildi.");
      const savedId = result.id ?? orderId;
      const customerId = String(form.get("customerId") ?? "");
      router.push(mode === "create" && savedId && customerId
        ? `/yonetim/faturalar/yeni?musteri=${customerId}&siparis=${savedId}`
        : `/yonetim/siparisler/${savedId}`);
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
        <span>Tür</span>
        <select name="kind" value={kind} onChange={(event) => setKind(event.target.value)}>
          {SOFTWARE_ORDER_KIND_OPTIONS.map((option) => (
            <option value={option.value} key={option.value}>{option.label}</option>
          ))}
        </select>
      </label>
      {kind === "package" ? (
        <label>
          <span>Paket</span>
          <select name="packageId" required defaultValue={initial?.packageId ? String(initial.packageId) : ""}>
            <option value="">Paket seçin</option>
            {packages.map((item) => (
              <option value={item.id} key={item.id}>{item.name}</option>
            ))}
          </select>
        </label>
      ) : (
        <label>
          <span>Modül</span>
          <select name="moduleId" required defaultValue={initial?.moduleId ? String(initial.moduleId) : ""}>
            <option value="">Modül seçin</option>
            {modules.map((item) => (
              <option value={item.id} key={item.id}>{item.name}</option>
            ))}
          </select>
        </label>
      )}
      <label>
        <span>Durum</span>
        <select name="status" defaultValue={initial?.status ?? "draft"}>
          {SOFTWARE_ORDER_STATUS_OPTIONS.map((option) => (
            <option value={option.value} key={option.value}>{option.label}</option>
          ))}
        </select>
      </label>
      <label className="admin-record-wide">
        <span>Fiyat notu</span>
        <input name="priceNote" type="text" maxLength={160} defaultValue={initial?.priceNote ?? ""} placeholder="Kesin tutar teklifle / sözleşmeyle yazılır" />
      </label>
      <label className="admin-record-wide">
        <span>İç not</span>
        <textarea name="note" maxLength={2000} rows={4} defaultValue={initial?.note ?? ""} placeholder="Teslim, kurulum veya takip notu. Müşteri görmez." />
      </label>
      <div className="admin-record-actions">
        <small className={hasError ? "error" : ""} role={hasError ? "alert" : "status"}>{message}</small>
        <button type="submit" disabled={saving}>{saving ? "Kaydediliyor…" : mode === "create" ? "Siparişi kaydet" : "Değişiklikleri kaydet"}</button>
      </div>
    </form>
  );
}
