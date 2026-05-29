const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const workspaceRoot = __dirname;
const manifestPath = path.join(workspaceRoot, 'book-manifest.json');
const printCssPath = path.join(workspaceRoot, 'print.css');

const numberPrefixPattern = /^(\d+)_/;
const quickReviewHeadingPattern = /^##\s+(?:المراجعة\s+السريعة(?:\s+Quick\s+Review)?|Quick\s+Review(?:\s+المراجعة\s+السريعة)?)\s*$/i;
const removableSectionHeadingPattern = /^##\s+(?:(?:المراجعة\s+السريعة(?:\s+Quick\s+Review)?)|(?:Quick\s+Review(?:\s+المراجعة\s+السريعة)?)|(?:مهمة\s+الدرس(?:\s+Study\s+Task)?)|(?:Study\s+Task(?:\s+مهمة\s+الدرس)?)|(?:الواجب(?:\s+Homework)?)|(?:Homework(?:\s+الواجب)?)|(?:الاختبار(?:\s+Test)?)|(?:Test(?:\s+الاختبار)?))\s*$/i;
const genericSummaryHeadingPattern = /^(هدف هذا|الهدف من هذا|الهدف العام|الهدف المهني النهائي|ماذا ستتعلم هنا|لماذا هذا الدرس مهم|هذا الجزء|هذا الملف|هذا الدليل)/;
const subjectHeadingIgnorePattern = /^(الهدف|لماذا|ماذا ستتعلم|الأخطاء الشائعة|منظور المستشار|كيف يظهر|المراجعة السريعة|مهمة الدرس|قاعدة دراسة|طريقة الدراسة|حالة البناء|قاعدة مهمة|دروس هذا الجزء|النتيجة المطلوبة|كيف يبدو النظام|المصادر المعتمدة|قاعدة العمل|الهدف من هذا الملف|الهدف من هذا المجلد)/;

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function readOptionalJson(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return {};
  return readJson(filePath);
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyFileIfNeeded(sourcePath, destinationPath) {
  if (path.resolve(sourcePath) === path.resolve(destinationPath)) return;
  ensureDir(path.dirname(destinationPath));
  fs.copyFileSync(sourcePath, destinationPath);
}

function formatTitleFromName(name) {
  return name
    .replace(/\.md$/i, '')
    .replace(numberPrefixPattern, '')
    .replace(/_/g, ' ')
    .trim();
}

function splitForSort(name) {
  const match = name.match(numberPrefixPattern);
  return {
    index: match ? Number(match[1]) : Number.MAX_SAFE_INTEGER,
    label: name,
  };
}

function compareNames(left, right) {
  const a = splitForSort(left);
  const b = splitForSort(right);
  if (a.index !== b.index) return a.index - b.index;
  return a.label.localeCompare(b.label, 'ar');
}

function walkMarkdownFiles(absPath, relPath = '') {
  const stats = fs.statSync(absPath);
  if (stats.isFile()) {
    return path.extname(absPath).toLowerCase() === '.md' ? [relPath.replace(/\\/g, '/')] : [];
  }

  const entries = fs.readdirSync(absPath).filter(name => !name.startsWith('.')).sort(compareNames);
  return entries.flatMap(entry => {
    const childAbs = path.join(absPath, entry);
    const childRel = relPath ? `${relPath}/${entry}` : entry;
    return walkMarkdownFiles(childAbs, childRel);
  });
}

function globToRegExp(pattern) {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '::DOUBLE_STAR::')
    .replace(/\*/g, '[^/]*')
    .replace(/::DOUBLE_STAR::/g, '.*');
  return new RegExp(`^${escaped}$`, 'u');
}

function matchesAnyPattern(relativePath, patterns = []) {
  return patterns.some(pattern => globToRegExp(pattern).test(relativePath));
}

function resolveSectionFiles(sourceRoot, section) {
  const all = section.includes.flatMap(includePath => {
    const normalized = includePath.replace(/\\/g, '/');
    const absolute = path.resolve(sourceRoot, normalized);
    if (!fs.existsSync(absolute)) {
      throw new Error(`Missing include path: ${normalized}`);
    }
    const stats = fs.statSync(absolute);
    if (stats.isFile()) return [normalized];
    return walkMarkdownFiles(absolute, normalized);
  });

  const unique = [...new Set(all)].sort((a, b) => a.localeCompare(b, 'ar', { numeric: true }));
  return unique.filter(relativePath => !matchesAnyPattern(relativePath, section.exclude || []));
}

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    || 'section';
}

