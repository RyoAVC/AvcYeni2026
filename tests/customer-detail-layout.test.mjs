import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const page = readFileSync(new URL("../app/yonetim/musteriler/[id]/page.tsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../app/yonetim/musteriler/[id]/customer-detail.css", import.meta.url), "utf8");

test("customer detail actions use a bounded wrapping navigation", () => {
  assert.match(page, /customer-detail-heading/);
  assert.match(page, /customer-detail-action-list/);
  assert.match(page, /aria-label="Müşteri işlemleri"/);
  assert.match(css, /\.customer-detail-action-list\s*\{[^}]*display:\s*flex;[^}]*flex-wrap:\s*wrap;/s);
  assert.match(css, /\.customer-detail-actions\s*\{[^}]*max-width:\s*760px;/s);
});

test("customer detail layout collapses before the admin sidebar breakpoint", () => {
  assert.match(css, /@media\s*\(max-width:\s*900px\)/);
  assert.match(css, /\.customer-detail-heading\s*\{[^}]*grid-template-columns:\s*1fr;/s);
  assert.match(css, /@media\s*\(max-width:\s*520px\)/);
  assert.match(css, /grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
});
