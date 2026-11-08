
import {
  readFile,
  copyFile,
  mkdir,
} from "node:fs/promises";

import {
  resolve,
  join,
} from "node:path";

const version = "5.4.624";

const root = process.cwd();

const pkgRoot = resolve(
  root,
  "node_modules",
  "pdfjs-dist"
);

const pkgPath = join(
  pkgRoot,
  "package.json"
);

let pkg;

try {
  pkg = JSON.parse(
    await readFile(pkgPath, "utf8")
  );
} catch {
  throw new Error(
    " npm install pdfjs-dist@5.4.624"
  );
}

if (pkg.version !== version) {
  throw new Error(
    `Versi pdfjs-dist ${pkg.version}; patch ini membutuhkan ${version}. Jalankan: npm install pdfjs-dist@${version}`
  );
}

const target = resolve(
  root,
  "public",
  "pdfjs",
  `v${version}`
);

await mkdir(target, {
  recursive: true,
});

for (const file of [
  "pdf.min.mjs",
  "pdf.worker.min.mjs",
]) {
  await copyFile(
    join(pkgRoot, "build", file),
    join(target, file)
  );

  console.log(
    `OK: public/pdfjs/v${version}/${file}`
  );
}

console.log(
  "Aset PDF.js siap digunakan."
);
