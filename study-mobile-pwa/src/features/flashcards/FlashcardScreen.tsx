import { useEffect, useMemo, useState } from 'react'
import { Brain, ChevronLeft, RefreshCw, Timer, Trophy, X } from 'lucide-react'
import type { Flashcard } from '../../engine/types'
import { FlashcardCard } from './FlashcardCard'
import { deckStats, selectDue, shuffle, useFlashcardDeck, useFlashcardStates } from './hooks'
import type { SessionMode, SrsAction } from './types'

type Props = {
  open: boolean
  onClose: () => void
}

const SPEED_ROUND_DURATION_MS = 60_000
const SPEED_ROUND_SIZE = 20

export function FlashcardScreen({ open, onClose }: Props) {
  const { cards, loading, error } = useFlashcardDeck()
  const { states, update, reload } = useFlashcardStates()
  const [mode, setMode] = useState<SessionMode | null>(null)
  const [queue, setQueue] = useState<Flashcard[]>([])
  const [index, setIndex] = useState(0)
  const [speedTimeLeft, setSpeedTimeLeft] = useState(SPEED_ROUND_DURATION_MS)
  const [speedScore, setSpeedScore] = useState({ correct: 0, wrong: 0 })
  const [sessionDone, setSessionDone] = useState(false)

  useEffect(() => {
    if (!open) {
      setMode(null)
      setQueue([])
      setIndex(0)
      setSessionDone(false)
    } else {
      reload()
    }
  }, [open, reload])

  // Speed round timer
  useEffect(() => {
    if (mode !== 'speed') return
    const start = Date.now()
    const id = window.setInterval(() => {
      const elapsed = Date.now() - start
      const remaining = Math.max(0, SPEED_ROUND_DURATION_MS - elapsed)
      setSpeedTimeLeft(remaining)
      if (remaining === 0) {
        setSessionDone(true)
        window.clearInterval(id)
      }
    }, 200)
    return () => window.clearInterval(id)
  }, [mode])

  const stats = useMemo(() => deckStats(cards, states), [cards, states])

  function startSession(nextMode: SessionMode) {
    let pool: Flashcard[]
    if (nextMode === 'due') {
      pool = shuffle(selectDue(cards, states))
    } else if (nextMode === 'speed') {
      pool = shuffle(cards).slice(0, SPEED_ROUND_SIZE)
      setSpeedTimeLeft(SPEED_ROUND_DURATION_MS)
      setSpeedScore({ correct: 0, wrong: 0 })
    } else {
      pool = shuffle(cards)
    }
    setQueue(pool)
    setIndex(0)
    setMode(nextMode)
    setSessionDone(pool.length === 0)
  }

  function handleAction(action: SrsAction) {
    const current = queue[index]
    if (!current) return

    if (mode !== 'speed') {
      update(current.id, action)
    } else {
      if (action === 'easy') setSpeedScore((s) => ({ ...s, correct: s.correct + 1 }))
      else setSpeedScore((s) => ({ ...s, wrong: s.wrong + 1 }))
    }

    if (index + 1 >= queue.length) {
      setSessionDone(true)
    } else {
      setIndex((current) => current + 1)
    }
  }

  function exitSession() {
    setMode(null)
    setSessionDone(false)
  }

  if (!open) return null

  return (
    <div className="flashcard-screen" dir="rtl" role="dialog" aria-modal="true">
      <header className="flashcard-screen__head">
        <button type="button" className="icon-button" onClick={mode ? exitSession : onClose} aria-label={mode ? 'العودة' : 'إغلاق'}>
          {mode ? <ChevronLeft size={20} /> : <X size={20} />}
        </button>
        <h2>
          <Brain size={18} />
          {mode === 'due' ? 'مراجعة اليوم' : mode === 'all' ? 'جميع البطاقات' : mode === 'speed' ? 'سباق سريع' : 'البطاقات التعليمية'}
        </h2>
        {mode === 'speed' ? (
          <span className="flashcard-screen__timer">
            <Timer size={14} />
            {Math.ceil(speedTimeLeft / 1000)}ث
          </span>
        ) : (
          <span aria-hidden="true" style={{ width: 36 }} />
        )}
      </header>

      <main className="flashcard-screen__body">
        {loading ? (
          <p className="flashcard-screen__muted">جار تحميل البطاقات...</p>
        ) : error ? (
          <p className="flashcard-screen__muted">تعذّر تحميل البطاقات: {error}</p>
        ) : !mode ? (
          <FlashcardLobby stats={stats} onSelect={startSession} />
        ) : sessionDone ? (
          <SessionSummary
            mode={mode}
            queueSize={queue.length}
            speedScore={speedScore}
            onAgain={() => startSession(mode)}
            onExit={exitSession}
          />
        ) : queue.length === 0 ? (
          <p className="flashcard-screen__muted">لا توجد بطاقات في هذا الوضع الآن.</p>
        ) : (
          <SessionRunner
            card={queue[index]}
            index={index}
            total={queue.length}
            onAction={handleAction}
            mode={mode}
          />
        )}
      </main>
    </div>
  )
}

