import type { FlashcardState, SrsAction } from './types'

// Leitner-style boxes. Index = box number, value = interval in days.
export const BOX_INTERVAL_DAYS = [1, 3, 7, 14, 30]
export const MAX_BOX = BOX_INTERVAL_DAYS.length - 1

const DAY_MS = 24 * 60 * 60 * 1000

export function makeNewState(cardId: string): FlashcardState {
  const now = Date.now()
  return {
    cardId,
    box: 0,
    dueAt: now,
    lastReviewedAt: 0,
    lapses: 0,
    successes: 0,
  }
}

export function applyAction(previous: FlashcardState | undefined, cardId: string, action: SrsAction): FlashcardState {
  const now = Date.now()
  const base = previous ?? makeNewState(cardId)
  let nextBox = base.box
  let lapses = base.lapses
  let successes = base.successes

  if (action === 'forgot') {
    nextBox = 0
    lapses += 1
  } else if (action === 'hard') {
    successes += 1
  } else {
    // easy
    nextBox = Math.min(MAX_BOX, base.box + 1)
    successes += 1
  }

  const intervalDays = BOX_INTERVAL_DAYS[nextBox]
  return {
    cardId,
    box: nextBox,
    dueAt: now + intervalDays * DAY_MS,
    lastReviewedAt: now,
    lapses,
    successes,
  }
}

export function isDue(state: FlashcardState | undefined): boolean {
  if (!state) return true
  return state.dueAt <= Date.now()
}
