import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync(new URL("../app/musteri-panel/page.tsx", import.meta.url), "utf8");
const consume = readFileSync(new URL("../app/api/v1/commerce/portal-sessions/consume/route.ts", import.meta.url), "utf8");
const login = readFileSync(new URL("../app/api/musteri-panel/giris/route.ts", import.meta.url), "utf8");
const auth = readFileSync(new URL("../app/customer-auth.ts", import.meta.url), "utf8");

test("canlı müşteri portalı demo ile ortak V2 kabuğunu ve firma kimliğini kullanır", () => {
  assert.match(page, /DemoPortalNavProvider/);
  assert.match(page, /DemoPortalCustomerBrand/);
  assert.match(page, /AVCI MÜŞTERİ PANELİ V2/);
  assert.match(page, /loadCustomerPortalSnapshot\(customer\)/);
});

test("canlı oturumlar doğrudan V2 özet görünümünde açılır", () => {
  assert.match(consume, /musteri-panel.*#ozet/);
  assert.match(login, /musteri-panel#ozet/);
});

test("deneme ve aktif müşteriler aynı V2 portal yetkisini kullanır", () => {
  assert.match(auth, /\["active", "trial"\]\.includes\(customer\.status\)/);
});
