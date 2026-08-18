export function normalizeEmailAddress(value, maxLength = 254) {
  if (typeof value !== "string") return "";
  const boundedLength = Number.isSafeInteger(maxLength) && maxLength > 0 ? maxLength : 254;
  return value.trim().slice(0, boundedLength).toLocaleLowerCase("en-US");
}