function cleanMarkdownText(text) {
  return String(text || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#>*_|-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractTitle(markdown, fallbackTitle) {
  const match = markdown.match(/^#\s+(.+?)\s*$/m);
  return match ? match[1].trim() : fallbackTitle;
}

function extractHeadings(markdown) {
  const headings = [];
  markdown.split(/\r?\n/).forEach(line => {
    const match = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
    if (!match) return;
    headings.push({
      level: match[1].length,
      title: match[2].trim(),
    });
  });
  return headings;
}

function extractQuickReview(markdown) {
  const lines = markdown.split(/\r?\n/);
  const startIndex = lines.findIndex(line => quickReviewHeadingPattern.test(line.trim()));
  if (startIndex < 0) return '';

  const buffer = [];
  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^##\s+/.test(line.trim())) break;
    buffer.push(line);
  }

  return buffer.join('\n').trim();
}

function normalizeHeadingTitle(title) {
  return cleanMarkdownText(title).toLowerCase();
}

function stripMarkdownSections(markdown, headingsToRemove = []) {
  if (!headingsToRemove.length) return markdown;

  const headingSet = new Set(headingsToRemove.map(normalizeHeadingTitle));
  const lines = markdown.split(/\r?\n/);
  const result = [];
  let skipping = false;
  let skipLevel = Number.MAX_SAFE_INTEGER;

  for (const line of lines) {
    const headingMatch = /^(#{2,6})\s+(.+?)\s*$/.exec(line.trim());
    if (headingMatch) {
      const level = headingMatch[1].length;
      const title = normalizeHeadingTitle(headingMatch[2]);

      if (skipping && level <= skipLevel) {
        skipping = false;
        skipLevel = Number.MAX_SAFE_INTEGER;
      }

      if (!skipping && headingSet.has(title)) {
        skipping = true;
        skipLevel = level;
        continue;
      }
    }

    if (!skipping) {
      result.push(line);
    }
  }

  return result.join('\n').trim();
}

function stripSupplementarySections(markdown) {
  const lines = markdown.split(/\r?\n/);
  const result = [];

  let skipping = false;
  for (const line of lines) {
    const trimmed = line.trim();

    if (removableSectionHeadingPattern.test(trimmed)) {
      skipping = true;
      continue;
    }

    if (skipping && /^##\s+/.test(trimmed)) {
      skipping = false;
    }

    if (!skipping) {
      result.push(line);
    }
  }

  return result.join('\n').trim();
}

function stripQuickReviewSection(markdown) {
  const lines = markdown.split(/\r?\n/);
  const result = [];
  let skipping = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (quickReviewHeadingPattern.test(trimmed)) {
      skipping = true;
      continue;
    }

    if (skipping && /^##\s+/.test(trimmed)) {
      skipping = false;
    }

    if (!skipping) {
      result.push(line);
    }
  }

  return result.join('\n').trim();
}

function normalizeSearchText(text) {
  return cleanMarkdownText(text).toLowerCase();
}

function parseMarkdownTableRow(line) {
  return line
    .split('|')
    .slice(1, -1)
    .map(cell => cell.trim());
}

function parseGlossaryEntries(markdown) {
  const lines = markdown.split(/\r?\n/);
  const entries = [];
  let currentHeading = '';

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    const headingMatch = /^##\s+(.+?)\s*$/.exec(line);
    if (headingMatch) {
      currentHeading = headingMatch[1].trim();
      continue;
    }

    if (!line.startsWith('|')) {
      continue;
    }

    const tableLines = [];
    while (index < lines.length && lines[index].trim().startsWith('|')) {
      tableLines.push(lines[index].trim());
      index += 1;
    }
    index -= 1;

    if (tableLines.length < 3) continue;
    if (/^(الهدف من هذا الملف|قاعدة دراسة هذا الملف)$/i.test(currentHeading)) continue;

    for (let rowIndex = 2; rowIndex < tableLines.length; rowIndex += 1) {
      const cells = parseMarkdownTableRow(tableLines[rowIndex]);
      if (cells.length < 3) continue;
      const [arabic, english, meaning] = cells;
      if (!arabic || !english || !meaning) continue;
      entries.push({
        category: currentHeading,
        arabic,
        english,
        meaning,
      });
    }
  }

  return entries;
}

