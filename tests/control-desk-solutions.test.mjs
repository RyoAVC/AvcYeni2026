import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");

test("çözüm kataloğu migration ve mağaza kapsamı içerir", () => {
  const migration = read("drizzle/0042_commerce_solution_blueprints.sql");
  const route = read("app/api/v1/control-desk/blueprints/route.ts");
  assert.match(migration, /UNIQUE\(blueprint_id, installation_id\)/);
  assert.match(migration, /basbitir-print-commerce/);
  assert.match(route, /auth\.customerId/);
  assert.match(route, /license\.customerId/);
  assert.match(route, /artifactManifestUrl/);
  assert.doesNotMatch(route, /password|ftpPassword|sshPassword/i);
});

test("müşteri indirme sayfası yalnız merkezi doğrulanmış sürüm kayıtlarını açar", () => {
  const page = read("app/control-desk/page.tsx");
  assert.match(page, /controlDeskAppReleases/);
  assert.match(page, /signatureStatus, "verified"/);
  assert.match(page, /button disabled>Henüz yayınlanmadı/);
  assert.match(page, /imzası doğrulanmış paketleri/i);
});

test("Control Desk uygulama sürümü imzasız biçimde yayınlanamaz", () => {
  const migration = read("drizzle/0043_control_desk_app_releases.sql");
  const route = read("app/api/v1/control-desk/app-releases/route.ts");
  const publicRoute = read("app/api/v1/control-desk/downloads/route.ts");
  assert.match(migration, /status != 'published'.*signature_status = 'verified'/s);
  assert.match(route, /İmzası doğrulanmamış paket yayınlanamaz/);
  assert.match(route, /hasControlDeskRole\(auth, \["platform_owner"\]\)/);
  assert.match(publicRoute, /signatureStatus, "verified"/);
  assert.doesNotMatch(publicRoute, /manifestSignature/);
});
