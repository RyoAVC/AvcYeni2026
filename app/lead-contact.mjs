export function normalizeLeadPhone(value) {
  let digits = typeof value === "string" ? value.replace(/\D/g, "") : "";
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) digits = `90${digits.slice(1)}`;
  if (digits.length === 10 && digits.startsWith("5")) digits = `90${digits}`;
  return digits.slice(0, 20);
}

