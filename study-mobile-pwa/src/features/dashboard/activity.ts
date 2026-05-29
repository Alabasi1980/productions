import * as storage from '../../engine/storage'

export type ActivityKind = 'lesson' | 'card' | 'quiz'

export type DailyActivity = {
  lessons?: number
  cards?: number
  quizzes?: number
}

export type ActivityLog = Record<string, DailyActivity>

const KEY = 'study.activity'

function dayKey(timestamp: number = Date.now()): string {
  const d = new Date(timestamp)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function read(): ActivityLog {
  return storage.get<ActivityLog>(KEY, {})
}

function write(value: ActivityLog): void {
  storage.set(KEY, value)
}

const ACTIVITY_FIELD: Record<ActivityKind, keyof DailyActivity> = {
  lesson: 'lessons',
  card: 'cards',
  quiz: 'quizzes',
}

export function logActivity(kind: ActivityKind, count = 1): void {
  try {
    const log = read()
    const key = dayKey()
    const day = log[key] ?? {}
    const field = ACTIVITY_FIELD[kind]
    day[field] = (day[field] ?? 0) + count
    log[key] = day
    write(log)
  } catch {
    // Swallow — activity logging never breaks user flow
  }
}

export function getActivityLog(): ActivityLog {
  return read()
}

export function hasAnyActivity(day: DailyActivity | undefined): boolean {
  if (!day) return false
  return (day.lessons ?? 0) + (day.cards ?? 0) + (day.quizzes ?? 0) > 0
}

export function activitySum(day: DailyActivity | undefined): number {
  if (!day) return 0
  return (day.lessons ?? 0) + (day.cards ?? 0) + (day.quizzes ?? 0)
}

export function computeStreak(log: ActivityLog): { current: number; longest: number } {
  // Walk back from today; count consecutive days with any activity
  const days = Object.keys(log).sort()
  if (days.length === 0) return { current: 0, longest: 0 }

  const activeSet = new Set(days.filter((d) => hasAnyActivity(log[d])))

  // Current streak
  let current = 0
  let cursor = new Date()
  while (activeSet.has(dayKey(cursor.getTime()))) {
    current++
    cursor.setDate(cursor.getDate() - 1)
  }

  // Longest streak (scan)
  let longest = 0
  let running = 0
  let prev: Date | null = null
  const sortedActive = Array.from(activeSet).sort()
  for (const key of sortedActive) {
    const [y, m, d] = key.split('-').map(Number)
    const date = new Date(y, m - 1, d)
    if (prev) {
      const diff = (date.getTime() - prev.getTime()) / (24 * 60 * 60 * 1000)
      if (diff === 1) running++
      else running = 1
    } else {
      running = 1
    }
    if (running > longest) longest = running
    prev = date
  }

  return { current, longest }
}

export function getDayKey(timestamp?: number): string {
  return dayKey(timestamp)
}

export function getLastNDays(n: number): string[] {
  const out: string[] = []
  const cursor = new Date()
  for (let i = 0; i < n; i++) {
    out.push(dayKey(cursor.getTime()))
    cursor.setDate(cursor.getDate() - 1)
  }
  return out.reverse()
}
