// Versioned commercial rights -> Commerce module manifest license_scope contract.
const rights = {
  shipping: { label: "Kargo entegrasyonu", scopes: ["core.shipping"] },
  parasut: { label: "Paraşüt", scopes: ["addon.accounting.parasut"] },
  marketplaces: { label: "Trendyol / Hepsiburada", scopes: ["addon.marketplace.trendyol", "addon.marketplace.hepsiburada"] },
  whatsapp: { label: "WhatsApp Support", scopes: ["addon.whatsapp-support"] },
  builder: { label: "Pro Page Builder", scopes: ["addon.pro-page-builder"] },
  tofy: { label: "Tofy", scopes: ["addon.tofy"] },
  design: { label: "Design Studio", scopes: ["addon.design-studio"] },
  print: { label: "Basım / katalog", scopes: ["addon.print-commerce"] },
};
const plans = {
  start: ["shipping", "parasut", "marketplaces", "whatsapp"],
  scale: ["builder", "tofy", "whatsapp", "design", "marketplaces", "parasut", "shipping", "print"],
};
export function packageEntitlements(plan) {
  if (!Object.hasOwn(plans, plan)) throw new Error("Paket otomatik satışa uygun değil.");
  const groups = plans[plan].map(key => ({ key, ...rights[key] }));
  return { version: 1, groups, scopes: [...new Set([...groups.flatMap(item => item.scopes), "core.catalog", "core.integrations"])].sort() };
}
