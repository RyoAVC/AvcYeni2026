import assert from "node:assert/strict";
import test from "node:test";
import { getPackageName, PACKAGE_OPTIONS } from "../app/package-options.ts";

test("package query values resolve from one unique catalog", () => {
  const ids = PACKAGE_OPTIONS.map((item) => item.id);
  const names = PACKAGE_OPTIONS.map((item) => item.name);

  assert.deepEqual(ids, ["start", "scale", "enterprise"]);
  assert.deepEqual(names, ["Start", "Scale", "Enterprise"]);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(getPackageName("scale"), "Scale");
  assert.equal(getPackageName("unknown"), "");
});
