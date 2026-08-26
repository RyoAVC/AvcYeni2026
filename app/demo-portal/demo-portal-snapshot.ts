import type { PortalBranding, PortalIntegrationInstance, PortalMetric, PortalModuleInstance, PortalNotification, PortalThresholds } from "../customer-portal-types";
import { buildTofySnapshot } from "../customer-portal-tofy.mjs";

const periodEnd = "2026-08-23";
const metric = (key: string, value: number, unit: string, label: string): PortalMetric => ({ key, value, unit, label, source: "demo_seed", periodStart: "2026-08-16", periodEnd });

export function createDemoPortalSnapshot() {
  const branding: PortalBranding = { companyName: "BasBitir Atölyesi", logoUrl: "", monogram: "BA", theme: "avci", colorMode: "day", providerLabel: "Avcı altyapısı" };
  const thresholds: PortalThresholds = { sslWarningDays: 30, tofyClickThresholdBps: 1000, marketplaceSetupDays: 7 };
  const moduleInstances: PortalModuleInstance[] = [
    { id: 1, key: "commerce-core", name: "E-Ticaret altyapısı", status: "active", coverage: "Scale çerçevesi · örnek", enabledAt: "2026-01-12", expiresAt: "", note: "Katalog, sipariş ve mağaza operasyonu" },
    { id: 2, key: "marketplace", name: "Pazaryeri senkronu", status: "setup", coverage: "Trendyol / HB · örnek", enabledAt: "", expiresAt: "", note: "Ürün, stok ve sipariş eşleştirme" },
    { id: 3, key: "tofy", name: "Tofy Ajan V2", status: "active", coverage: "Sepet ve öneri · örnek", enabledAt: "2026-02-04", expiresAt: "", note: "Öneri, yönlendirme ve çapraz satış" },
    { id: 4, key: "hosting", name: "Hosting & SSL", status: "active", coverage: "Yenileme 2027 · örnek", enabledAt: "2026-01-12", expiresAt: "2027-06-15", note: "Yayın, sertifika ve erişilebilirlik" },
  ];
  const integrationInstances: PortalIntegrationInstance[] = [
    { id: 1, providerKey: "trendyol", name: "Trendyol", category: "marketplace", status: "setup", setupProgress: 78, healthScore: 74, lastSyncAt: "", lastErrorSummary: "", publicMetadata: { scope: "Ürün ve stok eşleştirme", setupStartedAt: "2026-08-01" } },
    { id: 2, providerKey: "hepsiburada", name: "Hepsiburada", category: "marketplace", status: "setup", setupProgress: 63, healthScore: 68, lastSyncAt: "", lastErrorSummary: "", publicMetadata: { scope: "Kategori alanları eşleniyor" } },
    { id: 3, providerKey: "paytr", name: "PayTR", category: "payment", status: "active", setupProgress: 100, healthScore: 98, lastSyncAt: periodEnd, lastErrorSummary: "", publicMetadata: { scope: "Ödeme akışı hazır" } },
    { id: 4, providerKey: "yurtici", name: "Yurtiçi Kargo", category: "shipping", status: "active", setupProgress: 100, healthScore: 96, lastSyncAt: periodEnd, lastErrorSummary: "", publicMetadata: { scope: "Gönderi akışı hazır" } },
  ];
  const metrics = [
    metric("tofy_recommendation_views", 18420, "count", "Öneri gösterimi"), metric("tofy_click_rate_bps", 1240, "basis_points", "Öneri tıklama"),
    metric("tofy_cart_additions", 186, "count", "Sepete yönlendirme"), metric("tofy_cross_sell", 34, "count", "Tamamlayıcı ürün"),
    metric("tofy_quality_ready", 412, "count", "Yayına hazır"), metric("tofy_quality_needs_work", 38, "count", "Geliştirmeli"), metric("tofy_quality_blocked", 7, "count", "Engelli"),
  ];
  const previousMetrics = [
    { ...metric("tofy_recommendation_views", 16120, "count", "Öneri gösterimi"), periodStart: "2026-08-09", periodEnd: "2026-08-15" },
    { ...metric("tofy_click_rate_bps", 1080, "basis_points", "Öneri tıklama"), periodStart: "2026-08-09", periodEnd: "2026-08-15" },
    { ...metric("tofy_cart_additions", 158, "count", "Sepete yönlendirme"), periodStart: "2026-08-09", periodEnd: "2026-08-15" },
    { ...metric("tofy_cross_sell", 29, "count", "Tamamlayıcı ürün"), periodStart: "2026-08-09", periodEnd: "2026-08-15" },
  ];
  const tofy = buildTofySnapshot([...metrics, ...previousMetrics], []);
  const notifications: PortalNotification[] = [
    { id: "demo-hosting", type: "info", title: "Hosting yenileme takvimi", body: "Scale çerçevesi için örnek yenileme penceresi 2027 son çeyrekte planlanır.", priority: 30, targetSection: "altyapi", tone: "neutral", source: "system", createdAt: periodEnd },
    { id: "demo-tofy", type: "growth", title: "Tofy V2 öneri güncellemesi", body: "Kategori bazlı öneri kuralları örnek vitrinde genişletildi.", priority: 60, targetSection: "tofy", tone: "healthy", source: "rule", createdAt: periodEnd },
    { id: "demo-maintenance", type: "renewal", title: "Planlı bakım penceresi", body: "Gece yedeği sonrası kısa DNS kontrolü örnek olarak işaretlendi.", priority: 50, targetSection: "operasyon", tone: "watch", source: "system", createdAt: periodEnd },
  ];
  return { mode: "demo" as const, branding, thresholds, moduleInstances, integrationInstances, metrics, notifications, tofy };
}
