import { useEffect, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { useLessonStudy } from './hooks'
import type { Rating } from './types'

type Props = {
  lessonId: string
}

const OPTIONS: Array<{ value: Rating; label: string; emoji: string; description: string; tone: string }> = [
  { value: 'low', label: 'لم أفهم جيداً', emoji: '🔴', description: 'يعود للمراجعة غداً', tone: 'low' },
  { value: 'medium', label: 'فهمت جزئياً', emoji: '🟡', description: 'يعود للمراجعة خلال 3 أيام', tone: 'medium' },
  { value: 'high', label: 'فهمت جيداً', emoji: '🟢', description: 'يعود للمراجعة خلال أسبوع', tone: 'high' },
]

export function RatingWidget({ lessonId }: Props) {
  const { study, setRating } = useLessonStudy(lessonId)
  const [justRated, setJustRated] = useState(false)

  useEffect(() => {
    setJustRated(false)
  }, [lessonId])

  function handleSelect(rating: Rating) {
    setRating(rating)
    setJustRated(true)
  }

  return (
    <section className="rating-widget" dir="rtl">
      <header className="rating-widget__head">
        <h3>كيف كان فهمك لهذا الدرس؟</h3>
        <p>تقييمك يضيفه إلى قائمة المراجعة بوقت مناسب.</p>
      </header>

      <div className="rating-widget__options">
        {OPTIONS.map((option) => {
          const selected = study.rating === option.value
          return (
            <button
              key={option.value}
              type="button"
              className={`rating-option rating-option--${option.tone} ${selected ? 'rating-option--selected' : ''}`}
              onClick={() => handleSelect(option.value)}
              aria-pressed={selected}
            >
              <span className="rating-option__emoji" aria-hidden="true">{option.emoji}</span>
              <span className="rating-option__label">{option.label}</span>
              <span className="rating-option__hint">{option.description}</span>
            </button>
          )
        })}
      </div>

      {study.rating && justRated ? (
        <div className="rating-widget__confirm">
          <CheckCircle2 size={16} />
          <span>تم الحفظ — سيظهر في قائمة المراجعة في الوقت المحدد.</span>
        </div>
      ) : null}
    </section>
  )
}
