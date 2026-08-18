const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const ISTANBUL_OFFSET_HOURS = 3;
const DAY_IN_MS = 86_400_000;

export function normalizeLeadDate(value) {
  if (typeof value !== "string") return "";
  const candidate = value.trim();
  const match = DATE_PATTERN.exec(candidate);
  if (!match) return "";

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year
    || date.getUTCMonth() !== month - 1
    || date.getUTCDate() !== day
  ) return "";

  return candidate;
}

function istanbulDayStart(date) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, -ISTANBUL_OFFSET_HOURS));
}

export function parseLeadDateRange(fromValue, toValue) {
  const requestedFrom = typeof fromValue === "string" ? fromValue.trim() : "";
  const requestedTo = typeof toValue === "string" ? toValue.trim() : "";
  const from = normalizeLeadDate(requestedFrom);
  const to = normalizeLeadDate(requestedTo);

  let error = "";
  if (requestedFrom && !from) error = "Geçerli bir başlangıç tarihi seçin.";
  else if (requestedTo && !to) error = "Geçerli bir bitiş tarihi seçin.";
  else if (from && to && from > to) error = "Başlangıç tarihi bitiş tarihinden sonra olamaz.";

  return {
    from,
    to,
    startInclusive: from ? istanbulDayStart(from).toISOString() : "",
    endExclusive: to ? new Date(istanbulDayStart(to).getTime() + DAY_IN_MS).toISOString() : "",
    error,
    hasInput: Boolean(requestedFrom || requestedTo),
  };
}

export function appendLeadDateParams(params, range) {
  if (range.from) params.set("from", range.from);
  if (range.to) params.set("to", range.to);
  return params;
}
