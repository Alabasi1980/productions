import * as storage from '../../engine/storage'

const INTERVIEW_RESULTS_KEY = 'erp.interview.results'

export type InterviewScope = 'lesson' | 'part' | 'mixed'
export type InterviewRating = 'strong' | 'medium' | 'weak'

export type InterviewResult = {
  id: string
  questionId: string
  partId?: string
  lessonId?: string
  scope: InterviewScope
  rating: InterviewRating
  note?: string
  loggedAt: number
}

export type InterviewResultsMap = Record<string, InterviewResult>

export function readInterviewResults(): InterviewResultsMap {
  return storage.get<InterviewResultsMap>(INTERVIEW_RESULTS_KEY, {})
}

export function writeInterviewResults(value: InterviewResultsMap): void {
  storage.set(INTERVIEW_RESULTS_KEY, value)
}

export function recordInterviewResult(result: Omit<InterviewResult, 'id' | 'loggedAt'>): InterviewResult {
  const current = readInterviewResults()
  const stored: InterviewResult = {
    ...result,
    id: `ir-${Date.now()}-${result.questionId}`,
    loggedAt: Date.now(),
  }
  current[stored.id] = stored
  writeInterviewResults(current)
  return stored
}