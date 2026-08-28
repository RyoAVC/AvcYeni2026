import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const login = readFileSync(new URL("../app/musteri-girisi/page.tsx", import.meta.url), "utf8");
const account = readFileSync(new URL("../app/musteri-hesap/page.tsx", import.meta.url), "utf8");
const center = readFileSync(new URL("../app/musteri-merkezi/page.tsx", import.meta.url), "utf8");

test("customer access pages use the live email and password flow", () => {
  assert.match(login, /panel parolanızla/);
  assert.match(login, /\/musteri-panel\/giris/);
  assert.match(account, /güvenli panel parolası/);
  assert.match(center, /kayıtlı e-posta ve müşteri için oluşturulan panel parolasıyla/);
  assert.match(center, /href="\/musteri-panel\/giris"/);
});

test("customer access copy no longer claims that passwords are absent", () => {
  for (const source of [login, account, center]) {
    assert.doesNotMatch(source, /bu sitede şifre yok/i);
    assert.doesNotMatch(source, /parola bu siteden geçmez/i);
    assert.doesNotMatch(source, /lisans anahtarınızla güvenli müşteri paneline/i);
  }
});
