import assert from "node:assert/strict";
import test from "node:test";
import { serializeCsv, toSafeCsvCell } from "../app/csv-utils.mjs";

test("CSV cells escape quotes and neutralize spreadsheet formulas", () => {
  assert.equal(toSafeCsvCell('Ali "Test"'), '"Ali ""Test"""');
  assert.equal(toSafeCsvCell("=HYPERLINK(\"bad\")"), '"\'=HYPERLINK(""bad"")"');
  assert.equal(toSafeCsvCell("  +SUM(1,2)"), '"  \'+SUM(1,2)"');

  const csv = serializeCsv(["Ad", "Telefon"], [["Test", "05550000000"]]);
  assert.equal(csv, '"Ad","Telefon"\r\n"Test","05550000000"');
});
