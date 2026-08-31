import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const route=readFileSync(new URL("../app/api/v1/control-desk/mobile-store-sessions/route.ts",import.meta.url),"utf8");

test("mobil mağaza oturumu müşteri ve mağaza kapsamıyla kısa ömürlü imzalanır",()=>{
  assert.match(route,/customer_owner/);assert.match(route,/customer_viewer/);
  assert.match(route,/commerceLicenseInstallations\.customerId/);assert.match(route,/commerceLicenseInstallations\.storeKey/);
  assert.match(route,/aud:"avci-commerce-mobile"/);assert.match(route,/exp:expiresAt/);assert.match(route,/now\+120/);
  assert.match(route,/"orders\.read"/);assert.doesNotMatch(route,/activationToken|refreshToken/);
});
