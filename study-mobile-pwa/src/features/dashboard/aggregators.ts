import * as storage from '../../engine/storage'
import type { LessonsStudyMap } from '../self-assess/types'
import type { FlashcardStateMap } from '../flashcards/types'
import type { AttemptsMap, MistakesMap } from '../quiz/types'
import type { InterviewResultsMap } from '../../modules/erp/interview-storage'

// Read raw study data (no React) so we can build aggregates anywhere.

export function readLessonsRatings(): LessonsStudyMap {
  return storage.get<LessonsStudyMap>('study.lessons', {})
}

export function readFlashcardStates(): FlashcardStateMap {
  return storage.get<FlashcardStateMap>('flashcards.state', {})
}

export function readQuizAttempts(): AttemptsMap {
  return storage.get<AttemptsMap>('quiz.attempts', {})
}

export function readQuizMistakes(): MistakesMap {
  return storage.get<MistakesMap>('quiz.mistakes', {})
}

export function readInterviewResults(): InterviewResultsMap {
  return storage.get<InterviewResultsMap>('erp.interview.results', {})
}

export type PartScore = {
  partId: string
  weight: number // 0..1 (higher = weaker)
  signals: {
    lowRatedLessons: number
    mediumRatedLessons: number
    quizAccuracy: number | null
    quizMistakes: number
    quizAttempted: number
    interviewMedium: number
    interviewWeak: number
  }
}

const PART_ORDER = ['part-1', 'part-2', 'part-3', 'part-4', 'part-5', 'part-6']

export function buildPartScores(
  lessonPartLookup: Record<string, string>, // lessonId → partId
): PartScore[] {
  const ratings = readLessonsRatings()
  const attempts = readQuizAttempts()
  const mistakes = readQuizMistakes()
  const interviews = readInterviewResults()

  const partStats: Record<string, PartScore> = {}
  for (const partId of PART_ORDER) {
    partStats[partId] = {
      partId,
      weight: 0,
      signals: {
        lowRatedLessons: 0,
        mediumRatedLessons: 0,
        quizAccuracy: null,
        quizMistakes: 0,
        quizAttempted: 0,
        interviewMedium: 0,
        interviewWeak: 0,
      },
    }
  }

  // Lessons ratings
  for (const [lessonId, study] of Object.entries(ratings)) {
    const partId = lessonPartLookup[lessonId]
    if (!partId || !partStats[partId]) continue
    if (study.rating === 'low') partStats[partId].signals.lowRatedLessons++
    if (study.rating === 'medium') partStats[partId].signals.mediumRatedLessons++
  }

  // Quiz attempts per part
  for (const attempt of Object.values(attempts)) {
    const partId = attempt.partId
    if (!partId || !partStats[partId]) continue
    partStats[partId].signals.quizAttempted++

    const contribution = attempt.selfGrade === 'correct'
      ? 1
      : attempt.selfGrade === 'partial'
        ? 0.5
        : 0

    partStats[partId].signals.quizAccuracy = (partStats[partId].signals.quizAccuracy ?? 0) + contribution
  }

  // Quiz mistakes per part
  for (const mistake of Object.values(mistakes)) {
    const partId = mistake.partId
    if (!partId || !partStats[partId]) continue
    partStats[partId].signals.quizMistakes++
  }

  // Mock interview results per part
  for (const result of Object.values(interviews)) {
    const partId = result.partId ?? (result.lessonId ? lessonPartLookup[result.lessonId] : undefined)
    if (!partId || !partStats[partId]) continue
    if (result.rating === 'weak') partStats[partId].signals.interviewWeak++
    if (result.rating === 'medium') partStats[partId].signals.interviewMedium++
  }

  // Compute weight (relative weakness score)
  for (const stats of Object.values(partStats)) {
    const { lowRatedLessons, mediumRatedLessons, quizMistakes, interviewMedium, interviewWeak } = stats.signals
    if (stats.signals.quizAttempted > 0 && stats.signals.quizAccuracy !== null) {
      stats.signals.quizAccuracy = Math.round((stats.signals.quizAccuracy / stats.signals.quizAttempted) * 100)
    }
    stats.weight = lowRatedLessons * 3 + mediumRatedLessons * 1 + quizMistakes * 2 + interviewMedium * 1 + interviewWeak * 2
  }

  return Object.values(partStats)
}

export type PartAccuracy = {
  partId: string
  attempted: number
  correct: number
  partial: number
  wrong: number
  accuracyPct: number | null
}

export function buildPartAccuracy(
  questionPartLookup: Record<string, string>, // questionId → partId
): PartAccuracy[] {
  const attempts = readQuizAttempts()
  const buckets: Record<string, PartAccuracy> = {}
  for (const partId of PART_ORDER) {
    buckets[partId] = { partId, attempted: 0, correct: 0, partial: 0, wrong: 0, accuracyPct: null }
  }

  for (const [questionId, attempt] of Object.entries(attempts)) {
    const partId = attempt.partId ?? questionPartLookup[questionId]
    if (!partId || !buckets[partId]) continue
    buckets[partId].attempted++
    if (attempt.selfGrade === 'correct') buckets[partId].correct++
    else if (attempt.selfGrade === 'partial') buckets[partId].partial++
    else buckets[partId].wrong++
  }

  for (const bucket of Object.values(buckets)) {
    if (bucket.attempted > 0) {
      const score = bucket.correct + bucket.partial * 0.5
      bucket.accuracyPct = Math.round((score / bucket.attempted) * 100)
    }
  }

  return Object.values(buckets)
}
