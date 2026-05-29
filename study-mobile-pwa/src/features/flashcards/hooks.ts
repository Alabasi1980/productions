import { useCallback, useEffect, useState } from 'react'
import * as storage from '../../engine/storage'
import { logActivity } from '../dashboard/activity'
import type { Flashcard, FlashcardsBundle } from '../../engine/types'
import type { FlashcardState, FlashcardStateMap, SrsAction } from './types'
import { applyAction, isDue } from './srs'

const STATE_KEY = 'flashcards.state'
const DECK_URL = '/data/flashcards.json'

function readStates(): FlashcardStateMap {
  return storage.get<FlashcardStateMap>(STATE_KEY, {})
}

function writeStates(states: FlashcardStateMap): void {
  storage.set(STATE_KEY, states)
}

export function useFlashcardDeck() {
  const [cards, setCards] = useState<Flashcard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    fetch(DECK_URL)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json() as Promise<FlashcardsBundle>
      })
      .then((data) => {
        if (!active) return
        setCards(data.cards ?? [])
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

  return { cards, loading, error }
}

export function useFlashcardStates() {
  const [states, setStates] = useState<FlashcardStateMap>(() => readStates())

  const update = useCallback((cardId: string, action: SrsAction): FlashcardState => {
    const current = readStates()
    const next = applyAction(current[cardId], cardId, action)
    current[cardId] = next
    writeStates(current)
    setStates(current)
    logActivity('card')
    return next
  }, [])

  const reload = useCallback(() => {
    setStates(readStates())
  }, [])

  return { states, update, reload }
}

export function selectDue(cards: Flashcard[], states: FlashcardStateMap): Flashcard[] {
  return cards.filter((card) => isDue(states[card.id]))
}

export function shuffle<T>(items: T[]): T[] {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

export function deckStats(cards: Flashcard[], states: FlashcardStateMap) {
  const dueCount = selectDue(cards, states).length
  const learned = cards.filter((card) => (states[card.id]?.successes ?? 0) > 0).length
  const struggling = cards.filter((card) => (states[card.id]?.lapses ?? 0) >= 2).length
  return { total: cards.length, dueCount, learned, struggling }
}
