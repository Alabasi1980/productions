import { LayoutGrid, X } from 'lucide-react'
import { StreakHeatmap } from './StreakHeatmap'
import { WeakTopics } from './WeakTopics'
import { ErrorsHeatmap } from './ErrorsHeatmap'
import { DailyChallenge } from './DailyChallenge'
import { InterviewReadiness } from './InterviewReadiness'

type Props = {
  open: boolean
  onClose: () => void
  lessonPartLookup: Record<string, string>
  questionPartLookup: Record<string, string>
  firstLessonInPart: Record<string, string>
  onOpenLesson: (lessonId: string) => void
}

export function DashboardScreen({
  open,
  onClose,
  lessonPartLookup,
  questionPartLookup,
  firstLessonInPart,
  onOpenLesson,
}: Props) {
  if (!open) return null

  return (
    <div className="dashboard-screen" dir="rtl" role="dialog" aria-modal="true">
      <header className="dashboard-screen__head">
        <button type="button" className="icon-button" onClick={onClose} aria-label="إغلاق">
          <X size={20} />
        </button>
        <h2>
          <LayoutGrid size={18} />
          لوحتي
        </h2>
        <span aria-hidden="true" className="dashboard-screen__spacer" />
      </header>

      <main className="dashboard-screen__body">
        <DailyChallenge />
        <StreakHeatmap />
        <InterviewReadiness
          lessonPartLookup={lessonPartLookup}
          firstLessonInPart={firstLessonInPart}
          onOpenLesson={(id) => { onOpenLesson(id); onClose() }}
        />
        <WeakTopics
          lessonPartLookup={lessonPartLookup}
          firstLessonInPart={firstLessonInPart}
          onOpenLesson={(id) => { onOpenLesson(id); onClose() }}
        />
        <ErrorsHeatmap questionPartLookup={questionPartLookup} />
      </main>
    </div>
  )
}
