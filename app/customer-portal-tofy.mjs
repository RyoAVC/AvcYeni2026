export const TOFY_PERFORMANCE_KEYS = [
  "tofy_recommendation_views",
  "tofy_click_rate_bps",
  "tofy_cart_additions",
  "tofy_cross_sell",
];

const labels = {
  tofy_recommendation_views: "Öneri gösterimi",
  tofy_click_rate_bps: "Öneri tıklama",
  tofy_cart_additions: "Sepete yönlendirme",
  tofy_cross_sell: "Tamamlayıcı ürün",
  tofy_quality_ready: "Yayına hazır",
  tofy_quality_needs_work: "Geliştirmeli",
  tofy_quality_blocked: "Engelli",
};

export function portalMetricLabel(key) {
  return labels[key] || String(key || "").replaceAll("_", " ");
}

function normalizeMetric(item) {
  const key = item.key || item.metricKey || "";
  return {
    key,
    value: Number(item.value || 0),
    unit: item.unit || "count",
    source: item.source || "system",
    periodStart: item.periodStart || "",
    periodEnd: item.periodEnd || "",
    label: item.label || portalMetricLabel(key),
  };
}

function comparePeriods(current, previous) {
  if (!previous || previous.value === 0) {
    return { previousValue: previous?.value ?? null, deltaPercent: null, direction: "neutral" };
  }
  const deltaPercent = Math.round(((current.value - previous.value) / Math.abs(previous.value)) * 1000) / 10;
  return {
    previousValue: previous.value,
    deltaPercent,
    direction: deltaPercent > 0 ? "up" : deltaPercent < 0 ? "down" : "neutral",
  };
}

export function buildTofySnapshot(metricRows, experiments = []) {
  const grouped = new Map();
  for (const raw of metricRows || []) {
    const item = normalizeMetric(raw);
    if (!item.key.startsWith("tofy_")) continue;
    const rows = grouped.get(item.key) || [];
    if (!rows.some((row) => row.periodEnd === item.periodEnd)) rows.push(item);
    grouped.set(item.key, rows);
  }
  for (const rows of grouped.values()) {
    rows.sort((a, b) => String(b.periodEnd).localeCompare(String(a.periodEnd)));
  }

  const latest = (key) => grouped.get(key)?.[0] || null;
  const metrics = [...grouped.values()].map((rows) => rows[0]);
  const comparisons = TOFY_PERFORMANCE_KEYS.flatMap((key) => {
    const current = latest(key);
    if (!current) return [];
    const comparison = comparePeriods(current, grouped.get(key)?.[1] || null);
    return [{ ...current, ...comparison }];
  });
  const ready = latest("tofy_quality_ready")?.value || 0;
  const needsWork = latest("tofy_quality_needs_work")?.value || 0;
  const blocked = latest("tofy_quality_blocked")?.value || 0;
  const total = ready + needsWork + blocked;

  return {
    metrics,
    comparisons,
    quality: {
      ready,
      needsWork,
      blocked,
      total,
      score: total ? Math.round((ready / total) * 100) : null,
      hasData: total > 0,
    },
    experiments,
  };
}
