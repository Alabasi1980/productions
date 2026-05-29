export type SrsAction = 'forgot' | 'hard' | 'easy'

export type FlashcardState = {
  cardId: string
  box: number
  dueAt: number
  lastReviewedAt: number
  lapses: number
  successes: number
}

export type FlashcardStateMap = Record<string, FlashcardState>

export type SessionMode = 'due' | 'all' | 'speed'

export type SpeedRoundStats = {
  score: number
  correct: number
  wrong: number
  timeLeftMs: number
}
