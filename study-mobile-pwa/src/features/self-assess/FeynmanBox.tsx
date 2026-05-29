import { useEffect, useMemo, useRef, useState } from 'react'
import { Brain, Save } from 'lucide-react'
import { useLessonStudy } from './hooks'
import type { Heading } from '../../engine/types'

type Props = {
  lessonId: string
  headings?: Heading[]
}

// Treat any token of length >= 4 inside the heading as a candidate keyword.
// Strip Arabic prefixes like ال/و/ف/ب before comparison.
const ARABIC_STOPWORDS = new Set([
  'هذا', 'هذه', 'ذلك', 'تلك', 'الذي', 'التي', 'الذين', 'اللاتي', 'حول', 'بين', 'عند',
  'فقط', 'مثل', 'مثلا', 'أيضا', 'حتى', 'لكي', 'لكن', 'عندما', 'بعض', 'كل', 'بعد', 'قبل',
])

function normalize(text: string): string {
  return text
    .replace(/[ًٌٍَُِّْ]/g, '')
    .replace(/[إأآا]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .toLowerCase()
}

function extractKeywords(headings: Heading[]): string[] {
  const seen = new Set<string>()
  const keywords: string[] = []
  for (const heading of headings) {
    if (heading.level < 2 || heading.level > 3) continue
    const tokens = heading.text.split(/\s+|[.,،؛:؟?!-]/)
    for (const token of tokens) {
      const cleaned = token.replace(/^(ال|و|ف|ب|ل)/, '').trim()
      if (cleaned.length < 4) continue
      if (ARABIC_STOPWORDS.has(cleaned)) continue
      const key = normalize(cleaned)
      if (seen.has(key)) continue
      seen.add(key)
      keywords.push(token.trim())
      if (keywords.length >= 8) return keywords
    }
  }
  return keywords
}

export function FeynmanBox({ lessonId, headings = [] }: Props) {
  const { study, setFeynman } = useLessonStudy(lessonId)
  const [draft, setDraft] = useState<string>('')
  const [savedFlash, setSavedFlash] = useState(false)
  const saveTimer = useRef<number | null>(null)

  useEffect(() => {
    setDraft(study.feynman ?? '')
  }, [study.feynman, lessonId])

  const keywords = useMemo(() => extractKeywords(headings), [headings])

  const coverage = useMemo(() => {
    if (!draft || keywords.length === 0) return { hit: [], missed: keywords, percent: 0 }
    const normalizedDraft = normalize(draft)
    const hit: string[] = []
    const missed: string[] = []
    for (const keyword of keywords) {
      const normalizedKey = normalize(keyword.replace(/^(ال|و|ف|ب|ل)/, ''))
      if (normalizedDraft.includes(normalizedKey)) hit.push(keyword)
      else missed.push(keyword)
    }
    return { hit, missed, percent: keywords.length ? Math.round((hit.length / keywords.length) * 100) : 0 }
  }, [draft, keywords])

  function handleChange(value: string) {
    setDraft(value)
    if (saveTimer.current) window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(() => {
      setFeynman(value)
      setSavedFlash(true)
      window.setTimeout(() => setSavedFlash(false), 1400)
    }, 600)
  }

  const wordCount = draft.trim() ? draft.trim().split(/\s+/).length : 0

  return (
    <section className="feynman-box" dir="rtl">
      <header className="feynman-box__head">
        <Brain size={18} />
        <div>
          <h3>اشرحها بكلماتك</h3>
          <p>إذا قدرت تشرح المفهوم في ثلاثة أسطر بكلماتك، فقد فهمته فعلاً.</p>
        </div>
      </header>

      <textarea
        className="feynman-box__textarea"
        value={draft}
        onChange={(event) => handleChange(event.target.value)}
        placeholder="اكتب شرحك هنا للمفهوم الأساسي للدرس... تخيّل أنك تشرح لزميل جديد."
        rows={6}
      />

      <div className="feynman-box__footer">
        <span className="feynman-box__count">{wordCount} كلمة</span>
        {savedFlash ? (
          <span className="feynman-box__saved"><Save size={14} /> تم الحفظ</span>
        ) : null}
      </div>

      {keywords.length > 0 && draft.trim().length > 10 ? (
        <div className="feynman-box__coverage">
          <div className="feynman-box__coverage-bar">
            <div className="feynman-box__coverage-fill" style={{ width: `${coverage.percent}%` }} />
            <span className="feynman-box__coverage-label">{coverage.percent}% من المفاهيم الأساسية</span>
          </div>
          {coverage.missed.length > 0 ? (
            <p className="feynman-box__missed">
              <strong>لم تذكر:</strong> {coverage.missed.slice(0, 6).join('، ')}
            </p>
          ) : (
            <p className="feynman-box__complete">شرحك يغطي كل العناوين الأساسية. ممتاز.</p>
          )}
        </div>
      ) : null}
    </section>
  )
}
