import { Grid3x3 } from 'lucide-react'
import { buildPartAccuracy } from './aggregators'

const PART_LABELS: Record<string, string> = {
  'part-1': 'الأساسيات',
  'part-2': 'البيانات',
  'part-3': 'التنفيذ',
  'part-4': 'التكاليف',
  'part-5': 'الجودة',
  'part-6': 'الاستشارات',
}

function tone(accuracyPct: number | null): string {
  if (accuracyPct === null) return 'heatcell--empty'
  if (accuracyPct >= 85) return 'heatcell--green'
  if (accuracyPct >= 60) return 'heatcell--yellow'
  return 'heatcell--red'
}

type Props = {
  /** Maps questionId → partId — built once from the quiz bank. */
  questionPartLookup: Record<string, string>
}

export function ErrorsHeatmap({ questionPartLookup }: Props) {
  const data = buildPartAccuracy(questionPartLookup)
  const hasAny = data.some((part) => part.attempted > 0)

  return (
    <section className="heatmap" dir="rtl">
      <header className="heatmap__head">
        <Grid3x3 size={18} />
        <div>
          <h3>دقتك حسب الجزء</h3>
          <p>صحيحة 100% — جزئية 50% — خاطئة 0%</p>
        </div>
      </header>

      {!hasAny ? (
        <p className="heatmap__empty">لم تجرِ اختباراً بعد. ابدأ من شاشة الاختبارات لترى أداءك هنا.</p>
      ) : (
        <div className="heatmap__grid">
          {data.map((part) => (
            <div key={part.partId} className={`heatcell ${tone(part.accuracyPct)}`}>
              <span className="heatcell__name">{PART_LABELS[part.partId] ?? part.partId}</span>
              <span className="heatcell__pct">{part.accuracyPct === null ? '—' : `${part.accuracyPct}%`}</span>
              <span className="heatcell__count">{part.attempted} سؤال</span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
