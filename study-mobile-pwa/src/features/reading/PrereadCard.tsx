import { Lightbulb } from 'lucide-react'

type Props = {
  questions?: string[]
  /** Stable identifier so the same question shows for the same lesson on revisit. */
  seed?: string
}

function pick<T>(items: T[], seed: string): T {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0
  }
  const index = Math.abs(hash) % items.length
  return items[index]
}

export function PrereadCard({ questions, seed }: Props) {
  if (!questions || questions.length === 0) return null
  const question = pick(questions, seed ?? 'default')

  return (
    <aside className="preread-card" dir="rtl">
      <div className="preread-card__head">
        <Lightbulb size={16} />
        <span>قبل أن تقرأ</span>
      </div>
      <p className="preread-card__question">{question}</p>
      <p className="preread-card__hint">فكّر للحظة في إجابتك ثم اقرأ وقارن. الذاكرة النشطة تثبّت الفهم.</p>
    </aside>
  )
}
