export function parseAdminPositiveId(value) {
  const raw = Array.isArray(value) ? value[0] : value;
  const id = Number(raw);
  return Number.isSafeInteger(id) && id >= 1 ? id : 0;
}

export function parseAdminCustomerId(value) {
  return parseAdminPositiveId(value);
}

export function parseAdminLeadId(value) {
  return parseAdminPositiveId(value);
}

export function parseAdminOrderId(value) {
  return parseAdminPositiveId(value);
}

export function parseAdminPackageId(value) {
  return parseAdminPositiveId(value);
}

export function parseAdminModuleId(value) {
  return parseAdminPositiveId(value);
}

export function adminCustomerListHref(path, customerId, extra = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(extra)) {
    if (value == null || value === "" || value === "all" || value === false) continue;
    query.set(key, String(value));
  }
  const id = parseAdminPositiveId(customerId);
  if (id) query.set("musteri", String(id));
  const text = query.toString();
  return text ? `${path}?${text}` : path;
}
