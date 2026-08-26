"use client";

import { useState, type FormEvent } from "react";
import type {
  PortalBranding,
  PortalIntegrationInstance,
  PortalModuleInstance,
  PortalThresholds,
} from "../../../../customer-portal-types";

type CatalogItem = { id: number; name: string; slug?: string; providerKey?: string; category: string };
type PortalEditorSnapshot = {
  branding: PortalBranding;
  onboarding: { status: "not_started" | "in_progress" | "complete"; progress: number };
  thresholds: PortalThresholds;
  moduleInstances: PortalModuleInstance[];
  integrationInstances: PortalIntegrationInstance[];
};
type Props = { customerId: number; snapshot: PortalEditorSnapshot; moduleCatalog: CatalogItem[]; integrationCatalog: CatalogItem[] };

function responseError(value: unknown) {
  if (!value || typeof value !== "object" || !("error" in value)) return "";
  return typeof value.error === "string" ? value.error : "";
}

export function PortalEditor({ customerId, snapshot, moduleCatalog, integrationCatalog }: Props) {
  const [message, setMessage] = useState("");
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setMessage("Kaydediliyor…");
    const body = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch(`/api/yonetim/musteriler/${customerId}/portal`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const result = await response.json().catch(() => ({}));
    const activationToken = result && typeof result === "object" && "activationToken" in result && typeof result.activationToken === "string" ? result.activationToken : "";
    setMessage(response.ok ? (activationToken ? `Kurulum anahtarı (yalnız şimdi gösterilir): ${activationToken}` : "Kaydedildi. Panel yenilendiğinde uygulanır.") : responseError(result) || "Kaydedilemedi.");
    if (response.ok) setTimeout(() => location.reload(), 450);
  };
  const statusOptions = ["planned", "setup", "active", "paused", "expired"];
  return <div className="portal-admin-editor">
    <p className="portal-admin-feedback" role="status">{message || "Değişiklikler müşteri bazında uygulanır ve denetim loguna yazılır."}</p>
    <details open><summary>Portal Kimliği</summary><form onSubmit={submit}><input type="hidden" name="action" value="profile" /><label>Firma adı<input name="companyName" defaultValue={snapshot.branding.companyName} /></label><label>Logo URL<input name="logoUrl" type="url" defaultValue={snapshot.branding.logoUrl} /></label><label>Monogram<input name="monogram" maxLength={3} defaultValue={snapshot.branding.monogram} /></label><label>Tema<select name="theme" defaultValue={snapshot.branding.theme}><option value="avci">Avcı</option><option value="graphite">Kömür</option><option value="energy">Enerji</option></select></label><label>Görünüm<select name="colorMode" defaultValue={snapshot.branding.colorMode}><option value="day">Gündüz</option><option value="night">Gece</option></select></label><label>Onboarding<select name="onboardingStatus" defaultValue={snapshot.onboarding.status}><option value="not_started">Başlamadı</option><option value="in_progress">Devam ediyor</option><option value="complete">Tamamlandı</option></select></label><label>İlerleme (0–5)<input name="onboardingProgress" type="number" min="0" max="5" defaultValue={snapshot.onboarding.progress} /></label><button className="button button-primary">Kimliği kaydet</button></form></details>
    <details><summary>Sağlık ve Eşikler</summary><form onSubmit={submit}><input type="hidden" name="action" value="thresholds" /><label>SSL/hosting uyarısı (gün)<input name="sslWarningDays" type="number" min="1" max="365" defaultValue={snapshot.thresholds.sslWarningDays} /></label><label>Tofy tıklama eşiği (%)<input name="tofyClickThresholdPercent" type="number" min="0.01" max="100" step="0.01" defaultValue={snapshot.thresholds.tofyClickThresholdBps / 100} /></label><label>Kurulumda kalma eşiği (gün)<input name="marketplaceSetupDays" type="number" min="1" max="180" defaultValue={snapshot.thresholds.marketplaceSetupDays} /></label><button className="button button-primary">Eşikleri kaydet</button></form></details>
    <details><summary>Avcı Commerce Lisansı</summary><form onSubmit={submit}><input type="hidden" name="action" value="commerce-license" /><label>Mağaza anahtarı<input name="storeKey" placeholder="basbitir-store" required /></label><label>Kurulum kimliği<input name="installationId" placeholder="installation-basbitir-001" required /></label><label>Ana domain<input name="primaryDomain" placeholder="basbitir.com" required /></label><label>Paket<input name="plan" defaultValue="scale" required /></label><label>Commerce sürümü<input name="commerceVersion" defaultValue="1.0.0" required /></label><label>Geçerlilik tarihi<input name="validUntil" type="datetime-local" required /></label><label>Lisans kapsamları<textarea name="scopes" placeholder="core.catalog, core.orders, addon.tofy" required /></label><label>Kullanım limitleri (JSON)<textarea name="limits" defaultValue="{}" /></label><button className="button button-primary">Lisansı üret / anahtarı yenile</button></form><p>Kurulum anahtarı veritabanında yalnız özet olarak saklanır ve kayıttan sonra bir kez gösterilir.</p></details>
    <details><summary>Modüller</summary><form onSubmit={submit}><input type="hidden" name="action" value="module" /><label>Modül<select name="moduleId">{moduleCatalog.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>Durum<select name="status">{statusOptions.map(item => <option key={item}>{item}</option>)}</select></label><label>Kapsam<input name="coverage" placeholder="Paket veya özel kapsam" /></label><label>Not<textarea name="note" /></label><button className="button button-primary">Modülü ata / güncelle</button></form><p>{snapshot.moduleInstances.length ? snapshot.moduleInstances.map((item) => `${item.name} · ${item.status}`).join(" | ") : "Atanmış modül yok."}</p></details>
    <details><summary>Entegrasyonlar</summary><form onSubmit={submit}><input type="hidden" name="action" value="integration" /><label>Entegrasyon<select name="integrationId">{integrationCatalog.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>Durum<select name="status">{statusOptions.map(item => <option key={item}>{item}</option>)}</select></label><label>Kurulum %<input name="setupProgress" type="number" min="0" max="100" defaultValue="0" /></label><label>Sağlık puanı<input name="healthScore" type="number" min="0" max="100" defaultValue="0" /></label><label>Görünür hata özeti<textarea name="lastErrorSummary" /></label><button className="button button-primary">Entegrasyonu ata / güncelle</button></form><p>{snapshot.integrationInstances.length ? snapshot.integrationInstances.map((item) => `${item.name} · ${item.status}`).join(" | ") : "Atanmış entegrasyon yok."}</p></details>
    <details><summary>Tofy Deneyleri</summary><form onSubmit={submit}><input type="hidden" name="action" value="experiment" /><label>Deney adı<input name="name" required /></label><label>Tür<select name="kind"><option value="copy">Öneri metni</option><option value="placement">Yerleşim</option><option value="bundle">Ürün paketi</option></select></label><label>Durum<select name="status"><option value="draft">Taslak</option><option value="active">Aktif</option></select></label><label>Kontrol<input name="controlLabel" /></label><label>Varyant<input name="variantLabel" /></label><button className="button button-primary">Deney oluştur</button></form></details>
    <details><summary>Bildirimler</summary><form onSubmit={submit}><input type="hidden" name="action" value="notification" /><label>Başlık<input name="title" required /></label><label>Açıklama<textarea name="body" /></label><label>Tür<select name="type"><option value="info">Bilgi</option><option value="success">Sağlıklı</option><option value="warning">Takip</option><option value="critical">Kritik</option></select></label><label>Öncelik<input name="priority" type="number" min="0" max="100" defaultValue="20" /></label><label>Hedef bölüm<input name="targetSection" defaultValue="ozet" /></label><button className="button button-primary">Bildirim yayınla</button></form></details>
    <details><summary>Teslim ve Dokümanlar</summary><form onSubmit={submit}><input type="hidden" name="action" value="document" /><label>Doküman adı<input name="title" required /></label><label>Kategori<select name="category"><option value="delivery">Teslim</option><option value="training">Eğitim</option><option value="guide">Kılavuz</option></select></label><label>HTTPS bağlantısı<input name="url" type="url" required /></label><button className="button button-primary">Dokümanı ekle</button></form></details>
  </div>;
}
