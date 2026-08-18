import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const appRoot = fileURLToPath(new URL("../app/", import.meta.url));
const corporatePhone = "+908503086837";
const corporateEmail = "info@avcieticaret.com";

function listSourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return listSourceFiles(path);
    return entry.isFile() && /\.(?:ts|tsx)$/.test(entry.name) ? [path] : [];
  });
}

test("public contact links come from site settings, leftovers stay corporate", () => {
  const sources = listSourceFiles(appRoot).map((path) => ({ path, source: readFileSync(path, "utf8") }));
  const phones = sources.flatMap(({ path, source }) =>
    [...source.matchAll(/href="tel:([^"]+)"/g)].map((match) => ({ path, value: match[1] })),
  );
  const emails = sources.flatMap(({ path, source }) =>
    [...source.matchAll(/href="mailto:([^"?]+)(?:\?[^\"]*)?"/g)].map((match) => ({ path, value: match[1] })),
  );

  const englishHome = sources.find(({ path }) => path.endsWith(`${join("en", "page.tsx")}`));
  const englishPrivacy = sources.find(({ path }) => path.endsWith(`${join("en", "privacy", "page.tsx")}`));
  const notFound = sources.find(({ path }) => path.endsWith(`${join("not-found.tsx")}`));

  assert.ok(englishHome?.source.includes("loadSiteSettings"), "English home should load site settings");
  assert.ok(englishHome?.source.includes("settings.contactEmail"), "English home should use settings email");
  assert.ok(englishHome?.source.includes("settings.contactPhoneHref"), "English home should use settings phone");
  assert.ok(englishPrivacy?.source.includes("loadSiteSettings"), "English privacy should load site settings");
  assert.ok(englishPrivacy?.source.includes("settings.contactEmail"), "English privacy should use settings email");
  assert.ok(notFound?.source.includes("loadSiteSettings"), "404 page should load site settings");
  assert.ok(notFound?.source.includes("settings.contactEmail"), "404 page should use settings email");

  for (const phone of phones) assert.equal(phone.value, corporatePhone, `${phone.path} has a different static phone`);
  for (const email of emails) assert.equal(email.value, corporateEmail, `${email.path} has a different static email`);
  assert.ok(sources.every(({ source }) => !source.includes("536 599 50 40")), "legacy mobile number must not return");
});
