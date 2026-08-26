import assert from "node:assert/strict";
import test from "node:test";
import { buildTofySnapshot } from "../app/customer-portal-tofy.mjs";

const metric = (key, value, periodEnd, unit = "count") => ({
  key,
  value,
  unit,
  periodStart: periodEnd === "2026-08-23" ? "2026-08-17" : "2026-08-10",
  periodEnd,
});

test("Tofy performansını güncel ve önceki dönemden karşılaştırır", () => {
  const snapshot = buildTofySnapshot([
    metric("tofy_recommendation_views", 1200, "2026-08-23"),
    metric("tofy_recommendation_views", 1000, "2026-08-16"),
    metric("tofy_click_rate_bps", 900, "2026-08-23", "basis_points"),
    metric("tofy_click_rate_bps", 1000, "2026-08-16", "basis_points"),
  ]);

  assert.equal(snapshot.comparisons[0].deltaPercent, 20);
  assert.equal(snapshot.comparisons[0].direction, "up");
  assert.equal(snapshot.comparisons[1].deltaPercent, -10);
  assert.equal(snapshot.comparisons[1].direction, "down");
});

test("önceki dönem yoksa uydurma değişim üretmez", () => {
  const snapshot = buildTofySnapshot([metric("tofy_cart_additions", 12, "2026-08-23")]);
  assert.equal(snapshot.comparisons[0].previousValue, null);
  assert.equal(snapshot.comparisons[0].deltaPercent, null);
  assert.equal(snapshot.comparisons[0].direction, "neutral");
});

test("ürün kalite puanını gerçek dağılımdan hesaplar", () => {
  const snapshot = buildTofySnapshot([
    metric("tofy_quality_ready", 75, "2026-08-23"),
    metric("tofy_quality_needs_work", 20, "2026-08-23"),
    metric("tofy_quality_blocked", 5, "2026-08-23"),
  ]);
  assert.deepEqual(snapshot.quality, { ready: 75, needsWork: 20, blocked: 5, total: 100, score: 75, hasData: true });
});

test("veri yokken profesyonel boş durum için boş snapshot döndürür", () => {
  const snapshot = buildTofySnapshot([metric("orders", 99, "2026-08-23")]);
  assert.equal(snapshot.comparisons.length, 0);
  assert.equal(snapshot.quality.hasData, false);
  assert.equal(snapshot.quality.score, null);
});
