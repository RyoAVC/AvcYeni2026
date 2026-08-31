// Only structured catalogue values may ever enter the payment calculation.
export function checkoutTerms(item) {
  if (!item || item.status !== "live" || item.salesType !== "otomatik") throw new Error("Bu paket yalnız teklif ile alınabilir.");
  if (!Number.isSafeInteger(item.priceAmountKurus) || item.priceAmountKurus <= 0 || item.priceAmountKurus > 1000000000) throw new Error("Paketin sayısal fiyatı belirlenmeli.");
  if (item.priceIncludesVat !== true) throw new Error("Otomatik ödeme için KDV dahil nihai tutarı kaydedin.");
  if (!Number.isSafeInteger(item.licenseDurationDays) || item.licenseDurationDays <= 0 || item.licenseDurationDays > 36500) throw new Error("Paketin lisans süresi belirlenmeli.");
  return Object.freeze({ amountKurus: item.priceAmountKurus, currency: "TL", durationDays: item.licenseDurationDays });
}
