import { access, readFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

const projectRoot = path.resolve(import.meta.dirname, "..");
const vinextCli = path.join(projectRoot, "node_modules", "vinext", "dist", "cli.js");
const timeoutMs = Number(process.env.SITES_BUILD_TIMEOUT_MS || 180_000);

await access(vinextCli).catch(() => {
  throw new Error("vinext bulunamadı. Önce npm install komutunu tamamlayın.");
});

console.log("Platform bağımsız, süre sınırlı vinext build çalıştırılıyor...");
await new Promise((resolve, reject) => {
  const child = spawn(process.execPath, [vinextCli, "build"], {
    cwd: projectRoot,
    env: { ...process.env, WRANGLER_WRITE_LOGS: "false" },
    stdio: "inherit",
    shell: false,
  });
  const timer = setTimeout(() => {
    child.kill("SIGTERM");
    reject(new Error(`Build ${timeoutMs} ms süre sınırını aştı.`));
  }, timeoutMs);
  child.once("error", (error) => { clearTimeout(timer); reject(error); });
  child.once("exit", (code) => {
    clearTimeout(timer);
    code === 0 ? resolve() : reject(new Error(`vinext build ${code} koduyla sonlandı.`));
  });
});

const workerPath = path.join(projectRoot, "dist", "server", "index.js");
const hostingPath = path.join(projectRoot, "dist", ".openai", "hosting.json");
await access(workerPath);
JSON.parse(await readFile(hostingPath, "utf8"));
if (process.platform === "win32") {
  const workerSource = await readFile(workerPath, "utf8");
  if (!/export\s*\{[^}]*\bas\s+default\s*\}/s.test(workerSource) || !/\bfetch\s*\(/.test(workerSource)) {
    throw new Error("Windows artifact kontrolü Worker default export veya fetch işleyicisini bulamadı.");
  }
} else {
  const workerUrl = pathToFileURL(workerPath);
  workerUrl.searchParams.set("artifact-validation", `${process.pid}-${Date.now()}`);
  const worker = await import(workerUrl.href);
  if (!worker.default || typeof worker.default.fetch !== "function") {
    throw new Error("dist/server/index.js ESM default.fetch sunmuyor.");
  }
}
console.log("Doğrulandı: Worker default.fetch ve hosting manifesti hazır.");
