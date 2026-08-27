"use client";

import { withBasePath } from "../../base-path";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { MODULE_CATEGORY_OPTIONS, MODULE_RUNTIME_OPTIONS, MODULE_STATUS_OPTIONS } from "../../module-admin.mjs";

type ModuleFormValues = {
  name: string;
  slug: string;
  category: string;
  summary: string;
  features: string;
  priceNote: string;
  sortOrder: number;
  status: string;
  runtime?: string;
  version?: string;
  packageUrl?: string;
  packageChecksum?: string;
  entrypoint?: string;
  manifestJson?: string;
  installStatus?: string;
  expectedUpdatedAt?: string;
};

export function ModuleForm({
  mode,
  moduleId,
  initial,
}: {
  mode: "create" | "edit";
  moduleId?: number;
  initial?: ModuleFormValues;
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
      category: String(form.get("category") ?? "pazaryeri"),
      summary: String(form.get("summary") ?? ""),
      features: String(form.get("features") ?? ""),
      priceNote: String(form.get("priceNote") ?? ""),
      sortOrder: String(form.get("sortOrder") ?? "0"),
      status: String(form.get("status") ?? "draft"),
      expectedUpdatedAt: initial?.expectedUpdatedAt,
      runtime: String(form.get("runtime") ?? "node"),
      version: String(form.get("version") ?? "1.0.0"),
      packageUrl: String(form.get("packageUrl") ?? ""),
      packageChecksum: String(form.get("packageChecksum") ?? ""),
      entrypoint: String(form.get("entrypoint") ?? ""),
      manifestJson: String(form.get("manifestJson") ?? "{}"),
      installStatus: String(form.get("installStatus") ?? "not_installed"),
    };

    try {
      const response = await fetch(withBasePath(mode === "create" ? "/api/yonetim/moduller" : `/api/yonetim/moduller/${moduleId}`), {
        method: mode === "create" ? "POST" : "PATCH",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { error?: string; id?: number };
      if (!response.ok) throw new Error(result.error || "Kayıt yapılamadı.");
      setMessage("Kaydedildi.");
      router.push(`/yonetim/moduller/${result.id ?? moduleId}`);
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
        <span>Modül adı</span>
        <input name="name" type="text" required minLength={2} maxLength={80} defaultValue={initial?.name ?? ""} placeholder="Örn. Trendyol" />
      </label>
      <label>
        <span>Kısa kod</span>
        <input name="slug" type="text" maxLength={60} defaultValue={initial?.slug ?? ""} placeholder="Boş bırakırsanız addan üretilir" />
      </label>
      <label>
        <span>Kategori</span>
        <select name="category" defaultValue={initial?.category ?? "pazaryeri"}>
          {MODULE_CATEGORY_OPTIONS.map((option) => (
            <option value={option.value} key={option.value}>{option.label}</option>
          ))}
        </select>
      </label>
      <label>
        <span>Durum</span>
        <select name="status" defaultValue={initial?.status ?? "draft"}>
          {MODULE_STATUS_OPTIONS.map((option) => (
            <option value={option.value} key={option.value}>{option.label}</option>
          ))}
        </select>
      </label>
      <label><span>Çalışma ortamı</span><select name="runtime" defaultValue={initial?.runtime ?? "node"}>{MODULE_RUNTIME_OPTIONS.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></label>
      <label><span>Sürüm</span><input name="version" maxLength={32} defaultValue={initial?.version ?? "1.0.0"} placeholder="1.0.0" /></label>
      <label><span>Kurulum durumu</span><select name="installStatus" defaultValue={initial?.installStatus ?? "not_installed"}><option value="not_installed">Kurulmadı</option><option value="ready">Kuruluma hazır</option><option value="installed">Kurulu</option><option value="failed">Kurulum hatası</option></select></label>
      <label>
        <span>Sıra</span>
        <input name="sortOrder" type="number" min={0} max={999} defaultValue={initial?.sortOrder ?? 0} />
      </label>
      <label>
        <span>Fiyat notu</span>
        <input name="priceNote" type="text" maxLength={160} defaultValue={initial?.priceNote ?? ""} placeholder="Lisans ve kurulum teklifle yazılır" />
      </label>
      <label className="admin-record-wide">
        <span>Kısa özet</span>
        <input name="summary" type="text" maxLength={280} defaultValue={initial?.summary ?? ""} />
      </label>
      <label className="admin-record-wide">
        <span>Kapsam satırları</span>
        <textarea name="features" maxLength={2000} rows={6} defaultValue={initial?.features ?? ""} placeholder="Her satıra bir madde" />
      </label>
      <fieldset className="admin-record-wide module-package-panel">
        <legend>Kurulum paketi</legend>
        <p>İmzalı ZIP/TGZ paketinin HTTPS adresini ve SHA-256 özetini girin. PHP veya Node kodu yönetim sunucusunda doğrudan çalıştırılmaz; hedef Commerce kurulum aracısı manifesti doğrular.</p>
        <div className="module-package-grid">
          <label><span>Paket adresi</span><input name="packageUrl" type="url" maxLength={500} defaultValue={initial?.packageUrl ?? ""} placeholder="https://packages.avcieticaret.com/modul-1.0.0.zip" /></label>
          <label><span>SHA-256</span><input name="packageChecksum" maxLength={128} defaultValue={initial?.packageChecksum ?? ""} placeholder="Paket doğrulama özeti" /></label>
          <label><span>Başlangıç dosyası</span><input name="entrypoint" maxLength={180} defaultValue={initial?.entrypoint ?? ""} placeholder="dist/index.js veya public/index.php" /></label>
        </div>
        <label><span>Modül manifesti (JSON)</span><textarea className="module-code-field" name="manifestJson" rows={10} spellCheck={false} defaultValue={initial?.manifestJson ?? "{}"} /></label>
      </fieldset>
      <div className="admin-record-actions">
        <small className={hasError ? "error" : ""} role={hasError ? "alert" : "status"}>{message}</small>
        <button type="submit" disabled={saving}>{saving ? "Kaydediliyor…" : mode === "create" ? "Modülü kaydet" : "Değişiklikleri kaydet"}</button>
      </div>
    </form>
  );
}
