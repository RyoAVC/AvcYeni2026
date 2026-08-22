"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { withBasePath } from "../../base-path";

type CouponItem = {
  id: number;
  code: string;
  type: string;
  discountValue: number;
  minSpend: number;
  maxDiscount: number;
  usageLimit: number;
  usedCount: number;
  status: string;
  startsAt: string;
  endsAt: string;
};

export function CouponClient({ initialCoupons }: { initialCoupons: CouponItem[] }) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponItem | null>(null);

  const [code, setCode] = useState("");
  const [type, setType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState(10);
  const [minSpend, setMinSpend] = useState(0);
  const [maxDiscount, setMaxDiscount] = useState(0);
  const [usageLimit, setUsageLimit] = useState(100);
  const [status, setStatus] = useState("active");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function generateRandomCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let res = "AVCI";
    for (let i = 0; i < 4; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCode(res);
  }

  function openCreateModal() {
    setEditingCoupon(null);
    generateRandomCode();
    setType("percentage");
    setDiscountValue(10);
    setMinSpend(0);
    setMaxDiscount(0);
    setUsageLimit(100);
    setStatus("active");
    setStartsAt(new Date().toISOString().split("T")[0]);
    setEndsAt("");
    setErrorMessage("");
    setModalOpen(true);
  }

  function openEditModal(c: CouponItem) {
    setEditingCoupon(c);
    setCode(c.code);
    setType(c.type);
    setDiscountValue(c.discountValue);
    setMinSpend(c.minSpend);
    setMaxDiscount(c.maxDiscount);
    setUsageLimit(c.usageLimit);
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
      code: code.trim().toUpperCase(),
      type,
      discountValue: Number(discountValue) || 0,
      minSpend: Number(minSpend) || 0,
      maxDiscount: Number(maxDiscount) || 0,
      usageLimit: Number(usageLimit) || 100,
      status,
      startsAt,
      endsAt,
    };

    try {
      const endpoint = editingCoupon
        ? `/api/yonetim/kuponlar/${editingCoupon.id}`
        : "/api/yonetim/kuponlar";
      const method = editingCoupon ? "PATCH" : "POST";

      const res = await fetch(withBasePath(endpoint), {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setErrorMessage(data.error || "Kupon kaydedilemedi.");
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

  async function handleDelete(c: CouponItem) {
    if (!confirm(`"${c.code}" kuponunu silmek istediğinize emin misiniz?`)) return;

    try {
      const res = await fetch(withBasePath(`/api/yonetim/kuponlar/${c.id}`), {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        alert(data.error || "Kupon silinemedi.");
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
          <span>Yeni Kupon Oluştur</span>
        </button>
      </div>

      <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="admin-table-container" style={{ border: 0 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>KUPON KODU</th>
                <th>İNDİRİM DEĞERİ</th>
                <th>MİN. SEPET</th>
                <th>KULLANIM DURUMU</th>
                <th>GEÇERLİLİK</th>
                <th>DURUM</th>
                <th style={{ textAlign: "right" }}>İŞLEMLER</th>
              </tr>
            </thead>
            <tbody>
              {initialCoupons.length ? (
                initialCoupons.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <code style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.05em", background: "#f1f5f9", padding: "4px 8px", borderRadius: "6px" }}>
                        {c.code}
                      </code>
                    </td>
                    <td>
                      <strong style={{ color: "var(--admin-accent)" }}>
                        {c.type === "percentage" ? `%${c.discountValue}` : `${c.discountValue} TL`}
                      </strong>
                    </td>
                    <td>
                      <span style={{ fontSize: "12px" }}>
                        {c.minSpend > 0 ? `${c.minSpend} TL` : "Limitsiz"}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "12px" }}>
                        <strong>{c.usedCount}</strong> / {c.usageLimit} kullanım
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
                    Henüz kupon tanımlanmamış.
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
              maxWidth: "500px",
              boxShadow: "var(--admin-shadow-lg)",
            }}
          >
            <div className="admin-card-header">
              <h3 className="admin-card-title">
                {editingCoupon ? "Kuponu Düzenle" : "Yeni Kupon Oluştur"}
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
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 700 }}>Kupon Kodu *</label>
                  <button
                    onClick={generateRandomCode}
                    style={{ fontSize: "11px", color: "var(--admin-accent)", background: "transparent", border: 0, cursor: "pointer", fontWeight: 700 }}
                    type="button"
                  >
                    🎲 Rastgele Kod Üret
                  </button>
                </div>
                <input
                  className="admin-select"
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Örn: AVCI2026"
                  required
                  style={{ width: "100%", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.06em" }}
                  type="text"
                  value={code}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>
                    İndirim Türü
                  </label>
                  <select
                    className="admin-select"
                    onChange={(e) => setType(e.target.value)}
                    style={{ width: "100%" }}
                    value={type}
                  >
                    <option value="percentage">Yüzde (%) İndirim</option>
                    <option value="fixed">Sabit Tutar (TL)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>
                    İndirim Değeri
                  </label>
                  <input
                    className="admin-select"
                    min={0}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    required
                    style={{ width: "100%", fontWeight: 700 }}
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
                    Toplam Kullanım Limiti
                  </label>
                  <input
                    className="admin-select"
                    min={1}
                    onChange={(e) => setUsageLimit(Number(e.target.value))}
                    style={{ width: "100%" }}
                    type="number"
                    value={usageLimit}
                  />
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
                  {saving ? "Kaydediliyor..." : editingCoupon ? "Güncelle" : "Kuponu Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
