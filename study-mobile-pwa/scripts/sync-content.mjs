import fs from 'node:fs/promises'
import path from 'node:path'

const projectRoot = process.cwd()
const sourceRoot = path.resolve(projectRoot, '..', '00_مسار الدراسة المهنية')
const publicRoot = path.join(projectRoot, 'public')
const contentRoot = path.join(publicRoot, 'content')
const dataRoot = path.join(publicRoot, 'data')

const ARABIC_WORDS_PER_MIN = 160

const numberPrefixPattern = /^(\d+)_/

function stripNumberPrefix(value) {
  return value.replace(numberPrefixPattern, '')
}

function formatTitle(name) {
  return stripNumberPrefix(name.replace(/\.md$/i, '')).replace(/_/g, ' ').trim()
}

function splitForSort(name) {
  const match = name.match(numberPrefixPattern)
  return { index: match ? Number(match[1]) : Number.MAX_SAFE_INTEGER, label: name }
}

function compareNames(left, right) {
  const leftMeta = splitForSort(left)
  const rightMeta = splitForSort(right)
  if (leftMeta.index !== rightMeta.index) return leftMeta.index - rightMeta.index
  return leftMeta.label.localeCompare(rightMeta.label, 'ar')
}

function toUrlPath(relativePath) {
  return relativePath.split('/').map(encodeURIComponent).join('/')
}