function buildReferenceLabels(references) {
  return references.map(reference => `<a href="#${escapeHtml(reference.anchor)}">ف${escapeHtml(String(reference.chapterNumber))}</a>`).join('، ');
}

function buildGlossaryIndex(entries, chapters) {
  const glossaryChapterSuffix = '05_القاموس_التأسيسي_الثنائي_اللغة.md';

  return entries
    .map(entry => {
      const searchTerms = [entry.arabic, entry.english]
        .map(normalizeSearchText)
        .filter(Boolean);

      const matching = chapters.filter(chapter =>
        searchTerms.some(term => term && chapter.searchableText.includes(term))
      );

      const preferred = matching.filter(chapter => !chapter.relativePath.endsWith(glossaryChapterSuffix));
      const selected = (preferred.length ? preferred : matching)
        .slice(0, 6)
        .map(chapter => ({
          anchor: chapter.anchor,
          chapterNumber: chapter.chapterNumber,
        }));

      return {
        ...entry,
        references: selected,
      };
    })
    .sort((left, right) => left.arabic.localeCompare(right.arabic, 'ar'));
}

function buildSubjectIndex(chapters) {
  const subjectMap = new Map();

  chapters.forEach(chapter => {
    chapter.headings
      .filter(item => item.level === 2)
      .map(item => item.title.trim())
      .filter(title => title && !subjectHeadingIgnorePattern.test(title))
      .forEach(title => {
        const key = normalizeHeadingTitle(title);
        if (!key) return;

        const existing = subjectMap.get(key) || { title, references: [] };
        if (!existing.references.some(reference => reference.anchor === chapter.anchor)) {
          existing.references.push({
            anchor: chapter.anchor,
            chapterNumber: chapter.chapterNumber,
          });
        }
        subjectMap.set(key, existing);
      });
  });

  return [...subjectMap.values()]
    .map(entry => ({
      ...entry,
      references: entry.references.slice(0, 6),
    }))
    .sort((left, right) => left.title.localeCompare(right.title, 'ar'));
}

function normalizeSummaryParagraph(paragraph) {
  const cleaned = cleanMarkdownText(paragraph);
  if (!cleaned) return '';

  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length < 8) return '';

  return cleaned.length > 280 ? `${cleaned.slice(0, 277).trim()}...` : cleaned;
}

function extractFallbackSummary(markdown) {
  const bodyMarkdown = stripQuickReviewSection(stripSupplementarySections(markdown));
  const paragraphs = bodyMarkdown
    .split(/\r?\n\s*\r?\n/)
    .map(normalizeSummaryParagraph)
    .filter(block => block)
    .filter(block => !block.startsWith('الدرس '))
    .filter(block => !block.startsWith('مدخل '))
    .filter(block => !genericSummaryHeadingPattern.test(block));

  if (paragraphs.length > 0) {
    return paragraphs.slice(0, 2);
  }

  const headings = extractHeadings(bodyMarkdown)
    .map(item => item.title)
    .filter(title => title && !quickReviewHeadingPattern.test(`## ${title}`));

  return headings.slice(0, 3).map(title => `يركز هذا الفصل على ${title}.`);
}

function extractSummary(markdown) {
  const quickReview = extractQuickReview(markdown);
  if (quickReview) return marked.parse(quickReview);

  const fallbackParagraphs = extractFallbackSummary(markdown);
  if (!fallbackParagraphs.length) {
    return '<p>لا توجد خلاصة جاهزة لهذا الفصل بعد. يمكن مراجعة العناوين الرئيسية ومراجع الفصل أدناه.</p>';
  }

  return fallbackParagraphs.map(paragraph => `<p>${escapeHtml(paragraph)}</p>`).join('');
}

function applyChapterOverrides(markdown, chapterOverrides = {}) {
  return stripMarkdownSections(markdown, chapterOverrides.removeHeadings || []);
}

