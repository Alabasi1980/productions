export type SelfGrade = 'correct' | 'partial' | 'wrong'

export type QuizAttempt = {
  questionId: string
  attemptedAt: number
  userAnswer: string
  selfGrade: SelfGrade
  partId?: string
  lessonId?: string
  questionType?: string
}

export type AttemptsMap = Record<string, QuizAttempt>

export type MistakeRecord = {
  questionId: string
  questionText: string
  userAnswer: string
  partId?: string
  lessonId?: string
  loggedAt: number
  reviewCount: number
  lastReviewedAt?: number
}

export type MistakesMap = Record<string, MistakeRecord>

export type QuizMode = 'part' | 'interleaved' | 'mistakes' | 'lesson'

export type SessionState = {
  mode: QuizMode
  scopeLabel: string
  questionIds: string[]
  index: number
  answers: Record<string, { userAnswer: string; selfGrade: SelfGrade }>
}
