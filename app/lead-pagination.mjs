export const LEAD_PAGE_SIZE = 30;

export function parseLeadPage(value) {
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) return 1;
  const page = Number(value);
  return Number.isSafeInteger(page) ? page : 1;
}

export function getLeadTotalPages(totalMatches, pageSize = LEAD_PAGE_SIZE) {
  if (!Number.isSafeInteger(totalMatches) || totalMatches < 0) return 1;
  if (!Number.isSafeInteger(pageSize) || pageSize < 1) return 1;
  return Math.max(1, Math.ceil(totalMatches / pageSize));
}

export function clampLeadPage(page, totalMatches, pageSize = LEAD_PAGE_SIZE) {
  const requestedPage = Number.isSafeInteger(page) && page > 0 ? page : 1;
  return Math.min(requestedPage, getLeadTotalPages(totalMatches, pageSize));
}
