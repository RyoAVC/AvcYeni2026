"use client";

import { withBasePath } from "../../base-path";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";

type SettingsFormValues = {
  contactEmail: string;
  contactPhone: string;
  supportEmail: string;
  customerLoginEnabled: boolean;
  demoPortalEnabled: boolean;
  supportEnabled: boolean;
  portalReady: boolean;
  brandTitle: string;
  brandSubtitle: string;
  showWordmark: boolean;
  logoEnabled: boolean;
  logoScale: "small" | "medium" | "large";
  maintenanceMode: boolean;
  tofyPopupEnabled: boolean;
  tofyPopupTitle: string;
  tofyPopupText: string;
  tofyPopupButton: string;
  tofyPopupHref: string;
};

function flag(value: boolean) {
  return value ? "on" : "off";
}

export function SettingsForm({ initial }: { initial: SettingsFormValues }) {
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
      contactEmail: String(form.get("contactEmail") ?? ""),
      contactPhone: String(form.get("contactPhone") ?? ""),
      supportEmail: String(form.get("supportEmail") ?? ""),
      customerLoginEnabled: String(form.get("customerLoginEnabled") ?? "off"),
      demoPortalEnabled: String(form.get("demoPortalEnabled") ?? "off"),
      supportEnabled: String(form.get("supportEnabled") ?? "off"),
      portalReady: String(form.get("portalReady") ?? "off"),
      brandTitle: String(form.get("brandTitle") ?? ""),
      brandSubtitle: String(form.get("brandSubtitle") ?? ""),
      showWordmark: String(form.get("showWordmark") ?? "off"),
      logoEnabled: String(form.get("logoEnabled") ?? "off"),
      logoScale: String(form.get("logoScale") ?? "medium"),
      maintenanceMode: String(form.get("maintenanceMode") ?? "off"),
      tofyPopupEnabled: String(form.get("tofyPopupEnabled") ?? "off"),
      tofyPopupTitle: String(form.get("tofyPopupTitle") ?? ""),
      tofyPopupText: String(form.get("tofyPopupText") ?? ""),
      tofyPopupButton: String(form.get("tofyPopupButton") ?? ""),
      tofyPopupHref: String(form.get("tofyPopupHref") ?? ""),
    };

    try {
      const response = await fetch(withBasePath("/api/yonetim/ayarlar"), {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Kayıt yapılamadı.");
      setMessage("Kaydedildi.");
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
      <p className="admin-record-wide">Genel iletişim. Ana sayfa, teklif ve gizlilik bu e-posta / telefonu kullanır.</p>
      <label>
        <span>Genel e-posta</span>
        <input name="contactEmail" type="email" required maxLength={80} defaultValue={initial.contactEmail} />
      </label>
      <label>
        <span>Telefon</span>
        <input name="contactPhone" type="text" required minLength={7} maxLength={40} defaultValue={initial.contactPhone} />
      </label>

      <p className="admin-record-wide">Site kanalları. Müşteri girişi, destek ve demo portal buradan açılır / kapanır.</p>
      <label>
        <span>Destek e-postası</span>
        <input name="supportEmail" type="email" required maxLength={80} defaultValue={initial.supportEmail} />
      </label>
      <label>
        <span>Müşteri girişi</span>
        <select name="customerLoginEnabled" defaultValue={flag(initial.customerLoginEnabled)}>
          <option value="on">Açık — menüde ve /musteri-girisi</option>
          <option value="off">Kapalı — link gizlenir</option>
        </select>
      </label>
      <label>
        <span>Portal hazır mı?</span>
        <select name="portalReady" defaultValue={flag(initial.portalReady)}>
          <option value="on">Hazır — geçiş sayfası açılır (şifre yok)</option>
          <option value="off">Hazırlanıyor — uyarı gösterilir</option>
        </select>
      </label>
      <label>
        <span>Demo portal</span>
        <select name="demoPortalEnabled" defaultValue={flag(initial.demoPortalEnabled)}>
          <option value="on">Açık — örnek portal görünür</option>
          <option value="off">Kapalı</option>
        </select>
      </label>
      <label>
        <span>Müşteri destek sayfası</span>
        <select name="supportEnabled" defaultValue={flag(initial.supportEnabled)}>
          <option value="on">Açık — /destek ve e-posta</option>
          <option value="off">Kapalı — e-posta butonları gizlenir</option>
        </select>
      </label>
      <label>
        <span>Bakım modu</span>
        <select name="maintenanceMode" defaultValue={flag(initial.maintenanceMode)}>
          <option value="off">Site açık</option>
          <option value="on">Bakımda — yalnız yönetim açık</option>
        </select>
      </label>

      <p className="admin-record-wide">Genel tasarım. Yazı ve logo boyutu; Avcı renkleri / fontu değişmez. Yeni renk seçilmez.</p>
      <label>
        <span>Marka adı</span>
        <input name="brandTitle" type="text" required maxLength={24} defaultValue={initial.brandTitle} />
      </label>
      <label>
        <span>Marka alt yazısı</span>
        <input name="brandSubtitle" type="text" required maxLength={24} defaultValue={initial.brandSubtitle} />
      </label>
      <label>
        <span>Yazı işareti</span>
        <select name="showWordmark" defaultValue={flag(initial.showWordmark)}>
          <option value="on">Açık — AVCI / alt yazı görünsün</option>
          <option value="off">Kapalı — yalnız logo veya A</option>
        </select>
      </label>
      <label>
        <span>Yüklenen logo</span>
        <select name="logoEnabled" defaultValue={flag(initial.logoEnabled)}>
          <option value="on">Açık — varsa sitede göster</option>
          <option value="off">Kapalı — A harfi kalsın</option>
        </select>
      </label>
      <label>
        <span>Logo boyutu</span>
        <select name="logoScale" defaultValue={initial.logoScale}>
          <option value="small">Küçük</option>
          <option value="medium">Orta</option>
          <option value="large">Büyük</option>
        </select>
      </label>
      <p className="admin-record-wide">Tofy çıkış penceresi. Ziyaretçi tarayıcı çarpısına giderken bir kez çıkar. Kampanya metnini buradan değiştirin.</p>
      <label>
        <span>Çıkış penceresi</span>
        <select name="tofyPopupEnabled" defaultValue={flag(initial.tofyPopupEnabled)}>
          <option value="on">Açık</option>
          <option value="off">Kapalı</option>
        </select>
      </label>
      <label>
        <span>Başlık</span>
        <input name="tofyPopupTitle" type="text" required maxLength={60} defaultValue={initial.tofyPopupTitle} />
      </label>
      <label className="admin-record-wide">
        <span>Metin</span>
        <textarea name="tofyPopupText" required maxLength={240} defaultValue={initial.tofyPopupText} />
      </label>
      <label>
        <span>Buton yazısı</span>
        <input name="tofyPopupButton" type="text" required maxLength={32} defaultValue={initial.tofyPopupButton} />
      </label>
      <label>
        <span>Buton adresi</span>
        <input name="tofyPopupHref" type="text" required maxLength={80} defaultValue={initial.tofyPopupHref} />
      </label>
      <div className="admin-record-actions">
        <small className={hasError ? "error" : ""} role={hasError ? "alert" : "status"}>{message}</small>
        <button type="submit" disabled={saving}>{saving ? "Kaydediliyor…" : "Ayarları kaydet"}</button>
      </div>
    </form>
  );
}
