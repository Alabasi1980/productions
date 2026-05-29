import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, BookOpen, ChevronLeft, Layers, Shuffle, Target, Trophy, X } from 'lucide-react'
import type { Question } from '../../engine/types'
import { QuizQuestion } from './QuizQuestion'
import {
  bankStats,
  getMistakesList,
  pickByPart,
  pickInterleaved,
  pickMistakes,
  shuffle,
  useQuizBank,
  useQuizState,
} from './hooks'
import type { QuizMode, SelfGrade } from './types'

type Props = {
  open: boolean
  onClose: () => void
  /** Resolves an id from data to a human-facing title (lesson navigation). */
  resolveDocTitleById?: (id: string) => string | null
  /** Opens a doc by id (used for "show reference"). */
  openDocById?: (id: string) => void
  /** Optional initial scope: opens lobby preselected to part (for e.g. quiz launchers). */
  initialPartId?: string
  /** Optional initial scope: starts a quiz for the current lesson. */
  initialLessonId?: string
}

const PART_LABELS: Record<string, string> = {
  meta: 'التمهيد والقاموس',
  'part-1': 'الجزء الأول — الأساسيات',
  'part-2': 'الجزء الثاني — البيانات الأساسية',
  'part-3': 'الجزء الثالث — التنفيذ',
  'part-4': 'الجزء الرابع — التكاليف',
  'part-5': 'الجزء الخامس — الجودة والتخطيط',
  'part-6': 'الجزء السادس — الاستشارات',
}

const INTERLEAVED_SIZE = 12
const PART_SAMPLE_SIZE = 10

