import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { OFFER_INTEREST_GROUPS, OFFER_INTERESTS, OFFER_SOLUTION_SLUGS } from "../app/offer-options.ts";

const appRoot = fileURLToPath(new URL("../app/", import.meta.url));

function listSourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return listSourceFiles(path);
    return entry.isFile() && /\.(?:ts|tsx)$/.test(entry.name) ? [path] : [];
  });
}

test("offer form groups preserve the exact API allowlist", () => {
  const groupedInterests = OFFER_INTEREST_GROUPS.flatMap((group) => group.interests);

  assert.deepEqual(groupedInterests, [...OFFER_INTERESTS]);
  assert.equal(new Set(groupedInterests).size, OFFER_INTERESTS.length);
  assert.equal(OFFER_INTEREST_GROUPS[0].interests[0], "E-Ticaret altyapısı");
  assert.ok(OFFER_INTEREST_GROUPS[0].interests.includes("E-Ticaret entegrasyonları"));
  assert.ok(OFFER_INTEREST_GROUPS.every((group) => group.label.tr && group.label.en));
});

test("offer solution slugs resolve only to allowed interests", () => {
  const slugInterests = Object.values(OFFER_SOLUTION_SLUGS);

  assert.equal(new Set(Object.keys(OFFER_SOLUTION_SLUGS)).size, Object.keys(OFFER_SOLUTION_SLUGS).length);
  assert.equal(new Set(slugInterests).size, OFFER_INTERESTS.length);
  assert.deepEqual(new Set(slugInterests), new Set(OFFER_INTERESTS));
  assert.equal(OFFER_SOLUTION_SLUGS.entegrasyon, "E-Ticaret entegrasyonları");
});

test("static quote CTAs use registered solution slugs", () => {
  const registeredSlugs = new Set(Object.keys(OFFER_SOLUTION_SLUGS));
  const references = listSourceFiles(appRoot).flatMap((path) => {
    const source = readFileSync(path, "utf8");
    return [...source.matchAll(/\/teklif\?cozum=([a-z0-9-]+)/g)].map((match) => ({ path, slug: match[1] }));
  });

  assert.ok(references.length > 0);
  for (const reference of references) {
    assert.ok(registeredSlugs.has(reference.slug), `${reference.path} uses unknown solution slug: ${reference.slug}`);
  }
});

test("quote page header keeps the public menu", () => {
  const source = readFileSync(join(appRoot, "teklif", "page.tsx"), "utf8");
  assert.match(source, /aria-label="Sayfa menüsü"/);
  assert.match(source, /href="\/yazilimlar"/);
  assert.doesNotMatch(source, /quote-back/);
});
