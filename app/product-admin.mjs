export const PRODUCT_STATUS_OPTIONS = [
  { value: "active", label: "Satışta / Aktif" },
  { value: "draft", label: "Taslak" },
  { value: "passive", label: "Pasif / Gizli" },
];

export function productStatusLabel(status) {
  switch (status) {
    case "active":
      return "Satışta";
    case "draft":
      return "Taslak";
    case "passive":
      return "Pasif";
    default:
      return status || "Bilinmiyor";
  }
}

export function isProductStatus(value) {
  return value === "active" || value === "draft" || value === "passive";
}

export function slugifyProduct(name) {
  return String(name || "")
    .toLowerCase()
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("ı", "i")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseProductRecord(data) {
  if (typeof data !== "object" || data === null) {
    return { ok: false, error: "Geçersiz ürün verisi." };
  }

  const name = String(data.name || "").trim();
  if (!name || name.length < 2) {
    return { ok: false, error: "Ürün adı en az 2 karakter olmalıdır." };
  }

  let slug = String(data.slug || "").trim();
  if (!slug) {
    slug = slugifyProduct(name);
  }
  if (!slug) {
    return { ok: false, error: "Geçerli bir ürün kısa kodu (slug) gereklidir." };
  }

  const sku = String(data.sku || "").trim();
  const barcode = String(data.barcode || "").trim();
  const categoryId = data.categoryId ? Number(data.categoryId) : null;
  const brandId = data.brandId ? Number(data.brandId) : null;
  const shortDescription = String(data.shortDescription || "").trim();
  const description = String(data.description || "").trim();

  const price = Math.max(0, Math.round(Number(data.price || 0)));
  const discountedPrice = data.discountedPrice ? Math.max(0, Math.round(Number(data.discountedPrice))) : null;
  const costPrice = Math.max(0, Math.round(Number(data.costPrice || 0)));
  const vatRate = [0, 1, 10, 20].includes(Number(data.vatRate)) ? Number(data.vatRate) : 20;

  const stock = Math.max(0, Math.round(Number(data.stock || 0)));
  const criticalStock = Math.max(0, Math.round(Number(data.criticalStock ?? 5)));
  const status = isProductStatus(data.status) ? data.status : "active";
  const isFeatured = Number(data.isFeatured) ? 1 : 0;

  let images = "[]";
  if (typeof data.images === "string") {
    images = data.images;
  } else if (Array.isArray(data.images)) {
    images = JSON.stringify(data.images);
  }

  let variants = "[]";
  if (typeof data.variants === "string") {
    variants = data.variants;
  } else if (Array.isArray(data.variants)) {
    variants = JSON.stringify(data.variants);
  }

  const seoTitle = String(data.seoTitle || "").trim();
  const seoDescription = String(data.seoDescription || "").trim();

  return {
    ok: true,
    value: {
      name,
      slug,
      sku,
      barcode,
      categoryId,
      brandId,
      shortDescription,
      description,
      price,
      discountedPrice,
      costPrice,
      vatRate,
      stock,
      criticalStock,
      status,
      isFeatured,
      images,
      variants,
      seoTitle,
      seoDescription,
    },
  };
}
