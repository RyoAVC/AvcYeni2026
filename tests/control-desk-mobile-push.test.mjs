import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import { decryptPushToken, encryptPushToken } from "../app/mobile-push-crypto.mjs";

const root=new URL("../",import.meta.url);
const read=(path)=>readFileSync(new URL(path,root),"utf8");

test("mobil push migration tokenı düz metin sütunda tutmaz ve kapsam indekslerini kurar",()=>{
  const db=new DatabaseSync(":memory:");
  db.exec(read("drizzle/0046_mobile_push_devices.sql"));
  const columns=db.prepare("PRAGMA table_info(mobile_push_devices)").all().map((item)=>item.name);
  assert.ok(columns.includes("token_ciphertext"));
  assert.ok(columns.includes("token_nonce"));
  assert.ok(columns.includes("token_hash"));
  assert.equal(columns.includes("token"),false);
  const indexes=db.prepare("PRAGMA index_list(mobile_push_devices)").all().map((item)=>item.name);
  assert.ok(indexes.includes("idx_mobile_push_customer_store"));
  assert.ok(indexes.includes("idx_mobile_push_session"));
  db.close();
});

test("cihaz API müşteri, mağaza ve oturum kapsamını zorunlu tutar",()=>{
  const route=read("app/api/v1/control-desk/devices/route.ts");
  assert.match(route,/auth\.customerId/);
  assert.match(route,/auth\.sessionId/);
  assert.match(route,/platform_owner/);
  assert.match(route,/support_operator/);
  assert.match(route,/isStaff/);
  assert.match(route,/commerceLicenseInstallations\.storeKey/);
  assert.match(route,/\["active","trial"\]/);
  assert.match(route,/mobile_push_device_registered/);
  assert.doesNotMatch(route,/projection=.*tokenCiphertext/);
  assert.doesNotMatch(route,/projection=.*tokenNonce/);
  assert.doesNotMatch(route,/tokenCiphertext[^\n]*controlDeskJson/);
});

test("push token AES-GCM ile şifrelenir ve yalnız özetiyle tekilleştirilir",()=>{
  const crypto=read("app/mobile-push-crypto.mjs");
  assert.match(crypto,/AES-GCM/);
  assert.match(crypto,/SHA-256/);
  assert.match(crypto,/getRandomValues\(new Uint8Array\(12\)\)/);
});

test("şifreli push token yalnız doğru kasa anahtarıyla geri açılır",async()=>{
  const secret="test-only-mobile-push-encryption-key-123456",token="ExponentPushToken[test_token_12345678]";
  const encrypted=await encryptPushToken(token,secret);
  assert.notEqual(encrypted.ciphertext,token);
  assert.equal(await decryptPushToken(encrypted.ciphertext,encrypted.nonce,secret),token);
  await assert.rejects(()=>decryptPushToken(encrypted.ciphertext,encrypted.nonce,"different-test-mobile-push-key-123456"));
});

test("teslim tablosu ve gönderim API'si rol, kapsam ve sabit sağlayıcı adresi kullanır",()=>{
  const db=new DatabaseSync(":memory:");db.exec(read("drizzle/0047_mobile_push_deliveries.sql"));
  assert.ok(db.prepare("PRAGMA index_list(mobile_push_deliveries)").all().some((item)=>item.name==="idx_mobile_push_delivery_customer"));db.close();
  const route=read("app/api/v1/control-desk/push-notifications/route.ts");
  assert.match(route,/platform_owner/);
  assert.match(route,/mobilePushDevices\.customerId/);
  assert.match(route,/mobilePushDevices\.storeKey/);
  assert.match(route,/https:\/\/exp\.host\/--\/api\/v2\/push\/send/);
  assert.match(route,/dryRun/);
  assert.doesNotMatch(route,/controlDeskJson\([^\n]*tokenCiphertext/);
});
