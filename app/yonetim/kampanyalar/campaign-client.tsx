"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { withBasePath } from "../../base-path";

type CampaignItem = {
  id: number;
  name: string;
  type: string;
  discountValue: number;
  minSpend: number;
  targetType: string;
  status: string;
  startsAt: string;
  endsAt: string;
};

export function CampaignClient({ initialCampaigns }: { initialCampaigns: CampaignItem[] }) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<CampaignItem | null>(null);

  const [name, setName] = useState("");
  const [type, setType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState(10);
  const [minSpend, setMinSpend] = useState(0);
  const [targetType, setTargetType] = useState("all");
  const [status, setStatus] = useState("active");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function openCreateModal() {
    setEditingCampaign(null);
    setName("");
    setType("percentage");
    setDiscountValue(15);
    setMinSpend(0);
    setTargetType("all");
    setStatus("active");
    setStartsAt(new Date().toISOString().split("T")[0]);
    setEndsAt("");
    setErrorMessage("");
    setModalOpen(true);
  }

  function openEditModal(c: CampaignItem) {
    setEditingCampaign(c);
    setName(c.name);
    setType(c.type);
    setDiscountValue(c.discountValue);
    setMinSpend(c.minSpend);
    setTargetType(c.targetType);
    setStatus(c.status);
    setStartsAt(c.startsAt);
    setEndsAt(c.endsAt);
    setErrorMessage("");
    setModalOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setErrorMessage("");

    const payload = {
      name,
      type,
      discountValue: Number(discountValue) || 0,
      minSpend: Number(minSpend) || 0,
      targetType,
      status,
      startsAt,
      endsAt,
    };

    try {
      const endpoint = editingCampaign
        ? `/api/yonetim/kampanyalar/${editingCampaign.id}`
        : "/api/yonetim/kampanyalar";
      const method = editingCampaign ? "PATCH" : "POST";

      const res = await fetch(withBasePath(endpoint), {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setErrorMessage(data.error || "Kampanya kaydedilemedi.");
        setSaving(false);
        return;
      }

      setModalOpen(false);
      setSaving(false);
      router.refresh();
    } catch {
      setErrorMessage("Ağ hatası oluştu.");
      setSaving(false);
    }
  }

  async function handleDelete(c: CampaignItem) {
    if (!confirm(`"${c.name}" kampanyasını silmek istediğinize emin misiniz?`)) return;

    try {
      const res = await fetch(withBasePath(`/api/yonetim/kampanyalar/${c.id}`), {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        alert(data.error || "Kampanya silinemedi.");
        return;
      }
      router.refresh();
    } catch {
      alert("Ağ hatası oluştu.");
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
        <button className="admin-btn admin-btn-primary" onClick={openCreateModal} type="button">
          <svg aria-hidden="true" fill="none" height="14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" width="14">
            <line x1="12" x2="12" y1="5" y2="19" /><line x1="5" x2="19" y1="12" y2="12" />
          </svg>
          <span>Yeni Kampanya Oluştur</span>
        </button>
      </div>

      <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="admin-table-container" style={{ border: 0 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>KAMPANYA ADI</th>
                <th>TÜR & İNDİRİM</th>
                <th>MİNİMUM SEPET</th>
                <th>HEDEF KİTLE</th>
                <th>GEÇERLİLİK</th>
                <th>DURUM</th>
                <th style={{ textAlign: "right" }}>İŞLEMLER</th>
              </tr>
            </thead>
            <tbody>
              {initialCampaigns.length ? (
                initialCampaigns.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <strong style={{ fontSize: "13px" }}>{c.name}</strong>
                    </td>
                    <td>
                      <span className="admin-badge admin-badge--info">
                        {c.type === "percentage" ? `%${c.discountValue} İndirim` : c.type === "free_shipping" ? "Ücretsiz Kargo" : `${c.discountValue} TL İndirim`}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "12px" }}>
                        {c.minSpend > 0 ? `${c.minSpend} TL` : "Limitsiz"}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "12px", color: "var(--admin-text-muted)" }}>
                        {c.targetType === "all" ? "Tüm Ürünler" : c.targetType}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "11.5px", color: "var(--admin-text-muted)" }}>
                        {c.startsAt || "Başlangıç yok"} {c.endsAt ? `→ ${c.endsAt}` : "→ Süresiz"}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-badge ${c.status === "active" ? "admin-badge--success" : "admin-badge--neutral"}`}>
                        {c.status === "active" ? "Aktif" : "Pasif"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                        onClick={() => openEditModal(c)}
                        style={{ marginRight: "6px" }}
                        type="button"
                      >
                        Düzenle
                      </button>
                      <button
                        className="admin-btn admin-btn-sm"
                        onClick={() => handleDelete(c)}
                        style={{ color: "#dc2626", borderColor: "rgba(220,38,38,0.2)" }}
                        type="button"
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "36px", color: "var(--admin-text-muted)" }}>
                    Henüz kampanya tanımlanmamış.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Drawer */}
      {modalOpen && (
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
              <h3 className="admin-card-title">
                {editingCampaign ? "Kampanyayı Düzenle" : "Yeni Kampanya Oluştur"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                style={{ border: 0, background: "transparent", fontSize: "20px", cursor: "pointer" }}
                type="button"
              >
                ✕
              </button>
            </div>

            {errorMessage && (
              <div style={{ padding: "10px", borderRadius: "6px", background: "#fee2e2", color: "#991b1b", fontSize: "12.5px", marginBottom: "14px" }}>
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>
                  Kampanya Başlığı *
                </label>
                <input
                  className="admin-select"
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Örn: Yaz Sezonu %20 Sepet İndirimi"
                  required
                  style={{ width: "100%" }}
                  type="text"
                  value={name}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>
                    Kampanya Türü
                  </label>
                  <select
                    className="admin-select"
                    onChange={(e) => setType(e.target.value)}
                    style={{ width: "100%" }}
                    value={type}
                  >
                    <option value="percentage">Yüzdesel İndirim (%)</option>
                    <option value="fixed">Sabit Tutar İndirimi (TL)</option>
                    <option value="free_shipping">Ücretsiz Kargo</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>
                    {type === "percentage" ? "İndirim Oranı (%)" : type === "fixed" ? "İndirim Tutarı (TL)" : "Değer"}
                  </label>
                  <input
                    className="admin-select"
                    disabled={type === "free_shipping"}
                    min={0}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    style={{ width: "100%" }}
                    type="number"
                    value={discountValue}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>
                    Min. Sepet Tutarı (TL)
                  </label>
                  <input
                    className="admin-select"
                    min={0}
                    onChange={(e) => setMinSpend(Number(e.target.value))}
                    style={{ width: "100%" }}
                    type="number"
                    value={minSpend}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>
                    Durum
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>
                    Başlangıç Tarihi
                  </label>
                  <input
                    className="admin-select"
                    onChange={(e) => setStartsAt(e.target.value)}
                    style={{ width: "100%" }}
                    type="date"
                    value={startsAt}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>
                    Bitiş Tarihi
                  </label>
                  <input
                    className="admin-select"
                    onChange={(e) => setEndsAt(e.target.value)}
                    style={{ width: "100%" }}
                    type="date"
                    value={endsAt}
                  />
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
                  {saving ? "Kaydediliyor..." : editingCampaign ? "Güncelle" : "Kampanyayı Başlat"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
