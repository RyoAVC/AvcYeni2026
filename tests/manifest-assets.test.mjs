import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";
import manifest from "../app/manifest.ts";

const publicRoot = fileURLToPath(new URL("../public/", import.meta.url));

test("web manifest describes the commerce product and references existing icons", () => {
  const value = manifest();

  assert.match(value.description ?? "", /modüler e-ticaret altyapısı/);
  assert.doesNotMatch(value.description ?? "", /yapay zekâ çözümleri/i);
  assert.equal(value.start_url, "/");
  assert.equal(value.scope, "/");
  assert.ok(Array.isArray(value.icons) && value.icons.length > 0);
  for (const icon of value.icons ?? []) {
    assert.match(icon.src, /^\/[a-z0-9._/-]+$/i);
    const iconPath = fileURLToPath(new URL(`.${icon.src}`, new URL("../public/", import.meta.url)));
    const stats = statSync(iconPath);
    assert.ok(iconPath.startsWith(publicRoot));
    assert.ok(stats.isFile() && stats.size > 0, `${icon.src} must be a non-empty public file`);
  }
});

test("social and favicon metadata match non-empty public assets", () => {
  const layoutSource = readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8");
  const socialMetadataSource = readFileSync(new URL("../app/site-social-metadata.ts", import.meta.url), "utf8");
  const socialImage = readFileSync(new URL("../public/og.png", import.meta.url));
  const favicon = readFileSync(new URL("../public/favicon.svg", import.meta.url), "utf8");

  assert.match(layoutSource, /openGraph: SITE_OPEN_GRAPH/);
  assert.match(socialMetadataSource, /url: "\/og\.png", width: 1731, height: 909/);
  assert.match(layoutSource, /images: \["\/og\.png"\]/);
  assert.match(layoutSource, /icon: "\/favicon\.svg"/);
  assert.equal(socialImage.subarray(1, 4).toString("ascii"), "PNG");
  assert.equal(socialImage.readUInt32BE(16), 1731);
  assert.equal(socialImage.readUInt32BE(20), 909);
  assert.ok(socialImage.byteLength > 100_000);
  assert.match(favicon, /<svg\b/);
  assert.match(favicon, /viewBox=/);
});