// ─── Lobby ─────────────────────────────────────────────────────────

function FlashcardLobby({ stats, onSelect }: { stats: ReturnType<typeof deckStats>; onSelect: (mode: SessionMode) => void }) {
  return (
    <div className="flashcard-lobby">
      <div className="flashcard-lobby__stats">
        <div className="flashcard-stat">
          <span className="flashcard-stat__num">{stats.total}</span>
          <span className="flashcard-stat__label">بطاقة كلية</span>
        </div>
        <div className="flashcard-stat flashcard-stat--accent">
          <span className="flashcard-stat__num">{stats.dueCount}</span>
          <span className="flashcard-stat__label">مستحقّة الآن</span>
        </div>
        <div className="flashcard-stat">
          <span className="flashcard-stat__num">{stats.learned}</span>
          <span className="flashcard-stat__label">راجعتها</span>
        </div>
        <div className="flashcard-stat flashcard-stat--warning">
          <span className="flashcard-stat__num">{stats.struggling}</span>
          <span className="flashcard-stat__label">تحتاج تركيز</span>
        </div>
      </div>

      <div className="flashcard-lobby__modes">
        <button type="button" className="flashcard-mode flashcard-mode--primary" onClick={() => onSelect('due')} disabled={stats.dueCount === 0}>
          <span className="flashcard-mode__title">ابدأ مراجعة اليوم</span>
          <span className="flashcard-mode__sub">{stats.dueCount} بطاقة مستحقّة الآن</span>
        </button>
        <button type="button" className="flashcard-mode" onClick={() => onSelect('all')}>
          <span className="flashcard-mode__title">كل البطاقات</span>
          <span className="flashcard-mode__sub">{stats.total} بطاقة بدون تصفية</span>
        </button>
        <button type="button" className="flashcard-mode" onClick={() => onSelect('speed')}>
          <span className="flashcard-mode__title">سباق 60 ثانية</span>
          <span className="flashcard-mode__sub">{SPEED_ROUND_SIZE} بطاقة عشوائية بضغط الوقت</span>
        </button>
      </div>
    </div>
  )
}

// ─── Active session ────────────────────────────────────────────────

function SessionRunner({
  card,
  index,
  total,
  onAction,
  mode,
}: {
  card: Flashcard
  index: number
  total: number
  onAction: (action: SrsAction) => void
  mode: SessionMode
}) {
  return (
    <div className="flashcard-runner">
      <div className="flashcard-runner__progress">
        <span>{index + 1} من {total}</span>
        <div className="flashcard-runner__bar">
          <div style={{ width: `${((index + 1) / total) * 100}%` }} />
        </div>
      </div>

      <FlashcardCard card={card} />

      <div className="flashcard-actions">
        {mode === 'speed' ? (
          <>
            <button type="button" className="flashcard-action flashcard-action--wrong" onClick={() => onAction('forgot')}>
              لم أعرف
            </button>
            <button type="button" className="flashcard-action flashcard-action--right" onClick={() => onAction('easy')}>
              عرفتها
            </button>
          </>
        ) : (
          <>
            <button type="button" className="flashcard-action flashcard-action--forgot" onClick={() => onAction('forgot')}>
              نسيت
            </button>
            <button type="button" className="flashcard-action flashcard-action--hard" onClick={() => onAction('hard')}>
              صعبة
            </button>
            <button type="button" className="flashcard-action flashcard-action--easy" onClick={() => onAction('easy')}>
              سهلة
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Summary ───────────────────────────────────────────────────────

function SessionSummary({
  mode,
  queueSize,
  speedScore,
  onAgain,
  onExit,
}: {
  mode: SessionMode
  queueSize: number
  speedScore: { correct: number; wrong: number }
  onAgain: () => void
  onExit: () => void
}) {
  return (
    <div className="flashcard-summary">
      <Trophy size={48} />
      <h3>أنهيت الجلسة</h3>
      {mode === 'speed' ? (
        <p>
          أجبت بشكل صحيح على <strong>{speedScore.correct}</strong> من{' '}
          <strong>{speedScore.correct + speedScore.wrong}</strong>
        </p>
      ) : (
        <p>راجعت <strong>{queueSize}</strong> بطاقة. سيعود كل واحدة في موعدها التالي.</p>
      )}
      <div className="flashcard-summary__actions">
        <button type="button" className="flashcard-action flashcard-action--hard" onClick={onAgain}>
          <RefreshCw size={16} /> أعد الجلسة
        </button>
        <button type="button" className="flashcard-action" onClick={onExit}>
          عودة للقائمة
        </button>
      </div>
    </div>
  )
}
