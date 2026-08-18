export function normalizeTofyCommand(value) {
  return typeof value === "string"
    ? value
        .toLocaleLowerCase("tr-TR")
        .replace(/[’']/g, "")
        .replace(/[^a-z0-9çğıöşü\s-]/giu, " ")
        .replace(/\s+/g, " ")
        .trim()
    : "";
}

export function parseTofyPersonnelCommand(value) {
  const command = normalizeTofyCommand(value);
  if (command === "tofy kahveye gel") return "maintenance-on";
  if (command === "tofy afiyet olsun") return "maintenance-off";
  return null;
}
