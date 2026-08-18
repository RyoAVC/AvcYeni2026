import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import test from "node:test";

async function applicationFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return applicationFiles(path);
    return entry.isFile() && /\.(?:tsx|ts)$/.test(entry.name) ? [path] : [];
  }));
  return nested.flat();
}

test("all application tables expose captions and scoped headers", async () => {
  const appRoot = join(process.cwd(), "app");
  const files = await applicationFiles(appRoot);
  let tableCount = 0;

  for (const path of files) {
    const source = await readFile(path, "utf8");
    const tables = [...source.matchAll(/<table\b[\s\S]*?<\/table>/g)].map((match) => match[0]);
    const file = relative(process.cwd(), path);
    tableCount += tables.length;

    for (const table of tables) {
      assert.match(table, /<caption className="visually-hidden">[^<]+<\/caption>/, `${file} table should have a non-empty caption`);
      const headers = [...table.matchAll(/<th\b([^>]*)>/g)].map((match) => match[1]);
      assert.ok(headers.length > 0, `${file} table should have headers`);
      assert.ok(headers.every((attributes) => /\bscope="(?:col|row)"/.test(attributes)), `${file} table headers should declare their scope`);
      if (file.endsWith("demo-portal\\page.tsx") || file.endsWith("demo-portal/page.tsx") || file.endsWith("yonetim\\basvurular\\page.tsx") || file.endsWith("yonetim/basvurular/page.tsx")) {
        assert.match(table, /<tbody>[\s\S]*<th scope="row"/, `${file} data rows should expose their record name as a row header`);
      }
    }
  }

  assert.ok(tableCount >= 6, "the accessibility audit should find the existing application tables");
});

test("admin status controls include the lead name in their accessible label", async () => {
  const [listPage, detailPage] = await Promise.all([
    readFile(join(process.cwd(), "app", "yonetim", "basvurular", "page.tsx"), "utf8"),
    readFile(join(process.cwd(), "app", "yonetim", "basvurular", "[id]", "page.tsx"), "utf8"),
  ]);

  assert.match(listPage, /label=\{`\$\{lead\.name\} başvuru durumu`\}/);
  assert.match(detailPage, /label=\{`\$\{lead\.name\} başvuru durumu`\}/);
});
