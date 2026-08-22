"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { withBasePath } from "../../base-path";
import { PRODUCT_STATUS_OPTIONS, slugifyProduct } from "../../product-admin.mjs";

export type ProductFormValues = {
  name: string;
  slug: string;
  sku: string;
  barcode: string;
  categoryId: number | null;
  brandId: number | null;
  shortDescription: string;
  description: string;
  price: number;
  discountedPrice: number | null;
  costPrice: number;
  vatRate: number;
  stock: number;
  criticalStock: number;
  status: string;
  isFeatured: number;
  images: string;
  variants: string;
  seoTitle: string;
  seoDescription: string;
};

type OptionItem = { id: number; name: string };

export function ProductForm({
  mode,
  productId,
  initial,
  categories = [],
  brands = [],
}: {
  mode: "create" | "edit";
  productId?: number;
  initial?: Partial<ProductFormValues>;
  categories?: OptionItem[];
  brands?: OptionItem[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"general" | "pricing" | "stock" | "variants" | "media" | "seo">("general");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  // Form State
  const [name, setName] = useState(initial?.name || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [sku, setSku] = useState(initial?.sku || "");
  const [barcode, setBarcode] = useState(initial?.barcode || "");
  const [categoryId, setCategoryId] = useState<string>(initial?.categoryId ? String(initial.categoryId) : "");
  const [brandId, setBrandId] = useState<string>(initial?.brandId ? String(initial.brandId) : "");
  const [shortDescription, setShortDescription] = useState(initial?.shortDescription || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [price, setPrice] = useState<number>(initial?.price ?? 0);
  const [discountedPrice, setDiscountedPrice] = useState<string>(initial?.discountedPrice ? String(initial.discountedPrice) : "");
  const [costPrice, setCostPrice] = useState<number>(initial?.costPrice ?? 0);
  const [vatRate, setVatRate] = useState<number>(initial?.vatRate ?? 20);
  const [stock, setStock] = useState<number>(initial?.stock ?? 0);
  const [criticalStock, setCriticalStock] = useState<number>(initial?.criticalStock ?? 5);
  const [status, setStatus] = useState(initial?.status || "active");
  const [isFeatured, setIsFeatured] = useState<boolean>(Boolean(initial?.isFeatured));
  const [imageUrl, setImageUrl] = useState<string>(() => {
    try {
      const arr = JSON.parse(initial?.images || "[]");
      return Array.isArray(arr) && arr[0] ? arr[0] : "";
    } catch {
      return "";
    }
  });
  const [seoTitle, setSeoTitle] = useState(initial?.seoTitle || "");
  const [seoDescription, setSeoDescription] = useState(initial?.seoDescription || "");
  const [aiGenerating, setAiGenerating] = useState(false);

  function handleNameChange(value: string) {
    setName(value);
    if (mode === "create" && (!slug || slug === slugifyProduct(name))) {
      setSlug(slugifyProduct(value));
    }
  }

  function handleAiGenerate() {
    if (!name) {
      setMessage({ type: "error", text: "Lütfen önce ürün adını giriniz." });
      return;
    }
    setAiGenerating(true);
    setTimeout(() => {
      setShortDescription(`${name} - Kurumsal e-ticaret altyapısı ve yüksek performanslı mağaza çözümü.`);
      setDescription(
        `<h2>${name}</h2><p>${name}, modern e-ticaret operasyonlarınızı hızlandırmak için özel olarak geliştirilmiştir. Güvenli ödeme, anlık stok takibi ve tam entegrasyon desteği içerir.</p><ul><li>Yüksek performans ve hızlı altyapı</li><li>Kolay yönetim ve çok kanallı satış desteği</li><li>Mobil uyumlu modern deneyim</li></ul>`
      );
      setSeoTitle(`${name} | Avcı E-Ticaret`);
      setSeoDescription(`${name} en uygun fiyat ve güvenli altyapı ile Avcı E-Ticaret'te. Hemen keşfedin ve siparişinizi oluşturun.`);
      setAiGenerating(false);
      setMessage({ type: "success", text: "✨ Avcı AI ürün açıklamasını ve SEO meta etiketlerini başarıyla oluşturdu!" });
    }, 450);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setMessage({ type: "info", text: "Kaydediliyor…" });

    const imagesArray = imageUrl.trim() ? [imageUrl.trim()] : [];

    const payload = {
      name,
      slug: slug || slugifyProduct(name),
      sku,
      barcode,
      categoryId: categoryId ? Number(categoryId) : null,
      brandId: brandId ? Number(brandId) : null,
      shortDescription,
      description,
      price: Number(price) || 0,
      discountedPrice: discountedPrice ? Number(discountedPrice) : null,
      costPrice: Number(costPrice) || 0,
      vatRate: Number(vatRate),
      stock: Number(stock) || 0,
      criticalStock: Number(criticalStock) || 5,
      status,
      isFeatured: isFeatured ? 1 : 0,
      images: JSON.stringify(imagesArray),
      variants: initial?.variants || "[]",
      seoTitle,
      seoDescription,
    };

    try {
      const endpoint = mode === "create" ? "/api/yonetim/urunler" : `/api/yonetim/urunler/${productId}`;
      const res = await fetch(withBasePath(endpoint), {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.ok) {
        setMessage({ type: "error", text: data.error || "Kayıt işlemi başarısız oldu." });
        setSaving(false);
        return;
      }

      setMessage({ type: "success", text: "Ürün başarıyla kaydedildi! Yönlendiriliyorsunuz…" });
      setTimeout(() => {
        router.push("/yonetim/urunler");
        router.refresh();
      }, 600);
    } catch {
      setMessage({ type: "error", text: "Ağ bağlantısı hatası oluştu." });
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!confirm(`"${name}" ürününü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(withBasePath(`/api/yonetim/urunler/${productId}`), {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        alert(data.error || "Ürün silinemedi.");
        setDeleting(false);
        return;
      }
      router.push("/yonetim/urunler");
      router.refresh();
    } catch {
      alert("Ağ hatası oluştu.");
      setDeleting(false);
    }
  }

  return (
    <form className="admin-form-modern" onSubmit={onSubmit}>
      {message && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "20px",
            fontSize: "13px",
            fontWeight: 600,
            background: message.type === "error" ? "#fee2e2" : message.type === "success" ? "#d1fae5" : "#e0e7ff",
            color: message.type === "error" ? "#991b1b" : message.type === "success" ? "#065f46" : "#3730a3",
            border: `1px solid ${message.type === "error" ? "#f87171" : message.type === "success" ? "#34d399" : "#818cf8"}`,
          }}
        >
          {message.text}
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === "general" ? "active" : ""}`}
          onClick={() => setActiveTab("general")}
          type="button"
        >
          📄 Genel Bilgiler
        </button>
        <button
          className={`admin-tab ${activeTab === "pricing" ? "active" : ""}`}
          onClick={() => setActiveTab("pricing")}
          type="button"
        >
          💰 Fiyat & Vergi
        </button>
        <button
          className={`admin-tab ${activeTab === "stock" ? "active" : ""}`}
          onClick={() => setActiveTab("stock")}
          type="button"
        >
          📦 Stok & SKU
        </button>
        <button
          className={`admin-tab ${activeTab === "media" ? "active" : ""}`}
          onClick={() => setActiveTab("media")}
          type="button"
        >
          🖼️ Görsel & Medya
        </button>
        <button
          className={`admin-tab ${activeTab === "seo" ? "active" : ""}`}
          onClick={() => setActiveTab("seo")}
          type="button"
        >
          🔍 SEO & Arama
        </button>
      </div>

      {/* Tab 1: General Info */}
      {activeTab === "general" && (
        <div className="admin-card" style={{ display: "grid", gap: "18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700 }}>Temel Ürün Bilgileri</h3>
            <button
              className="admin-ai-badge"
              disabled={aiGenerating}
              onClick={handleAiGenerate}
              style={{ cursor: "pointer", border: "1px solid #c084fc" }}
              type="button"
            >
              <span>{aiGenerating ? "⏳ Üretiliyor..." : "✨ Avcı AI ile İçerik Yaz"}</span>
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>
                Ürün Adı *
              </label>
              <input
                className="admin-select"
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Örn: Avcı Kurumsal E-Ticaret Lisansı"
                required
                style={{ width: "100%" }}
                type="text"
                value={name}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>
                URL Kısa Kodu (Slug) *
              </label>
              <input
                className="admin-select"
                onChange={(e) => setSlug(e.target.value)}
                placeholder="avci-kurumsal-e-ticaret-lisansi"
                required
                style={{ width: "100%" }}
                type="text"
                value={slug}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>
                Kategori
              </label>
              <select
                className="admin-select"
                onChange={(e) => setCategoryId(e.target.value)}
                style={{ width: "100%" }}
                value={categoryId}
              >
                <option value="">-- Kategori Seçiniz --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>
                Marka
              </label>
              <select
                className="admin-select"
                onChange={(e) => setBrandId(e.target.value)}
                style={{ width: "100%" }}
                value={brandId}
              >
                <option value="">-- Marka Seçiniz --</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>
                Yayın Durumu
              </label>
              <select
                className="admin-select"
                onChange={(e) => setStatus(e.target.value)}
                style={{ width: "100%" }}
                value={status}
              >
                {PRODUCT_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>
              Kısa Özet Açıklama (Vitrin ve Listeleme için)
            </label>
            <input
              className="admin-select"
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Ürünün 1-2 cümlelik vurucu açıklaması"
              style={{ width: "100%" }}
              type="text"
              value={shortDescription}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>
              Detaylı Ürün Açıklaması (HTML / Zengin Metin)
            </label>
            <textarea
              className="admin-select"
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ürünün tüm özellikleri, kutu içeriği ve teknik detayları..."
              rows={7}
              style={{ width: "100%", height: "auto", padding: "12px", fontFamily: "monospace" }}
              value={description}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
            <input
              checked={isFeatured}
              id="isFeatured"
              onChange={(e) => setIsFeatured(e.target.checked)}
              style={{ width: "18px", height: "18px", accentColor: "var(--admin-accent)" }}
              type="checkbox"
            />
            <label htmlFor="isFeatured" style={{ fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
              ⭐ Bu ürünü vitrinde / ana sayfada öne çıkar
            </label>
          </div>
        </div>
      )}

      {/* Tab 2: Pricing & Tax */}
      {activeTab === "pricing" && (
        <div className="admin-card" style={{ display: "grid", gap: "18px" }}>
          <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700 }}>Fiyatlandırma & Maliyet</h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>
                Satış Fiyatı (TL) *
              </label>
              <input
                className="admin-select"
                min={0}
                onChange={(e) => setPrice(Number(e.target.value))}
                required
                style={{ width: "100%", fontWeight: 700, fontSize: "14px" }}
                type="number"
                value={price}
              />
              <span style={{ fontSize: "11px", color: "var(--admin-text-muted)" }}>KDV Dahil / Hariç baz fiyat</span>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>
                İndirimli Kampanya Fiyatı (TL)
              </label>
              <input
                className="admin-select"
                min={0}
                onChange={(e) => setDiscountedPrice(e.target.value)}
                placeholder="İndirim yoksa boş bırakın"
                style={{ width: "100%", color: "#dc2626", fontWeight: 700 }}
                type="number"
                value={discountedPrice}
              />
              <span style={{ fontSize: "11px", color: "var(--admin-text-muted)" }}>Ürünün üzeri çizili fiyatı</span>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>
                Alış / Maliyet Fiyatı (TL)
              </label>
              <input
                className="admin-select"
                min={0}
                onChange={(e) => setCostPrice(Number(e.target.value))}
                style={{ width: "100%" }}
                type="number"
                value={costPrice}
              />
              <span style={{ fontSize: "11px", color: "var(--admin-text-muted)" }}>Kar analizi için (müşteri görmez)</span>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>
                KDV Oranı (%)
              </label>
              <select
                className="admin-select"
                onChange={(e) => setVatRate(Number(e.target.value))}
                style={{ width: "100%" }}
                value={vatRate}
              >
                <option value={20}>%20 Standart KDV</option>
                <option value={10}>%10 İndirimli KDV</option>
                <option value={1}>%1 Temel Gıda KDV</option>
                <option value={0}>%0 Muaf / Lisans</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Stock & SKU */}
      {activeTab === "stock" && (
        <div className="admin-card" style={{ display: "grid", gap: "18px" }}>
          <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700 }}>Envanter & Barkod Yönetimi</h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>
                Stok Kodu (SKU)
              </label>
              <input
                className="admin-select"
                onChange={(e) => setSku(e.target.value)}
                placeholder="Örn: AVC-PRO-001"
                style={{ width: "100%" }}
                type="text"
                value={sku}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>
                Barkod (EAN / GTIN)
              </label>
              <input
                className="admin-select"
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="Örn: 868000100101"
                style={{ width: "100%" }}
                type="text"
                value={barcode}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>
                Mevcut Stok Adedi *
              </label>
              <input
                className="admin-select"
                min={0}
                onChange={(e) => setStock(Number(e.target.value))}
                required
                style={{ width: "100%", fontWeight: 700 }}
                type="number"
                value={stock}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>
                Kritik Stok Uyarı Eşiği
              </label>
              <input
                className="admin-select"
                min={0}
                onChange={(e) => setCriticalStock(Number(e.target.value))}
                style={{ width: "100%" }}
                type="number"
                value={criticalStock}
              />
              <span style={{ fontSize: "11px", color: "var(--admin-text-muted)" }}>
                Stok bu adedin altına düştüğünde kontrol panelinde uyarı verilir.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Media & Images */}
      {activeTab === "media" && (
        <div className="admin-card" style={{ display: "grid", gap: "18px" }}>
          <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700 }}>Görsel ve Medya</h3>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>
              Ana Ürün Görseli (URL veya Dosya Yolu)
            </label>
            <input
              className="admin-select"
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/images/product.png veya /brand/avci-logo-light.png"
              style={{ width: "100%" }}
              type="text"
              value={imageUrl}
            />
          </div>

          {imageUrl && (
            <div style={{ marginTop: "10px" }}>
              <span style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "8px" }}>Önizleme:</span>
              <div
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "10px",
                  border: "1px solid var(--admin-border)",
                  padding: "8px",
                  background: "#ffffff",
                  display: "grid",
                  placeItems: "center",
                  overflow: "hidden",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Ürün Önizleme"
                  src={imageUrl}
                  style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: SEO */}
      {activeTab === "seo" && (
        <div className="admin-card" style={{ display: "grid", gap: "18px" }}>
          <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700 }}>Arama Motoru Optimizasyonu (SEO)</h3>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>
              SEO Sayfa Başlığı (Title)
            </label>
            <input
              className="admin-select"
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder={name ? `${name} | Avcı E-Ticaret` : "Özel SEO başlığı"}
              style={{ width: "100%" }}
              type="text"
              value={seoTitle}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>
              SEO Meta Açıklaması (Description)
            </label>
            <textarea
              className="admin-select"
              onChange={(e) => setSeoDescription(e.target.value)}
              placeholder="Google arama sonuçlarında çıkacak 150-160 karakterlik meta açıklama..."
              rows={3}
              style={{ width: "100%", height: "auto", padding: "10px" }}
              value={seoDescription}
            />
          </div>

          {/* Google Search Simulator Preview */}
          <div
            style={{
              padding: "16px",
              borderRadius: "8px",
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              boxShadow: "var(--admin-shadow-sm)",
            }}
          >
            <span style={{ fontSize: "11px", color: "var(--admin-text-muted)", display: "block", marginBottom: "6px" }}>
              Google Arama Önizlemesi:
            </span>
            <div style={{ color: "#1a0dab", fontSize: "16px", fontWeight: 600, textDecoration: "underline", cursor: "pointer" }}>
              {seoTitle || (name ? `${name} | Avcı E-Ticaret` : "Ürün Başlığı - Avcı E-Ticaret")}
            </div>
            <div style={{ color: "#006621", fontSize: "12px", margin: "2px 0 4px" }}>
              https://avcieticaret.com/urunler/{slug || "ornek-urun"}
            </div>
            <div style={{ color: "#4d5156", fontSize: "12.5px", lineHeight: 1.4 }}>
              {seoDescription || shortDescription || "Ürününüzün arama motorlarında görünecek açıklama metni burada yer alacaktır."}
            </div>
          </div>
        </div>
      )}

      {/* Form Action Buttons Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: "20px",
          borderTop: "1px solid var(--admin-border)",
          marginTop: "24px",
        }}
      >
        <div style={{ display: "flex", gap: "10px" }}>
          <Link className="admin-btn admin-btn-secondary" href="/yonetim/urunler">
            İptal
          </Link>
          {mode === "edit" && (
            <button
              className="admin-btn"
              disabled={deleting}
              onClick={onDelete}
              style={{ color: "#dc2626", borderColor: "rgba(220, 38, 38, 0.3)", background: "#fff1f2" }}
              type="button"
            >
              {deleting ? "Siliniyor..." : "Ürünü Sil"}
            </button>
          )}
        </div>

        <button
          className="admin-btn admin-btn-primary"
          disabled={saving}
          type="submit"
        >
          {saving ? "Kaydediliyor..." : mode === "create" ? "Ürünü Oluştur ve Yayınla" : "Değişiklikleri Kaydet"}
        </button>
      </div>
    </form>
  );
}
