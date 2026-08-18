export function historyCountLabel(visibleCount, totalCount, label) {
  const visible = Number.isSafeInteger(visibleCount) && visibleCount >= 0 ? visibleCount : 0;
  const total = Number.isSafeInteger(totalCount) && totalCount >= visible ? totalCount : visible;
  const safeLabel = typeof label === "string" ? label.trim() : "";
  return total > visible
    ? `Son ${visible} / ${total} ${safeLabel}`
    : `${total} ${safeLabel}`;
}