function slugify(text, fallback = 'h') {
  const base = text
    .toLowerCase()
    .replace(/[#`*_~\[\]\(\)]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w؀-ۿ-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return base || fallback
}

// Minimal YAML frontmatter parser (supports flat keys, list values, inline strings)
function parseFrontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n?/)
  if (!match) return { meta: {}, body: text }
  const yaml = match[1]
  const body = text.slice(match[0].length)
  const meta = {}
  let currentKey = null
  for (const rawLine of yaml.split('\n')) {
    const line = rawLine.replace(/\r$/, '')
    if (!line.trim()) continue
    if (line.startsWith('  - ') && currentKey) {
      if (!Array.isArray(meta[currentKey])) meta[currentKey] = []
      meta[currentKey].push(line.slice(4).trim().replace(/^["']|["']$/g, ''))
      continue
    }
    const m = line.match(/^([A-Za-z][A-Za-z0-9_]*):\s*(.*)$/)
    if (!m) continue
    const [, key, value] = m
    currentKey = key
    const trimmed = value.trim()
    if (!trimmed) { meta[key] = []; continue }
    if (/^\[.*\]$/.test(trimmed)) {
      meta[key] = trimmed.slice(1, -1).split(',').map((v) => v.trim().replace(/^["']|["']$/g, '')).filter(Boolean)
    } else if (trimmed === 'true' || trimmed === 'false') {
      meta[key] = trimmed === 'true'
    } else if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
      meta[key] = Number(trimmed)
    } else {
      meta[key] = trimmed.replace(/^["']|["']$/g, '')
    }
  }
  return { meta, body }
}

function extractHeadings(body) {
  const lines = body.split('\n')
  const headings = []
  let inCode = false
  let order = 0
  for (const line of lines) {
    if (/^```/.test(line)) { inCode = !inCode; continue }
    if (inCode) continue
    const m = line.match(/^(#{1,4})\s+(.+?)\s*$/)
    if (!m) continue
    order += 1
    const level = m[1].length
    const text = m[2].replace(/\s+$/, '')
    headings.push({ level, text, slug: slugify(text, `h-${order}`) })
  }
  return headings
}

function countWords(body) {
  // Strip code blocks
  const noCode = body.replace(/```[\s\S]*?```/g, '').replace(/`[^`]*`/g, '')
  const tokens = noCode.split(/\s+/).filter((t) => /[؀-ۿA-Za-z0-9]/.test(t))
  return tokens.length
}

function firstParagraph(body) {
  const lines = body.split('\n')
  const buf = []
  for (const line of lines) {
    if (/^#+\s/.test(line) || /^---$/.test(line)) {
      if (buf.length === 0) continue
      break
    }
    if (line.trim() === '') {
      if (buf.length) break
      continue
    }
    if (/^[-*]\s|^\d+\.\s|^\|/.test(line)) {
      if (buf.length) break
      continue
    }
    buf.push(line.trim())
  }
  return buf.join(' ').slice(0, 240)
}

function normalizeForMatch(text) {
  return text
    .toLowerCase()
    .replace(/[؟?.,:;!()[\]{}]/g, ' ')
    .replace(/\b(ما|متى|كيف|لماذا|ماهو|ما\s+هو|الفرق|بين|و|في|عن|من|إلى|على|هذا|هذه)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function inferDocType(relativePath, fileName, meta) {
  if (meta?.docType) return meta.docType
  const p = relativePath.toLowerCase()
  const f = fileName.toLowerCase()

  if (f.startsWith('00_مدخل') || f.startsWith('00_مدخل_'.toLowerCase())) return 'intro'
  if (/اختبار/.test(f)) return 'test'
  if (/قاموس/.test(f)) return 'glossary'
  if (/فهرس/.test(f)) return 'index'
  if (/دليل/.test(f) && !p.includes('/')) return 'guide'
  if (/خطة/.test(f) || /لوحة/.test(f) || /قالب/.test(f)) return 'meta'
  if (p.includes('10_المراجع_السريعة')) return 'reference'
  if (p.includes('20_السيناريوهات_والتمارين')) return 'exercise'
  if (p.includes('30_الاختبارات_والتقييم')) return 'test-resource'
  if (p.includes('40_ادوات_التشغيل_الواقعية')) return 'tool'
  if (p.includes('50_مسارات_الدراسة')) return 'study-path'
  if (/الدرس_/.test(f)) return 'lesson'
  if (p.includes('90_الملاحق_والمرجع_السريع') && f.startsWith('00_')) return 'intro'
  return 'document'
}

function inferPartId(relativePath) {
  if (!relativePath.includes('/')) return 'meta'
  const top = relativePath.split('/')[0]
  const m = top.match(/^(\d+)_/)
  if (!m) return 'unknown'
  const n = Number(m[1])
  if (n >= 10 && n <= 60) return `part-${(n - 10) / 10 + 1}`
  if (n === 90) {
    // appendix subsection
    const parts = relativePath.split('/')
    if (parts.length >= 2) {
      const subM = parts[1].match(/^(\d+)_/)
      if (subM) {
        const sub = Number(subM[1])
        if (sub === 10) return 'appendix-refs'
        if (sub === 20) return 'appendix-scenarios'
        if (sub === 30) return 'appendix-tests'
        if (sub === 40) return 'appendix-tools'
        if (sub === 50) return 'appendix-study'
      }
    }
    return 'appendix'
  }
  return 'unknown'
}

function generateId(relativePath, docType, partId) {
  const fileName = path.basename(relativePath, '.md')
  const m = fileName.match(/^(\d+)_/)
  const num = m ? m[1] : '00'

  if (docType === 'intro') return `${partId}-intro`
  if (docType === 'test' && /^90_/.test(fileName)) return `${partId}-test`
  if (docType === 'lesson' && /الدرس_(\d+)/.test(fileName)) {
    const lessonNum = fileName.match(/الدرس_(\d+)/)[1]
    return `${partId}-l${Number(lessonNum)}`
  }
  if (!relativePath.includes('/')) return `meta-${num}`
  if (partId.startsWith('appendix-')) return `${partId.replace('appendix-', 'ap-')}-${num}`
  return `${partId}-${num}`
}

function inferDifficulty(partId, docType) {
  if (docType === 'test') return 'high'
  if (partId === 'part-1' || partId === 'part-2') return 'easy'
  if (partId === 'part-3') return 'medium'
  if (partId === 'part-4' || partId === 'part-5') return 'hard'
  if (partId === 'part-6') return 'hard'
  return 'medium'
}

// ─── Glossary extraction ──────────────────────────────────────────

function extractGlossary(body) {
  const lines = body.split('\n')
  const entries = []
  let currentCategory = ''
  let inTable = false
  let isHeaderRow = false

  for (const line of lines) {
    const trimmed = line.trim()
    const headingMatch = trimmed.match(/^##\s+(.+)$/)
    if (headingMatch) {
      currentCategory = headingMatch[1].trim()
      inTable = false
      continue
    }
    if (/^\|.*\|.*\|/.test(trimmed)) {
      if (!inTable) {
        inTable = true
        isHeaderRow = true
        continue
      }
      if (isHeaderRow) {
        isHeaderRow = false
        // The separator row "|---|---|---|"
        if (/^\|\s*-+/.test(trimmed)) continue
      }
      // Skip separator rows
      if (/^\|\s*-+/.test(trimmed)) continue
      const cells = trimmed.split('|').slice(1, -1).map((c) => c.trim())
      if (cells.length < 3) continue
      const [arabic, english, meaning] = cells
      if (!arabic || !english || !meaning) continue

      // Sometimes English column has multiple variants separated by /
      const primaryEnglish = english.split('/')[0].trim().replace(/\s*\(.+?\)\s*/g, '').trim()
      const id = slugify(primaryEnglish, `term-${entries.length + 1}`)

      entries.push({
        id,
        arabic: arabic.replace(/\s*\(.+?\)\s*/g, '').trim(),
        english,
        meaning,
        category: currentCategory,
      })
    } else {
      inTable = false
    }
  }

  return entries
}

// ─── Quiz extraction from test files ─────────────────────────────

function extractQuestionsFromTest(body, lessonId, partId) {
  const lines = body.split('\n')
  const questions = []
  let currentSection = ''
  let currentSectionType = 'general'
  let collectingListItems = false
  let listItemPrefix = ''

  function sectionType(title) {
    if (/مفاهيم/.test(title)) return 'concept'
    if (/تمييز.*المصطلحات/.test(title) || /مصطلحات/.test(title)) return 'terminology'
    if (/تحليل/.test(title)) return 'analysis'
    if (/مقارنة/.test(title)) return 'comparison'
    if (/تطبيق/.test(title) || /استشاري/.test(title) || /حالة/.test(title)) return 'scenario'
    if (/تقييم.*ذاتي/.test(title)) return 'self-assess'
    return 'general'
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    const secMatch = trimmed.match(/^##\s+(.+)$/)
    if (secMatch) {
      currentSection = secMatch[1].trim()
      currentSectionType = sectionType(currentSection)
      collectingListItems = false
      continue
    }

    // Skip self-assessment & criteria sections
    if (currentSectionType === 'self-assess' || /معيار.*الانتقال/.test(currentSection) || /تعليمات/.test(currentSection)) continue

    // Pattern: ### N. السؤال
    const qHeadingMatch = trimmed.match(/^###\s+\d+\.\s+(.+)$/)
    if (qHeadingMatch) {
      const text = qHeadingMatch[1].trim().replace(/[؟?]$/, '؟')
      // Determine if it's a "true if ends with ؟ or instruction"
      const type = currentSectionType === 'terminology' ? 'short-answer' : 'open'
      questions.push({
        id: `q-${lessonId}-${questions.length + 1}`,
        type,
        text: text.endsWith('؟') || text.endsWith('?') ? text : text + '؟',
        section: currentSection,
        sectionType: currentSectionType,
        lessonId,
        partId,
        explanationLessonId: lessonId,
      })
      collectingListItems = false
      continue
    }

    // Pattern: numbered list items (terminology lists)
    const listMatch = trimmed.match(/^(\d+)\.\s+(.+)$/)
    if (listMatch && currentSectionType === 'terminology') {
      const term = listMatch[2].trim()
      questions.push({
        id: `q-${lessonId}-${questions.length + 1}`,
        type: 'short-answer',
        text: `اشرح: ${term}`,
        section: currentSection,
        sectionType: 'terminology',
        lessonId,
        partId,
        term,
        explanationLessonId: lessonId,
      })
    }
  }
  return questions
}

// ─── Flashcards from glossary ────────────────────────────────────

function buildFlashcardsFromGlossary(entries) {
  const cards = []
  for (const e of entries) {
    // EN → AR (term recognition)
    cards.push({
      id: `fc-${e.id}-en-ar`,
      type: 'recognition',
      front: e.english,
      back: `${e.arabic} — ${e.meaning}`,
      tags: [e.category, 'glossary', 'en-ar'],
      sourceTermId: e.id,
    })
    // AR → EN (term recall)
    cards.push({
      id: `fc-${e.id}-ar-en`,
      type: 'recall',
      front: e.arabic,
      back: `${e.english} — ${e.meaning}`,
      tags: [e.category, 'glossary', 'ar-en'],
      sourceTermId: e.id,
    })
  }
  return cards
}

function pickDistractors(entries, startIndex, excludeId, count = 3) {
  const distractors = []

  for (let offset = 1; offset < entries.length && distractors.length < count; offset += 1) {
    const candidate = entries[(startIndex + offset) % entries.length]
    if (candidate.id !== excludeId) distractors.push(candidate)
  }

  return distractors.slice(0, count)
}

function buildQuizSeedsFromGlossary(entries) {
  const questions = []

  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index]
    const distractors = pickDistractors(entries, index, entry.id, 3)

    if (distractors.length === 3) {
      const correctOptionIndex = index % 4
      const options = new Array(4)
      options[correctOptionIndex] = entry.english

      let distractorCursor = 0
      for (let optionIndex = 0; optionIndex < options.length; optionIndex += 1) {
        if (optionIndex === correctOptionIndex) continue
        options[optionIndex] = distractors[distractorCursor].english
        distractorCursor += 1
      }

      questions.push({
        id: `q-glossary-mcq-${entry.id}`,
        type: 'multiple-choice',
        text: `ما المقابل الإنجليزي الصحيح للمصطلح: ${entry.arabic}؟`,
        section: 'القاموس التأسيسي',
        sectionType: 'terminology',
        lessonId: 'meta-05',
        partId: 'meta',
        options,
        correctOptionIndex,
        explanation: `${entry.arabic} تقابلها ${entry.english}، ومعناها: ${entry.meaning}`,
        explanationLessonId: 'meta-05',
      })
    }

    const useCorrectMeaning = index % 2 === 0
    const statementMeaning = useCorrectMeaning
      ? entry.meaning
      : entries[(index + 1) % entries.length].meaning

    questions.push({
      id: `q-glossary-tf-${entry.id}`,
      type: 'true-false',
      text: `صح أم خطأ: ${entry.english} يعني ${statementMeaning}`,
      section: 'القاموس التأسيسي',
      sectionType: 'terminology',
      lessonId: 'meta-05',
      partId: 'meta',
      correctBoolean: useCorrectMeaning,
      explanation: useCorrectMeaning
        ? `العبارة صحيحة. ${entry.english} تعني ${entry.arabic}، ومعناها: ${entry.meaning}`
        : `العبارة خاطئة. ${entry.english} تعني ${entry.arabic}، ومعناها الصحيح: ${entry.meaning}`,
      explanationLessonId: 'meta-05',
    })
  }

  return questions
}

function extractInterviewGuide(body) {
  const lines = body.split('\n')
  const guides = []
  let current = null

  for (const line of lines) {
    const trimmed = line.trim()
    const headingMatch = trimmed.match(/^###\s+\d+\.\s+(.+)$/)
    if (headingMatch) {
      if (current && current.points.length > 0) guides.push(current)
      const title = headingMatch[1].trim().replace(/[؟?]$/, '؟')
      current = {
        id: `ig-${slugify(title, `guide-${guides.length + 1}`)}`,
        title,
        matchKey: normalizeForMatch(title),
        points: [],
      }
      continue
    }

    if (!current) continue
    if (/^##\s+/.test(trimmed)) break
    if (/^[-*]\s+/.test(trimmed)) {
      current.points.push(trimmed.replace(/^[-*]\s+/, '').trim())
    }
  }

  if (current && current.points.length > 0) guides.push(current)
  return guides
}

// ─── Tree builder ────────────────────────────────────────────────

async function buildTree(absolutePath, relativePath = '', accumulators) {
  const stats = await fs.stat(absolutePath)
  const name = path.basename(absolutePath)

  if (stats.isDirectory()) {
    const entries = (await fs.readdir(absolutePath)).filter((entry) => !entry.startsWith('.')).sort(compareNames)
    const children = []
    for (const entry of entries) {
      const childAbs = path.join(absolutePath, entry)
      const childRel = relativePath ? `${relativePath}/${entry}` : entry
      const child = await buildTree(childAbs, childRel, accumulators)
      if (child) children.push(child)
    }
    return {
      type: 'directory',
      name,
      title: formatTitle(name),
      relativePath,
      children,
    }
  }

  if (path.extname(name).toLowerCase() !== '.md') return null

  const raw = await fs.readFile(absolutePath, 'utf8')
  const { meta, body } = parseFrontmatter(raw)
  const headings = extractHeadings(body)
  const wordCount = countWords(body)
  const estReadMin = Math.max(1, Math.round(wordCount / ARABIC_WORDS_PER_MIN))
  const partId = inferPartId(relativePath)
  const docType = inferDocType(relativePath, name, meta)
  const id = meta?.id || generateId(relativePath, docType, partId)
  const summary = meta?.summary || firstParagraph(body)
  const difficulty = meta?.difficulty || inferDifficulty(partId, docType)

  const enrichedMeta = {
    id,
    docType,
    partId,
    wordCount,
    estReadMin,
    summary,
    difficulty,
    headings: headings.map((h) => ({ level: h.level, text: h.text, slug: h.slug })),
    skills: meta?.skills || [],
    prerequisites: meta?.prerequisites || [],
    prereadQuestions: meta?.prereadQuestions || [],
    recallQuestions: meta?.recallQuestions || [],
    trackable: docType === 'lesson' || docType === 'test' || docType === 'glossary' || docType === 'reference' || docType === 'tool' || docType === 'exercise',
  }

  // Glossary extraction (only for the glossary file)
  if (docType === 'glossary' && !accumulators.glossaryExtracted) {
    const glossaryEntries = extractGlossary(body)
    accumulators.glossary.push(...glossaryEntries)
    accumulators.glossaryExtracted = true
  }

  // Quiz extraction from test files
  if (docType === 'test') {
    const qs = extractQuestionsFromTest(body, id, partId)
    accumulators.questions.push(...qs)
  }

  return {
    type: 'file',
    name,
    title: meta?.title || formatTitle(name),
    relativePath,
    url: `/content/${toUrlPath(relativePath)}`,
    ...enrichedMeta,
  }
}

// ─── Main ────────────────────────────────────────────────────────

async function main() {
  await fs.mkdir(publicRoot, { recursive: true })
  await fs.mkdir(dataRoot, { recursive: true })
  await fs.rm(contentRoot, { recursive: true, force: true })

  await fs.cp(sourceRoot, contentRoot, {
    recursive: true,
    filter: (source) => {
      const extension = path.extname(source).toLowerCase()
      return extension === '' || extension === '.md'
    },
  })

  const accumulators = { glossary: [], glossaryExtracted: false, questions: [] }
  const tree = await buildTree(sourceRoot, '', accumulators)
  const interviewGuideSource = path.join(
    sourceRoot,
    '90_الملاحق_والمرجع_السريع',
    '30_الاختبارات_والتقييم',
    '02_دليل_الإجابات_النموذجية_ومعيار_التقييم.md',
  )
  const interviewGuideBody = await fs.readFile(interviewGuideSource, 'utf8')
  const interviewGuides = extractInterviewGuide(interviewGuideBody)

  // content-index.json
  await fs.writeFile(
    path.join(publicRoot, 'content-index.json'),
    JSON.stringify({ generatedAt: new Date().toISOString(), domain: 'erp-production', root: tree }, null, 2),
    'utf8',
  )

  // glossary.json
  await fs.writeFile(
    path.join(dataRoot, 'glossary.json'),
    JSON.stringify({ generatedAt: new Date().toISOString(), entries: accumulators.glossary }, null, 2),
    'utf8',
  )

  // flashcards.json (seeded from glossary)
  const cards = buildFlashcardsFromGlossary(accumulators.glossary)
  await fs.writeFile(
    path.join(dataRoot, 'flashcards.json'),
    JSON.stringify({ generatedAt: new Date().toISOString(), cards }, null, 2),
    'utf8',
  )

  // quiz-bank.json (seeded from test files + glossary objective questions)
  const objectiveQuestions = buildQuizSeedsFromGlossary(accumulators.glossary)
  await fs.writeFile(
    path.join(dataRoot, 'quiz-bank.json'),
    JSON.stringify({ generatedAt: new Date().toISOString(), questions: [...accumulators.questions, ...objectiveQuestions] }, null, 2),
    'utf8',
  )

  await fs.writeFile(
    path.join(dataRoot, 'interview-bank.json'),
    JSON.stringify({ generatedAt: new Date().toISOString(), guides: interviewGuides }, null, 2),
    'utf8',
  )

  // study-metadata.json (lightweight cross-reference)
  const lessonsFlat = []
  function walk(node) {
    if (node.type === 'file') {
      lessonsFlat.push({
        id: node.id,
        title: node.title,
        partId: node.partId,
        docType: node.docType,
        estReadMin: node.estReadMin,
        difficulty: node.difficulty,
        trackable: node.trackable,
        skills: node.skills,
        prerequisites: node.prerequisites,
      })
      return
    }
    for (const child of node.children || []) walk(child)
  }
  walk(tree)

  await fs.writeFile(
    path.join(dataRoot, 'study-metadata.json'),
    JSON.stringify({ generatedAt: new Date().toISOString(), lessons: lessonsFlat }, null, 2),
    'utf8',
  )

  console.log(`✓ content-index.json — ${lessonsFlat.length} files`)
  console.log(`✓ glossary.json — ${accumulators.glossary.length} terms`)
  console.log(`✓ flashcards.json — ${cards.length} cards`)
  console.log(`✓ quiz-bank.json — ${accumulators.questions.length + objectiveQuestions.length} questions`)
  console.log(`✓ interview-bank.json — ${interviewGuides.length} guides`)
  console.log(`✓ study-metadata.json — ${lessonsFlat.length} entries`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
