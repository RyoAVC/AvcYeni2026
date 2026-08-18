import fs from "fs";
import path from "path";

const root = "C:/Users/User/Desktop/lisans ön yüz/app";
const files = [];

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (ent.name.endsWith(".tsx")) files.push(p);
  }
}
walk(root);

const brandRe =
  /<span className="brand-mark">A<\/span>\s*<span className="brand-copy"><strong>AVCI<\/strong><small>[^<]*<\/small><\/span>/g;
const brandReMulti =
  /<span className="brand-mark">A<\/span>\s*<span className="brand-copy">\s*<strong>AVCI<\/strong>\s*<small>[^<]*<\/small>\s*<\/span>/g;

let changed = 0;
for (const file of files) {
  if (file.endsWith("brand-logo.tsx") || file.endsWith("theme-preview.tsx")) continue;
  let src = fs.readFileSync(file, "utf8");
  if (!src.includes("brand-mark")) continue;

  const before = src;
  src = src.replace(brandRe, '<BrandLogo variant="light" animated />');
  src = src.replace(brandReMulti, '<BrandLogo variant="light" animated />');

  if (src === before) {
    console.log("skip-no-match", path.relative(root, file));
    continue;
  }

  if (
    !src.includes('from "./brand-logo"') &&
    !src.includes("from '../brand-logo'") &&
    !src.includes('from "../brand-logo"') &&
    !src.includes("from '../../brand-logo'") &&
    !src.includes('from "../../brand-logo"')
  ) {
    let rel = path.relative(path.dirname(file), path.join(root, "brand-logo.tsx")).replace(/\\/g, "/");
    rel = rel.replace(/\.tsx$/, "");
    if (!rel.startsWith(".")) rel = "./" + rel;
    if (src.includes('from "next/link"')) {
      src = src.replace(
        'from "next/link";',
        `from "next/link";\nimport { BrandLogo } from "${rel}";`,
      );
    } else if (src.includes("from 'next/link'")) {
      src = src.replace(
        "from 'next/link';",
        `from 'next/link';\nimport { BrandLogo } from '${rel}';`,
      );
    } else {
      src = `import { BrandLogo } from "${rel}";\n` + src;
    }
  }

  fs.writeFileSync(file, src);
  changed += 1;
  console.log("updated", path.relative(root, file));
}
console.log("changed", changed);
