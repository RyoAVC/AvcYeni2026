export function toSafeCsvCell(value) {
  let text = String(value ?? "").replace(/\r\n?/g, "\n");
  const trimmed = text.trimStart();
  if (/^[=+\-@]/.test(trimmed)) {
    text = `${text.slice(0, text.length - trimmed.length)}'${trimmed}`;
  }
  return `"${text.replaceAll('"', '""')}"`;
}

export function serializeCsv(headers, rows) {
  return [headers, ...rows]
    .map((row) => row.map(toSafeCsvCell).join(","))
    .join("\r\n");
}
