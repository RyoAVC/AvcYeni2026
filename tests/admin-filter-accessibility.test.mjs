import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("admin filters expose their purpose and date-range relationship", async () => {
  const source = await readFile(new URL("../app/yonetim/basvurular/page.tsx", import.meta.url), "utf8");

  assert.match(source, /<fieldset className="admin-filters">/);
  assert.match(source, /<legend className="visually-hidden">Başvuru listesini filtrele<\/legend>/);
  assert.match(source, /id="admin-date-range-help"/);
  assert.equal((source.match(/aria-describedby="admin-date-range-help"/g) || []).length, 2);
  assert.match(source, /className="admin-filter-error" role="alert"/);
});
