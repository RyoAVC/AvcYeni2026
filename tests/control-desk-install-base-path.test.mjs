import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../app/api/v1/control-desk/install-jobs/route.ts", import.meta.url), "utf8");

test("kurulum ajan adresi geçerli route base path önekini korur", () => {
  assert.match(source, /requestUrl\.pathname\.indexOf\(apiMarker\)/);
  assert.match(source, /requestUrl\.pathname\.slice\(0, markerIndex\)/);
  assert.match(source, /agentEndpoint: `\$\{center\}\/api\/v1\/commerce\/install-agent\/jobs`/);
  assert.doesNotMatch(source, /const center = new URL\(request\.url\)\.origin/);
});