export function QuizScreen({ open, onClose, resolveDocTitleById, openDocById, initialLessonId }: Props) {
  const { questions, loading, error } = useQuizBank()
  const { attempts, mistakes, recordAttempt, reload } = useQuizState()
  const [sessionQuestions, setSessionQuestions] = useState<Question[] | null>(null)
  const [sessionLabel, setSessionLabel] = useState<string>('')
  const [sessionMode, setSessionMode] = useState<QuizMode | null>(null)
  const [sessionPartId, setSessionPartId] = useState<string | undefined>(undefined)
  const [sessionLessonId, setSessionLessonId] = useState<string | undefined>(undefined)
  const [index, setIndex] = useState(0)
  const [grades, setGrades] = useState<Record<string, SelfGrade>>({})
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!open) {
      setSessionQuestions(null)
      setSessionMode(null)
      setSessionPartId(undefined)
      setSessionLessonId(undefined)
      setSessionLabel('')
      setIndex(0)
      setGrades({})
      setDone(false)
    } else {
      reload()
    }
  }, [open, reload])

  const stats = useMemo(() => bankStats(questions, attempts, mistakes), [questions, attempts, mistakes])

  useEffect(() => {
    if (!open || !initialLessonId || loading || error || sessionQuestions) return
    if (!questions.some((question) => question.lessonId === initialLessonId)) return
    startSession('lesson', undefined, initialLessonId)
  }, [open, initialLessonId, loading, error, questions, sessionQuestions])

  function startSession(mode: QuizMode, partId?: string, lessonId?: string) {
    let pool: Question[]
    let label = ''

    if (mode === 'interleaved') {
      pool = pickInterleaved(questions, INTERLEAVED_SIZE)
      label = 'اختبار مختلط — تداخل المواضيع'
    } else if (mode === 'mistakes') {
      pool = shuffle(pickMistakes(questions, mistakes))
      label = 'مراجعة الأخطاء'
    } else if (mode === 'part' && partId) {
      pool = shuffle(pickByPart(questions, partId)).slice(0, PART_SAMPLE_SIZE)
      label = PART_LABELS[partId] ?? partId
    } else if (mode === 'lesson' && lessonId) {
      pool = shuffle(questions.filter((question) => question.lessonId === lessonId))
      label = resolveDocTitleById?.(lessonId) ?? 'اختبار هذا الدرس'
    } else {
      return
    }

    setSessionQuestions(pool)
    setSessionMode(mode)
    setSessionPartId(partId)
    setSessionLessonId(lessonId)
    setSessionLabel(label)
    setIndex(0)
    setGrades({})
    setDone(pool.length === 0)
  }

  function handleGrade(userAnswer: string, grade: SelfGrade) {
    if (!sessionQuestions) return
    const current = sessionQuestions[index]
    recordAttempt(current, userAnswer, grade)
    setGrades((prev) => ({ ...prev, [current.id]: grade }))
    if (index + 1 >= sessionQuestions.length) {
      setDone(true)
    } else {
      setIndex((current) => current + 1)
    }
  }

  function exitSession() {
    setSessionQuestions(null)
    setSessionMode(null)
    setSessionLabel('')
    setIndex(0)
    setGrades({})
    setDone(false)
  }

  if (!open) return null

  return (
    <div className="quiz-screen" dir="rtl" role="dialog" aria-modal="true">
      <header className="quiz-screen__head">
        <button
          type="button"
          className="icon-button"
          onClick={sessionQuestions ? exitSession : onClose}
          aria-label={sessionQuestions ? 'العودة' : 'إغلاق'}
        >
          {sessionQuestions ? <ChevronLeft size={20} /> : <X size={20} />}
        </button>
        <h2>
          <Target size={18} />
          {sessionLabel || 'الاختبارات والتقييم'}
        </h2>
        <span aria-hidden="true" className="quiz-screen__spacer" />
      </header>

      <main className="quiz-screen__body">
        {loading ? (
          <p className="quiz-screen__muted">جار تحميل بنك الأسئلة...</p>
        ) : error ? (
          <p className="quiz-screen__muted">تعذّر تحميل البنك: {error}</p>
        ) : !sessionQuestions ? (
          <QuizLobby
            stats={stats}
            availableParts={Object.keys(stats.byPart).sort().filter((partId) => (stats.byPart[partId] ?? 0) > 0)}
            onStartInterleaved={() => startSession('interleaved')}
            onStartPart={(partId) => startSession('part', partId)}
            onStartMistakes={() => startSession('mistakes')}
            mistakesList={getMistakesList(mistakes)}
            resolveDocTitleById={resolveDocTitleById}
            openDocById={openDocById}
          />
        ) : done ? (
          <SessionSummary
            grades={grades}
            total={sessionQuestions.length}
            onAgain={() => {
              if (sessionMode === 'mistakes') return startSession('mistakes')
              if (sessionMode === 'part' && sessionPartId) return startSession('part', sessionPartId)
              if (sessionMode === 'lesson' && sessionLessonId) return startSession('lesson', undefined, sessionLessonId)
              if (sessionMode) return startSession(sessionMode)
            }}
            onExit={exitSession}
          />
        ) : sessionQuestions.length === 0 ? (
          <p className="quiz-screen__muted">لا توجد أسئلة في هذا النطاق.</p>
        ) : (
          <QuizQuestion
            key={sessionQuestions[index].id}
            question={sessionQuestions[index]}
            index={index}
            total={sessionQuestions.length}
            resolveLessonTitle={resolveDocTitleById}
            onGrade={handleGrade}
            onOpenLesson={openDocById}
          />
        )}
      </main>
    </div>
  )
}

// ─── Lobby ─────────────────────────────────────────────────────────

