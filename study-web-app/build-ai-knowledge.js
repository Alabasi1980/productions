const fs = require('fs');
const path = require('path');

const root = __dirname;

function readJson(fileName) {
  return JSON.parse(fs.readFileSync(path.join(root, fileName), 'utf8'));
}

const contentBundle = readJson('content-bundle.json');
const contentIndex = readJson('content-index.json');
const studyMetadata = readJson('study-metadata.json');
const domainConfig = readJson('domain-config.json');
const glossary = readJson('glossary.json');
const flashcards = readJson('flashcards.json');
const clozeBank = readJson('cloze-bank.json');
const quizBank = readJson('quiz-bank.json');
const systemComparisons = readJson('system-comparisons.json');
const interviewBank = readJson('interview-bank.json');
const concepts = readJson('concepts.json');
const cheatSheets = readJson('cheatsheets.json');
const scenarios = readJson('scenarios.json');

const output = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  app: {
    domainId: domainConfig.domainId || 'erp-production',
    title: domainConfig.appTitle || 'منهج موديول الإنتاج في ERP',
  },
  summary: {
    contentFiles: Object.keys(contentBundle).length,
    glossaryTerms: glossary.terms?.length || 0,
    flashcards: (flashcards.cards?.length || 0) + (clozeBank.cards?.length || 0),
    quizzes: quizBank.quizzes?.length || 0,
    scenarios: scenarios.scenarios?.length || 0,
    interviewQuestions: interviewBank.questions?.length || 0,
  },
  knowledge: {
    contentIndex,
    contentBundle,
    studyMetadata,
    glossary,
    flashcards,
    clozeBank,
    quizBank,
    systemComparisons,
    interviewBank,
    concepts,
    cheatSheets,
    scenarios,
  },
};

const outPath = path.join(root, 'ai-knowledge-base.json');
fs.writeFileSync(outPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
console.log(`AI knowledge bundle built: ${output.summary.contentFiles} files, ${output.summary.glossaryTerms} glossary terms.`);
console.log(`→ ${outPath}`);