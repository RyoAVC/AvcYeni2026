import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import sitemap from "../app/sitemap.ts";

const appRoot = fileURLToPath(new URL("../app/", import.meta.url));
const excludedPublicPages = new Set(["/musteri-girisi", "/demo-portal"]);

function listPageFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return listPageFiles(path);
    return entry.isFile() && entry.name === "page.tsx" ? [path] : [];
  });
}

function pageRoute(path) {
  const segments = relative(appRoot, dirname(path)).split(sep).filter(Boolean);
  if (segments.includes("api") || segments.some((segment) => segment.startsWith("[") && segment.endsWith("]"))) return null;
  const routeSegments = segments.filter((segment) => !(segment.startsWith("(") && segment.endsWith(")")));
  return routeSegments.length ? `/${routeSegments.join("/")}` : "/";
}

test("sitemap contains every indexable page and no private page", () => {
  const expectedRoutes = listPageFiles(appRoot)
    .map(pageRoute)
    .filter((route) => route && route !== "/yonetim" && !route.startsWith("/yonetim/") && !excludedPublicPages.has(route));
  const sitemapRoutes = sitemap().map((entry) => new URL(entry.url).pathname.replace(/\/$/, "") || "/");

  assert.equal(new Set(expectedRoutes).size, expectedRoutes.length, "page routes must be unique");
  assert.equal(new Set(sitemapRoutes).size, sitemapRoutes.length, "sitemap routes must be unique");
  assert.deepEqual(new Set(sitemapRoutes), new Set(expectedRoutes));
  assert.ok(sitemap().every((entry) => new URL(entry.url).origin === "https://avcieticaret.com"));
});
