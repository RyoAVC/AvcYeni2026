"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { withBasePath } from "../../base-path";

type IntegrationItem = {
  id: number;
  providerKey: string;
  category: string;
  name: string;
  status: string;
  config: string;
  lastSyncAt: string;
};

const CATEGORY_NAMES: Record<string, string> = {
  payment: "💳 Ödeme Sistemleri & Sanal POS",
  shipping: "🚚 Kargo & Lojistik",
  marketplace: "🛍️ Pazaryerleri",
  erp: "📊 Muhasebe & E-Fatura (ERP)",
  sms: "📱 İletişim & SMS Servisleri",
};

export function IntegrationClient({ initialIntegrations }: { initialIntegrations: IntegrationItem[] }) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<IntegrationItem | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [isTestMode, setIsTestMode] = useState(true);
  const [status, setStatus] = useState("active");
  const [saving, setSaving] = useState(false);
  const [logoVersion, setLogoVersion] = useState(0);

  function openConfigModal(item: IntegrationItem) {
    setSelectedItem(item);
    setStatus(item.status);
    try {
      const conf = JSON.parse(item.config || "{}");
      setApiKey(conf.apiKey || conf.merchantId || conf.username || "");
      setSecretKey(conf.secretKey || conf.password || conf.companyId || "");
      setIsTestMode(conf.mode === "test" || conf.mode === "sandbox");
    } catch {
      setApiKey("");
      setSecretKey("");
      setIsTestMode(true);
    }
    setModalOpen(true);
  }

  async function handleToggleStatus(item: IntegrationItem) {
    const nextStatus = item.status === "active" ? "passive" : "active";
    try {
      const res = await fetch(withBasePath(`/api/yonetim/entegrasyonlar/${item.id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) router.refresh();
    } catch {
      alert("Ağ hatası oluştu.");
    }
  }

  async function handleSaveConfig(e: FormEvent) {
    e.preventDefault();
    if (!selectedItem || saving) return;
    setSaving(true);

    const configObj = {
      apiKey,
      secretKey,
      mode: isTestMode ? "test" : "live",
    };

    try {
      const res = await fetch(withBasePath(`/api/yonetim/entegrasyonlar/${selectedItem.id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, config: configObj }),
      });
      if (res.ok) {
        setModalOpen(false);
        setSaving(false);
        router.refresh();
      } else {
        alert("Entegrasyon ayarları kaydedilemedi.");
        setSaving(false);
      }
    } catch {
      alert("Ağ hatası oluştu.");
      setSaving(false);
    }
  }

  async function handleLogoUpload(file: File | null) {
    if (!selectedItem || !file) return;
    const form = new FormData();
    form.set("logo", file);
    setSaving(true);
    const response = await fetch(withBasePath(`/api/yonetim/entegrasyonlar/${selectedItem.id}/logo`), { method: "POST", body: form });
    const result = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) return alert(typeof result.error === "string" ? result.error : "Logo yüklenemedi.");
    setLogoVersion((value) => value + 1);
  }

  const grouped = initialIntegrations.reduce((acc, curr) => {
    acc[curr.category] = acc[curr.category] || [];
    acc[curr.category].push(curr);
    return acc;
  }, {} as Record<string, IntegrationItem[]>);

  return (
    <div style={{ display: "grid", gap: "28px" }}>
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          <h2 style={{ fontSize: "15px", fontWeight: 750, color: "var(--admin-text-main)", marginBottom: "14px" }}>
            {CATEGORY_NAMES[category] || category.toUpperCase()}
          </h2>

          <div className="integration-admin-grid">
            {items.map((item) => (
              <div className={`admin-card integration-admin-card ${item.status === "active" ? "is-active" : "is-passive"}`} key={item.id}>
                <div>
                  <div className="integration-admin-head">
                    <span className="integration-admin-logo"><img alt="" onError={(event) => { event.currentTarget.style.display = "none"; }} src={withBasePath(`/api/yonetim/entegrasyonlar/${item.id}/logo?v=${logoVersion}`)} /><b>{item.name.slice(0, 2).toUpperCase()}</b></span>
                    <strong>{item.name}</strong>
                    <span className={`admin-badge ${item.status === "active" ? "admin-badge--success" : "admin-badge--neutral"}`}>
                      {item.status === "active" ? "Bağlı" : "Pasif"}
                    </span>
                  </div>
                  <span style={{ fontSize: "11px", color: "var(--admin-text-muted)", display: "block" }}>
                    Sağlayıcı Kodu: <code style={{ fontSize: "11px" }}>{item.providerKey}</code>
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--admin-text-muted)", display: "block", marginTop: "4px" }}>
                    Son Senkronizasyon: {item.lastSyncAt ? new Date(item.lastSyncAt).toLocaleDateString("tr-TR") : "Henüz yapılmadı"}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: "14px",
                    marginTop: "16px",
                    borderTop: "1px solid var(--admin-border-subtle)",
                  }}
                >
                  <button
                    className="admin-btn admin-btn-secondary admin-btn-sm"
                    onClick={() => openConfigModal(item)}
                    type="button"
                  >
                    ⚙️ API & Ayarlar
                  </button>

                  <button
                    className={`admin-btn admin-btn-sm ${item.status === "active" ? "admin-btn-secondary" : "admin-btn-primary"}`}
                    onClick={() => handleToggleStatus(item)}
                    type="button"
                  >
                    {item.status === "active" ? "Pasife Al" : "Aktif Et"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Modal Drawer */}
      {modalOpen && selectedItem && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 100,
            display: "grid",
            placeItems: "center",
            padding: "20px",
          }}
        >
          <div
            className="admin-card"
            style={{
              width: "100%",
              maxWidth: "520px",
              boxShadow: "var(--admin-shadow-lg)",
            }}
          >
            <div className="admin-card-header">
              <h3 className="admin-card-title">{selectedItem.name} Entegrasyon Ayarları</h3>
              <button
                onClick={() => setModalOpen(false)}
                style={{ border: 0, background: "transparent", fontSize: "20px", cursor: "pointer" }}
                type="button"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveConfig} style={{ display: "grid", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>
                  Marka logosu / ikon
                </label>
                <input accept="image/png,image/jpeg,image/webp,image/svg+xml" disabled={saving} onChange={(event) => handleLogoUpload(event.target.files?.[0] || null)} type="file" />
                <small style={{ display: "block", marginTop: 5, color: "var(--admin-text-muted)" }}>PNG, JPG, WebP veya güvenli SVG. En fazla 400 KB.</small>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>
                  API Anahtarı / Mağaza Kodu (Merchant Key / ID)
                </label>
                <input
                  className="admin-select"
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Örn: 987654 veya pk_live_..."
                  style={{ width: "100%", fontFamily: "monospace" }}
                  type="text"
                  value={apiKey}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>
                  Gizli Anahtar / Şifre (Secret Key)
                </label>
                <input
                  className="admin-select"
                  onChange={(e) => setSecretKey(e.target.value)}
                  placeholder="Örn: sk_live_... veya şifre"
                  style={{ width: "100%", fontFamily: "monospace" }}
                  type="password"
                  value={secretKey}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>
                    Çalışma Modu
                  </label>
                  <select
                    className="admin-select"
                    onChange={(e) => setIsTestMode(e.target.value === "test")}
                    style={{ width: "100%" }}
                    value={isTestMode ? "test" : "live"}
                  >
                    <option value="test">🧪 Test / Sandbox Modu</option>
                    <option value="live">🚀 Canlı (Production) Modu</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>
                    Entegrasyon Durumu
                  </label>
                  <select
                    className="admin-select"
                    onChange={(e) => setStatus(e.target.value)}
                    style={{ width: "100%" }}
                    value={status}
                  >
                    <option value="active">Aktif</option>
                    <option value="passive">Pasif</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button
                  className="admin-btn admin-btn-secondary"
                  onClick={() => setModalOpen(false)}
                  type="button"
                >
                  İptal
                </button>
                <button
                  className="admin-btn admin-btn-primary"
                  disabled={saving}
                  type="submit"
                >
                  {saving ? "Kaydediliyor..." : "Ayarları Kaydet & Test Et"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