function resolveCoverImage(manifest, outputDir) {
  if (!manifest.coverImagePath) return '';

  const sourcePath = path.resolve(workspaceRoot, manifest.coverImagePath);
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Missing cover image: ${manifest.coverImagePath}`);
  }

  const fileName = path.basename(sourcePath);
  const destinationPath = path.join(outputDir, fileName);
  copyFileIfNeeded(sourcePath, destinationPath);
  return `./${fileName}`;
}

function renderReferences(section, chapter) {
  const sources = [
    `المسار الأصلي: ${chapter.relativePath}`,
    `القسم في الكتاب: ${section.title}`,
  ];

  return `
    <section class="chapter-references">
      <h2>مراجع الفصل</h2>
      <ul>
        ${sources.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
      </ul>
      <p class="book-footer-note">يمكن لاحقًا توسيع هذه الكتلة بمراجع تحريرية أكثر تفصيلًا عند إضافة بيانات مرجعية صريحة داخل المصدر.</p>
    </section>
  `;
}

function renderChapterOutline(chapter) {
  const outlineItems = chapter.headings
    .filter(item => item.level === 2)
    .map(item => item.title)
    .slice(0, 6);

  if (!outlineItems.length) return '';

  return `
    <section class="chapter-outline">
      <h2>محاور الفصل</h2>
      <ul>
        ${outlineItems.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
      </ul>
    </section>
  `;
}

function renderChapterNavigation(section, chapter) {
  return `
    <section class="chapter-navigation">
      <a href="#book-toc">العودة إلى فهرس المحتويات</a>
      <a href="#${escapeHtml(section.anchor)}">العودة إلى بداية ${escapeHtml(section.kind === 'appendix' ? 'الملحق' : section.kind === 'front' ? 'المدخل' : 'الجزء')}</a>
      <a href="#book-indexes">الذهاب إلى الفهارس النهائية</a>
    </section>
  `;
}

function renderChapter(section, chapter, chapterNumber) {
  const chapterAnchor = `chapter-${chapterNumber}-${slugify(chapter.title)}`;
  return `
    <article class="chapter" id="${chapterAnchor}">
      <header class="chapter-header">
        <div class="chapter-kicker">${escapeHtml(section.title)}</div>
        <div class="chapter-number">الفصل ${chapter.chapterNumber}</div>
        <h1 class="chapter-title">${escapeHtml(chapter.title)}</h1>
        <div class="chapter-meta">${escapeHtml(`المصدر: ${chapter.relativePath}`)}</div>
      </header>

      ${renderChapterOutline(chapter)}

      <section class="chapter-body">
        ${chapter.html}
      </section>

      <section class="chapter-summary">
        <h2>خلاصة الفصل</h2>
        ${chapter.summaryHtml}
      </section>

      ${renderReferences(section, chapter)}
      ${renderChapterNavigation(section, chapter)}
    </article>
  `;
}

function renderCover(manifest) {
  return `
    <section class="cover-title-page">
      <div class="cover-badge">${escapeHtml(manifest.editionLabel || 'نسخة مرجعية')}</div>
      <div class="cover-art" aria-hidden="true">
        <div class="cover-art-grid"></div>
        <div class="cover-art-ring cover-art-ring-a"></div>
        <div class="cover-art-ring cover-art-ring-b"></div>
      </div>
      <h1>${escapeHtml(manifest.title)}</h1>
      <p class="cover-subtitle">${escapeHtml(manifest.subtitle || '')}</p>
      <div class="cover-meta-grid">
        <p><strong>السلسلة:</strong> ${escapeHtml(manifest.publisherLabel || '')}</p>
        <p><strong>الإعداد:</strong> ${escapeHtml(manifest.authorLabel || '')}</p>
        <p><strong>الإصدار:</strong> ${escapeHtml(manifest.releaseLabel || '')}</p>
        <p><strong>الحقوق:</strong> ${escapeHtml(manifest.rightsHolderLabel || '')}</p>
      </div>
      <p class="cover-purpose">${escapeHtml(manifest.bookPurpose || '')}</p>
      <h2>الأنظمة المرجعية</h2>
      <ul>
        ${(manifest.sourceReferences || []).map(item => `<li>${escapeHtml(item)}</li>`).join('')}
      </ul>
    </section>
  `;
}

function renderCoverImagePage(manifest) {
  if (!manifest.coverImageResolvedPath) return '';

  return `
    <section class="cover-image-page">
      <img class="cover-image-fullpage" src="${escapeHtml(manifest.coverImageResolvedPath)}" alt="غلاف الكتاب الكامل">
    </section>
  `;
}

function renderImprint(manifest, sections) {
  const chapterCount = sections.reduce((sum, section) => sum + section.chapters.length, 0);
  return `
    <section class="imprint-page">
      <h1>بيانات الإصدار</h1>
      <div class="imprint-grid">
        <p><strong>عنوان الكتاب:</strong> ${escapeHtml(manifest.title)}</p>
        <p><strong>الوصف:</strong> ${escapeHtml(manifest.subtitle || '')}</p>
        <p><strong>السلسلة:</strong> ${escapeHtml(manifest.publisherLabel || '')}</p>
        <p><strong>الإعداد والتنظيم:</strong> ${escapeHtml(manifest.authorLabel || '')}</p>
        <p><strong>صاحب الحقوق:</strong> ${escapeHtml(manifest.rightsHolderLabel || '')}</p>
        <p><strong>الإصدار:</strong> ${escapeHtml(manifest.editionLabel || '')}</p>
        <p><strong>تاريخ الإصدار:</strong> ${escapeHtml(manifest.releaseLabel || '')}</p>
        <p><strong>عدد الأقسام:</strong> ${escapeHtml(String(sections.length))}</p>
        <p><strong>عدد الفصول:</strong> ${escapeHtml(String(chapterCount))}</p>
      </div>
      <p class="imprint-note">${escapeHtml(manifest.rightsNotice || '')}</p>
      <p class="imprint-note">تم إعداد هذه النسخة للطباعة على A4 مع فهرس داخلي وروابط انتقال مباشرة بين الفهرس والفصول.</p>
    </section>
  `;
}

function renderToc(sections) {
  return `
    <section class="toc-page" id="book-toc">
      <h1>فهرس المحتويات</h1>
      ${sections.map(section => `
        <section class="toc-section">
          <h2><a class="toc-section-link" href="#${escapeHtml(section.anchor)}">${escapeHtml(section.title)}</a></h2>
          <ul>
            ${section.chapters.map(chapter => `<li><a class="toc-link" href="#${escapeHtml(chapter.anchor)}"><span class="toc-index">${escapeHtml(String(chapter.chapterNumber))}</span> ${escapeHtml(chapter.title)}</a></li>`).join('')}
          </ul>
        </section>
      `).join('')}
    </section>
  `;
}

function renderGeneratedIndexes(glossaryIndex, subjectIndex) {
  return `
    <section class="backmatter-page" id="book-indexes">
      <h1>الفهارس النهائية</h1>
      <section class="index-block">
        <h2>فهرس المصطلحات الثنائي</h2>
        <p class="index-intro">يقدم هذا الفهرس المصطلحات العربية والإنجليزية الأساسية مع إحالات سريعة إلى الفصول الأكثر ارتباطًا بها داخل الكتاب.</p>
        <div class="index-list">
          ${glossaryIndex.map(entry => `
            <article class="index-entry">
              <h3>${escapeHtml(entry.arabic)}</h3>
              <p class="index-english">${escapeHtml(entry.english)}</p>
              <p>${escapeHtml(entry.meaning)}</p>
              <p class="index-refs">الإحالات: ${entry.references.length ? buildReferenceLabels(entry.references) : 'لا توجد إحالات إضافية بعد.'}</p>
            </article>
          `).join('')}
        </div>
      </section>

      <section class="index-block">
        <h2>فهرس الموضوعات</h2>
        <p class="index-intro">يجمع هذا الفهرس المحاور الرئيسية المتكررة في الفصول، ليسهل الرجوع إلى مواضع المعالجة المفاهيمية والتنفيذية والاستشارية.</p>
        <div class="subject-index-list">
          ${subjectIndex.map(entry => `
            <article class="subject-index-entry">
              <h3>${escapeHtml(entry.title)}</h3>
              <p class="index-refs">الإحالات: ${buildReferenceLabels(entry.references)}</p>
            </article>
          `).join('')}
        </div>
      </section>
    </section>
  `;
}

function renderSectionCover(section) {
  return `
    <section class="part-page" id="${escapeHtml(section.anchor)}">
      <span class="part-kind">${escapeHtml(section.kind === 'appendix' ? 'ملاحق' : section.kind === 'front' ? 'مدخل' : 'جزء')}</span>
      <h1>${escapeHtml(section.title)}</h1>
      <p>${escapeHtml(section.description || '')}</p>
    </section>
  `;
}

function buildBookData(manifest) {
  const sourceRoot = path.resolve(workspaceRoot, manifest.sourceRoot);
  const editorialOverrides = readOptionalJson(
    manifest.editorialOverrides ? path.join(workspaceRoot, manifest.editorialOverrides) : ''
  );
  let chapterCounter = 0;
  const sections = manifest.sections.map(section => {
    const sectionAnchor = `section-${slugify(section.id || section.title)}`;
    const chapterFiles = resolveSectionFiles(sourceRoot, section);
    const chapters = chapterFiles.map((relativePath, sectionIndex) => {
      const absolutePath = path.join(sourceRoot, ...relativePath.split('/'));
      const markdown = readText(absolutePath);
      const chapterOverrides = editorialOverrides.chapters?.[relativePath] || {};
      const editorialMarkdown = applyChapterOverrides(markdown, chapterOverrides);
      const title = extractTitle(markdown, formatTitleFromName(path.basename(relativePath)));
      const bodyMarkdown = stripSupplementarySections(editorialMarkdown);
      const html = marked.parse(bodyMarkdown);
      const headings = extractHeadings(editorialMarkdown);
      const summaryHtml = chapterOverrides.summaryMarkdown
        ? marked.parse(chapterOverrides.summaryMarkdown)
        : extractSummary(editorialMarkdown);
      chapterCounter += 1;

      return {
        title,
        relativePath,
        html,
        headings,
        summaryHtml,
        anchor: `chapter-${chapterCounter}-${slugify(title)}`,
        chapterNumber: chapterCounter,
        sectionChapterNumber: sectionIndex + 1,
        searchableText: normalizeSearchText(`${title} ${editorialMarkdown}`),
      };
    });

    return {
      ...section,
      anchor: sectionAnchor,
      chapters,
    };
  });

  const flatChapters = sections.flatMap(section => section.chapters);
  const glossarySourcePath = path.join(sourceRoot, '05_القاموس_التأسيسي_الثنائي_اللغة.md');
  const glossaryIndex = fs.existsSync(glossarySourcePath)
    ? buildGlossaryIndex(parseGlossaryEntries(readText(glossarySourcePath)), flatChapters)
    : [];
  const subjectIndex = buildSubjectIndex(flatChapters);

  return { sourceRoot, sections, glossaryIndex, subjectIndex };
}

function buildHtmlDocument(manifest, sections, glossaryIndex, subjectIndex) {
  const body = [
    renderCoverImagePage(manifest),
    renderCover(manifest),
    renderImprint(manifest, sections),
    renderToc(sections),
    ...sections.flatMap(section => {
      const chapterMarkup = section.chapters.map(chapter => renderChapter(section, chapter, chapter.chapterNumber));

      return [renderSectionCover(section), ...chapterMarkup];
    }),
    renderGeneratedIndexes(glossaryIndex, subjectIndex),
  ].join('\n');

  return `<!DOCTYPE html>
<html lang="${escapeHtml(manifest.language || 'ar')}" dir="${escapeHtml(manifest.direction || 'rtl')}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(manifest.title)}</title>
  <link rel="stylesheet" href="./print.css">
</head>
<body>
  <main class="book">
    ${body}
  </main>
</body>
</html>`;
}

function main() {
  const manifest = readJson(manifestPath);
  const outputHtmlPath = path.join(workspaceRoot, manifest.outputHtml);
  const outputDir = path.dirname(outputHtmlPath);
  ensureDir(outputDir);

  manifest.coverImageResolvedPath = resolveCoverImage(manifest, outputDir);

  const { sections, glossaryIndex, subjectIndex } = buildBookData(manifest);

  const html = buildHtmlDocument(manifest, sections, glossaryIndex, subjectIndex);
  fs.writeFileSync(outputHtmlPath, html, 'utf8');
  fs.copyFileSync(printCssPath, path.join(outputDir, 'print.css'));

  console.log(`Book HTML generated: ${outputHtmlPath}`);
  console.log(`Sections: ${sections.length}`);
  console.log(`Chapters: ${sections.reduce((sum, section) => sum + section.chapters.length, 0)}`);
}

main();