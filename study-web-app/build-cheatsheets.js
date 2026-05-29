// Builds a one-page cheat sheet per book section.
// Pulls H2/H3, key bullets, glossary terms, and system comparisons into a dense reference.
const fs = require('fs');
const path = require('path');
const BOOK = require('./book-config.js');

const contentDir = path.join(__dirname, 'content');
const outPath = path.join(__dirname, 'cheatsheets.json');

function readFile(p) {
  return fs.readFileSync(p, 'utf8');
}

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

function extractStructure(markdown) {
  // Strip fenced code blocks
  const clean = markdown.replace(/```[\s\S]*?```/g, '');
  const lines = clean.split(/\r?\n/);
  const sections = []; // {heading, level, bullets[]}
  let current = null;

  lines.forEach(line => {
    const h = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (h) {
      if (current) sections.push(current);
      current = { level: h[1].length, heading: cleanInline(h[2]), bullets: [], paragraphs: [] };
      return;
    }
    const bullet = /^\s*[-*]\s+(.+)$/.exec(line);
    if (bullet && current) {
      current.bullets.push(cleanInline(bullet[1]));
      return;
    }
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('|') && !trimmed.startsWith('---') && !trimmed.startsWith('#') && current) {
      current.paragraphs.push(cleanInline(trimmed));
    }
  });
  if (current) sections.push(current);
  return sections;
}

function topBullets(structure, limit = 5) {
  const all = [];
  structure.forEach(sec => {
    sec.bullets.forEach(b => {
      if (b.length >= 12 && b.length <= 180) all.push({ heading: sec.heading, text: b });
    });
  });
  // Prefer earlier bullets; deduplicate by first 30 chars
  const seen = new Set();
  const picked = [];
  for (const item of all) {
    const key = item.text.slice(0, 30);
    if (seen.has(key)) continue;
    seen.add(key);
    picked.push(item);
    if (picked.length >= limit) break;
  }
  return picked;
}

function firstParagraph(structure) {
  for (const sec of structure) {
    const p = sec.paragraphs.find(par => par.length >= 50);
    if (p) return p.length > 220 ? p.slice(0, 217) + '...' : p;
  }
  return '';
}

function lessonStructure(file) {
  const abs = path.join(contentDir, file.path);
  if (!fs.existsSync(abs)) return null;
  return extractStructure(readFile(abs));
}

function loadGlossary() {
  const p = path.join(__dirname, 'glossary.json');
  if (!fs.existsSync(p)) return [];
  return JSON.parse(readFile(p)).terms || [];
}

function loadComparisons() {
  const p = path.join(__dirname, 'system-comparisons.json');
  if (!fs.existsSync(p)) return [];
  return JSON.parse(readFile(p)).tables || [];
}

function sectionGlossary(section, glossary) {
  // Heuristic: pull terms whose definition or aliases appear in section's lesson texts.
  const lessonTexts = section.files
    .map(f => {
      const abs = path.join(contentDir, f.path);
      return fs.existsSync(abs) ? readFile(abs) : '';
    })
    .join('\n')
    .toLowerCase();

  const picked = [];
  const seen = new Set();
  glossary.forEach(t => {
    const variants = [t.english, t.arabic, ...(t.aliases || [])]
      .map(v => String(v || '').trim().toLowerCase())
      .filter(v => v.length >= 3);
    const matched = variants.some(v => lessonTexts.includes(v));
    if (matched && !seen.has(t.id)) {
      seen.add(t.id);
      picked.push({
        id: t.id,
        ar: t.arabic,
        en: t.english,
        def: t.definition ? (t.definition.length > 100 ? t.definition.slice(0, 97) + '...' : t.definition) : '',
      });
    }
  });
  return picked.slice(0, 18);
}

function sectionComparisons(section, allComparisons) {
  const fileIds = new Set(section.files.map(f => f.id));
  const rows = [];
  allComparisons.forEach(table => {
    if (!fileIds.has(table.sourceId)) return;
    (table.rows || []).forEach(r => {
      rows.push({
        concept: r.concept,
        dynamics: r.dynamics,
        oracle: r.oracle,
        sap: r.sap,
      });
    });
  });
  return rows.slice(0, 12);
}

function buildSheet(section, glossary, comparisons) {
  const lessons = section.files
    .filter(f => f.trackable && (f.type === 'lesson' || !f.type))
    .map(file => {
      const struct = lessonStructure(file);
      if (!struct) return null;
      return {
        id: file.id,
        title: file.title,
        path: file.path,
        summary: firstParagraph(struct),
        keyPoints: topBullets(struct, 4),
        subheadings: struct
          .filter(s => s.level <= 3 && s.heading.length < 80)
          .slice(0, 6)
          .map(s => s.heading),
      };
    })
    .filter(Boolean);

  return {
    sectionId: section.id,
    title: section.title,
    badge: section.badge || null,
    color: section.color || null,
    lessonCount: lessons.length,
    lessons,
    terms: sectionGlossary(section, glossary),
    comparisons: sectionComparisons(section, comparisons),
  };
}

function main() {
  const glossary = loadGlossary();
  const comparisons = loadComparisons();
  const sheets = BOOK.sections
    .filter(section => section.files.some(f => f.trackable && (f.type === 'lesson' || !f.type)))
    .map(section => buildSheet(section, glossary, comparisons))
    .filter(s => s.lessonCount > 0);

  const output = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    domainId: 'erp-production',
    contentPackId: 'erp-production-v1',
    count: sheets.length,
    sheets,
  };

  fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8');
  console.log(`Cheat sheets built: ${sheets.length} sections (${sheets.reduce((s, x) => s + x.lessonCount, 0)} lessons total).`);
  console.log(`→ ${outPath}`);
}

main();
