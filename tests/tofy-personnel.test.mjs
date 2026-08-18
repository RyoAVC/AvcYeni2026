import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

import { normalizeTofyCommand, parseTofyPersonnelCommand } from "../app/tofy-personnel.mjs";
import { isCompanyResearchQuestion } from "../app/avcai-llm.mjs";

test("Tofy recognizes only the two exact personnel phrases", () => {
  assert.equal(normalizeTofyCommand("  Tofy, kahveye gel! "), "tofy kahveye gel");
  assert.equal(parseTofyPersonnelCommand("Tofy kahveye gel"), "maintenance-on");
  assert.equal(parseTofyPersonnelCommand("TOFY AFİYET OLSUN."), "maintenance-off");
  assert.equal(parseTofyPersonnelCommand("Tofy siteyi kapat"), null);
  assert.equal(parseTofyPersonnelCommand("kahveye gel"), null);
});

test("company-history questions can use grounded OpenAI web search", async () => {
  assert.equal(isCompanyResearchQuestion("Avcı E-Ticaret hakkında bilgi ver"), true);
  assert.equal(isCompanyResearchQuestion("Avcı E-Ticaret geçmişi nedir?"), true);
  assert.equal(isCompanyResearchQuestion("Paket fiyatı nedir?"), false);
  const source = await readFile(new URL("../app/avcai-llm.mjs", import.meta.url), "utf8");
  assert.match(source, /https:\/\/api\.openai\.com\/v1\/responses/);
  assert.match(source, /type: "web_search"/);
  assert.match(source, /Kaynak \$\{index \+ 1\}/);
});

test("maintenance command is admin-gated and the public worker keeps recovery access", async () => {
  const route = await readFile(new URL("../app/api/avcai/personel/route.ts", import.meta.url), "utf8");
  const command = await readFile(new URL("../app/tofy-personnel-command.ts", import.meta.url), "utf8");
  const worker = await readFile(new URL("../worker/index.ts", import.meta.url), "utf8");
  assert.match(route, /executeTofyPersonnelCommand/);
  assert.match(command, /getAdminUser\(\)/);
  assert.match(command, /admin\.authorized/);
  assert.match(command, /maintenanceMode/);
  assert.match(worker, /pathname\.startsWith\("\/yonetim\/"\)/);
  assert.match(worker, /status: 503/);
  assert.match(worker, /microphone=\(self\)/);
  assert.match(worker, /connect-src 'self' https:\/\/api\.openai\.com/);
});
