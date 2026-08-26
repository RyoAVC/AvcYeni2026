const DAY_MS = 86400000;

export function daysUntil(value, now = new Date()) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return Math.ceil((date.getTime() - now.getTime()) / DAY_MS);
}

export function renewalRule(context) {
  const dates = [
    ["Alan adı", context.customer.domainExpiresAt],
    ["Hosting", context.customer.hostingExpiresAt],
  ];
  const candidates = dates.map(([label, value]) => ({ label, days: daysUntil(value, context.now) }))
    .filter((item) => item.days !== null && item.days >= 0 && item.days < context.thresholds.sslWarningDays)
    .sort((a, b) => a.days - b.days);
  const next = candidates[0];
  if (!next) return null;
  return { id: `rule-renewal-${next.label}`, type: "renewal", title: "Yenileme öncesi kontrol", body: `${next.label} yenilemesine ${next.days} gün kaldı. Kayıt ve servis kapsamını kontrol edin.`, priority: 70, targetSection: "altyapi", tone: next.days <= 7 ? "critical" : "watch", source: "rule" };
}

export function tofyClickRule(context) {
  const metric = context.metrics.find((item) => item.key === "tofy_click_rate_bps");
  if (!metric || metric.value >= context.thresholds.tofyClickThresholdBps) return null;
  return { id: "rule-tofy-click", type: "growth", title: "Tofy optimizasyon fırsatı", body: `Öneri tıklama oranı %${(metric.value / 100).toLocaleString("tr-TR")} ile yönetim eşiğinin altında. Öneri kalitesini inceleyin.`, priority: 60, targetSection: "tofy", tone: "watch", source: "rule" };
}

export function marketplaceSetupRule(context) {
  const item = context.integrations.find((integration) => integration.category === "marketplace" && integration.status === "setup");
  if (!item) return null;
  const startedAt = typeof item.publicMetadata?.setupStartedAt === "string" ? item.publicMetadata.setupStartedAt : "";
  const elapsed = startedAt ? Math.max(0, -daysUntil(startedAt, context.now)) : null;
  if (elapsed === null || elapsed <= context.thresholds.marketplaceSetupDays) return null;
  return { id: `rule-marketplace-${item.id}`, type: "integration", title: "Kanal operasyonu bekliyor", body: `${item.name} kurulumu ${elapsed} gündür devam ediyor. Eşleme adımlarını gözden geçirin.`, priority: 65, targetSection: "altyapi", tone: "watch", source: "rule" };
}

export function supportRule(context) {
  if (!context.openTickets) return null;
  return { id: "rule-open-support", type: "support", title: "Destek talebiniz bekliyor", body: `${context.openTickets} açık destek kaydının durumu izleniyor.`, priority: 100, targetSection: "destek", tone: context.criticalTickets ? "critical" : "watch", source: "rule" };
}

export const portalRules = [supportRule, renewalRule, marketplaceSetupRule, tofyClickRule];

export function runPortalRules(context) {
  return portalRules.map((rule) => rule(context)).filter(Boolean).sort((a, b) => b.priority - a.priority);
}
