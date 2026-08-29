import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const root=new URL("../",import.meta.url);const read=(path)=>readFileSync(new URL(path,root),"utf8");
test("mobil uygulamalar müşteri kapsamı ve rol denetimi kullanır",()=>{const route=read("app/api/v1/control-desk/mobile-apps/route.ts");assert.match(route,/auth\.customerId/);assert.match(route,/platform_owner/);assert.match(route,/customerMobileAppAssignments/);assert.doesNotMatch(route,/password|privateKey|signingKey/i);});
test("mobil uygulama şeması iki platformu ve müşteri atamasını ayırır",()=>{const migration=read("drizzle/0044_avci_mobile_apps.sql");assert.match(migration,/CHECK\(platform IN \('ios','android'\)\)/);assert.match(migration,/UNIQUE\(customer_id, mobile_app_id\)/);});
