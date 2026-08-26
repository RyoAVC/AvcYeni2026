"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { withBasePath } from "../../base-path";

type IntegrationItem = { id: number; providerKey: string; category: string; name: string; status: string; lastSyncAt: string; customerActiveCount: number; customerTotalCount: number; activeDomains: string[] };
const CATEGORY_NAMES: Record<string, string> = { payment: "Ödeme sistemleri ve sanal POS", shipping: "Kargo ve lojistik", marketplace: "Pazaryerleri", erp: "Muhasebe ve ERP", sms: "İletişim ve SMS servisleri" };

export function IntegrationClient({ initialIntegrations }: { initialIntegrations: IntegrationItem[] }) {
  const router = useRouter();
  const [selectedItem, setSelectedItem] = useState<IntegrationItem | null>(null);
  const [status, setStatus] = useState("passive");
  const [saving, setSaving] = useState(false);
  const [logoVersion, setLogoVersion] = useState(0);
  const [message, setMessage] = useState("");
  const grouped = initialIntegrations.reduce((result, item) => { (result[item.category] ||= []).push(item); return result; }, {} as Record<string, IntegrationItem[]>);

  function openEditor(item: IntegrationItem) { setSelectedItem(item); setStatus(item.status); setMessage(""); }
  async function updateCatalog(item: IntegrationItem, nextStatus: string) {
    setSaving(true); setMessage("");
    try {
      const response = await fetch(withBasePath(`/api/yonetim/entegrasyonlar/${item.id}`), { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: nextStatus }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof result.error === "string" ? result.error : "Katalog güncellenemedi.");
      setSelectedItem(null); router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Katalog güncellenemedi."); }
    finally { setSaving(false); }
  }
  async function submit(event: FormEvent) { event.preventDefault(); if (selectedItem) await updateCatalog(selectedItem, status); }
  async function uploadLogo(file: File | null) {
    if (!selectedItem || !file) return;
    const form = new FormData(); form.set("logo", file); setSaving(true); setMessage("");
    try {
      const response = await fetch(withBasePath(`/api/yonetim/entegrasyonlar/${selectedItem.id}/logo`), { method: "POST", body: form });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof result.error === "string" ? result.error : "Logo yüklenemedi.");
      setLogoVersion((value) => value + 1); setMessage("Logo kaydedildi.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Logo yüklenemedi."); }
    finally { setSaving(false); }
  }

  return <div className="integration-admin-stack">
    <aside className="integration-catalog-note"><div><span>GENEL KATALOG</span><strong>Bu ekran müşteride çalışan bağlantıları değil, Avcı E‑Ticaret’in sunduğu entegrasyon kataloğunu yönetir.</strong></div><p>“Sitede yayınlanıyor” kayıtları Avcı vitrininin Entegrasyonlar sayfasında görünür. Bir müşteri ve domaine gerçek aktivasyon atamak için Müşteri Sistemleri’ni kullanın.</p><Link className="admin-btn admin-btn-secondary" href="/yonetim/sistemler">Müşteri sistemlerine git</Link></aside>
    {Object.entries(grouped).map(([category, items]) => <section className="integration-admin-group" key={category}><header><span>{String(items.length).padStart(2, "0")}</span><h2>{CATEGORY_NAMES[category] || category}</h2></header><div className="integration-admin-grid">
      {items.map((item) => <article className={`admin-card integration-admin-card ${item.status === "active" ? "is-active" : "is-passive"}`} key={item.id}>
        <div className="integration-admin-head"><span className="integration-admin-logo"><img alt={`${item.name} logosu`} onError={(event) => { event.currentTarget.style.display = "none"; }} src={withBasePath(`/api/yonetim/entegrasyonlar/${item.id}/logo?v=${logoVersion}`)} /><b>{item.name.slice(0, 2).toUpperCase()}</b></span><div><strong>{item.name}</strong><small>{item.providerKey}</small></div><span className={`admin-badge ${item.status === "active" ? "admin-badge--success" : "admin-badge--neutral"}`}>{item.status === "active" ? "Sitede yayında" : "Taslak"}</span></div>
        <div className="integration-usage"><div><strong>{item.customerActiveCount}</strong><span>aktif müşteri</span></div><div><strong>{item.activeDomains.length}</strong><span>aktif domain</span></div><div><strong>{item.customerTotalCount}</strong><span>toplam atama</span></div></div>
        <p className="integration-domains">{item.activeDomains.length ? item.activeDomains.slice(0, 3).join(" · ") : "Henüz bir müşteri domaininde aktif değil."}</p>
        <div className="integration-admin-actions"><button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => openEditor(item)} type="button">Katalog kaydını düzenle</button><button className={`admin-btn admin-btn-sm ${item.status === "active" ? "admin-btn-secondary" : "admin-btn-primary"}`} disabled={saving} onClick={() => updateCatalog(item, item.status === "active" ? "passive" : "active")} type="button">{item.status === "active" ? "Yayından kaldır" : "Sitede yayınla"}</button></div>
      </article>)}
    </div></section>)}
    {selectedItem && <div className="integration-modal-backdrop"><div aria-labelledby="integration-editor-title" aria-modal="true" className="admin-card integration-modal" role="dialog"><header className="admin-card-header"><div><span className="kicker">KATALOG KAYDI</span><h3 className="admin-card-title" id="integration-editor-title">{selectedItem.name}</h3></div><button aria-label="Kapat" className="integration-modal-close" onClick={() => setSelectedItem(null)} type="button">×</button></header><form onSubmit={submit}>
      <label className="integration-field"><span>Marka logosu / ikon</span><input accept="image/png,image/jpeg,image/webp,image/svg+xml" autoComplete="off" disabled={saving} onChange={(event) => uploadLogo(event.target.files?.[0] || null)} type="file" /><small>PNG, JPG, WebP veya güvenli SVG; en fazla 400 KB.</small></label>
      <label className="integration-field"><span>Avcı sitesi katalog durumu</span><select className="admin-select" onChange={(event) => setStatus(event.target.value)} value={status}><option value="active">Sitede yayınlanıyor</option><option value="passive">Taslak / gizli</option></select></label>
      <aside className="integration-security-note"><strong>Müşteri bağlantı bilgileri burada tutulmaz.</strong><span>API anahtarı ve gizli şifre, ilgili müşterinin Avcı Commerce kurulumunda şifreli olarak yönetilmelidir.</span></aside>{message && <p className="integration-message" role="status">{message}</p>}
      <footer><button className="admin-btn admin-btn-secondary" onClick={() => setSelectedItem(null)} type="button">İptal</button><button className="admin-btn admin-btn-primary" disabled={saving} type="submit">{saving ? "Kaydediliyor…" : "Katalog durumunu kaydet"}</button></footer>
    </form></div></div>}
  </div>;
}
