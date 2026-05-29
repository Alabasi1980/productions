import { useCallback, useEffect, useState } from 'react'
import * as storage from '../../engine/storage'
import { logActivity } from '../dashboard/activity'
import type { LessonStudy, LessonsStudyMap, Rating, ReviewItem, ReviewQueueMap } from './types'

const LESSONS_KEY = 'study.lessons'
const REVIEW_QUEUE_KEY = 'study.reviewQueue'

const DAY_MS = 24 * 60 * 60 * 1000

const INITIAL_INTERVALS: Record<Rating, number> = {
  low: 1,
  medium: 3,
  high: 7,
}

const INTERVAL_CAPS: Record<Rating, number> = {
  low: 1,
  medium: 14,
  high: 30,
}

function readLessons(): LessonsStudyMap {
  return storage.get<LessonsStudyMap>(LESSONS_KEY, {})
}

function writeLessons(value: LessonsStudyMap): void {
  storage.set(LESSONS_KEY, value)
}

function readQueue(): ReviewQueueMap {
  return storage.get<ReviewQueueMap>(REVIEW_QUEUE_KEY, {})
}

function writeQueue(value: ReviewQueueMap): void {
  storage.set(REVIEW_QUEUE_KEY, value)
}

function nextIntervalDays(previous: ReviewItem | undefined, rating: Rating): number {
  if (!previous) return INITIAL_INTERVALS[rating]
  if (rating === 'low') return 1
  const doubled = Math.max(previous.intervalDays * 2, INITIAL_INTERVALS[rating])
  return Math.min(doubled, INTERVAL_CAPS[rating])
}

// ─── useLessonStudy: per-lesson rating + Feynman text ────────────

export function useLessonStudy(lessonId: string | null | undefined) {
  const [study, setStudy] = useState<LessonStudy>(() => {
    if (!lessonId) return {}
    return readLessons()[lessonId] ?? {}
  })

  useEffect(() => {
    if (!lessonId) {
      setStudy({})
      return
    }
    setStudy(readLessons()[lessonId] ?? {})
  }, [lessonId])

  const setRating = useCallback(
    (rating: Rating) => {
      if (!lessonId) return
      const now = Date.now()
      const lessons = readLessons()
      const next: LessonStudy = { ...lessons[lessonId], rating, ratedAt: now }
      lessons[lessonId] = next
      writeLessons(lessons)
      setStudy(next)

      // Cascade into review queue
      const queue = readQueue()
      const previous = queue[lessonId]
      const interval = nextIntervalDays(previous, rating)
      queue[lessonId] = {
        sourceId: lessonId,
        itemType: 'lesson',
        intervalDays: interval,
        dueAt: now + interval * DAY_MS,
        lastRating: rating,
        addedAt: previous?.addedAt ?? now,
      }
      writeQueue(queue)
      logActivity('lesson')
    },
    [lessonId],
  )

  const setFeynman = useCallback(
    (text: string) => {
      if (!lessonId) return
      const lessons = readLessons()
      const next: LessonStudy = { ...lessons[lessonId], feynman: text, feynmanUpdatedAt: Date.now() }
      lessons[lessonId] = next
      writeLessons(lessons)
      setStudy(next)
    },
    [lessonId],
  )

  return { study, setRating, setFeynman }
}

// ─── useReviewQueue: list of due items + helpers ─────────────────

export function useReviewQueue() {
  const [queue, setQueue] = useState<ReviewQueueMap>(() => readQueue())
  const [tick, setTick] = useState(0)

  useEffect(() => {
    setQueue(readQueue())
  }, [tick])

  const refresh = useCallback(() => setTick((current) => current + 1), [])

  const removeItem = useCallback((sourceId: string) => {
    const current = readQueue()
    delete current[sourceId]
    writeQueue(current)
    setQueue(current)
  }, [])

  const due = Object.values(queue).filter((item) => item.dueAt <= Date.now())
  const upcoming = Object.values(queue).filter((item) => item.dueAt > Date.now())

  return { queue, due, upcoming, refresh, removeItem }
}

// Stand-alone read helper (no React) for inline checks
export function isInReviewQueue(lessonId: string): { inQueue: boolean; isDue: boolean; intervalDays?: number; lastRating?: Rating } {
  const queue = readQueue()
  const item = queue[lessonId]
  if (!item) return { inQueue: false, isDue: false }
  return {
    inQueue: true,
    isDue: item.dueAt <= Date.now(),
    intervalDays: item.intervalDays,
    lastRating: item.lastRating,
  }
}
