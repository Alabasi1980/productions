import { useEffect, useMemo, useState } from 'react'
import { BookOpen, ChevronLeft, Target, X } from 'lucide-react'
import type { InterviewGuideEntry, Question } from '../../engine/types'
import { loadInterviewBank } from '../../engine/content'
import { logActivity } from '../../features/dashboard/activity'
import { readInterviewResults, recordInterviewResult, type InterviewRating, type InterviewScope } from './interview-storage'

type Props = {
  open: boolean
  onClose: () => void
  questions: Question[]
  currentLessonId?: string
  currentPartId?: string
  resolveDocTitleById?: (id: string) => string | null
  openDocById?: (id: string) => void
}

type InterviewPrompt = {
  question: Question
  stage: 'warmup' | 'deep' | 'scenario'
  coaching: string
}

type SessionMode = InterviewScope | 'review'

const STAGE_LABELS: Record<InterviewPrompt['stage'], string> = {
  warmup: 'تمهيد وتعريف',
  deep: 'تفكيك وتحليل',
  scenario: 'حالة واستجابة',
}

const RATING_LABELS: Record<InterviewRating, string> = {
  strong: 'إجابتي قوية',
  medium: 'مقبولة لكن تحتاج صقل',
  weak: 'أحتاج تدريبًا أكثر',
}

function getSectionType(question: Question): string {
  return typeof question.sectionType === 'string' ? question.sectionType : 'general'
}

function isInterviewCandidate(question: Question): boolean {
  if (question.type === 'multiple-choice' || question.type === 'true-false') return false
  const sectionType = getSectionType(question)
  return ['concept', 'terminology', 'analysis', 'comparison', 'scenario', 'general'].includes(sectionType)
}

function getCoaching(question: Question): string {
  switch (getSectionType(question)) {
    case 'scenario':
      return 'ابدأ بتوصيف المشكلة، ثم الأثر التشغيلي، ثم سببين محتملين، ثم بيانات أو شاشات ستراجعها، ثم الإجراء العملي المقترح.'
    case 'comparison':
      return 'لا تكتف بذكر فرق واحد. قارن في الهدف، البيانات المستخدمة، توقيت الاستخدام، والأثر على التنفيذ أو التكلفة.'
    case 'analysis':
      return 'قسّم الإجابة إلى: السبب، التسلسل، النتيجة، ومؤشر النجاح. هذا يمنع الإجابة العامة غير المقنعة.'
    case 'terminology':
      return 'عرّف المصطلح بدقة، ثم اربطه بمثال من دورة الإنتاج أو بموقف تنفيذي يثبت أنك تفهمه عمليًا.'
    case 'concept':
      return 'ابدأ بالتعريف، ثم لماذا يهم، ثم مثال قصير. هذا النمط مناسب جدًا لأسئلة المقابلة الافتتاحية.'
    default:
      return 'اجعل الإجابة في نقاط: الفكرة، الخطوات، الخطأ الشائع، ثم مثال قصير من العمل أو التطبيق.'
  }
}