function QuizLobby({
  stats,
  availableParts,
  onStartInterleaved,
  onStartPart,
  onStartMistakes,
  mistakesList,
  resolveDocTitleById,
  openDocById,
}: {
  stats: ReturnType<typeof bankStats>
  availableParts: string[]
  onStartInterleaved: () => void
  onStartPart: (partId: string) => void
  onStartMistakes: () => void
  mistakesList: ReturnType<typeof getMistakesList>
  resolveDocTitleById?: (id: string) => string | null
  openDocById?: (id: string) => void
}) {
  const accuracy = stats.attempted > 0 ? Math.round((stats.correct / stats.attempted) * 100) : 0

  return (
    <div className="quiz-lobby">
      <div className="quiz-lobby__stats">
        <div className="quiz-stat">
          <span className="quiz-stat__num">{stats.total}</span>
          <span className="quiz-stat__label">سؤال متاح</span>
        </div>
        <div className="quiz-stat">
          <span className="quiz-stat__num">{stats.attempted}</span>
          <span className="quiz-stat__label">حاولت إجابتها</span>
        </div>
        <div className="quiz-stat quiz-stat--accent">
          <span className="quiz-stat__num">{accuracy}%</span>
          <span className="quiz-stat__label">دقتك الذاتية</span>
        </div>
        <div className="quiz-stat quiz-stat--warning">
          <span className="quiz-stat__num">{stats.mistakes}</span>
          <span className="quiz-stat__label">في دفتر الأخطاء</span>
        </div>
      </div>

      <section className="quiz-lobby__section">
        <h3 className="quiz-lobby__section-title">ابدأ اختباراً</h3>
        <div className="quiz-mode-grid">
          <button
            type="button"
            className="quiz-mode quiz-mode--primary"
            onClick={onStartInterleaved}
          >
            <Shuffle size={18} />
            <div>
              <strong>اختبار مختلط</strong>
              <span>{INTERLEAVED_SIZE} أسئلة عبر مواضيع متنوعة</span>
            </div>
          </button>

          {stats.mistakes > 0 ? (
            <button
              type="button"
              className="quiz-mode quiz-mode--danger"
              onClick={onStartMistakes}
            >
              <AlertTriangle size={18} />
              <div>
                <strong>مراجعة الأخطاء</strong>
                <span>{stats.mistakes} سؤال أخطأت فيها سابقاً</span>
              </div>
            </button>
          ) : null}
        </div>
      </section>

      <section className="quiz-lobby__section">
        <h3 className="quiz-lobby__section-title">اختبارات حسب الجزء</h3>
        <div className="quiz-parts">
          {availableParts.map((partId) => (
            <button
              key={partId}
              type="button"
              className="quiz-part"
              onClick={() => onStartPart(partId)}
              disabled={(stats.byPart[partId] ?? 0) === 0}
            >
              <Layers size={14} />
              <span className="quiz-part__name">{PART_LABELS[partId] ?? partId}</span>
              <span className="quiz-part__count">{stats.byPart[partId] ?? 0}</span>
            </button>
          ))}
        </div>
      </section>

      {mistakesList.length > 0 ? (
        <section className="quiz-lobby__section">
          <h3 className="quiz-lobby__section-title">دفتر الأخطاء — آخر ما أخطأت</h3>
          <div className="quiz-mistakes">
            {mistakesList.slice(0, 6).map((mistake) => {
              const lessonTitle = mistake.lessonId ? resolveDocTitleById?.(mistake.lessonId) : null
              return (
                <article key={mistake.questionId} className="quiz-mistake">
                  <p className="quiz-mistake__q">{mistake.questionText}</p>
                  {lessonTitle ? (
                    <button
                      type="button"
                      className="quiz-mistake__link"
                      onClick={() => mistake.lessonId && openDocById?.(mistake.lessonId)}
                    >
                      <BookOpen size={12} /> {lessonTitle}
                    </button>
                  ) : null}
                </article>
              )
            })}
          </div>
        </section>
      ) : null}
    </div>
  )
}

// ─── Summary ───────────────────────────────────────────────────────

function SessionSummary({
  grades,
  total,
  onAgain,
  onExit,
}: {
  grades: Record<string, SelfGrade>
  total: number
  onAgain: () => void
  onExit: () => void
}) {
  const correct = Object.values(grades).filter((g) => g === 'correct').length
  const partial = Object.values(grades).filter((g) => g === 'partial').length
  const wrong = Object.values(grades).filter((g) => g === 'wrong').length
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0

  return (
    <div className="quiz-summary">
      <Trophy size={48} />
      <h3>أنهيت الجلسة</h3>
      <p className="quiz-summary__big">{pct}% صحيح</p>
      <div className="quiz-summary__chips">
        <span className="quiz-chip quiz-chip--correct">{correct} صحيحة</span>
        <span className="quiz-chip quiz-chip--partial">{partial} جزئية</span>
        <span className="quiz-chip quiz-chip--wrong">{wrong} خاطئة</span>
      </div>
      {wrong > 0 ? (
        <p className="quiz-summary__hint">الأسئلة التي أخطأت فيها أُضيفت إلى دفتر الأخطاء.</p>
      ) : null}
      <div className="quiz-summary__actions">
        <button type="button" className="quiz-action" onClick={onAgain}>أعد جلسة مماثلة</button>
        <button type="button" className="quiz-action quiz-action--primary" onClick={onExit}>عودة للقائمة</button>
      </div>
    </div>
  )
}
