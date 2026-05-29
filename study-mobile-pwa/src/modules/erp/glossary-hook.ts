import { useEffect, useMemo, useState } from 'react'
import type { GlossaryBundle, GlossaryEntry } from '../../engine/types'

const URL = '/data/glossary.json'

// Index for fast lookup by primary English term + Arabic term.

export type GlossaryIndex = {
  byEnglish: Record<string, GlossaryEntry>
  byArabic: Record<string, GlossaryEntry>
  englishTerms: string[]
}

function buildIndex(entries: GlossaryEntry[]): GlossaryIndex {
  const byEnglish: Record<string, GlossaryEntry> = {}
  const byArabic: Record<string, GlossaryEntry> = {}
  for (const entry of entries) {
    const englishPrimary = entry.english.split('/')[0].trim().replace(/\s*\(.*?\)\s*/g, '').trim()
    if (englishPrimary) byEnglish[englishPrimary.toLowerCase()] = entry
    if (entry.arabic) byArabic[entry.arabic.trim()] = entry
  }
  const englishTerms = Object.keys(byEnglish)
    .filter((term) => term.length >= 3)
    .sort((a, b) => b.length - a.length)
  return { byEnglish, byArabic, englishTerms }
}

export function useGlossary(): { entries: GlossaryEntry[]; index: GlossaryIndex; loading: boolean } {
  const [entries, setEntries] = useState<GlossaryEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    fetch(URL)
      .then((res) => res.ok ? (res.json() as Promise<GlossaryBundle>) : Promise.reject(new Error('load failed')))
      .then((data) => {
        if (!active) return
        setEntries(data.entries ?? [])
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const index = useMemo(() => buildIndex(entries), [entries])
  return { entries, index, loading }
}
