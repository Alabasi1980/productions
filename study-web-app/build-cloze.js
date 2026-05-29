// Generates cloze-bank.json from glossary terms + lesson markdown.
// Each glossary term gets a fill-in-the-blank sentence pulled from real lesson text.
const fs = require('fs');
const path = require('path');
const BOOK = require('./book-config.js');

const contentDir = path.join(__dirname, 'content');
const glossaryPath = path.join(__dirname, 'glossary.json');
const outPath = path.join(__dirname, 'cloze-bank.json');

function cleanInline(text) {
  return text
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripBlocks(markdown) {
  // remove fenced code blocks and tables
  return markdown
    .replace(/```[\s\S]*?```/g, '\n')
    .split(/\r?\n/)
    .filter(line => !line.trim().startsWith('|') && !line.trim().startsWith('---'))
    .join('\n');
}

function splitSentences(text) {
  // Split on Arabic & Latin sentence terminators while keeping fragments reasonable.
  return text
    .split(/(?<=[\.\!\?؟])\s+|\n+/)
    .map(s => cleanInline(s))
    .filter(Boolean);
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function loadFiles() {
  const map = new Map(); // path → text
  BOOK.sections.forEach(section => {
    section.files.forEach(file => {
      const abs = path.join(contentDir, file.path);
      if (!fs.existsSync(abs)) return;
      const text = fs.readFileSync(abs, 'utf8');
      map.set(file.path, { file, section, text: stripBlocks(text) });
    });
  });
  return map;
}

function fileIsGlossary(file) {
  return /قاموس|glossary/i.test(file.title) || /glossary|قاموس/i.test(file.path);
}

function findClozeSentence(term, files) {
  const variants = [term.english, term.arabic, ...(term.aliases || [])]
    .map(v => String(v || '').trim())
    .filter(v => v.length >= 3);
  if (!variants.length) return null;

  for (const variant of variants) {
    const re = new RegExp(`(^|[^\\p{L}])${escapeRe(variant)}([^\\p{L}]|$)`, 'u');
    for (const [, entry] of files) {
      if (fileIsGlossary(entry.file)) continue;
      if (term.sourcePath && entry.file.path === term.sourcePath && fileIsGlossary(entry.file)) continue;
      const sentences = splitSentences(entry.text);
      for (const sentence of sentences) {
        if (sentence.length < 30 || sentence.length > 220) continue;
        if (sentence.startsWith('#')) continue;
        if (!re.test(sentence)) continue;
        // Found a good sentence — produce cloze
        const blanked = sentence.replace(
          new RegExp(`(^|[^\\p{L}])(${escapeRe(variant)})([^\\p{L}]|$)`, 'u'),
          (_, a, _b, c) => `${a}_____${c}`
        );
        return {
          sentence: blanked,
          answer: variant,
          sourceId: entry.file.id,
          sourceTitle: entry.file.title,
          sourcePath: entry.file.path,
          sectionId: entry.section.id,
          sectionTitle: entry.section.title,
        };
      }
    }
  }
  return null;
}

function main() {
  if (!fs.existsSync(glossaryPath)) {
    console.error('glossary.json not found — run `npm run study:data` first.');
    process.exit(1);
  }
  const glossary = JSON.parse(fs.readFileSync(glossaryPath, 'utf8'));
  const files = loadFiles();
  const terms = glossary.terms || [];

  const cards = [];
  let serial = 1;
  let skipped = 0;
  terms.forEach(term => {
    const found = findClozeSentence(term, files);
    if (!found) { skipped++; return; }
    cards.push({
      id: `cz-${String(serial++).padStart(3, '0')}`,
      type: 'cloze',
      termId: term.id,
      category: term.category,
      front: found.sentence,
      back: found.answer,
      hint: term.definition ? term.definition.slice(0, 120) : '',
      sourceId: found.sourceId,
      sourceTitle: found.sourceTitle,
      sourcePath: found.sourcePath,
      sectionId: found.sectionId,
      sectionTitle: found.sectionTitle,
      direction: 'cloze',
      difficulty: 'medium',
      tags: ['cloze', 'glossary'],
    });
  });

  const output = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    domainId: glossary.domainId,
    contentPackId: glossary.contentPackId,
    source: 'glossary+lessons',
    count: cards.length,
    skipped,
    cards,
  };

  fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8');
  console.log(`Cloze bank built: ${cards.length} cards (${skipped} terms skipped — no usable sentence).`);
  console.log(`→ ${outPath}`);
}

main();
