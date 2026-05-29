import { startTransition, useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react'
import { ArrowUpLeft, BookMarked, BookOpen, Brain, Calendar, Compass, Download, FolderTree, GitCompareArrows, LayoutGrid, ListChecks, Menu, Search, Sparkles, Target, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { loadContentManifest, loadDomainConfig, loadMarkdownContent } from './engine/content'
import * as storage from './engine/storage'
import type { ContentManifest, ContentNode, ContentFileNode, DomainConfig } from './engine/types'
import { ReadingMeta } from './features/reading/ReadingMeta'
import { TableOfContents } from './features/reading/TableOfContents'
import { ReadingProgress } from './features/reading/ReadingProgress'
import { FontSizeControl } from './features/reading/FontSizeControl'
import { FocusToggle } from './features/reading/FocusToggle'
import { PrereadCard } from './features/reading/PrereadCard'
import { RatingWidget } from './features/self-assess/RatingWidget'
import { FeynmanBox } from './features/self-assess/FeynmanBox'
import { ReviewQueueDrawer } from './features/self-assess/ReviewQueueDrawer'
import { useReviewQueue, isInReviewQueue } from './features/self-assess/hooks'
import { FlashcardScreen } from './features/flashcards/FlashcardScreen'
import { useFlashcardDeck, useFlashcardStates, selectDue as selectDueCards } from './features/flashcards/hooks'
import { QuizScreen } from './features/quiz/QuizScreen'
import { useQuizBank, useQuizState } from './features/quiz/hooks'
import { DashboardScreen } from './features/dashboard/DashboardScreen'
import { useGlossary } from './modules/erp/glossary-hook'
import { decorateChildren } from './modules/erp/decorate-text'
import { SystemMapScreen } from './modules/erp/SystemMapScreen'
import { MockInterviewScreen } from './modules/erp/MockInterviewScreen'
import './modules/erp/erp.css'
import './features/reading/reading.css'
import './features/self-assess/self-assess.css'
import './features/flashcards/flashcards.css'
import './features/quiz/quiz.css'
import './features/dashboard/dashboard.css'
import './App.css'

// Initialize storage layer (runs migrations to current schema version).
storage.runMigrations()

type FlatDoc = ContentFileNode & { pathLabel: string }

type SectionSummary = {
  title: string
  relativePath: string
  firstDoc: FlatDoc | null
  docsCount: number
  indexLabel: string
}

type DeferredPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

type StudyCoachActionId =
  | 'review-queue'
  | 'flashcards'
  | 'quiz-mistakes'
  | 'lesson-quiz'
  | 'mock-interview'
  | 'continue-reading'

type StudyCoachRecommendation = {
  tone: 'urgent' | 'warm' | 'focus' | 'steady'
  title: string
  body: string
  actionLabel: string
  actionId: StudyCoachActionId
  meta: string
}

const STORE_NAMES = {
  selectedDoc: 'selectedDoc',
}

function getPathPrefix(relativePath: string): string {
  return relativePath.split('_')[0] ?? ''
}

function flattenFiles(node: ContentNode, parents: string[] = []): FlatDoc[] {
  if (node.type === 'file') {
    return [{ ...node, pathLabel: parents.join(' / ') }]
  }

  return (node.children ?? []).flatMap((child) =>
    flattenFiles(child, node.relativePath ? [...parents, node.title] : parents),
  )
}

function countDocs(node: ContentNode): number {
  if (node.type === 'file') {
    return 1
  }

  return (node.children ?? []).reduce((sum, child) => sum + countDocs(child), 0)
}

function countFolders(node: ContentNode): number {
  if (node.type === 'file') {
    return 0
  }

  return 1 + (node.children ?? []).reduce((sum, child) => sum + countFolders(child), 0)
}

function decodeInternalPath(href: string): string | null {
  const decodedHref = decodeURIComponent(href)
  const marker = '/00_مسار الدراسة المهنية/'

  if (decodedHref.includes(marker)) {
    return decodedHref.split(marker)[1] ?? null
  }

  if (decodedHref.startsWith('/content/')) {
    return decodedHref.replace('/content/', '')
  }

  return null
}

function filterTree(node: ContentNode, query: string): ContentNode | null {
  if (!query.trim()) {
    return node
  }

  const normalizedQuery = query.trim().toLowerCase()
  const titleMatches = node.title.toLowerCase().includes(normalizedQuery)

  if (node.type === 'file') {
    return titleMatches ? node : null
  }

  const filteredChildren = (node.children ?? [])
    .map((child) => filterTree(child, normalizedQuery))
    .filter(Boolean) as ContentNode[]

  if (titleMatches || filteredChildren.length > 0) {
    return {
      ...node,
      children: filteredChildren,
    }
  }

  return null
}

function TreeItem({
  node,
  depth,
  activePath,
  onSelect,
}: {
  node: ContentNode
  depth: number
  activePath: string | null
  onSelect: (path: string) => void
}) {
  const [open, setOpen] = useState(depth < 2)

  useEffect(() => {
    if (node.type === 'directory' && node.children?.some((child) => child.relativePath === activePath || activePath?.startsWith(`${child.relativePath}/`))) {
      setOpen(true)
    }
  }, [activePath, node])

  if (node.type === 'file') {
    return (
      <button
        type="button"
        className={`tree-file ${activePath === node.relativePath ? 'active' : ''}`}
        onClick={() => onSelect(node.relativePath)}
      >
        <span>{node.title}</span>
      </button>
    )
  }

  return (
    <div className="tree-group">
      {node.relativePath ? (
        <button type="button" className="tree-group-toggle" onClick={() => setOpen((current) => !current)}>
          <FolderTree size={16} />
          <span>{node.title}</span>
        </button>
      ) : null}

      {(node.relativePath === '' || open) && node.children?.length ? (
        <div className={`tree-children depth-${Math.min(depth, 6)}`}>
          {node.children.map((child) => (
            <TreeItem key={child.relativePath || child.name} node={child} depth={depth + 1} activePath={activePath} onSelect={onSelect} />
          ))}
        </div>
      ) : null}
    </div>
  )
}

function App() {
  const [manifest, setManifest] = useState<ContentManifest | null>(null)
  const [domainConfig, setDomainConfig] = useState<DomainConfig | null>(null)
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [installPrompt, setInstallPrompt] = useState<DeferredPromptEvent | null>(null)
  const [reviewOpen, setReviewOpen] = useState(false)
  const { due: reviewDue } = useReviewQueue()
  const [flashcardsOpen, setFlashcardsOpen] = useState(false)
  const { cards: flashcardDeck } = useFlashcardDeck()
  const { states: flashcardStates } = useFlashcardStates()
  const flashcardDueCount = useMemo(
    () => selectDueCards(flashcardDeck, flashcardStates).length,
    [flashcardDeck, flashcardStates],
  )
  const [quizOpen, setQuizOpen] = useState(false)
  const [quizInitialLessonId, setQuizInitialLessonId] = useState<string | undefined>(undefined)
  const { mistakes: quizMistakes } = useQuizState()
  const quizMistakesCount = Object.keys(quizMistakes).length
  const [dashboardOpen, setDashboardOpen] = useState(false)
  const [systemMapOpen, setSystemMapOpen] = useState(false)
  const [mockInterviewOpen, setMockInterviewOpen] = useState(false)
  const { questions: allQuestions } = useQuizBank()
  const { index: glossaryIndex } = useGlossary()

  const allDocs = useMemo(() => (manifest ? flattenFiles(manifest.root) : []), [manifest])

  // Build lookups once per data change
  const lessonPartLookup = useMemo<Record<string, string>>(() => {
    const map: Record<string, string> = {}
    for (const doc of allDocs) {
      if (doc.id && doc.partId) map[doc.id] = doc.partId
    }
    return map
  }, [allDocs])

  const questionPartLookup = useMemo<Record<string, string>>(() => {
    const map: Record<string, string> = {}
    for (const q of allQuestions) {
      if (typeof q.partId === 'string') map[q.id] = q.partId
    }
    return map
  }, [allQuestions])

  const firstLessonInPart = useMemo<Record<string, string>>(() => {
    const map: Record<string, string> = {}
    for (const doc of allDocs) {
      if (doc.docType === 'lesson' && doc.partId && !map[doc.partId]) {
        map[doc.partId] = doc.id
      }
    }
    return map
  }, [allDocs])
  const selectedDoc = useMemo(
    () => allDocs.find((doc) => doc.relativePath === selectedPath) ?? null,
    [allDocs, selectedPath],
  )
  const filteredTree = useMemo(
    () => (manifest ? filterTree(manifest.root, deferredSearch) : null),
    [deferredSearch, manifest],
  )
  const rootDocs = useMemo(
    () => allDocs.filter((doc) => !doc.relativePath.includes('/')).slice(0, 6),
    [allDocs],
  )
  const topSections = useMemo<SectionSummary[]>(() => {
    return (manifest?.root.children ?? [])
      .filter((child): child is ContentNode => child.type === 'directory')
      .map((section) => {
        const sectionDocs = flattenFiles(section)

        return {
          title: section.title,
          relativePath: section.relativePath,
          firstDoc: sectionDocs[0] ?? null,
          docsCount: sectionDocs.length,
          indexLabel: getPathPrefix(section.relativePath),
        }
      })
  }, [manifest])
  const selectedSection = useMemo(
    () => topSections.find((section) => selectedPath?.startsWith(`${section.relativePath}/`)),
    [selectedPath, topSections],
  )
  const selectedLessonQuizCount = useMemo(
    () => (selectedDoc?.id ? allQuestions.filter((question) => question.lessonId === selectedDoc.id).length : 0),
    [allQuestions, selectedDoc],
  )
  const quickStartDocs = useMemo(() => {
    const candidates = [
      selectedDoc,
      allDocs.find((doc) => doc.title.includes('ابدأ من هنا')),
      allDocs.find((doc) => doc.title.includes('القاموس')),
      allDocs.find((doc) => doc.title.includes('مدخل الملاحق')),
    ]
    const seen = new Set<string>()

    return candidates.reduce<FlatDoc[]>((items, doc) => {
      if (doc && !seen.has(doc.relativePath)) {
        seen.add(doc.relativePath)
        items.push(doc)
      }

      return items
    }, [])
  }, [allDocs, selectedDoc])

  useEffect(() => {
    let active = true

    Promise.all([loadContentManifest(), loadDomainConfig()])
      .then(([data, config]) => {
        if (!active) {
          return
        }

        storage.setActiveScope({
          domainId: config.domainId || data.domain,
          contentPackId: config.contentPackId,
        })

        setManifest(data)
        setDomainConfig(config)
        document.title = config.appTitle
        const savedPath = storage.get<string | null>(STORE_NAMES.selectedDoc, null)
        const docs = flattenFiles(data.root)
        const defaultPath = docs.find((doc) => doc.relativePath.endsWith('00_دليل_المجلد.md'))?.relativePath ?? docs[0]?.relativePath ?? null
        setSelectedPath(savedPath && docs.some((doc) => doc.relativePath === savedPath) ? savedPath : defaultPath)
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as DeferredPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)

    return () => {
      active = false
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    }
  }, [])

  useEffect(() => {
    if (!selectedDoc) {
      return
    }

    let active = true
    setContent('')

    loadMarkdownContent(selectedDoc.url)
      .then((text) => {
        if (!active) {
          return
        }

        setContent(text)
        storage.set(STORE_NAMES.selectedDoc, selectedDoc.relativePath)
      })

    return () => {
      active = false
    }
  }, [selectedDoc])

  function handleSelectDoc(relativePath: string) {
    startTransition(() => {
      setSelectedPath(relativePath)
      setDrawerOpen(false)
    })
  }

  const resolveDocTitleById = useCallback(
    (id: string) => allDocs.find((doc) => doc.id === id)?.title ?? null,
    [allDocs],
  )

  const openDocById = useCallback(
    (id: string) => {
      const target = allDocs.find((doc) => doc.id === id)
      if (target) handleSelectDoc(target.relativePath)
    },
    [allDocs],
  )

  const currentReviewState = useMemo(
    () => (selectedDoc?.id ? isInReviewQueue(selectedDoc.id) : { inQueue: false, isDue: false }),
    // re-evaluate when reviewOpen toggles (drawer write may have changed queue)
    [selectedDoc?.id, reviewOpen],
  )

  const docsCount = manifest ? countDocs(manifest.root) : 0
  const foldersCount = manifest ? countFolders(manifest.root) - 1 : 0
  const features = domainConfig?.features ?? {}
  const launchers = domainConfig?.launchers ?? {}
  const copy = domainConfig?.copy ?? {}

  const studyCoach = useMemo<StudyCoachRecommendation | null>(() => {
    if (reviewDue.length > 0) {
      return {
        tone: 'urgent',
        title: currentReviewState.isDue ? 'ابدأ بمراجعة هذا الدرس الآن' : 'ابدأ بما هو مستحق قبل أي جديد',
        body: currentReviewState.isDue
          ? 'هذا الدرس موجود بالفعل في دورة المراجعة. تثبيته الآن أفضل من فتح مادة جديدة ثم فقدان الربط.'
          : 'لديك عناصر مستحقة في قائمة المراجعة، والبدء بها الآن يثبت التعلم ويمنع تراكم النسيان.',
        actionLabel: 'افتح المراجعة',
        actionId: 'review-queue',
        meta: `${reviewDue.length} عنصر مراجعة مستحق`,
      }
    }

    if (flashcardDueCount > 0) {
      return {
        tone: 'warm',
        title: 'ثبّت المصطلحات قبل أن تبهت',
        body: 'لديك بطاقات مستحقة اليوم. مراجعتها الآن ترفع التذكر السريع وتدعم فهمك أثناء القراءة والاختبارات.',
        actionLabel: 'ابدأ البطاقات',
        actionId: 'flashcards',
        meta: `${flashcardDueCount} بطاقة مستحقة`,
      }
    }

    if (quizMistakesCount > 0) {
      return {
        tone: 'focus',
        title: 'راجع أخطاءك قبل الانتقال',
        body: 'دفتر الأخطاء يحدد أين يتكرر الخلل فعليًا. تنظيف هذه المنطقة الآن يرفع الجودة أكثر من قراءة مادة جديدة.',
        actionLabel: 'راجع الأخطاء',
        actionId: 'quiz-mistakes',
        meta: `${quizMistakesCount} خطأ محفوظ`,
      }
    }

    if (selectedDoc?.trackable && selectedLessonQuizCount > 0 && features.quizzes !== false) {
      return {
        tone: 'focus',
        title: 'اختبر هذا الدرس قبل أن تغادره',
        body: 'أفضل لحظة للاختبار هي الآن، لأن الدرس ما زال حاضرًا في الذهن ويمكنك كشف فجوات الفهم بسرعة.',
        actionLabel: 'اختبر هذا الدرس',
        actionId: 'lesson-quiz',
        meta: `${selectedLessonQuizCount} سؤال مرتبط بهذا الدرس`,
      }
    }

    if (selectedDoc?.trackable && features.mockInterview !== false) {
      return {
        tone: 'steady',
        title: 'حوّل الفهم إلى صياغة مهنية',
        body: 'محاكاة المقابلة تجبرك على ترتيب الفكرة وتحويلها من معرفة صامتة إلى شرح وتحليل واضح.',
        actionLabel: 'ابدأ محاكاة',
        actionId: 'mock-interview',
        meta: 'تدريب شفهي وتحليلي',
      }
    }

    if (selectedDoc) {
      return {
        tone: 'steady',
        title: 'واصل القراءة بتركيز',
        body: 'لا توجد مراجعات ملحّة الآن، لذا أفضل خطوة هي إكمال القراءة الحالية مع تثبيت الفكرة الأساسية قبل التبديل.',
        actionLabel: 'تابع القراءة',
        actionId: 'continue-reading',
        meta: selectedDoc.title,
      }
    }

    return quickStartDocs[0]
      ? {
          tone: 'steady',
          title: 'ابدأ من أقرب مدخل ذكي',
          body: 'إذا لم تختر مسارًا بعد، ابدأ من إحدى نقاط الدخول السريعة ثم ابنِ عليها دورة قراءة ومراجعة واختبار.',
          actionLabel: 'افتح المدخل',
          actionId: 'continue-reading',
          meta: quickStartDocs[0].title,
        }
      : null
  }, [currentReviewState.isDue, features.mockInterview, features.quizzes, flashcardDueCount, quickStartDocs, quizMistakesCount, reviewDue.length, selectedDoc, selectedLessonQuizCount])

  function handleStudyCoachAction(actionId: StudyCoachActionId) {
    switch (actionId) {
      case 'review-queue':
        setReviewOpen(true)
        return
      case 'flashcards':
        setFlashcardsOpen(true)
        return
      case 'quiz-mistakes':
        setQuizInitialLessonId(undefined)
        setQuizOpen(true)
        return
      case 'lesson-quiz':
        if (selectedDoc?.id) {
          setQuizInitialLessonId(selectedDoc.id)
          setQuizOpen(true)
        }
        return
      case 'mock-interview':
        setMockInterviewOpen(true)
        return
      case 'continue-reading':
        if (selectedDoc?.relativePath) {
          handleSelectDoc(selectedDoc.relativePath)
        } else if (quickStartDocs[0]) {
          handleSelectDoc(quickStartDocs[0].relativePath)
        }
    }
  }

  async function handleInstall() {
    if (!installPrompt) {
      return
    }

    await installPrompt.prompt()
    await installPrompt.userChoice
    setInstallPrompt(null)
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${drawerOpen ? 'open' : ''}`}>
        <div className="sidebar-head">
          <div>
            <p className="eyebrow">{domainConfig?.sidebarEyebrow ?? 'دراسة متنقلة'}</p>
            <h1>{domainConfig?.appTitle ?? 'مسار الدراسة المهنية'}</h1>
          </div>
          <button type="button" className="icon-button mobile-only" title="إغلاق القائمة" aria-label="إغلاق القائمة" onClick={() => setDrawerOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="search-box">
          <Search size={18} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={domainConfig?.searchPlaceholder ?? 'ابحث عن درس أو ملحق أو اختبار'}
          />
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <span>{docsCount}</span>
            <small>ملف دراسي</small>
          </div>
          <div className="stat-card">
            <span>{foldersCount}</span>
            <small>مجلد</small>
          </div>
        </div>

        <div className="sidebar-note">
          <p className="eyebrow">{copy.sidebarNoteTitle ?? 'الفهرس الكامل'}</p>
          <p>{copy.sidebarNoteBody ?? 'استكشف المسار كاملًا من هنا، أو استخدم البطاقات في الواجهة الرئيسية للدخول السريع إلى الجزء المناسب.'}</p>
        </div>

        <div className="sidebar-tree">
          {loading ? <p className="muted">جار تحميل الفهرس...</p> : null}
          {filteredTree ? (
            <TreeItem node={filteredTree} depth={0} activePath={selectedPath} onSelect={handleSelectDoc} />
          ) : null}
        </div>
      </aside>

      {drawerOpen ? <button type="button" className="drawer-backdrop" title="إغلاق القائمة" aria-label="إغلاق القائمة" onClick={() => setDrawerOpen(false)} /> : null}

      {features.readingProgress !== false ? <ReadingProgress resetKey={selectedPath} /> : null}

      <main className="reader-panel">
        <header className="reader-header">
          <div className="header-actions">
            <button type="button" className="icon-button mobile-only" title="فتح القائمة" aria-label="فتح القائمة" onClick={() => setDrawerOpen(true)}>
              <Menu size={20} />
            </button>
            <div>
              <p className="eyebrow">{domainConfig?.readerEyebrow ?? 'تصفح مباشر للمحتوى'}</p>
              <h2>{selectedDoc?.title ?? 'اختر ملفًا للقراءة'}</h2>
            </div>
          </div>

          <div className="cta-row">
            {features.flashcards !== false ? (
              <button
                type="button"
                className="flashcard-trigger"
                onClick={() => setFlashcardsOpen(true)}
                title={launchers.flashcards?.title ?? 'البطاقات التعليمية'}
              >
                <Brain size={16} />
                <span>{launchers.flashcards?.label ?? 'بطاقات'}</span>
                {flashcardDueCount > 0 ? <span className="flashcard-trigger__badge">{flashcardDueCount}</span> : null}
              </button>
            ) : null}
            {features.quizzes !== false ? (
              <button
                type="button"
                className="quiz-trigger"
                onClick={() => {
                  setQuizInitialLessonId(undefined)
                  setQuizOpen(true)
                }}
                title={launchers.quizzes?.title ?? 'الاختبارات والتقييم'}
              >
                <ListChecks size={16} />
                <span>{launchers.quizzes?.label ?? 'اختبارات'}</span>
                {quizMistakesCount > 0 ? <span className="quiz-trigger__badge">{quizMistakesCount}</span> : null}
              </button>
            ) : null}
            {features.quizzes !== false && selectedDoc?.trackable && selectedLessonQuizCount > 0 ? (
              <button
                type="button"
                className="quiz-trigger"
                onClick={() => {
                  setQuizInitialLessonId(selectedDoc.id)
                  setQuizOpen(true)
                }}
                title={launchers.lessonQuiz?.title ?? 'اختبر هذا الدرس'}
              >
                <Target size={16} />
                <span>{launchers.lessonQuiz?.label ?? 'اختبر هذا الدرس'}</span>
              </button>
            ) : null}
            {features.dashboard !== false ? (
              <button
                type="button"
                className="dashboard-trigger"
                onClick={() => setDashboardOpen(true)}
                title={launchers.dashboard?.title ?? 'لوحتي'}
              >
                <LayoutGrid size={16} />
                <span>{launchers.dashboard?.label ?? 'لوحتي'}</span>
              </button>
            ) : null}
            {features.systemMap !== false ? (
              <button
                type="button"
                className="system-map-trigger"
                onClick={() => setSystemMapOpen(true)}
                title={launchers.systemMap?.title ?? 'خريطة المصطلحات بين الأنظمة'}
              >
                <GitCompareArrows size={16} />
                <span>{launchers.systemMap?.label ?? 'الأنظمة'}</span>
              </button>
            ) : null}
            {features.mockInterview !== false ? (
              <button
                type="button"
                className="mock-interview-trigger"
                onClick={() => setMockInterviewOpen(true)}
                title={launchers.mockInterview?.title ?? 'محاكاة المقابلة'}
              >
                <Target size={16} />
                <span>{launchers.mockInterview?.label ?? 'مقابلة'}</span>
              </button>
            ) : null}
            <button
              type="button"
              className="review-trigger"
              onClick={() => setReviewOpen(true)}
              title={launchers.review?.title ?? 'قائمة المراجعة'}
            >
              <Calendar size={16} />
              <span>{launchers.review?.label ?? 'المراجعة'}</span>
              {reviewDue.length > 0 ? <span className="review-trigger__badge">{reviewDue.length}</span> : null}
            </button>
            {installPrompt ? (
              <button type="button" className="install-button" onClick={handleInstall}>
                <Download size={18} />
                {launchers.install?.label ?? 'تثبيت على الهاتف'}
              </button>
            ) : null}
          </div>
        </header>

        <section className="hero-grid">
          <section className="hero-panel">
            <div>
              <p className="eyebrow">{copy.heroEyebrow ?? 'أفضل خيار لأندرويد'}</p>
              <h3>{copy.heroTitle ?? 'واجهة قراءة أقوى، أسرع، وأوضح لمسار الدراسة كله'}</h3>
              <p>{copy.heroBody ?? 'بدل قائمة طويلة متعبة، صار عندك مدخل بصري واضح: ملفات الجذر، خريطة الأجزاء، ومداخل ذكية تعيدك إلى أهم النقاط خلال ثوانٍ.'}</p>
            </div>
            <div className="hero-badges">
              <span><BookOpen size={16} /> قراءة Markdown مباشرة</span>
              <span><FolderTree size={16} /> تصفح حسب المجلدات</span>
              <span><Sparkles size={16} /> PWA جاهز للتثبيت</span>
            </div>
          </section>

          <aside className="focus-panel">
            <div className="focus-panel__intro">
              <p className="eyebrow">{copy.quickStartEyebrow ?? 'محطات ذكية'}</p>
              <h3>{copy.quickStartTitle ?? 'لا تبدأ من الصفر كل مرة'}</h3>
              <p>{copy.quickStartBody ?? 'هذه المداخل تقفز بك فورًا إلى ما تحتاجه الآن: متابعة القراءة، بدء منظم، أو مرجع سريع.'}</p>
            </div>

            <div className="focus-list">
              {quickStartDocs.map((doc, index) => (
                <button
                  key={doc.relativePath}
                  type="button"
                  className={`focus-card ${index === 0 ? 'primary' : ''}`}
                  onClick={() => handleSelectDoc(doc.relativePath)}
                >
                  <span className="focus-card__label">{index === 0 ? 'متابعة القراءة' : 'دخول سريع'}</span>
                  <strong>{doc.title}</strong>
                  <small>{doc.pathLabel || 'الملفات الرئيسية'}</small>
                  <ArrowUpLeft size={18} />
                </button>
              ))}
            </div>
          </aside>
        </section>

        {studyCoach ? (
          <section className={`study-coach study-coach--${studyCoach.tone}`}>
            <div className="study-coach__copy">
              <p className="eyebrow">{copy.coachEyebrow ?? 'الخطوة التالية'}</p>
              <h3>{copy.coachTitle ?? 'لا تترك الدراسة تتوزع بين أدوات كثيرة'}</h3>
              <p className="study-coach__lead">{copy.coachBody ?? 'المحرّك يرشح لك الآن أفضل خطوة ترفع الفهم والتثبيت قبل الانتقال إلى شيء جديد.'}</p>
              <strong className="study-coach__title">{studyCoach.title}</strong>
              <p className="study-coach__body">{studyCoach.body}</p>
            </div>
            <div className="study-coach__actionbox">
              <span className="study-coach__meta">{studyCoach.meta}</span>
              <button
                type="button"
                className="study-coach__button"
                onClick={() => handleStudyCoachAction(studyCoach.actionId)}
              >
                {studyCoach.actionLabel}
              </button>
            </div>
          </section>
        ) : null}

        <section className="quick-strip">
          <div className="section-header">
            <div>
              <p className="eyebrow">الأساسيات القريبة</p>
              <h3 className="section-title">ملفات الجذر التي ستعود لها باستمرار</h3>
            </div>
            <p className="section-copy">
              {selectedSection
                ? `أنت الآن داخل: ${selectedSection.title}`
                : 'اختر نقطة دخول أساسية قبل أن تنزل إلى تفاصيل الأجزاء.'}
            </p>
          </div>

          <div className="quick-pills">
            {rootDocs.map((doc) => (
              <button
                key={doc.relativePath}
                type="button"
                className={`quick-pill ${selectedPath === doc.relativePath ? 'active' : ''}`}
                onClick={() => handleSelectDoc(doc.relativePath)}
              >
                {doc.title}
              </button>
            ))}
          </div>
        </section>

        <section className="section-showcase">
          <div className="section-header">
            <div>
              <p className="eyebrow">خريطة المسار</p>
              <h3 className="section-title">ادخل إلى أي جزء بمنطق، لا بعشوائية</h3>
            </div>
            <p className="section-copy">كل بطاقة تمثل جزءًا رئيسيًا. افتحها من المدخل الأول وابقَ داخل نفس المسار حتى تنهيه.</p>
          </div>

          <div className="section-grid">
            {topSections.map((section, index) => (
              <button
                key={section.relativePath}
                type="button"
                className={`section-card tone-${(index % 4) + 1} ${selectedSection?.relativePath === section.relativePath ? 'active' : ''}`}
                onClick={() => section.firstDoc && handleSelectDoc(section.firstDoc.relativePath)}
              >
                <span className="section-card__index">{section.indexLabel}</span>
                <div className="section-card__body">
                  <p className="section-card__eyebrow">{section.docsCount} ملف</p>
                  <h4>{section.title}</h4>
                  <p>{section.firstDoc?.title ?? 'ابدأ من بداية هذا الجزء المرتبة.'}</p>
                </div>
                <div className="section-card__footer">
                  <span>{section.firstDoc ? 'افتح المدخل الأول' : 'استكشف الجزء'}</span>
                  <ArrowUpLeft size={16} />
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="reader-insights">
          <div className="insight-card">
            <Compass size={18} />
            <div>
              <strong>المسار الحالي</strong>
              <span>{selectedDoc?.pathLabel || 'أنت في نقطة البداية العامة.'}</span>
            </div>
          </div>
          <div className="insight-card">
            <BookMarked size={18} />
            <div>
              <strong>الملف الحالي</strong>
              <span>{selectedDoc?.title || 'اختر ملفًا من أي بطاقة أو من الفهرس الجانبي.'}</span>
            </div>
          </div>
          <div className="insight-card">
            <LayoutGrid size={18} />
            <div>
              <strong>التغطية</strong>
              <span>{docsCount} ملفًا دراسيًا داخل {foldersCount} مجلدًا منظمًا.</span>
            </div>
          </div>
          <div className="insight-card">
            <Target size={18} />
            <div>
              <strong>آخر تحديث</strong>
              <span>{manifest ? new Date(manifest.generatedAt).toLocaleDateString('ar') : 'جار التحديث...'}</span>
            </div>
          </div>
        </section>

        <div className="reader-shell">
          <section className="doc-meta">
            <span>{selectedDoc?.pathLabel || 'المجلد الجذر'}</span>
            {currentReviewState.inQueue ? (
              <span className={`review-chip ${currentReviewState.isDue ? 'review-chip--due' : ''}`}>
                <Calendar size={13} />
                {currentReviewState.isDue ? 'هذا درس مستحقّ المراجعة' : 'في قائمة المراجعة'}
              </span>
            ) : null}
            <span>{manifest ? `آخر تحديث: ${new Date(manifest.generatedAt).toLocaleDateString('ar')}` : ''}</span>
          </section>

          {selectedDoc ? (
            <div className="reader-toolbar">
              <ReadingMeta doc={selectedDoc} />
              <div className="reader-toolbar__right">
                <FontSizeControl />
                {features.focusMode !== false ? <FocusToggle /> : null}
              </div>
            </div>
          ) : null}

          {features.preread !== false && selectedDoc && selectedDoc.prereadQuestions && selectedDoc.prereadQuestions.length > 0 ? (
            <PrereadCard questions={selectedDoc.prereadQuestions} seed={selectedDoc.id} />
          ) : null}

          {features.tableOfContents !== false && selectedDoc && selectedDoc.headings && selectedDoc.headings.length > 1 ? (
            <TableOfContents headings={selectedDoc.headings} />
          ) : null}

          <article className="markdown-card">
          {!selectedDoc ? <p className="muted">اختر ملفًا من القائمة لبدء القراءة.</p> : null}
          {selectedDoc && !content ? <p className="muted">جار تحميل الملف...</p> : null}
          {content ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ href = '', children, ...props }) => {
                  const internalPath = decodeInternalPath(href)

                  if (internalPath && allDocs.some((doc) => doc.relativePath === internalPath)) {
                    return (
                      <a
                        {...props}
                        href="#"
                        onClick={(event) => {
                          event.preventDefault()
                          handleSelectDoc(internalPath)
                        }}
                      >
                        {children}
                      </a>
                    )
                  }

                  return (
                    <a {...props} href={href} target="_blank" rel="noreferrer">
                      {children}
                    </a>
                  )
                },
                p: ({ children, ...props }) => (
                  <p {...props}>{decorateChildren(children, glossaryIndex)}</p>
                ),
                td: ({ children, ...props }) => (
                  <td {...props}>{decorateChildren(children, glossaryIndex)}</td>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          ) : null}
          </article>

          {features.selfAssess !== false && selectedDoc && selectedDoc.trackable && content ? (
            <>
              <FeynmanBox lessonId={selectedDoc.id} headings={selectedDoc.headings} />
              <RatingWidget lessonId={selectedDoc.id} />
            </>
          ) : null}
        </div>
      </main>

      <ReviewQueueDrawer
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        resolveTitle={resolveDocTitleById}
        onOpenItem={openDocById}
      />

      {features.flashcards !== false ? <FlashcardScreen open={flashcardsOpen} onClose={() => setFlashcardsOpen(false)} /> : null}

      {features.quizzes !== false ? (
        <QuizScreen
          open={quizOpen}
          onClose={() => {
            setQuizOpen(false)
            setQuizInitialLessonId(undefined)
          }}
          resolveDocTitleById={resolveDocTitleById}
          openDocById={openDocById}
          initialLessonId={quizInitialLessonId}
        />
      ) : null}

      {features.dashboard !== false ? (
        <DashboardScreen
          open={dashboardOpen}
          onClose={() => setDashboardOpen(false)}
          lessonPartLookup={lessonPartLookup}
          questionPartLookup={questionPartLookup}
          firstLessonInPart={firstLessonInPart}
          onOpenLesson={openDocById}
        />
      ) : null}

      {features.systemMap !== false ? <SystemMapScreen open={systemMapOpen} onClose={() => setSystemMapOpen(false)} /> : null}

      {features.mockInterview !== false ? (
        <MockInterviewScreen
          open={mockInterviewOpen}
          onClose={() => setMockInterviewOpen(false)}
          questions={allQuestions}
          currentLessonId={selectedDoc?.trackable ? selectedDoc.id : undefined}
          currentPartId={selectedDoc?.partId}
          resolveDocTitleById={resolveDocTitleById}
          openDocById={openDocById}
        />
      ) : null}
    </div>
  )
}

export default App
