import fs from "node:fs";
import path from "node:path";

// Jalankan dari root repo: node install-smart-search.mjs [--check]
const root = process.cwd();
const dryRun = process.argv.includes("--check");
const componentPath = path.join(
  root,
  "common/components/elements/CommandSearch.tsx",
);

if (!fs.existsSync(componentPath)) {
  console.error("[GAGAL] CommandSearch.tsx belum ada. Ekstrak isi ZIP ke root repo terlebih dahulu.");
  process.exit(1);
}

const files = [
  {
    relative: "common/components/layouts/index.tsx",
    edits: [
      {
        from: 'import Sidebar from "./sidebar";',
        to: 'import Sidebar from "./sidebar";\nimport { CommandSearchProvider } from "@/common/components/elements/CommandSearch";',
      },
      {
        from: '  return (\n    <div className="mx-auto max-w-7xl lg:px-12">',
        to: '  return (\n    <CommandSearchProvider>\n      <div className="mx-auto max-w-7xl lg:px-12">',
      },
      {
        from: '      {isShowChatButton && <ChatButton />}\n    </div>\n  );',
        to: '      {isShowChatButton && <ChatButton />}\n      </div>\n    </CommandSearchProvider>\n  );',
      },
    ],
    marker: '<CommandSearchProvider>',
  },
  {
    relative: "common/components/layouts/sidebar/Profile.tsx",
    edits: [
      {
        from: 'import IntlToggle from "./IntlToggle";',
        to: 'import IntlToggle from "./IntlToggle";\nimport { SearchTrigger } from "@/common/components/elements/CommandSearch";',
      },
      {
        from: '        <ProfileHeader expandMenu={isOpen} imageSize={imageSize} />',
        to: '        <ProfileHeader expandMenu={isOpen} imageSize={imageSize} />\n        <div className="hidden w-full lg:block">\n          <SearchTrigger />\n        </div>\n        <div className="hidden md:block lg:hidden">\n          <SearchTrigger compact />\n        </div>',
      },
      {
        from: '            <div className="flex gap-4">\n              <IntlToggle />',
        to: '            <div className="flex gap-4">\n              <SearchTrigger compact />\n              <IntlToggle />',
      },
    ],
    marker: '<SearchTrigger />',
  },
];

const prepared = [];
for (const entry of files) {
  const absolute = path.join(root, entry.relative);
  if (!fs.existsSync(absolute)) {
    console.error(`[GAGAL] File tidak ada: ${entry.relative}`);
    process.exit(1);
  }
  const original = fs.readFileSync(absolute, "utf8");
  if (original.includes(entry.marker)) {
    console.log(`[LEWATI] Sudah terpasang: ${entry.relative}`);
    continue;
  }
  const newline = original.includes("\r\n") ? "\r\n" : "\n";
  let modified = original.replace(/\r\n/g, "\n");
  for (const edit of entry.edits) {
    if (!modified.includes(edit.from)) {
      console.error(`[GAGAL] Struktur berbeda di ${entry.relative}. Anchor tidak ditemukan:\n${edit.from}`);
      console.error("Tidak ada file proyek yang diubah. Ikuti langkah manual di README.");
      process.exit(1);
    }
    if (modified.split(edit.from).length !== 2) {
      console.error(`[GAGAL] Anchor duplikat di ${entry.relative}. Batalkan untuk keamanan.`);
      process.exit(1);
    }
    modified = modified.replace(edit.from, edit.to);
  }
  prepared.push({ relative: entry.relative, absolute, original, next: modified.replace(/\n/g, newline) });
}

if (dryRun) {
  console.log(`[CHECK OK] ${prepared.length} file siap diubah. Tidak ada perubahan yang ditulis.`);
  process.exit(0);
}

const backupRoot = path.join(root, ".command-search-backup");
for (const item of prepared) {
  const backup = path.join(backupRoot, item.relative);
  fs.mkdirSync(path.dirname(backup), { recursive: true });
  if (!fs.existsSync(backup)) fs.writeFileSync(backup, item.original);
}
try {
  for (const item of prepared) {
    fs.writeFileSync(item.absolute, item.next);
    console.log(`[OK] ${item.relative}`);
  }
} catch (error) {
  console.error("Gagal saat menulis, mencoba memulihkan file awal:", error);
  for (const item of prepared) fs.writeFileSync(item.absolute, item.original);
  process.exit(1);
}
console.log("\nSmart Command Search terpasang. Jalankan npm run dev dan uji Ctrl+K.");
console.log("File sebelum perubahan disimpan di .command-search-backup/ (jangan di-commit). ");
