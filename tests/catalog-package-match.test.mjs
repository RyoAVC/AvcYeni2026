import assert from "node:assert/strict";
import test from "node:test";
import {
  findAdminPackageByCatalogId,
  guessCatalogPackageId,
  parseCatalogPackageId,
} from "../app/package-options.ts";
import { orderPriceNoteFromCatalog, packageDraftFromCatalog } from "../app/package-scope-details.ts";

test("catalog package id accepts only start scale enterprise", () => {
  assert.equal(parseCatalogPackageId("Scale"), "scale");
  assert.equal(parseCatalogPackageId(["enterprise"]), "enterprise");
  assert.equal(parseCatalogPackageId("pos"), "");
});

test("guesses catalog package from interest text", () => {
  assert.equal(guessCatalogPackageId("Scale paketi konuşmak istiyorum"), "scale");
  assert.equal(guessCatalogPackageId("Kuruma özel altyapı"), "enterprise");
  assert.equal(guessCatalogPackageId("E-Ticaret altyapısı"), "");
});

test("finds admin package by slug then by name", () => {
  const rows = [
    { id: 2, slug: "scale", name: "Scale" },
    { id: 9, slug: "ozel-start", name: "Start E-Ticaret" },
  ];
  assert.equal(findAdminPackageByCatalogId(rows, "scale")?.id, 2);
  assert.equal(findAdminPackageByCatalogId(rows, "start")?.id, 9);
  assert.equal(findAdminPackageByCatalogId(rows, "enterprise"), undefined);
});

test("catalog draft and price note stay example band", () => {
  const draft = packageDraftFromCatalog("start");
  assert.equal(draft?.slug, "start");
  assert.equal(draft?.family, "eticaret");
  assert.match(draft?.priceNote ?? "", /örnek band/);
  assert.match(orderPriceNoteFromCatalog("scale"), /74\.999 TL/);
});
