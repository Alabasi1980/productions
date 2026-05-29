import { useEffect, useState } from 'react'
import { ChevronDown, List } from 'lucide-react'
import type { Heading } from '../../engine/types'

type Props = {
  headings: Heading[]
  scrollContainer?: HTMLElement | null
}

function scrollToHeadingByText(text: string, container: HTMLElement | null) {
  const root = container ?? document
  const elements = root.querySelectorAll<HTMLElement>('.markdown-card h2, .markdown-card h3, .markdown-card h4')
  for (const el of Array.from(elements)) {
    if ((el.textContent ?? '').trim() === text.trim()) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return true
    }
  }
  return false
}

export function TableOfContents({ headings, scrollContainer }: Props) {
  const [open, setOpen] = useState(false)
  const items = headings.filter((heading) => heading.level >= 2 && heading.level <= 3)

  // Auto-collapse when the doc changes
  useEffect(() => {
    setOpen(false)
  }, [headings])

  if (items.length < 2) return null

  return (
    <div className={`toc ${open ? 'toc--open' : ''}`}>
      <button
        type="button"
        className="toc__toggle"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
      >
        <span className="toc__title"><List size={16} /> فهرس الدرس</span>
        <span className="toc__count">{items.length}</span>
        <ChevronDown size={14} className={`toc__chevron ${open ? 'toc__chevron--open' : ''}`} />
      </button>
      {open ? (
        <ol className="toc__list">
          {items.map((heading, index) => (
            <li key={`${heading.slug}-${index}`} className={`toc__item toc__item--level-${heading.level}`}>
              <button
                type="button"
                onClick={() => {
                  if (scrollToHeadingByText(heading.text, scrollContainer ?? null)) {
                    setOpen(false)
                  }
                }}
              >
                {heading.text}
              </button>
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  )
}
