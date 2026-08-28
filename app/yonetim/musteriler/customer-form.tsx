"use client";

import { withBasePath } from "../../base-path";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { CUSTOMER_STATUS_OPTIONS } from "../../customer-statuses";

type CustomerFormValues = {
  name: string;
  email: string;
  phone: string;
  company: string;
  city: string;
  interest: string;
  note: string;
  domainName?: string;
  domainExpiresAt?: string;
  hostingExpiresAt?: string;
  status: string;
  expectedUpdatedAt?: string;
};

export function CustomerForm({
  mode,
  customerId,
  leadId,
  initial,
}: {
  mode: "create" | "edit";
  customerId?: number;
  leadId?: number;
  initial?: CustomerFormValues;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [portalPassword, setPortalPassword] = useState("");

  function generatePortalPassword() {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
    const bytes = crypto.getRandomValues(new Uint8Array(20));
    const generated = Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
    setPortalPassword(`${generated.slice(0, 7)}-${generated.slice(7, 14)}-${generated.slice(14)}9aA`);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setMessage("Kaydediliyor…");

    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      company: String(form.get("company") ?? ""),
      city: String(form.get("city") ?? ""),
      interest: String(form.get("interest") ?? ""),
      note: String(form.get("note") ?? ""),
      domainName: String(form.get("domainName") ?? ""),
      domainExpiresAt: String(form.get("domainExpiresAt") ?? ""),
      hostingExpiresAt: String(form.get("hostingExpiresAt") ?? ""),
      status: String(form.get("status") ?? "active"),
      expectedUpdatedAt: initial?.expectedUpdatedAt,
      leadId: mode === "create" && leadId ? leadId : undefined,
      portalPassword: String(form.get("portalPassword") ?? ""),
    };

    try {
      const response = await fetch(withBasePath(mode === "create" ? "/api/yonetim/musteriler" : `/api/yonetim/musteriler/${customerId}`), {
        method: mode === "create" ? "POST" : "PATCH",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { error?: string; id?: number };
      if (!response.ok) throw new Error(result.error || "Kayıt yapılamadı.");
      setMessage("Kaydedildi.");
      const savedId = result.id ?? customerId;
      router.push(leadId && savedId
        ? `/yonetim/siparisler/yeni?musteri=${savedId}`
        : `/yonetim/musteriler/${savedId}`);
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
        <span>Ad soyad</span>
        <input name="name" type="text" required minLength={2} maxLength={100} defaultValue={initial?.name ?? ""} />
      </label>
      <label>
        <span>Firma</span>
        <input name="company" type="text" maxLength={120} defaultValue={initial?.company ?? ""} placeholder="Altyapı alan işletme" />
      </label>
      <label>
        <span>E-posta</span>
        <input name="email" type="email" required maxLength={180} defaultValue={initial?.email ?? ""} autoComplete="off" />
      </label>
      <label>
        <span>Telefon</span>
        <input name="phone" type="tel" required maxLength={30} defaultValue={initial?.phone ?? ""} />
      </label>
      <label>
        <span>Şehir</span>
        <input name="city" type="text" maxLength={80} defaultValue={initial?.city ?? ""} />
      </label>
      <label>
        <span>İlgilendiği paket / modül</span>
        <input name="interest" type="text" maxLength={120} defaultValue={initial?.interest ?? ""} placeholder="Örn. E-Ticaret altyapısı" />
      </label>
      <label>
        <span>Alan adı</span>
        <input name="domainName" type="text" maxLength={80} defaultValue={initial?.domainName ?? ""} placeholder="ornek.com — yoksa boş" />
      </label>
      <label>
        <span>Alan adı bitiş</span>
        <input name="domainExpiresAt" type="date" defaultValue={initial?.domainExpiresAt ?? ""} />
      </label>
      <label>
        <span>Yayın / hosting bitiş</span>
        <input name="hostingExpiresAt" type="date" defaultValue={initial?.hostingExpiresAt ?? ""} />
      </label>
      <label>
        <span>Durum</span>
        <select name="status" defaultValue={initial?.status ?? "active"}>
          {CUSTOMER_STATUS_OPTIONS.map((option) => (
            <option value={option.value} key={option.value}>{option.label}</option>
          ))}
        </select>
      </label>
      <label className="admin-record-wide">
        <span>{mode === "create" ? "Müşteri paneli parolası" : "Yeni müşteri paneli parolası (isteğe bağlı)"}</span>
        <span className="admin-password-field">
          <input
            autoComplete="new-password"
            minLength={12}
            maxLength={128}
            name="portalPassword"
            onChange={(event) => setPortalPassword(event.target.value)}
            placeholder={mode === "create" ? "En az 12 karakter" : "Değişmeyecekse boş bırakın"}
            required={mode === "create"}
            type="text"
            value={portalPassword}
          />
          <button className="admin-btn admin-btn-secondary" onClick={generatePortalPassword} type="button">Güçlü parola üret</button>
        </span>
        <small>Parola yalnız bu ekranda görünür; veritabanına geri döndürülemeyen güvenli özeti kaydedilir.</small>
      </label>
      <label className="admin-record-wide">
        <span>İç not</span>
        <textarea name="note" maxLength={2000} rows={4} defaultValue={initial?.note ?? ""} placeholder="Görüşme, teslim veya takip notu. Müşteri görmez." />
      </label>
      <div className="admin-record-actions">
        <small className={hasError ? "error" : ""} role={hasError ? "alert" : "status"}>{message}</small>
        <button type="submit" disabled={saving}>{saving ? "Kaydediliyor…" : mode === "create" ? "Müşteriyi kaydet" : "Değişiklikleri kaydet"}</button>
      </div>
    </form>
  );
}
