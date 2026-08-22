export type ProductStatus = "active" | "draft" | "passive";

export type ProductStatusOption = {
  value: ProductStatus;
  label: string;
};

export const PRODUCT_STATUS_OPTIONS: readonly ProductStatusOption[];

export function productStatusLabel(status: string): string;

export function isProductStatus(value: unknown): value is ProductStatus;

export function slugifyProduct(name: string): string;

export type ParsedProductRecord = {
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

export type ParseProductResult =
  | { ok: false; error: string }
  | { ok: true; value: ParsedProductRecord };

export function parseProductRecord(data: unknown): ParseProductResult;
