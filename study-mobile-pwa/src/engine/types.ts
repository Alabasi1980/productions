// ─── Content tree (from content-index.json) ────────────────────────
// This shape is stable: the sync script owns it.

export type DocType =
  | 'lesson'
  | 'test'
  | 'glossary'
  | 'index'
  | 'guide'
  | 'meta'
  | 'intro'
  | 'reference'
  | 'exercise'
  | 'test-resource'
  | 'tool'
  | 'study-path'
  | 'document'
  | string // open: don't lock to enum, sync may introduce new kinds

export type Heading = {
  level: number
  text: string
  slug: string
}

export type ContentDirectoryNode = {
  type: 'directory'
  name: string
  title: string
  relativePath: string
  children?: ContentNode[]
}

export type ContentFileNode = {
  type: 'file'
  name: string
  title: string
  relativePath: string
  url: string
  id: string
  docType: DocType
  partId: string
  wordCount: number
  estReadMin: number
  summary: string
  difficulty: string
  headings: Heading[]
  trackable: boolean
  // optional / future:
  skills?: string[]
  prerequisites?: string[]
  prereadQuestions?: string[]
  recallQuestions?: string[]
}

export type ContentNode = ContentDirectoryNode | ContentFileNode

export type ContentManifest = {
  generatedAt: string
  domain: string
  root: ContentDirectoryNode
}

export type DomainConfig = {
  generatedAt: string
  domainId: string
  contentPackId: string
  appTitle: string
  sidebarEyebrow: string
  readerEyebrow: string
  searchPlaceholder: string
  features: {
    flashcards?: boolean
    quizzes?: boolean
    dashboard?: boolean
    systemMap?: boolean
    mockInterview?: boolean
    readingProgress?: boolean
    tableOfContents?: boolean
    focusMode?: boolean
    preread?: boolean
    selfAssess?: boolean
    glossaryTooltip?: boolean
  }
  launchers?: {
    flashcards?: { label?: string; title?: string }
    quizzes?: { label?: string; title?: string }
    lessonQuiz?: { label?: string; title?: string }
    dashboard?: { label?: string; title?: string }
    systemMap?: { label?: string; title?: string }
    mockInterview?: { label?: string; title?: string }
    review?: { label?: string; title?: string }
    install?: { label?: string; title?: string }
  }
  copy?: {
    sidebarNoteTitle?: string
    sidebarNoteBody?: string
    heroEyebrow?: string
    heroTitle?: string
    heroBody?: string
    coachEyebrow?: string
    coachTitle?: string
    coachBody?: string
    quickStartEyebrow?: string
    quickStartTitle?: string
    quickStartBody?: string
  }
}

// ─── Generic study entities (deliberately loose) ────────────────────
// These shapes intentionally allow unknown extra fields so the engine
// won't break when the sync script's extraction format evolves.

export type EntityBase = {
  id: string
  tags?: string[]
  // Allow any forward-compatible fields without breaking the type:
  [extra: string]: unknown
}

export type Flashcard = EntityBase & {
  front: string
  back: string
}

export type Question = EntityBase & {
  type: string
  text: string
}

export type GlossaryEntry = EntityBase & {
  arabic: string
  english: string
  meaning: string
}

export type InterviewGuideEntry = EntityBase & {
  title: string
  points: string[]
}

// Bundles loaded from /data/*.json
export type FlashcardsBundle = { generatedAt: string; cards: Flashcard[] }
export type QuizBundle = { generatedAt: string; questions: Question[] }
export type GlossaryBundle = { generatedAt: string; entries: GlossaryEntry[] }
export type InterviewBankBundle = { generatedAt: string; guides: InterviewGuideEntry[] }
export type StudyMetadataBundle = {
  generatedAt: string
  lessons: Array<{
    id: string
    title: string
    partId: string
    docType: string
    estReadMin: number
    difficulty: string
    trackable: boolean
    skills?: string[]
    prerequisites?: string[]
  }>
}
