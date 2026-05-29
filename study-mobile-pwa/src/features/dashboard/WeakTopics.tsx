import { AlertTriangle, ArrowUpLeft } from 'lucide-react'
import { buildPartScores, type PartScore } from './aggregators'

const PART_LABELS: Record<string, string> = {
  'part-1': 'الجزء الأول — الأساسيات',
  'part-2': 'الجزء الثاني — البيانات الأساسية',
  'part-3': 'الجزء الثالث — التنفيذ',
  'part-4': 'الجزء الرابع — التكاليف',
  'part-5': 'الجزء الخامس — الجودة والتخطيط',
  'part-6': 'الجزء السادس — الاستشارات',
}

type Props = {
  /** Maps lessonId → partId — built once from the content index. */
  lessonPartLookup: Record<string, string>
  /** Maps partId → first openable lesson id in that part. */
  firstLessonInPart?: Record<string, string>
  onOpenLesson?: (lessonId: string) => void
}

function describeSignals(score: PartScore): string {
  const bits: string[] = []
  if (score.signals.lowRatedLessons > 0) {
    bits.push(`${score.signals.lowRatedLessons} درس قيّمته بأنك لم تفهمه`)
  }
  if (score.signals.mediumRatedLessons > 0) {
    bits.push(`${score.signals.mediumRatedLessons} درس فهمته جزئياً`)
  }
  if (score.signals.quizMistakes > 0) {
    bits.push(`${score.signals.quizMistakes} سؤال في دفتر الأخطاء`)
  }
  if (score.signals.interviewWeak > 0) {
    bits.push(`${score.signals.interviewWeak} إجابة مقابلة ضعيفة`)
  }
  if (score.signals.interviewMedium > 0) {
    bits.push(`${score.signals.interviewMedium} إجابة مقابلة تحتاج صقل`)
  }
  return bits.join(' · ') || 'لم تبدأ بعد'
}

export function WeakTopics({ lessonPartLookup, firstLessonInPart, onOpenLesson }: Props) {
  const scores = buildPartScores(lessonPartLookup)
  const ranked = scores
    .filter((s) => s.weight > 0)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3)

  return (
    <section className="weak-topics" dir="rtl">
      <header className="weak-topics__head">
        <AlertTriangle size={18} />
        <div>
          <h3>أين أنت ضعيف فعلاً</h3>
          <p>تُحسب من تقييمك الذاتي + دفتر الأخطاء + محاكاة المقابلة</p>
        </div>
      </header>

      {ranked.length === 0 ? (
        <p className="weak-topics__empty">لم تُسجّل بيانات كافية بعد. ابدأ بتقييم الدروس بعد قراءتها.</p>
      ) : (
        <ol className="weak-topics__list">
          {ranked.map((score, index) => {
            const lessonTarget = firstLessonInPart?.[score.partId]
            return (
              <li key={score.partId} className="weak-topics__item">
                <span className="weak-topics__rank">{index + 1}</span>
                <div className="weak-topics__body">
                  <strong>{PART_LABELS[score.partId] ?? score.partId}</strong>
                  <span>{describeSignals(score)}</span>
                </div>
                {lessonTarget && onOpenLesson ? (
                  <button
                    type="button"
                    className="weak-topics__cta"
                    onClick={() => onOpenLesson(lessonTarget)}
                  >
                    ابدأ بمراجعته <ArrowUpLeft size={14} />
                  </button>
                ) : null}
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
