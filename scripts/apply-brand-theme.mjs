import fs from "fs";

const path = new URL("../app/globals.css", import.meta.url);
let css = fs.readFileSync(path, "utf8");

css = css.replace(
  /:root \{[\s\S]*?\n\}/,
  `:root {
  --brand-red: #e7000a;
  --brand-red-deep: #b10511;
  --brand-black: #000000;
  --ink: #0a0a0a;
  --ink-soft: #161616;
  --paper: #f6f6f6;
  --white: #ffffff;
  --muted: #6a6a6a;
  --line: rgba(0, 0, 0, 0.1);
  --mint: #e7000a;
  --cyan: #ff3b3b;
  --lime: #ff8e8e;
  --display: var(--font-geist-sans), "Segoe UI", Arial, Helvetica, sans-serif;
  --hero-title: clamp(3.35rem, 6.2vw + 1rem, 7.35rem);
  --page-title: clamp(3rem, 6.8vw + .55rem, 8.25rem);
  --section-title: clamp(2.55rem, 4.2vw + .45rem, 5.25rem);
  --hero-copy: clamp(1.125rem, 1.1vw + .7rem, 1.6rem);
  --lead-copy: clamp(1.05rem, .65vw + .75rem, 1.35rem);
}`
);

css = css
  .replace(/rgba\(\s*130\s*,\s*247\s*,\s*188\s*,/g, "rgba(231, 0, 10,")
  .replace(/rgba\(\s*105\s*,\s*207\s*,\s*255\s*,/g, "rgba(255, 59, 59,")
  .replace(/#82f7bc/gi, "#e7000a")
  .replace(/#69cfff/gi, "#ff3b3b")
  .replace(/#d7ff6c/gi, "#ff8e8e")
  .replace(/#173a49/g, "#3a0a0c")
  .replace(/#0b202c/g, "#120606")
  .replace(/#cbd9d2/g, "#d4d4d4");

css = css.replace(
  /.skip-link \{ position: fixed; z-index: 100; top: 12px; left: 12px; padding: 11px 15px; border-radius: 8px; color: var\(--ink\); background: var\(--mint\);/,
  ".skip-link { position: fixed; z-index: 100; top: 12px; left: 12px; padding: 11px 15px; border-radius: 8px; color: #fff; background: var(--mint);"
);

css = css.replace(
  /.button-primary \{ color: var\(--ink\); background: var\(--mint\);/,
  ".button-primary { color: #fff; background: var(--mint);"
);

css = css.replace(
  /.header-cta \{ display: inline-flex; align-items: center; gap: 12px; padding: 12px 17px; border-radius: 999px; background: white; color: var\(--ink\);/,
  ".header-cta { display: inline-flex; align-items: center; gap: 12px; padding: 12px 17px; border-radius: 999px; background: #e7000a; color: #fff;"
);

css = css.replace(
  /.hero \{ position: relative; min-height: 860px; height: 100vh; overflow: hidden; display: grid; grid-template-columns: \.9fr 1\.1fr; align-items: center; gap: 3vw; padding: 120px 5vw 80px; color: white; background: radial-gradient\(circle at 68% 35%, #3a0a0c 0, #120606 26%, var\(--ink\) 62%\); \}/,
  `.hero { position: relative; min-height: 860px; height: 100vh; overflow: hidden; display: grid; grid-template-columns: .9fr 1.1fr; align-items: center; gap: 3vw; padding: 120px 5vw 80px; color: white; background:
    radial-gradient(circle at 78% 22%, rgba(231, 0, 10, 0.32) 0, transparent 32%),
    radial-gradient(circle at 12% 88%, rgba(177, 5, 17, 0.18) 0, transparent 42%),
    #000000; }`
);

css = css.replace(/html\[data-theme-preview="logo"\]\s*/g, "");

css = css.replace(
  /\/\* ========== LOGO[\s\S]*?\*\//,
  "/* ========== AVCI BRAND (siyah + #E7000A) ========== */"
);

// Drop duplicate :root-like block left from preview (now bare properties)
css = css.replace(
  /\/\* ========== AVCI BRAND \(siyah \+ #E7000A\) ========== \*\/\n\{\n  --brand-red:[\s\S]*?--lime: #ff8e8e;\n\}\n/,
  "/* ========== AVCI BRAND (siyah + #E7000A) ========== */\n"
);

fs.writeFileSync(path, css);

const leftoverPreview = (css.match(/data-theme-preview/g) || []).length;
const leftoverMint = (css.match(/#82f7bc/gi) || []).length;
console.log("ok", { leftoverPreview, leftoverMint, bytes: css.length });
