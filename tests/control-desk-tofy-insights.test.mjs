import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source=fs.readFileSync(new URL("../app/api/v1/control-desk/tofy-insights/route.ts",import.meta.url),"utf8");
test("Control Desk Tofy endpoint sends aggregate counts only",()=>{assert.match(source,/aggregate-only/);assert.match(source,/offlineStores/);assert.doesNotMatch(source,/primaryDomain|storeKey|installationId|customerId|email|phone/);});
test("Tofy endpoint uses the existing server-side provider and rejects local pretend output",()=>{assert.match(source,/replyAvcai\(prompt,auth\.env/);assert.match(source,/if\(!result\.provider\)/);});
