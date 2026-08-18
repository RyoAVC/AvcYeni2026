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

test("every application button declares its form behavior", async () => {
  const files = await applicationFiles(join(process.cwd(), "app"));
  let buttonCount = 0;

  for (const path of files) {
    const source = await readFile(path, "utf8");
    const buttons = [...source.matchAll(/<button\b([^>]*)>/g)].map((match) => match[1]);
    buttonCount += buttons.length;
    for (const attributes of buttons) {
      const type = attributes.match(/\btype="([^"]+)"/)?.[1];
      assert.ok(["button", "submit", "reset"].includes(type), `${relative(process.cwd(), path)} button should declare a valid type`);
    }
  }

  assert.ok(buttonCount > 0, "the audit should find existing application buttons");
});
