import fs from "fs";

const path = new URL("../app/page.tsx", import.meta.url);
const text = fs.readFileSync(path, "utf8");
const marker = "\n}\n\n      <section className=\"trust-strip\"";
const idx = text.indexOf(marker);
if (idx < 0) {
  console.error("marker not found");
  process.exit(1);
}
const kept = `${text.slice(0, idx + 2)}\n`;
fs.writeFileSync(path, kept);
console.log("ok lines", kept.split("\n").length);
