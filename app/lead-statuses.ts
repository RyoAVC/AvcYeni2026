export const LEAD_STATUS_OPTIONS = [
  { value: "new", label: "Yeni" },
  { value: "contacted", label: "İletişim kuruldu" },
  { value: "qualified", label: "Fırsat" },
  { value: "closed", label: "Tamamlandı" },
] as const;

export type LeadStatus = (typeof LEAD_STATUS_OPTIONS)[number]["value"];

const LEAD_STATUS_VALUES = new Set<string>(LEAD_STATUS_OPTIONS.map((option) => option.value));

export function isLeadStatus(value: string): value is LeadStatus {
  return LEAD_STATUS_VALUES.has(value);
}

export function leadStatusLabel(value: string) {
  return LEAD_STATUS_OPTIONS.find((option) => option.value === value)?.label ?? value;
}
