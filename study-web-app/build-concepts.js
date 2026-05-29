// Builds concepts.json: atoms (glossary terms) + edges (co-occurrence in lessons).
// Edge weight = number of sentences where both terms appear together.
const fs = require('fs');
const path = require('path');
const BOOK = require('./book-config.js');

const contentDir = path.join(__dirname, 'content');
const outPath = path.join(__dirname, 'concepts.json');

function stripBlocks(md) {
  return md
    .replace(/```[\s\S]*?```/g, '\n')
    .split(/\r?\n/)
    .filter(l => !l.trim().startsWith('|') && !l.trim().startsWith('---'))
    .join('\n');
}

function splitSentences(text) {
  return text
    .split(/(?<=[\.\!\?؟])\s+|\n+/)
    .map(s => s.replace(/[#>*_`]/g, ' ').replace(/\s+/g, ' ').trim())
    .filter(s => s.length >= 15);
}

function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function loadGlossary() {
  const p = path.join(__dirname, 'glossary.json');
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, 'utf8')).terms || [];
}

function loadAllSentences() {
  const sentences = [];
  BOOK.sections.forEach(section => {
    section.files.forEach(file => {
      const abs = path.join(contentDir, file.path);
      if (!fs.existsSync(abs)) return;
      // Skip glossary files themselves (their sentences are just definitions)
      if (/قاموس|glossary/i.test(file.title)) return;
      const text = stripBlocks(fs.readFileSync(abs, 'utf8'));
      splitSentences(text).forEach(s => sentences.push({
        sentence: s,
        sourceId: file.id,
        sectionId: section.id,
      }));
    });
  });
  return sentences;
}

function buildAtoms(glossary) {
  return glossary.map(t => ({
    id: t.id,
    arabic: t.arabic,
    english: t.english,
    category: t.category || '',
    definition: t.definition || '',
    sourceId: t.sourceId,
  }));
}

function buildVariantMap(glossary) {
  // Map term id → regex matching any variant
  return new Map(glossary.map(t => {
    const variants = [t.english, t.arabic, ...(t.aliases || [])]
      .map(v => String(v || '').trim())
      .filter(v => v.length >= 3);
    const uniq = [...new Set(variants)];
    const pattern = uniq.length
      ? new RegExp(`(^|[^\\p{L}])(?:${uniq.map(escapeRe).join('|')})([^\\p{L}]|$)`, 'iu')
      : null;
    return [t.id, pattern];
  }));
}

function main() {
  const glossary = loadGlossary();
  const atoms = buildAtoms(glossary);
  const patterns = buildVariantMap(glossary);
  const sentences = loadAllSentences();
  console.log(`Scanning ${sentences.length} sentences across ${atoms.length} atoms...`);

  const edgeMap = new Map(); // "from|to" → {weight, sources:Set}
  const presenceCount = new Map(); // atomId → count of sentences containing it

  sentences.forEach(({ sentence, sourceId }) => {
    const present = [];
    atoms.forEach(atom => {
      const re = patterns.get(atom.id);
      if (re && re.test(sentence)) present.push(atom.id);
    });
    present.forEach(id => presenceCount.set(id, (presenceCount.get(id) || 0) + 1));
    for (let i = 0; i < present.length; i++) {
      for (let j = i + 1; j < present.length; j++) {
        const [a, b] = [present[i], present[j]].sort();
        const key = `${a}|${b}`;
        const existing = edgeMap.get(key) || { from: a, to: b, weight: 0, sources: new Set() };
        existing.weight += 1;
        existing.sources.add(sourceId);
        edgeMap.set(key, existing);
      }
    }
  });

  const edges = [...edgeMap.values()]
    .filter(e => e.weight >= 2)
    .map(e => ({
      from: e.from,
      to: e.to,
      weight: e.weight,
      sources: [...e.sources].slice(0, 5),
    }))
    .sort((a, b) => b.weight - a.weight);

  // Annotate atoms with overall presence count (for sizing)
  const annotatedAtoms = atoms.map(a => ({
    ...a,
    mentions: presenceCount.get(a.id) || 0,
  }));

  const output = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    domainId: 'erp-production',
    contentPackId: 'erp-production-v1',
    atomCount: annotatedAtoms.length,
    edgeCount: edges.length,
    atoms: annotatedAtoms,
    edges,
  };

  fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8');
  console.log(`Concepts built: ${annotatedAtoms.length} atoms, ${edges.length} edges (weight ≥ 2).`);
  console.log(`→ ${outPath}`);
}

main();
