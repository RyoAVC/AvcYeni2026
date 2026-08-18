import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("motion-heavy presentation respects the reduced-motion preference", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const media = css.match(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{([\s\S]*)\}\s*$/)?.[1] ?? "";

  assert.ok(media, "globals.css should define a reduced-motion media query");
  assert.match(media, /html\s*\{\s*scroll-behavior:\s*auto;/, "smooth scrolling should be disabled");
  assert.match(media, /\*,\s*\*::before,\s*\*::after\s*\{[^}]*animation-duration:\s*\.01ms\s*!important;/, "animations should complete immediately");
  assert.match(media, /animation-iteration-count:\s*1\s*!important;/, "animations should not repeat");
  assert.match(media, /transition-duration:\s*\.01ms\s*!important;/, "transitions should complete immediately");

  const animationNames = [...css.matchAll(/@keyframes\s+([\w-]+)/g)].map((match) => match[1]);
  assert.ok(animationNames.length >= 8, "the audit should cover the existing animated presentation");
});
