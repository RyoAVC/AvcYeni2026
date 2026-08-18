import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("admin summary facets preserve every other active lead filter", async () => {
  const source = await readFile(new URL("../app/yonetim/basvurular/page.tsx", import.meta.url), "utf8");
  const querySource = await readFile(new URL("../app/lead-query.ts", import.meta.url), "utf8");
  const exportSource = await readFile(new URL("../app/api/yonetim/basvurular/export/route.ts", import.meta.url), "utf8");

  assert.match(source, /buildLeadFacetWheres\(\{/);
  assert.match(exportSource, /const where = buildLeadWhere\(\{ search, status, source, interest, dateRange \}\)/);
  assert.match(exportSource, /\.where\(where\)/);

  assert.match(querySource, /where: and\(\.\.\.shared, statusFilter, sourceFilter, interestFilter\)/);
  assert.match(querySource, /statusSummaryWhere: and\(\.\.\.shared, sourceFilter, interestFilter\)/);
  assert.match(querySource, /sourceSummaryWhere: and\(\.\.\.shared, statusFilter, interestFilter\)/);
  assert.match(querySource, /interestSummaryWhere: and\(\.\.\.shared, statusFilter, sourceFilter\)/);

  assert.match(source, /\.where\(statusSummaryWhere\)\.groupBy\(leads\.status\)/);
  assert.match(source, /\.where\(sourceSummaryWhere\)\.groupBy\(leads\.source\)/);
  assert.match(source, /\.where\(interestSummaryWhere\)\.groupBy\(leads\.interest\)/);
});
