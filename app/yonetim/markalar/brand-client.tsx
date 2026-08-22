"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { withBasePath } from "../../base-path";
import { slugifyProduct } from "../../product-admin.mjs";

type BrandItem = {
  id: number;
  name: string;
  slug: string;
  website: string;
  description: string;
  sortOrder: number;
  status: string;
  productCount: number;
};

export function BrandClient({ initialBrands }: { initialBrands: BrandItem[] }) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandItem | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [status, setStatus] = useState("active");
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function openCreateModal() {
    setEditingBrand(null);
    setName("");
    setSlug("");
    setWebsite("");
    setDescription("");
    setSortOrder(initialBrands.length + 1);
    setStatus("active");
    setErrorMessage("");
    setModalOpen(true);
  }

  function openEditModal(b: BrandItem) {
    setEditingBrand(b);
    setName(b.name);
    setSlug(b.slug);
    setWebsite(b.website);
    setDescription(b.description);
    setSortOrder(b.sortOrder);
    setStatus(b.status);
    setErrorMessage("");
    setModalOpen(true);
  }

  function handleNameChange(val: string) {
    setName(val);
    if (!editingBrand && (!slug || slug === slugifyProduct(name))) {
      setSlug(slugifyProduct(val));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setErrorMessage("");

    const payload = {
      name,
      slug: slug || slugifyProduct(name),
      website,
      description,
      sortOrder: Number(sortOrder) || 0,
      status,
    };

    try {
      const endpoint = editingBrand
        ? `/api/yonetim/markalar/${editingBrand.id}`
        : "/api/yonetim/markalar";
      const method = editingBrand ? "PATCH" : "POST";

      const res = await fetch(withBasePath(endpoint), {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setErrorMessage(data.error || "Marka kaydedilemedi.");
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

  async function handleDelete(b: BrandItem) {
    if (b.productCount > 0) {
      alert(`Bu markaya ait ${b.productCount} adet ürün var. Önce ürünlerin markasını değiştiriniz.`);
      return;
    }
    if (!confirm(`"${b.name}" markasını silmek istediğinize emin misiniz?`)) return;

    try {
      const res = await fetch(withBasePath(`/api/yonetim/markalar/${b.id}`), {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        alert(data.error || "Marka silinemedi.");
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
          <span>Yeni Marka Ekle</span>
        </button>
      </div>

      <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="admin-table-container" style={{ border: 0 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: "60px" }}>SIRA</th>
                <th>MARKA ADI</th>
                <th>KISA KOD</th>
                <th>WEB SİTESİ</th>
                <th>ÜRÜN SAYISI</th>
                <th>DURUM</th>
                <th style={{ textAlign: "right" }}>İŞLEMLER</th>
              </tr>
            </thead>
            <tbody>
              {initialBrands.length ? (
                initialBrands.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <span className="admin-badge admin-badge--neutral">{b.sortOrder}</span>
                    </td>
                    <td>
                      <strong style={{ fontSize: "13px" }}>{b.name}</strong>
                      {b.description && (
                        <span style={{ display: "block", fontSize: "11px", color: "var(--admin-text-muted)" }}>
                          {b.description}
                        </span>
                      )}
                    </td>
                    <td>
                      <code style={{ fontSize: "12px", background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px" }}>
                        {b.slug}
                      </code>
                    </td>
                    <td>
                      {b.website ? (
                        <a href={b.website} rel="noreferrer" style={{ fontSize: "12px", color: "var(--admin-accent)" }} target="_blank">
                          {b.website.replace(/^https?:\/\//, "")} ↗
                        </a>
                      ) : (
                        <span style={{ color: "var(--admin-text-muted)", fontSize: "11px" }}>-</span>
                      )}
                    </td>
                    <td>
                      <span className="admin-badge admin-badge--info">
                        {b.productCount} ürün
                      </span>
                    </td>
                    <td>
                      <span className={`admin-badge ${b.status === "active" ? "admin-badge--success" : "admin-badge--neutral"}`}>
                        {b.status === "active" ? "Aktif" : "Pasif"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                        onClick={() => openEditModal(b)}
                        style={{ marginRight: "6px" }}
                        type="button"
                      >
                        Düzenle
                      </button>
                      <button
                        className="admin-btn admin-btn-sm"
                        onClick={() => handleDelete(b)}
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
                    Henüz marka tanımlanmamış.
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
                {editingBrand ? "Markayı Düzenle" : "Yeni Marka Ekle"}
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
                  Marka Adı *
                </label>
                <input
                  className="admin-select"
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Örn: Avcı Teknoloji"
                  required
                  style={{ width: "100%" }}
                  type="text"
                  value={name}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>
                  Kısa Kod (Slug)
                </label>
                <input
                  className="admin-select"
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="avci-teknoloji"
                  style={{ width: "100%" }}
                  type="text"
                  value={slug}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>
                  Web Sitesi URL
                </label>
                <input
                  className="admin-select"
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com"
                  style={{ width: "100%" }}
                  type="url"
                  value={website}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>
                  Açıklama
                </label>
                <textarea
                  className="admin-select"
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Marka hakkında kısa bilgi..."
                  rows={3}
                  style={{ width: "100%", height: "auto", padding: "8px" }}
                  value={description}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>
                    Sıralama No
                  </label>
                  <input
                    className="admin-select"
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    style={{ width: "100%" }}
                    type="number"
                    value={sortOrder}
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
                  {saving ? "Kaydediliyor..." : editingBrand ? "Güncelle" : "Ekle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
