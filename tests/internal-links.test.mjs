import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const appRoot = fileURLToPath(new URL("../app/", import.meta.url));
const virtualRoutes = new Set([
  "/callback",
  "/musteri-portali",
  "/signin-with-chatgpt",
  "/signout-with-chatgpt",
]);

function listFiles(directory, predicate) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return listFiles(path, predicate);
    return entry.isFile() && predicate(entry.name) ? [path] : [];
  });
}

function pageRoute(path) {
  const segments = relative(appRoot, dirname(path)).split(sep).filter(Boolean);
  if (segments.includes("api") || segments.some((segment) => segment.startsWith("[") && segment.endsWith("]"))) return null;
  const publicSegments = segments.filter((segment) => !(segment.startsWith("(") && segment.endsWith(")")));
  return publicSegments.length ? `/${publicSegments.join("/")}` : "/";
}

function apiRoute(path) {
  const segments = relative(appRoot, dirname(path)).split(sep).filter(Boolean);
  if (!segments[0] || segments[0] !== "api") return null;
  if (segments.some((segment) => segment.startsWith("[") && segment.endsWith("]"))) return null;
  return `/${segments.join("/")}`;
}

test("static internal links resolve to an application or system route", () => {
  const sourceFiles = listFiles(appRoot, (name) => /\.(?:ts|tsx)$/.test(name));
  const pageRoutes = new Set(
    listFiles(appRoot, (name) => name === "page.tsx").map(pageRoute).filter(Boolean),
  );
  const apiRoutes = new Set(
    listFiles(appRoot, (name) => name === "route.ts").map(apiRoute).filter(Boolean),
  );
  const knownRoutes = new Set([...pageRoutes, ...apiRoutes, ...virtualRoutes]);
  const references = sourceFiles.flatMap((path) => {
    const source = readFileSync(path, "utf8");
    return [...source.matchAll(/\bhref="(\/[^"{}]*)"/g)].map((match) => ({ path, href: match[1] }));
  });

  assert.ok(pageRoutes.size >= 20, "expected the multi-route site catalog");
  assert.ok(references.length >= 50, "expected static internal navigation links");
  for (const reference of references) {
    const pathname = new URL(reference.href, "https://app.local").pathname.replace(/\/$/, "") || "/";
    assert.ok(knownRoutes.has(pathname), `${reference.path} links to missing internal route: ${reference.href}`);
  }
});
