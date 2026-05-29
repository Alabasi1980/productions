// build-dist.js — copies web files to dist/ for Capacitor bundling
const fs   = require('fs');
const path = require('path');

const dist = path.join(__dirname, 'dist');
const markedDistDir = path.join(dist, 'node_modules', 'marked');
const capacitorCoreDistDir = path.join(dist, 'node_modules', '@capacitor', 'core', 'dist');
const secureStorageDistDir = path.join(dist, 'node_modules', '@aparajita', 'capacitor-secure-storage', 'dist');
if (fs.existsSync(dist)) fs.rmSync(dist, { recursive: true });
fs.mkdirSync(dist);
fs.mkdirSync(markedDistDir, { recursive: true });
fs.mkdirSync(capacitorCoreDistDir, { recursive: true });
fs.mkdirSync(secureStorageDistDir, { recursive: true });

const files = [
  'index.html',
  'style.css',
  'app.js',
  'book-config.js',
  'content-bundle.json',
  'content-index.json',
  'ai-knowledge-base.json',
  'study-metadata.json',
  'domain-config.json',
  'glossary.json',
  'flashcards.json',
  'quiz-bank.json',
  'system-comparisons.json',
  'interview-bank.json',
  'cloze-bank.json',
  'concepts.json',
  'cheatsheets.json',
  'scenarios.json',
];
files.forEach(f => {
  const src = path.join(__dirname, f);
  if (!fs.existsSync(src)) {
    console.warn(`  ✗  missing: ${f} (skipped)`);
    return;
  }
  fs.copyFileSync(src, path.join(dist, f));
  console.log(`  copied → dist/${f}`);
});

const markedSource = path.join(__dirname, 'node_modules', 'marked', 'marked.min.js');
fs.copyFileSync(markedSource, path.join(markedDistDir, 'marked.min.js'));
console.log('  copied → dist/node_modules/marked/marked.min.js');

const capacitorCoreSource = path.join(__dirname, 'node_modules', '@capacitor', 'core', 'dist', 'capacitor.js');
fs.copyFileSync(capacitorCoreSource, path.join(capacitorCoreDistDir, 'capacitor.js'));
console.log('  copied → dist/node_modules/@capacitor/core/dist/capacitor.js');

const secureStorageSource = path.join(__dirname, 'node_modules', '@aparajita', 'capacitor-secure-storage', 'dist', 'plugin.js');
fs.copyFileSync(secureStorageSource, path.join(secureStorageDistDir, 'plugin.js'));
console.log('  copied → dist/node_modules/@aparajita/capacitor-secure-storage/dist/plugin.js');

console.log('\ndist/ ready for Capacitor sync.');