function normalizeForMatch(text: string): string {
  return text
    .toLowerCase()
    .replace(/[؟?.,:;!()[\]{}]/g, ' ')
    .replace(/\b(ما|متى|كيف|لماذا|ماهو|ما\s+هو|الفرق|بين|و|في|عن|من|إلى|على|هذا|هذه)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function findBestGuide(question: Question, guides: InterviewGuideEntry[]): InterviewGuideEntry | null {
  const questionKey = normalizeForMatch(question.text)
  if (!questionKey) return null

  let bestGuide: InterviewGuideEntry | null = null
  let bestScore = 0
  const questionTokens = questionKey.split(' ').filter((token) => token.length > 2)

  for (const guide of guides) {
    const guideKey = typeof guide.matchKey === 'string' ? guide.matchKey : normalizeForMatch(guide.title)
    if (!guideKey) continue
    const matchedTokens = questionTokens.filter((token) => guideKey.includes(token)).length
    if (matchedTokens > bestScore) {
      bestScore = matchedTokens
      bestGuide = guide
    }
  }

  return bestScore >= 2 ? bestGuide : null
}

function uniqueById(questions: Question[]): Question[] {
  const seen = new Set<string>()
  return questions.filter((question) => {
    if (seen.has(question.id)) return false
    seen.add(question.id)
    return true
  })
}

function buildInterviewPrompts(questions: Question[], scope: InterviewScope, currentLessonId?: string, currentPartId?: string): InterviewPrompt[] {
  const candidates = uniqueById(questions.filter(isInterviewCandidate))

  const scopedCandidates = scope === 'lesson'
    ? candidates.filter((question) => question.lessonId === currentLessonId)
    : scope === 'part'
      ? candidates.filter((question) => question.partId === currentPartId)
      : candidates

  const fallbackCandidates = scope === 'lesson' && currentPartId
    ? uniqueById([...scopedCandidates, ...candidates.filter((question) => question.partId === currentPartId)])
    : scopedCandidates

  const pool = fallbackCandidates.length > 0 ? fallbackCandidates : candidates
  const warmup = pool.filter((question) => ['concept', 'terminology', 'general'].includes(getSectionType(question)))
  const deep = pool.filter((question) => ['analysis', 'comparison'].includes(getSectionType(question)))
  const scenarios = pool.filter((question) => getSectionType(question) === 'scenario')

  const selected = uniqueById([
    ...warmup.slice(0, 2),
    ...deep.slice(0, 2),
    ...scenarios.slice(0, 2),
  ])

  for (const question of pool) {
    if (selected.length >= 6) break
    if (!selected.some((item) => item.id === question.id)) selected.push(question)
  }

  return selected.slice(0, 6).map((question) => ({
    question,
    stage: getSectionType(question) === 'scenario'
      ? 'scenario'
      : ['analysis', 'comparison'].includes(getSectionType(question))
        ? 'deep'
        : 'warmup',
    coaching: getCoaching(question),
  }))
}

function buildReviewPrompts(questions: Question[], failedQuestionIds: string[]): InterviewPrompt[] {
  const pool = uniqueById(
    questions.filter((question) => failedQuestionIds.includes(question.id) && isInterviewCandidate(question)),
  )

  return pool.slice(0, 6).map((question) => ({
    question,
    stage: getSectionType(question) === 'scenario'
      ? 'scenario'
      : ['analysis', 'comparison'].includes(getSectionType(question))
        ? 'deep'
        : 'warmup',
    coaching: getCoaching(question),
  }))
}

export function MockInterviewScreen({
  open,
  onClose,
  questions,
  currentLessonId,
  currentPartId,
  resolveDocTitleById,
  openDocById,
}: Props) {
  const [sessionPrompts, setSessionPrompts] = useState<InterviewPrompt[] | null>(null)
  const [sessionScope, setSessionScope] = useState<SessionMode | null>(null)
  const [sessionLabel, setSessionLabel] = useState('')
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [ratings, setRatings] = useState<Record<string, InterviewRating>>({})
  const [guides, setGuides] = useState<InterviewGuideEntry[]>([])

  useEffect(() => {
    if (!open) {
      setSessionPrompts(null)
      setSessionScope(null)
      setSessionLabel('')
      setIndex(0)
      setRevealed(false)
      setNotes({})
      setRatings({})
    }
  }, [open])

  useEffect(() => {
    setRevealed(false)
  }, [index, sessionPrompts])

  useEffect(() => {
    let active = true

    loadInterviewBank()
      .then((bundle) => {
        if (active) setGuides(bundle.guides)
      })
      .catch(() => {
        if (active) setGuides([])
      })

    return () => {
      active = false
    }
  }, [])

  const lessonCandidates = useMemo(
    () => (currentLessonId ? questions.filter((question) => isInterviewCandidate(question) && question.lessonId === currentLessonId) : []),
    [currentLessonId, questions],
  )
  const partCandidates = useMemo(
    () => (currentPartId ? questions.filter((question) => isInterviewCandidate(question) && question.partId === currentPartId) : []),
    [currentPartId, questions],
  )
  const mixedCandidates = useMemo(
    () => questions.filter(isInterviewCandidate),
    [questions],
  )
  const interviewResults = useMemo(
    () => Object.values(readInterviewResults()).sort((a, b) => b.loggedAt - a.loggedAt),
    [open, ratings],
  )
  const recentResults = useMemo(() => interviewResults.slice(0, 5), [interviewResults])
  const weakReviewIds = useMemo(() => {
    const weighted = new Map<string, number>()
    for (const result of interviewResults) {
      const currentWeight = weighted.get(result.questionId) ?? 0
      const delta = result.rating === 'weak' ? 2 : result.rating === 'medium' ? 1 : -1
      weighted.set(result.questionId, currentWeight + delta)
    }
    return Array.from(weighted.entries())
      .filter(([, score]) => score > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([questionId]) => questionId)
  }, [interviewResults])
  const reviewCandidates = useMemo(
    () => questions.filter((question) => weakReviewIds.includes(question.id) && isInterviewCandidate(question)),
    [questions, weakReviewIds],
  )

  if (!open) return null

  function startSession(scope: SessionMode) {
    const prompts = scope === 'review'
      ? buildReviewPrompts(questions, weakReviewIds)
      : buildInterviewPrompts(questions, scope, currentLessonId, currentPartId)
    setSessionPrompts(prompts)
    setSessionScope(scope)
    setSessionLabel(
      scope === 'review'
        ? 'مراجعة أسئلة المقابلة الأضعف'
        : scope === 'lesson'
        ? resolveDocTitleById?.(currentLessonId ?? '') ?? 'مقابلة هذا الدرس'
        : scope === 'part'
          ? 'مقابلة هذا الجزء'
          : 'مقابلة ERP مختلطة',
    )
    setIndex(0)
    setRatings({})
    setNotes({})
  }

  function exitSession() {
    setSessionPrompts(null)
    setSessionScope(null)
    setSessionLabel('')
    setIndex(0)
    setRevealed(false)
    setRatings({})
    setNotes({})
  }

  function rateCurrent(rating: InterviewRating) {
    if (!sessionPrompts || !sessionScope) return
    const current = sessionPrompts[index]
    setRatings((currentRatings) => ({ ...currentRatings, [current.question.id]: rating }))
    recordInterviewResult({
      questionId: current.question.id,
      lessonId: typeof current.question.lessonId === 'string' ? current.question.lessonId : undefined,
      partId: typeof current.question.partId === 'string' ? current.question.partId : undefined,
      scope: sessionScope === 'review' ? 'mixed' : sessionScope,
      rating,
      note: notes[current.question.id]?.trim() || undefined,
    })
    logActivity('quiz')

    if (index + 1 >= sessionPrompts.length) {
      setIndex(sessionPrompts.length)
      return
    }

    setIndex((currentIndex) => currentIndex + 1)
  }

  const done = sessionPrompts !== null && index >= sessionPrompts.length
  const current = sessionPrompts && !done ? sessionPrompts[index] : null
  const currentQuestion = current?.question
  const currentQuestionLessonId = typeof currentQuestion?.lessonId === 'string' ? currentQuestion.lessonId : undefined
  const currentLessonTitle = currentQuestionLessonId ? resolveDocTitleById?.(currentQuestionLessonId) ?? null : null
  const currentGuide = currentQuestion ? findBestGuide(currentQuestion, guides) : null

  const strongCount = Object.values(ratings).filter((rating) => rating === 'strong').length
  const mediumCount = Object.values(ratings).filter((rating) => rating === 'medium').length
  const weakCount = Object.values(ratings).filter((rating) => rating === 'weak').length

  return (
    <div className="mock-interview-screen" dir="rtl" role="dialog" aria-modal="true">
      <header className="mock-interview-screen__head">
        <button
          type="button"
          className="icon-button"
          onClick={sessionPrompts ? exitSession : onClose}
          aria-label={sessionPrompts ? 'العودة' : 'إغلاق'}
        >
          {sessionPrompts ? <ChevronLeft size={20} /> : <X size={20} />}
        </button>
        <h2>
          <Target size={18} />
          {sessionLabel || 'محاكاة المقابلة'}
        </h2>
        <span aria-hidden="true" className="mock-interview-screen__spacer" />
      </header>

      <main className="mock-interview-screen__body">
        {!sessionPrompts ? (
          <div className="mock-interview-lobby">
            <section className="mock-interview-hero">
              <p className="mock-interview-hero__eyebrow">محاكاة مهنية</p>
              <h3>درّب نفسك كما لو أنك داخل مقابلة فعلية</h3>
              <p>
                ستنتقل بين أسئلة تعريفية وتحليلية وسيناريوهات تطبيقية، ثم تقيّم قوة إجابتك ذاتيًا وتعود مباشرة إلى المرجع.
              </p>
            </section>

            <div className="mock-interview-grid">
              <button
                type="button"
                className="mock-interview-card"
                onClick={() => startSession('lesson')}
                disabled={!currentLessonId || lessonCandidates.length === 0}
              >
                <span className="mock-interview-card__eyebrow">مركّز</span>
                <strong>مقابلة هذا الدرس</strong>
                <p>أفضل خيار قبل مراجعة درس محدد أو قبل إعادة شرحه بصياغة مهنية.</p>
                <span className="mock-interview-card__count">{lessonCandidates.length} سؤال مرشح</span>
              </button>

              <button
                type="button"
                className="mock-interview-card"
                onClick={() => startSession('part')}
                disabled={!currentPartId || partCandidates.length === 0}
              >
                <span className="mock-interview-card__eyebrow">أوسع</span>
                <strong>مقابلة هذا الجزء</strong>
                <p>يناسب التحضير لجزء كامل مثل التنفيذ أو التكاليف بدل درس منفرد.</p>
                <span className="mock-interview-card__count">{partCandidates.length} سؤال مرشح</span>
              </button>

              <button
                type="button"
                className="mock-interview-card mock-interview-card--accent"
                onClick={() => startSession('mixed')}
                disabled={mixedCandidates.length === 0}
              >
                <span className="mock-interview-card__eyebrow">شامل</span>
                <strong>مقابلة ERP مختلطة</strong>
                <p>مزج بين المفاهيم والتحليل والسيناريوهات لتقوية جاهزيتك العامة قبل المقابلة.</p>
                <span className="mock-interview-card__count">{mixedCandidates.length} سؤال مرشح</span>
              </button>

              <button
                type="button"
                className="mock-interview-card mock-interview-card--warning"
                onClick={() => startSession('review')}
                disabled={reviewCandidates.length === 0}
              >
                <span className="mock-interview-card__eyebrow">مركّز جداً</span>
                <strong>مراجعة الأضعف</strong>
                <p>يعيد لك الأسئلة التي كانت إجاباتك فيها أضعف أو ما زالت تحتاج صقلًا.</p>
                <span className="mock-interview-card__count">{reviewCandidates.length} سؤال قابل للمراجعة</span>
              </button>
            </div>

            {recentResults.length > 0 ? (
              <section className="mock-interview-history">
                <header className="mock-interview-history__head">
                  <h4>آخر سجل المقابلات</h4>
                  <span>{recentResults.length} عناصر حديثة</span>
                </header>
                <div className="mock-interview-history__list">
                  {recentResults.map((result) => {
                    const question = questions.find((item) => item.id === result.questionId)
                    const lessonTitle = result.lessonId ? resolveDocTitleById?.(result.lessonId) : null
                    return (
                      <article key={result.id} className="mock-interview-history__item">
                        <span className={`mock-interview-history__badge mock-interview-history__badge--${result.rating}`}>
                          {RATING_LABELS[result.rating]}
                        </span>
                        <div className="mock-interview-history__body">
                          <strong>{question?.text ?? result.questionId}</strong>
                          <span>{lessonTitle ?? 'بدون مرجع مباشر'} · {new Date(result.loggedAt).toLocaleDateString('ar')}</span>
                          {result.note ? <p>{result.note}</p> : null}
                        </div>
                      </article>
                    )
                  })}
                </div>
              </section>
            ) : null}
          </div>
        ) : done ? (
          <div className="mock-interview-summary">
            <h3>انتهت الجلسة</h3>
            <p className="mock-interview-summary__lead">الآن راجع أين كانت إجاباتك قوية، وأين تحتاج إلى إعادة صياغة أو أمثلة عملية أكثر.</p>
            <div className="mock-interview-summary__stats">
              <div className="mock-interview-summary__stat mock-interview-summary__stat--strong">
                <strong>{strongCount}</strong>
                <span>قوية</span>
              </div>
              <div className="mock-interview-summary__stat mock-interview-summary__stat--medium">
                <strong>{mediumCount}</strong>
                <span>متوسطة</span>
              </div>
              <div className="mock-interview-summary__stat mock-interview-summary__stat--weak">
                <strong>{weakCount}</strong>
                <span>تحتاج تقوية</span>
              </div>
            </div>
            <div className="mock-interview-summary__actions">
              <button type="button" className="quiz-action quiz-action--primary" onClick={() => sessionScope && startSession(sessionScope)}>
                أعد المحاكاة
              </button>
              {weakReviewIds.length > 0 && sessionScope !== 'review' ? (
                <button type="button" className="quiz-action" onClick={() => startSession('review')}>
                  راجع الأضعف الآن
                </button>
              ) : null}
              <button type="button" className="quiz-action" onClick={exitSession}>
                عودة إلى الخيارات
              </button>
            </div>
          </div>
        ) : current && currentQuestion ? (
          <div className="mock-interview-session">
            <header className="mock-interview-session__head">
              <span className="mock-interview-session__pos">{index + 1} / {sessionPrompts.length}</span>
              <span className="mock-interview-session__stage">{STAGE_LABELS[current.stage]}</span>
            </header>

            <h3 className="mock-interview-session__question">{currentQuestion.text}</h3>

            <div className="mock-interview-tip">
              <strong>كيف تجيب باحتراف</strong>
              <p>{current.coaching}</p>
            </div>

            <textarea
              className="mock-interview-session__notes"
              value={notes[currentQuestion.id] ?? ''}
              onChange={(event) => setNotes((currentNotes) => ({ ...currentNotes, [currentQuestion.id]: event.target.value }))}
              placeholder="اكتب عناصر إجابتك، أو اتركها فارغة إذا كنت تتدرب شفهيًا..."
              rows={6}
            />

            {!revealed ? (
              <div className="mock-interview-session__actions">
                <button type="button" className="quiz-action quiz-action--reveal" onClick={() => setRevealed(true)}>
                  <BookOpen size={14} /> أظهر المرجع ومعيار التقييم
                </button>
              </div>
            ) : (
              <div className="mock-interview-session__feedback">
                <p className="mock-interview-session__rubric">
                  قيّم إجابتك على أساس: وضوح الفكرة، ترتيب الخطوات، الربط بالبيانات أو الحالة، ووجود مثال عملي أو أثر تشغيلي واضح.
                </p>

                {currentLessonTitle ? (
                  <p className="quiz-question__reference">
                    ارجع إلى المرجع المرتبط:&nbsp;
                    <button
                      type="button"
                      className="quiz-question__lesson-link"
                      onClick={() => currentQuestionLessonId && openDocById?.(currentQuestionLessonId)}
                    >
                      {currentLessonTitle}
                    </button>
                  </p>
                ) : null}

                {currentGuide && Array.isArray(currentGuide.points) && currentGuide.points.length > 0 ? (
                  <div className="mock-interview-session__guide">
                    <strong>عناصر الإجابة القوية</strong>
                    <ul>
                      {currentGuide.points.map((point) => (
                        <li key={`${currentGuide.id}-${point}`}>{point}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="mock-interview-session__ratings">
                  {(['strong', 'medium', 'weak'] as InterviewRating[]).map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      className={`mock-interview-rating mock-interview-rating--${rating}`}
                      onClick={() => rateCurrent(rating)}
                    >
                      {RATING_LABELS[rating]}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="mock-interview-screen__muted">لا توجد أسئلة مناسبة لهذه المحاكاة الآن.</p>
        )}
      </main>
    </div>
  )
}