import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const source=fs.readFileSync(new URL("../app/api/v1/control-desk/snapshot/route.ts",import.meta.url),"utf8");
test("snapshot v2 publishes one shared desktop/mobile summary",()=>{assert.match(source,/snapshot\.v2/);for(const key of ["activeLicenses","healthyStores","warningStores","offlineStores","failedInstalls","openTickets"])assert.match(source,new RegExp(key));});
