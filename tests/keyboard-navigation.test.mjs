import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import test from "node:test";

async function applicationFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return applicationFiles(path);
    return entry.isFile() && entry.name.endsWith(".tsx") ? [path] : [];
  }));
  return nested.flat();
}

test("keyboard focus remains visible on every interactive element type", async () => {
  const css = await readFile(join(process.cwd(), "app", "globals.css"), "utf8");

  assert.match(css, /:where\(a, button, input, select, textarea, summary\):focus-visible/);
  assert.match(css, /outline:\s*3px solid var\(--mint\)/);
  assert.match(css, /outline-offset:\s*3px/);
});

test("every skip link resolves to a target in its own page", async () => {
  const appRoot = join(process.cwd(), "app");
  const files = await applicationFiles(appRoot);
  let skipLinkCount = 0;

  for (const path of files) {
    const source = await readFile(path, "utf8");
    const targets = [...source.matchAll(/className="skip-link" href="#([^"]+)"/g)].map((match) => match[1]);
    skipLinkCount += targets.length;

    for (const target of targets) {
      assert.match(source, new RegExp(`\\bid="${target}"`), `${relative(process.cwd(), path)} skip link should resolve to #${target}`);
    }
  }

  assert.ok(skipLinkCount >= 20, "the audit should cover the public page skip links");
});
