export const CUSTOMER_STATUS_OPTIONS = [
  { value: "active", label: "Aktif" },
  { value: "trial", label: "Deneme" },
  { value: "paused", label: "Askıda" },
  { value: "closed", label: "Kapandı" },
] as const;

export type CustomerStatus = (typeof CUSTOMER_STATUS_OPTIONS)[number]["value"];

const CUSTOMER_STATUS_VALUES = new Set<string>(CUSTOMER_STATUS_OPTIONS.map((option) => option.value));

export function isCustomerStatus(value: string): value is CustomerStatus {
  return CUSTOMER_STATUS_VALUES.has(value);
}

export function customerStatusLabel(value: string) {
  return CUSTOMER_STATUS_OPTIONS.find((option) => option.value === value)?.label ?? value;
}
