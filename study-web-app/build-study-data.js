// Generates study data files from book-config.js and Markdown content.
const fs = require('fs');
const path = require('path');
const BOOK = require('./book-config.js');

const contentDir = path.join(__dirname, 'content');
const outFiles = {
  contentIndex: path.join(__dirname, 'content-index.json'),
  studyMetadata: path.join(__dirname, 'study-metadata.json'),
  domainConfig: path.join(__dirname, 'domain-config.json'),
  glossary: path.join(__dirname, 'glossary.json'),
  flashcards: path.join(__dirname, 'flashcards.json'),
  quizBank: path.join(__dirname, 'quiz-bank.json'),
  systemComparisons: path.join(__dirname, 'system-comparisons.json'),
  interviewBank: path.join(__dirname, 'interview-bank.json'),
};

const schemaVersion = 1;
const domainId = 'erp-production';
const contentPackId = 'erp-production-v1';
const readingWordsPerMinute = 170;

function readMarkdown(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function cleanMarkdown(text) {
  return text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#>*_\-|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function wordCount(text) {
  const clean = cleanMarkdown(text);
  if (!clean) return 0;
  return clean.split(/\s+/).filter(Boolean).length;
}

function readingMinutes(text) {
  return Math.max(1, Math.ceil(wordCount(text) / readingWordsPerMinute));
}

function extractHeadings(text) {
  const headings = [];
  const lines = text.split(/\r?\n/);

  lines.forEach(line => {
    const match = /^(#{1,3})\s+(.+?)\s*$/.exec(line);
    if (!match) return;
    const level = match[1].length;
    const title = match[2].replace(/\s+#+$/, '').trim();
    if (!title) return;
    headings.push({
      id: `h-${headings.length + 1}`,
      level,
      title,
    });
  });

  return headings;
}

function extractSummary(text) {
  const lines = text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#') && !line.startsWith('|') && !line.startsWith('---'));

  const firstParagraph = lines.find(line => cleanMarkdown(line).length >= 40) || lines[0] || '';
  const clean = cleanMarkdown(firstParagraph);
  return clean.length > 180 ? `${clean.slice(0, 177).trim()}...` : clean;
}

function inferDocType(file) {
  const source = `${file.type || ''} ${file.title || ''} ${file.path || ''}`;
  const title = file.title || '';

  if (file.type) return file.type;
  if (/^(اختبار|الاختبار)\b|^(test|exam)\b/i.test(title)) return 'test';
  if (/الدرس|lesson/i.test(source)) return 'lesson';
  if (/قاموس|glossary/i.test(source)) return 'glossary';
  if (/تمارين|تمرين|سيناريو|case|exercise/i.test(source)) return 'exercise';
  if (/مرجع|خريطة|قائمة|دليل|reference|guide/i.test(source)) return 'reference';
  if (/مدخل|مقدمة|intro/i.test(source)) return 'intro';

  return 'document';
}

function inferSkills(file, text) {
  const source = `${file.title || ''} ${file.path || ''} ${text || ''}`.toLowerCase();
  const skills = [];
  const rules = [
    ['erp-production-core', /production|انتاج|الإنتاج|الانتاج|تصنيع/],
    ['master-data', /master data|bom|formula|route|work definition|البيانات|بنية المنتج|طريقة التصنيع/],
    ['production-execution', /production order|material issue|raf|goods receipt|امر الانتاج|الصرف|الاستلام|التنفيذ/],
    ['costing-wip', /wip|cost|variance|تكلفة|التكلفة|انحراف|انحرافات/],
    ['quality-planning', /quality|mrp|planning|الجودة|التخطيط/],
    ['consulting-readiness', /discovery|gap|uat|go-live|consultant|استشارات|استلام|جاهزية/],
  ];

  rules.forEach(([skill, pattern]) => {
    if (pattern.test(source)) skills.push(skill);
  });

  return [...new Set(skills)];
}

function inferDifficulty(file, docType) {
  const source = `${file.id || ''} ${file.path || ''}`;
  if (docType === 'test' || /50_|60_|90_/.test(source)) return 'advanced';
  if (/30_|40_/.test(source)) return 'intermediate';
  return 'foundational';
}

function parseMarkdownTableRow(line) {
  if (!line.trim().startsWith('|')) return null;
  const cells = line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map(cell => cell.trim());

  return cells.length >= 3 ? cells : null;
}

function isSeparatorRow(cells) {
  return cells.every(cell => /^:?-{3,}:?$/.test(cell));
}

function normalizeHeader(value) {
  return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function extractSystemComparisons(allFiles) {
  const tables = [];

  allFiles.forEach(file => {
    const filePath = path.join(contentDir, ...file.path.split('/'));
    let text = '';
    try {
      text = readMarkdown(filePath);
    } catch {
      return;
    }

    const lines = text.split(/\r?\n/);
    let currentHeading = file.title;
    let tableIndex = 0;

    for (let i = 0; i < lines.length; i += 1) {
      const heading = /^(#{1,3})\s+(.+?)\s*$/.exec(lines[i]);
      if (heading) {
        currentHeading = heading[2].replace(/\s+#+$/, '').trim();
        continue;
      }

      const header = parseMarkdownTableRow(lines[i]);
      const separator = parseMarkdownTableRow(lines[i + 1] || '');
      if (!header || !separator || !isSeparatorRow(separator)) continue;

      const normalized = header.map(normalizeHeader);
      const dynamicsIndex = normalized.findIndex(cell => cell.includes('dynamics'));
      const oracleIndex = normalized.findIndex(cell => cell.includes('oracle'));
      const sapIndex = normalized.findIndex(cell => cell.includes('sap'));
      if (dynamicsIndex < 0 || oracleIndex < 0 || sapIndex < 0) continue;

      const conceptIndex = header.findIndex((_, idx) => ![dynamicsIndex, oracleIndex, sapIndex].includes(idx));
      const noteIndex = header.findIndex((cell, idx) => {
        if ([conceptIndex, dynamicsIndex, oracleIndex, sapIndex].includes(idx)) return false;
        return /note|ملاحظة|الملاحظة/i.test(cell);
      });

      const rows = [];
      let rowIndex = 0;
      let j = i + 2;
      while (j < lines.length) {
        const row = parseMarkdownTableRow(lines[j]);
        if (!row || isSeparatorRow(row)) break;

        const concept = row[conceptIndex] || '';
        const dynamics = row[dynamicsIndex] || '';
        const oracle = row[oracleIndex] || '';
        const sap = row[sapIndex] || '';
        if (concept && (dynamics || oracle || sap)) {
          rowIndex += 1;
          rows.push({
            id: `cmp-${file.id}-${tableIndex + 1}-${rowIndex}`,
            concept,
            dynamics,
            oracle,
            sap,
            note: noteIndex >= 0 ? row[noteIndex] || '' : '',
          });
        }
        j += 1;
      }

      if (rows.length) {
        tableIndex += 1;
        tables.push({
          id: `cmp-${file.id}-${tableIndex}`,
          title: currentHeading,
          sourceId: file.id,
          sourceTitle: file.title,
          sourcePath: file.path,
          sectionId: file.sectionId,
          sectionTitle: file.sectionTitle,
          rowCount: rows.length,
          rows,
        });
      }

      i = Math.max(i, j - 1);
    }
  });

  return tables;
}

function buildFlashcardsFromGlossary() {
  const glossaryItem = BOOK.sections
    .flatMap(section => section.files.map(file => ({ ...file, sectionId: section.id, sectionTitle: section.title })))
    .find(file => /glossary|قاموس|القاموس/i.test(`${file.title} ${file.path}`));

  if (!glossaryItem) return [];

  const filePath = path.join(contentDir, ...glossaryItem.path.split('/'));
  let text = '';
  try {
    text = readMarkdown(filePath);
  } catch {
    return [];
  }

  const cards = [];
  let currentCategory = 'Glossary';
  const lines = text.split(/\r?\n/);

  lines.forEach(line => {
    const heading = /^##\s+(.+?)\s*$/.exec(line);
    if (heading) {
      currentCategory = heading[1].trim();
      return;
    }

    const cells = parseMarkdownTableRow(line);
    if (!cells || isSeparatorRow(cells)) return;
    const [arabic, english, definition] = cells;
    if (/العربية|english|المعنى/i.test(`${arabic} ${english} ${definition}`)) return;
    if (!arabic || !english || !definition) return;

    const order = cards.length + 1;
    cards.push({
      id: `fc-${String(order).padStart(3, '0')}`,
      sourceId: glossaryItem.id,
      sourcePath: glossaryItem.path,
      category: currentCategory,
      type: 'term',
      front: arabic,
      back: english,
      hint: definition,
      direction: 'ar-to-en',
      difficulty: 'foundational',
      tags: ['glossary', 'terminology'],
    });
  });

  return cards;
}

function buildGlossaryFromCards(cards) {
  return cards.map(card => ({
    id: card.id.replace(/^fc-/, 'gl-'),
    sourceId: card.sourceId,
    sourcePath: card.sourcePath,
    category: card.category,
    arabic: card.front,
    english: card.back,
    definition: card.hint,
    aliases: [card.front, card.back].filter(Boolean),
    tags: card.tags || ['glossary', 'terminology'],
  }));
}

function buildQuizBank(allFiles) {
  const tests = allFiles.filter(file => file.docType === 'test');
  const quizzes = [];

  tests.forEach(test => {
    const filePath = path.join(contentDir, ...test.path.split('/'));
    let text = '';
    try {
      text = readMarkdown(filePath);
    } catch {
      return;
    }

    const questions = extractQuizQuestions(text, test);
    if (!questions.length) return;

    quizzes.push({
      id: `quiz-${test.id}`,
      sourceId: test.id,
      title: test.title,
      sourcePath: test.path,
      sectionId: test.sectionId,
      sectionTitle: test.sectionTitle,
      questionCount: questions.length,
      questions,
    });
  });

  return quizzes;
}

function buildInterviewBank(quizzes, comparisons, allFiles) {
  const questions = [];
  const add = item => {
    questions.push({
      id: `int-${String(questions.length + 1).padStart(3, '0')}`,
      ...item,
    });
  };

  quizzes.forEach(quiz => {
    (quiz.questions || []).forEach(question => {
      if (!question.prompt || question.prompt.length < 18) return;
      add({
        source: 'quiz',
        sourceId: quiz.sourceId,
        sourceTitle: quiz.title,
        sourcePath: quiz.sourcePath,
        sectionId: quiz.sectionId,
        sectionTitle: quiz.sectionTitle,
        type: question.type === 'scenario' ? 'scenario' : 'concept',
        difficulty: question.difficulty || 'intermediate',
        prompt: question.prompt,
        followUp: 'اربط الإجابة بمنطق دورة الإنتاج، ثم اذكر أثرها على البيانات أو الرقابة أو التكلفة.',
        rubric: [
          'شرح المفهوم بدون حفظ لفظي',
          'ربط الإجابة بسيناريو ERP واقعي',
          'تمييز الفجوة الحقيقية عن ضعف البيانات أو التدريب',
        ],
      });
    });
  });

  comparisons.forEach(table => {
    (table.rows || []).forEach(row => {
      add({
        source: 'comparison',
        sourceId: table.sourceId,
        sourceTitle: table.sourceTitle,
        sourcePath: table.sourcePath,
        sectionId: table.sectionId,
        sectionTitle: table.sectionTitle,
        type: 'system-comparison',
        difficulty: 'intermediate',
        prompt: `قارن مفهوم "${row.concept}" بين Dynamics 365 وOracle Fusion Cloud وSAP S/4HANA.`,
        followUp: 'لا تكتف بالأسماء. اشرح أين يتشابه المنطق وأين يختلف التعبير النظامي.',
        rubric: [
          `Dynamics 365: ${row.dynamics || '-'}`,
          `Oracle Fusion Cloud: ${row.oracle || '-'}`,
          `SAP S/4HANA: ${row.sap || '-'}`,
        ],
      });
    });
  });

  allFiles
    .filter(file => file.docType === 'lesson' && file.trackable)
    .slice(0, 20)
    .forEach(file => {
      add({
        source: 'lesson',
        sourceId: file.id,
        sourceTitle: file.title,
        sourcePath: file.path,
        sectionId: file.sectionId,
        sectionTitle: file.sectionTitle,
        type: 'consultant-explanation',
        difficulty: file.difficulty || 'foundational',
        prompt: `اشرح درس "${file.title}" كما لو كنت في مقابلة Functional Consultant.`,
        followUp: 'ابدأ بالمفهوم، ثم مثال تطبيقي، ثم سؤال تحقق تسأله للعميل.',
        rubric: [
          'وضوح الفكرة الأساسية',
          'مثال عملي من الإنتاج أو التصنيع',
          'قدرة على تحويل الفهم إلى سؤال Discovery',
        ],
      });
    });

  return questions;
}

function extractQuizQuestions(text, test) {
  const questions = [];
  let currentSection = 'General';
  const lines = text.split(/\r?\n/);

  lines.forEach(line => {
    const h2 = /^##\s+(.+?)\s*$/.exec(line);
    if (h2) {
      currentSection = h2[1].trim();
      return;
    }

    const h3 = /^###\s+(.+?)\s*$/.exec(line);
    if (!h3) return;

    const prompt = h3[1].trim();
    if (!isQuizPrompt(prompt)) return;

    const id = `q-${test.id}-${String(questions.length + 1).padStart(2, '0')}`;
    questions.push({
      id,
      sourceId: test.id,
      sourcePath: test.path,
      section: currentSection,
      type: inferQuestionType(prompt, currentSection),
      prompt,
      expectedAnswer: '',
      explanation: '',
      skills: test.skills || [],
      difficulty: test.difficulty || 'intermediate',
    });
  });

  return questions;
}

function isQuizPrompt(prompt) {
  if (!prompt) return false;
  if (/^(المطلوب|التقييم|معيار|كيف تستخدم|الغرض|توزيع)/i.test(prompt)) return false;
  return /\?|؟|اشرح|اذكر|اكتب|لماذا|ما |متى|كيف|هل |إذا|عميل|يمكن|بمجرد|كل |أفضل|كثرة/.test(prompt);
}

function inferQuestionType(prompt, section) {
  if (/صح أم خطأ|true|false/i.test(section)) return 'true-false-explain';
  if (/سيناريو|عميل|إذا|case|diagnosis/i.test(`${section} ${prompt}`)) return 'scenario';
  return 'short-answer';
}

function build() {
  const seenIds = new Set();
  const errors = [];
  const allFiles = [];
  const studyLessons = {};

  const sections = BOOK.sections.map((section, sectionIndex) => {
    const files = section.files.map((file, fileIndex) => {
      if (seenIds.has(file.id)) errors.push(`Duplicate file id: ${file.id}`);
      seenIds.add(file.id);

      const filePath = path.join(contentDir, ...file.path.split('/'));
      let text = '';
      let exists = false;

      try {
        text = readMarkdown(filePath);
        exists = true;
      } catch {
        errors.push(`Missing content file for ${file.id}: ${file.path}`);
      }

      const headings = exists ? extractHeadings(text) : [];
      const docType = inferDocType(file);
      const item = {
        id: file.id,
        title: file.title,
        path: file.path,
        sectionId: section.id,
        sectionTitle: section.title,
        sectionOrder: sectionIndex + 1,
        order: fileIndex + 1,
        docType,
        trackable: !!file.trackable,
        readingMinutes: exists ? readingMinutes(text) : 0,
        wordCount: exists ? wordCount(text) : 0,
        summary: exists ? extractSummary(text) : '',
        headings,
        skills: exists ? inferSkills(file, text) : [],
        difficulty: inferDifficulty(file, docType),
      };

      allFiles.push(item);

      if (item.trackable || docType === 'lesson' || docType === 'test') {
        studyLessons[item.id] = {
          id: item.id,
          title: item.title,
          docType: item.docType,
          sourcePath: item.path,
          sectionId: item.sectionId,
          skills: item.skills,
          difficulty: item.difficulty,
          prerequisites: [],
          preReadingPrompts: buildPreReadingPrompts(item),
          recallPrompts: buildRecallPrompts(item),
          reviewWeight: item.docType === 'test' ? 1.25 : 1,
        };
      }

      return item;
    });

    return {
      id: section.id,
      title: section.title,
      badge: section.badge || null,
      color: section.color || null,
      order: sectionIndex + 1,
      files,
    };
  });

  const generatedAt = new Date().toISOString();
  const contentIndex = {
    schemaVersion,
    generatedAt,
    domainId,
    contentPackId,
    title: BOOK.title,
    contentBase: BOOK.contentBase || 'content/',
    counts: {
      sections: sections.length,
      files: allFiles.length,
      trackable: allFiles.filter(file => file.trackable).length,
      lessons: allFiles.filter(file => file.docType === 'lesson').length,
      tests: allFiles.filter(file => file.docType === 'test').length,
    },
    sections,
  };

  const studyMetadata = {
    schemaVersion,
    generatedAt,
    domainId,
    contentPackId,
    lessons: studyLessons,
  };

  const generatedCards = buildFlashcardsFromGlossary();
  const generatedGlossary = buildGlossaryFromCards(generatedCards);
  const glossary = {
    schemaVersion,
    generatedAt,
    domainId,
    contentPackId,
    source: 'glossary',
    count: generatedGlossary.length,
    terms: generatedGlossary,
  };

  const generatedQuizzes = buildQuizBank(allFiles);
  const generatedComparisons = extractSystemComparisons(allFiles);
  const generatedInterviewQuestions = buildInterviewBank(generatedQuizzes, generatedComparisons, allFiles);
  const flashcards = {
    schemaVersion,
    generatedAt,
    domainId,
    contentPackId,
    source: 'glossary',
    count: generatedCards.length,
    cards: generatedCards,
  };

  const quizBank = {
    schemaVersion,
    generatedAt,
    domainId,
    contentPackId,
    source: 'test-markdown-headings',
    count: generatedQuizzes.reduce((sum, quiz) => sum + quiz.questionCount, 0),
    quizzes: generatedQuizzes,
  };

  const systemComparisons = {
    schemaVersion,
    generatedAt,
    domainId,
    contentPackId,
    source: 'markdown-comparison-tables',
    systems: ['Dynamics 365', 'Oracle Fusion Cloud', 'SAP S/4HANA'],
    count: generatedComparisons.reduce((sum, table) => sum + table.rowCount, 0),
    tables: generatedComparisons,
  };

  const interviewBank = {
    schemaVersion,
    generatedAt,
    domainId,
    contentPackId,
    source: 'quiz-comparison-lesson-prompts',
    count: generatedInterviewQuestions.length,
    questions: generatedInterviewQuestions,
  };

  const domainConfig = {
    schemaVersion,
    domainId,
    contentPackId,
    appTitle: BOOK.title,
    trackTitle: 'ERP Production and Manufacturing',
    locale: 'ar',
    direction: 'rtl',
    storagePrefix: `${domainId}.${contentPackId}`,
    readingWordsPerMinute,
    features: {
      readingToc: true,
      readingProgress: true,
      fontControls: true,
      focusMode: true,
      glossaryTooltips: true,
      systemComparison: true,
      mockInterview: true,
      selfRating: false,
      reviewQueue: false,
      flashcards: true,
      quizzes: true,
    },
    terminology: {
      lesson: 'درس',
      test: 'اختبار',
      review: 'مراجعة',
      completed: 'منتهي',
      inProgress: 'قيد الدراسة',
    },
  };

  writeJson(outFiles.contentIndex, contentIndex);
  writeJson(outFiles.studyMetadata, studyMetadata);
  writeJson(outFiles.domainConfig, domainConfig);
  writeJson(outFiles.glossary, glossary);
  writeJson(outFiles.flashcards, flashcards);
  writeJson(outFiles.quizBank, quizBank);
  writeJson(outFiles.systemComparisons, systemComparisons);
  writeJson(outFiles.interviewBank, interviewBank);

  if (errors.length) {
    console.error('\nStudy data validation failed:');
    errors.forEach(error => console.error(`  - ${error}`));
    process.exitCode = 1;
    return;
  }

  console.log(`Study data: ${contentIndex.counts.files} files, ${contentIndex.counts.trackable} trackable, ${contentIndex.counts.lessons} lessons, ${contentIndex.counts.tests} tests, ${flashcards.count} cards, ${quizBank.count} questions, ${systemComparisons.count} comparisons, ${interviewBank.count} interview prompts`);
}

function buildPreReadingPrompts(item) {
  if (item.docType === 'test') {
    return ['ما المفاهيم التي يجب أن أراجعها قبل محاولة هذا الاختبار؟'];
  }

  if (item.docType === 'lesson') {
    return [`ما الذي أتوقع أن أتعلمه من: ${item.title}؟`];
  }

  return [];
}

function buildRecallPrompts(item) {
  if (item.docType === 'test') {
    return ['ما الخطأ أو التردد الذي ظهر أثناء الاختبار؟'];
  }

  if (item.docType === 'lesson') {
    return [
      'ما أهم فكرة أستطيع شرحها من هذا الدرس؟',
      'ما المصطلح الإنجليزي أو المهني الذي يجب تثبيته؟',
    ];
  }

  return [];
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  console.log(`  wrote ${path.basename(filePath)}`);
}

build();
