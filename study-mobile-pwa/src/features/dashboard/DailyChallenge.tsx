import { useEffect, useMemo, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { FlashcardCard } from '../flashcards/FlashcardCard'
import { selectDue, useFlashcardDeck, useFlashcardStates } from '../flashcards/hooks'
import { getDayKey } from './activity'

// A single random due card, stable for the day so the same card shows on reopen.

export function DailyChallenge() {
  const { cards } = useFlashcardDeck()
  const { states, update } = useFlashcardStates()
  const [completedToday, setCompletedToday] = useState(false)

  const cardForToday = useMemo(() => {
    const due = selectDue(cards, states)
    if (due.length === 0) return null
    const day = getDayKey()
    // Stable per-day pick: simple hash of day key
    let hash = 0
    for (let i = 0; i < day.length; i++) hash = ((hash << 5) - hash + day.charCodeAt(i)) | 0
    const index = Math.abs(hash) % due.length
    return due[index]
  }, [cards, states])

  useEffect(() => {
    setCompletedToday(false)
  }, [cardForToday?.id])

  if (!cardForToday) {
    return (
      <section className="daily-challenge daily-challenge--empty" dir="rtl">
        <Sparkles size={18} />
        <div>
          <strong>لا تحدي اليوم</strong>
          <span>أنت ماشٍ على مراجعتك. عُد غداً لتحدي جديد.</span>
        </div>
      </section>
    )
  }

  if (completedToday) {
    return (
      <section className="daily-challenge daily-challenge--done" dir="rtl">
        <Sparkles size={18} />
        <div>
          <strong>أنجزت تحدي اليوم 🎉</strong>
          <span>ابدأ مراجعة بطاقات أكثر من شاشة البطاقات.</span>
        </div>
      </section>
    )
  }

  return (
    <section className="daily-challenge" dir="rtl">
      <header className="daily-challenge__head">
        <Sparkles size={16} />
        <strong>تحدي اليوم</strong>
        <span>بطاقة عشوائية مستحقّة</span>
      </header>

      <FlashcardCard card={cardForToday} showHint />

      <div className="daily-challenge__actions">
        <button
          type="button"
          className="flashcard-action flashcard-action--forgot"
          onClick={() => { update(cardForToday.id, 'forgot'); setCompletedToday(true) }}
        >
          نسيت
        </button>
        <button
          type="button"
          className="flashcard-action flashcard-action--hard"
          onClick={() => { update(cardForToday.id, 'hard'); setCompletedToday(true) }}
        >
          صعبة
        </button>
        <button
          type="button"
          className="flashcard-action flashcard-action--easy"
          onClick={() => { update(cardForToday.id, 'easy'); setCompletedToday(true) }}
        >
          سهلة
        </button>
      </div>
    </section>
  )
}
