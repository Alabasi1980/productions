import { ArrowUpLeft, BriefcaseBusiness } from 'lucide-react'
import { readInterviewResults } from './aggregators'

const PART_LABELS: Record<string, string> = {
  'part-1': 'الجزء الأول — الأساسيات',
  'part-2': 'الجزء الثاني — البيانات الأساسية',
  'part-3': 'الجزء الثالث — التنفيذ',
  'part-4': 'الجزء الرابع — التكاليف',
  'part-5': 'الجزء الخامس — الجودة والتخطيط',
  'part-6': 'الجزء السادس — الاستشارات',
}

type Props = {
  lessonPartLookup: Record<string, string>
  firstLessonInPart?: Record<string, string>
  onOpenLesson?: (lessonId: string) => void
}

export function InterviewReadiness({ lessonPartLookup, firstLessonInPart, onOpenLesson }: Props) {
  const results = Object.values(readInterviewResults())

  if (results.length === 0) {
    return (
      <section className="interview-readiness" dir="rtl">
        <header className="interview-readiness__head">
          <BriefcaseBusiness size={18} />
          <div>
            <h3>جاهزية المقابلة</h3>
            <p>ابدأ أول محاكاة لتظهر هنا صورة أوضح عن مستواك الشفهي والتحليلي.</p>
          </div>
        </header>
      </section>
    )
  }

  const strong = results.filter((result) => result.rating === 'strong').length
  const medium = results.filter((result) => result.rating === 'medium').length
  const weak = results.filter((result) => result.rating === 'weak').length
  const readiness = Math.round(((strong + medium * 0.5) / results.length) * 100)

  const weakByPart = results.reduce<Record<string, number>>((accumulator, result) => {
    const partId = result.partId ?? (result.lessonId ? lessonPartLookup[result.lessonId] : undefined)
    if (!partId) return accumulator
    if (result.rating === 'weak' || result.rating === 'medium') {
      accumulator[partId] = (accumulator[partId] ?? 0) + (result.rating === 'weak' ? 2 : 1)
    }
    return accumulator
  }, {})

  const focusPartId = Object.entries(weakByPart).sort((a, b) => b[1] - a[1])[0]?.[0]
  const focusLessonId = focusPartId ? firstLessonInPart?.[focusPartId] : undefined

  return (
    <section className="interview-readiness" dir="rtl">
      <header className="interview-readiness__head">
        <BriefcaseBusiness size={18} />
        <div>
          <h3>جاهزية المقابلة</h3>
          <p>قياس سريع مبني على محاكاة المقابلات التي أنجزتها داخل التطبيق.</p>
        </div>
      </header>

      <div className="interview-readiness__body">
        <div className="interview-readiness__score">
          <strong>{readiness}%</strong>
          <span>جاهزية تقريبية</span>
        </div>

        <div className="interview-readiness__stats">
          <span className="interview-readiness__chip interview-readiness__chip--strong">{strong} قوية</span>
          <span className="interview-readiness__chip interview-readiness__chip--medium">{medium} متوسطة</span>
          <span className="interview-readiness__chip interview-readiness__chip--weak">{weak} تحتاج تقوية</span>
        </div>
      </div>

      {focusPartId ? (
        <div className="interview-readiness__focus">
          <p>
            أكثر جزء يحتاج صقلًا قبل المقابلة: <strong>{PART_LABELS[focusPartId] ?? focusPartId}</strong>
          </p>
          {focusLessonId && onOpenLesson ? (
            <button type="button" className="interview-readiness__cta" onClick={() => onOpenLesson(focusLessonId)}>
              افتح مدخل هذا الجزء <ArrowUpLeft size={14} />
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}