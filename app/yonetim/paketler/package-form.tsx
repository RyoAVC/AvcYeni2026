"use client";

import { withBasePath } from "../../base-path";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { PACKAGE_FAMILY_OPTIONS, PACKAGE_STATUS_OPTIONS } from "../../package-admin.mjs";

type PackageFormValues = {
  name: string;
  slug: string;
  family: string;
  summary: string;
  features: string;
  priceNote: string;
  salesType?: string;
  priceAmountKurus?: number;
  priceIncludesVat?: boolean;
  licenseDurationDays?: number;
  sortOrder: number;
  status: string;
  expectedUpdatedAt?: string;
};

export function PackageForm({
  mode,
  packageId,
  initial,
}: {
  mode: "create" | "edit";
  packageId?: number;
  initial?: PackageFormValues;
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
      name: String(form.get("name") ?? ""),
      slug: String(form.get("slug") ?? ""),
      family: String(form.get("family") ?? "eticaret"),
      summary: String(form.get("summary") ?? ""),
      features: String(form.get("features") ?? ""),
      priceNote: String(form.get("priceNote") ?? ""),
      salesType: String(form.get("salesType") ?? "teklif"),
      priceAmountKurus: String(form.get("priceAmountKurus") ?? "0"),
      priceIncludesVat: form.get("priceIncludesVat") === "true",
      licenseDurationDays: String(form.get("licenseDurationDays") ?? "0"),
      sortOrder: String(form.get("sortOrder") ?? "0"),
      status: String(form.get("status") ?? "draft"),
      expectedUpdatedAt: initial?.expectedUpdatedAt,
    };

    try {
      const response = await fetch(withBasePath(mode === "create" ? "/api/yonetim/paketler" : `/api/yonetim/paketler/${packageId}`), {
        method: mode === "create" ? "POST" : "PATCH",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { error?: string; id?: number };
      if (!response.ok) throw new Error(result.error || "Kayıt yapılamadı.");
      setMessage("Kaydedildi.");
      router.push(`/yonetim/paketler/${result.id ?? packageId}`);
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
        <span>Paket adı</span>
        <input name="name" type="text" required minLength={2} maxLength={80} defaultValue={initial?.name ?? ""} placeholder="Örn. Start" />
      </label>
      <label>
        <span>Kısa kod</span>
        <input name="slug" type="text" maxLength={60} defaultValue={initial?.slug ?? ""} placeholder="Boş bırakırsanız addan üretilir" />
      </label>
      <label>
        <span>Aile</span>
        <select name="family" defaultValue={initial?.family ?? "eticaret"}>
          {PACKAGE_FAMILY_OPTIONS.map((option) => (
            <option value={option.value} key={option.value}>{option.label}</option>
          ))}
        </select>
      </label>
      <label>
        <span>Durum</span>
        <select name="status" defaultValue={initial?.status ?? "draft"}>
          {PACKAGE_STATUS_OPTIONS.map((option) => (
            <option value={option.value} key={option.value}>{option.label}</option>
          ))}
        </select>
      </label>
      <label>
        <span>Sıra</span>
        <input name="sortOrder" type="number" min={0} max={999} defaultValue={initial?.sortOrder ?? 0} />
      </label>
      <label>
        <span>Fiyat notu</span>
        <input name="priceNote" type="text" maxLength={160} defaultValue={initial?.priceNote ?? ""} placeholder="Kesin tutar teklifle belirlenir" />
      </label>
      <label>
        <span>Satış tipi</span>
        <select name="salesType" defaultValue={initial?.salesType ?? "teklif"}>
          <option value="teklif">Teklif / manuel işlem</option>
          <option value="otomatik">Otomatik satın alma (yalnız test)</option>
        </select>
      </label>
      <label>
        <span>Sayısal fiyat (kuruş)</span>
        <input name="priceAmountKurus" type="number" required min={0} max={1000000000} step={1} defaultValue={initial?.priceAmountKurus ?? 0} />
        <small>100 kuruş = 1 TL. Fiyat notu tahsilat için kullanılmaz.</small>
      </label>
      <label>
        <span>Fiyatın KDV durumu</span>
        <select name="priceIncludesVat" defaultValue={String(initial?.priceIncludesVat ?? true)}>
          <option value="true">KDV dahil nihai tutar</option>
          <option value="false">KDV hariç (otomatik ödeme kapalı)</option>
        </select>
      </label>
      <label>
        <span>Lisans süresi (gün)</span>
        <input name="licenseDurationDays" type="number" required min={0} max={36500} step={1} defaultValue={initial?.licenseDurationDays ?? 0} />
        <small>0: henüz belirlenmedi. Otomatik ödeme için pozitif süre ve KDV dahil tutar gerekir.</small>
      </label>
      <p className="admin-record-wide">Start / Scale başlangıç tutarları geçici örnek fiyatlardır. Gerçek tutarı ve süreyi burada güncelleyin. Bu form canlı ödemeyi açmaz.</p>
      <label className="admin-record-wide">
        <span>Kısa özet</span>
        <input name="summary" type="text" maxLength={280} defaultValue={initial?.summary ?? ""} />
      </label>
      <label className="admin-record-wide">
        <span>Kapsam satırları</span>
        <textarea name="features" maxLength={2000} rows={6} defaultValue={initial?.features ?? ""} placeholder="Her satıra bir madde" />
      </label>
      <div className="admin-record-actions">
        <small className={hasError ? "error" : ""} role={hasError ? "alert" : "status"}>{message}</small>
        <button type="submit" disabled={saving}>{saving ? "Kaydediliyor…" : mode === "create" ? "Paketi kaydet" : "Değişiklikleri kaydet"}</button>
      </div>
    </form>
  );
}
