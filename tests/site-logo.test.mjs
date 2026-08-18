import assert from "node:assert/strict";
import test from "node:test";
import { brandLogoSrc, parseLogoBytes, parseLogoKind, STATIC_BRAND_LOGOS } from "../app/site-logo.mjs";
import { parseSiteTheme } from "../app/site-theme.mjs";

test("logo upload rejects scripted svg and accepts a clean svg", () => {
  const dirty = new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
  const clean = new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"></svg>');
  assert.equal(parseLogoBytes(dirty, "image/svg+xml").ok, false);
  assert.equal(parseLogoBytes(clean, "image/svg+xml").ok, true);
  assert.equal(parseLogoBytes(new Uint8Array([1, 2, 3]), "image/png").ok, false);
});

test("header falls back to the static brand PNG when no upload exists", () => {
  assert.equal(brandLogoSrc("night", { exists: false }), STATIC_BRAND_LOGOS.night);
  assert.equal(brandLogoSrc("day", { exists: false }), STATIC_BRAND_LOGOS.day);
  assert.equal(
    brandLogoSrc("night", { exists: true, updatedAt: "2026-08-18" }),
    "/api/site-logo?kind=night&v=2026-08-18",
  );
});

test("logo kind and site theme stay in the night/day pair", () => {
  assert.equal(parseLogoKind("day"), "logo-day");
  assert.equal(parseLogoKind("gunduz"), "logo-day");
  assert.equal(parseLogoKind("night"), "logo-night");
  assert.equal(parseLogoKind(""), "logo-night");
  assert.equal(parseSiteTheme("day"), "day");
  assert.equal(parseSiteTheme("night"), "night");
  assert.equal(parseSiteTheme("rainbow"), "night");
});
