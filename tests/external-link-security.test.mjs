import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import test from "node:test";

async function applicationFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return applicationFiles(path);
    return entry.isFile() && entry.name.endsWith(".tsx") ? [path] : [];
  }))).flat();
}

test("new-tab links prevent opener access and referrer disclosure", async () => {
  const files = await applicationFiles(join(process.cwd(), "app"));
  let newTabLinkCount = 0;

  for (const path of files) {
    const source = await readFile(path, "utf8");
    const links = [...source.matchAll(/<a\b[^>]*\btarget="_blank"[^>]*>/g)].map((match) => match[0]);
    newTabLinkCount += links.length;
    for (const link of links) {
      const rel = link.match(/\brel="([^"]+)"/)?.[1]?.split(/\s+/) ?? [];
      assert.ok(rel.includes("noopener"), `${relative(process.cwd(), path)} new-tab link should include noopener`);
      assert.ok(rel.includes("noreferrer"), `${relative(process.cwd(), path)} new-tab link should include noreferrer`);
    }
  }

  assert.ok(newTabLinkCount > 0, "the audit should find existing new-tab links");
});
