import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("public pages get a centered mobile bottom menu instead of a clipped top drawer", async () => {
  const [nav, layout, css] = await Promise.all([
    readFile(new URL("../app/mobile-bottom-nav.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(layout, /MobileBottomNav/);
  assert.match(nav, /aria-label=\{open \? "Menüyü kapat" : "Menüyü aç"\}/);
  assert.match(nav, /mobile-bottom-nav-bar/);
  assert.match(nav, /href: "\/yazilimlar"/);
  assert.match(nav, /label: "Yazılım"/);
  assert.match(nav, /label: "Paket"/);
  assert.match(css, /grid-template-columns:\s*repeat\(5,/);
  assert.match(nav, /href: "\/paketler"/);
  assert.match(nav, /href: "\/teklif"/);
  assert.match(nav, /\/yonetim/);
  assert.match(css, /\.mobile-bottom-nav-bar/);
  assert.match(css, /left:\s*50%/);
  assert.match(css, /\.site-header \.mobile-nav \{ display: none; \}/);
  assert.match(css, /\.avcai-voice-setting/);
  assert.match(css, /\.avcai-voice-caption/);
  assert.match(css, /\.demo-table-wrap \{ overflow-x: auto; max-width: 100%; min-width: 0;/);
  assert.match(css, /@media \(hover: none\)/);
  assert.match(css, /touch-action: manipulation/);
});
