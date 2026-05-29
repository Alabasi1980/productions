import { useEffect, useState } from 'react'
import { RotateCw } from 'lucide-react'
import type { Flashcard } from '../../engine/types'

type Props = {
  card: Flashcard
  showHint?: boolean
}

export function FlashcardCard({ card, showHint = true }: Props) {
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    setFlipped(false)
  }, [card.id])

  const tags = Array.isArray(card.tags) ? card.tags : []

  return (
    <div
      className={`flashcard ${flipped ? 'flashcard--flipped' : ''}`}
      onClick={() => setFlipped((current) => !current)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === ' ' || event.key === 'Enter') {
          event.preventDefault()
          setFlipped((current) => !current)
        }
      }}
    >
      <div className="flashcard__inner">
        <div className="flashcard__face flashcard__face--front">
          <span className="flashcard__type">{tags[0] ?? 'بطاقة'}</span>
          <div className="flashcard__front-content">
            <p className="flashcard__primary">{card.front}</p>
          </div>
          {showHint ? (
            <p className="flashcard__hint">
              <RotateCw size={12} /> اضغط للقلب
            </p>
          ) : null}
        </div>

        <div className="flashcard__face flashcard__face--back">
          <span className="flashcard__type">الإجابة</span>
          <div className="flashcard__back-content">
            <p className="flashcard__primary">{card.back}</p>
          </div>
          {showHint ? (
            <p className="flashcard__hint">
              <RotateCw size={12} /> اضغط للعودة
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
