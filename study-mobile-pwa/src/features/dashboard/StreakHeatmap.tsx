import { Flame } from 'lucide-react'
import { activitySum, computeStreak, getActivityLog, getDayKey, getLastNDays } from './activity'

type Props = {
  days?: number
}

function intensityClass(count: number): string {
  if (count === 0) return 'streak-cell--0'
  if (count <= 2) return 'streak-cell--1'
  if (count <= 5) return 'streak-cell--2'
  if (count <= 10) return 'streak-cell--3'
  return 'streak-cell--4'
}

export function StreakHeatmap({ days = 60 }: Props) {
  const log = getActivityLog()
  const range = getLastNDays(days)
  const today = getDayKey()
  const { current, longest } = computeStreak(log)

  // Group into weeks (columns) for grid display
  const totalCols = Math.ceil(range.length / 7)
  const weeks: string[][] = Array.from({ length: totalCols }, (_, i) => range.slice(i * 7, i * 7 + 7))

  return (
    <section className="streak-card" dir="rtl">
      <header className="streak-card__head">
        <div>
          <h3>سلسلة الدراسة</h3>
          <p>آخر {days} يوم من نشاطك</p>
        </div>
        <div className="streak-card__counters">
          <div className="streak-counter">
            <Flame size={18} />
            <span className="streak-counter__num">{current}</span>
            <span className="streak-counter__label">سلسلة حالية</span>
          </div>
          <div className="streak-counter">
            <span className="streak-counter__num">{longest}</span>
            <span className="streak-counter__label">الأطول</span>
          </div>
        </div>
      </header>

      <div className="streak-grid">
        {weeks.map((week, wi) => (
          <div className="streak-col" key={wi}>
            {week.map((day) => {
              const count = activitySum(log[day])
              const isToday = day === today
              return (
                <div
                  key={day}
                  className={`streak-cell ${intensityClass(count)} ${isToday ? 'streak-cell--today' : ''}`}
                  title={`${day} — ${count} نشاط`}
                />
              )
            })}
          </div>
        ))}
      </div>

      <div className="streak-legend">
        <span>أقل</span>
        <div className="streak-cell streak-cell--0" />
        <div className="streak-cell streak-cell--1" />
        <div className="streak-cell streak-cell--2" />
        <div className="streak-cell streak-cell--3" />
        <div className="streak-cell streak-cell--4" />
        <span>أكثر</span>
      </div>
    </section>
  )
}
