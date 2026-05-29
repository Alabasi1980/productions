import { useCallback, useEffect, useState } from 'react'
import * as storage from '../../engine/storage'
import { logActivity } from '../dashboard/activity'
import type { Question, QuizBundle } from '../../engine/types'
import type { AttemptsMap, MistakeRecord, MistakesMap, SelfGrade } from './types'

const ATTEMPTS_KEY = 'quiz.attempts'
const MISTAKES_KEY = 'quiz.mistakes'
const BANK_URL = '/data/quiz-bank.json'

function readAttempts(): AttemptsMap {
  return storage.get<AttemptsMap>(ATTEMPTS_KEY, {})
}

function writeAttempts(value: AttemptsMap): void {
  storage.set(ATTEMPTS_KEY, value)
}

function readMistakes(): MistakesMap {
  return storage.get<MistakesMap>(MISTAKES_KEY, {})
}

function writeMistakes(value: MistakesMap): void {
  storage.set(MISTAKES_KEY, value)
}

export function useQuizBank() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    fetch(BANK_URL)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json() as Promise<QuizBundle>
      })
      .then((data) => {
        if (!active) return
        setQuestions(data.questions ?? [])
        setError(null)
      })
      .catch((err: Error) => {
        if (!active) return
        setError(err.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  return { questions, loading, error }
}

export function useQuizState() {
  const [attempts, setAttempts] = useState<AttemptsMap>(() => readAttempts())
  const [mistakes, setMistakes] = useState<MistakesMap>(() => readMistakes())

  const recordAttempt = useCallback((question: Question, userAnswer: string, grade: SelfGrade) => {
    const currentAttempts = readAttempts()
    currentAttempts[question.id] = {
      questionId: question.id,
      attemptedAt: Date.now(),
      userAnswer,
      selfGrade: grade,
      partId: typeof question.partId === 'string' ? question.partId : undefined,
      lessonId: typeof question.lessonId === 'string' ? question.lessonId : undefined,
      questionType: typeof question.type === 'string' ? question.type : undefined,
    }
    writeAttempts(currentAttempts)
    setAttempts(currentAttempts)

    const currentMistakes = readMistakes()
    if (grade === 'wrong') {
      const existing = currentMistakes[question.id]
      currentMistakes[question.id] = {
        questionId: question.id,
        questionText: question.text,
        userAnswer,
        partId: typeof question.partId === 'string' ? question.partId : undefined,
        lessonId: typeof question.lessonId === 'string' ? question.lessonId : undefined,
        loggedAt: existing?.loggedAt ?? Date.now(),
        reviewCount: (existing?.reviewCount ?? 0) + 1,
        lastReviewedAt: Date.now(),
      }
      writeMistakes(currentMistakes)
      setMistakes(currentMistakes)
    } else if (grade === 'correct' && currentMistakes[question.id]) {
      delete currentMistakes[question.id]
      writeMistakes(currentMistakes)
      setMistakes(currentMistakes)
    }
    logActivity('quiz')
  }, [])

  const removeMistake = useCallback((questionId: string) => {
    const current = readMistakes()
    delete current[questionId]
    writeMistakes(current)
    setMistakes(current)
  }, [])

  const reload = useCallback(() => {
    setAttempts(readAttempts())
    setMistakes(readMistakes())
  }, [])

  return { attempts, mistakes, recordAttempt, removeMistake, reload }
}

// ─── Selectors ─────────────────────────────────────────────────────

export function pickByPart(questions: Question[], partId: string): Question[] {
  return questions.filter((q) => q.partId === partId)
}

export function pickByLesson(questions: Question[], lessonId: string): Question[] {
  return questions.filter((q) => q.lessonId === lessonId)
}

export function pickInterleaved(questions: Question[], count = 12): Question[] {
  // Group by partId, then round-robin pick to maximize variety
  const byPart: Record<string, Question[]> = {}
  for (const q of questions) {
    const part = typeof q.partId === 'string' ? q.partId : 'unknown'
    byPart[part] = byPart[part] ?? []
    byPart[part].push(q)
  }
  for (const key of Object.keys(byPart)) {
    byPart[key] = shuffle(byPart[key])
  }
  const result: Question[] = []
  const keys = Object.keys(byPart)
  let i = 0
  while (result.length < count && keys.some((k) => byPart[k].length > 0)) {
    const key = keys[i % keys.length]
    const next = byPart[key].shift()
    if (next) result.push(next)
    i++
  }
  return result
}

export function pickMistakes(questions: Question[], mistakes: MistakesMap): Question[] {
  const ids = new Set(Object.keys(mistakes))
  return questions.filter((q) => ids.has(q.id))
}

export function shuffle<T>(items: T[]): T[] {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

export function bankStats(questions: Question[], attempts: AttemptsMap, mistakes: MistakesMap) {
  const byPart: Record<string, number> = {}
  for (const q of questions) {
    const part = typeof q.partId === 'string' ? q.partId : 'unknown'
    byPart[part] = (byPart[part] ?? 0) + 1
  }
  const attemptedCount = Object.keys(attempts).length
  const mistakesCount = Object.keys(mistakes).length
  const correctCount = Object.values(attempts).filter((a) => a.selfGrade === 'correct').length
  return {
    total: questions.length,
    attempted: attemptedCount,
    correct: correctCount,
    mistakes: mistakesCount,
    byPart,
  }
}

export type MistakeRecordList = MistakeRecord[]

export function getMistakesList(mistakes: MistakesMap): MistakeRecord[] {
  return Object.values(mistakes).sort((a, b) => b.loggedAt - a.loggedAt)
}
