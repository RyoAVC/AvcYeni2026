export const PACKAGE_OPTIONS = [
  { id: "start", name: "Start" },
  { id: "scale", name: "Scale" },
  { id: "enterprise", name: "Enterprise" },
] as const;

export type PackageId = (typeof PACKAGE_OPTIONS)[number]["id"];

export function getPackageName(value: string) {
  return PACKAGE_OPTIONS.find((item) => item.id === value)?.name ?? "";
}

function firstValue(value: unknown) {
  if (Array.isArray(value)) return String(value[0] ?? "");
  return String(value ?? "");
}

export function parseCatalogPackageId(value: unknown): PackageId | "" {
  const id = firstValue(value).trim().toLocaleLowerCase("en-US");
  return PACKAGE_OPTIONS.some((item) => item.id === id) ? (id as PackageId) : "";
}

export function guessCatalogPackageId(text: unknown): PackageId | "" {
  const hay = String(text ?? "").toLocaleLowerCase("tr-TR");
  if (!hay.trim()) return "";
  if (/\benterprise\b|kuruma özel|kurumsal/.test(hay)) return "enterprise";
  if (/\bscale\b|büyüme odağı|büyüme/.test(hay)) return "scale";
  if (/\bstart\b|hızlı başlangıç|başlangıç/.test(hay)) return "start";
  return "";
}

export function findAdminPackageByCatalogId<T extends { slug?: string | null; name?: string | null }>(
  rows: ReadonlyArray<T>,
  catalogId: unknown,
): T | undefined {
  const id = parseCatalogPackageId(catalogId);
  if (!id) return undefined;
  const slugMatch = rows.find((row) => String(row.slug ?? "").trim().toLocaleLowerCase("en-US") === id);
  if (slugMatch) return slugMatch;
  const name = getPackageName(id).toLocaleLowerCase("tr-TR");
  return rows.find((row) => String(row.name ?? "").toLocaleLowerCase("tr-TR").includes(name));
}
