// build-bundle.js — bundles all markdown files into content-bundle.json
const fs   = require('fs');
const path = require('path');
const BOOK = require('./book-config.js');

const contentDir = path.join(__dirname, 'content');
const outPath    = path.join(__dirname, 'content-bundle.json');
const bundle     = {};
let ok = 0, fail = 0;

BOOK.sections.forEach(section => {
  section.files.forEach(file => {
    const filePath = path.join(contentDir, ...file.path.split('/'));
    try {
      bundle[file.id] = fs.readFileSync(filePath, 'utf8');
      console.log(`  ✓  ${file.id}`);
      ok++;
    } catch {
      console.warn(`  ✗  ${file.id}  (${filePath})`);
      fail++;
    }
  });
});

fs.writeFileSync(outPath, JSON.stringify(bundle), 'utf8');
const kb = (fs.statSync(outPath).size / 1024).toFixed(0);
console.log(`\nBundle: ${ok} files, ${fail} missing → ${kb} KB`);
