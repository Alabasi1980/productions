import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { GlossaryEntry } from '../../engine/types'

type Props = {
  term: GlossaryEntry
  children: ReactNode
}

export function GlossaryTerm({ term, children }: Props) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLSpanElement>(null)
  const popoverRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!open) return
    function onDocClick(event: MouseEvent) {
      if (
        wrapRef.current &&
        !wrapRef.current.contains(event.target as Node) &&
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  return (
    <span className="glossary-term" ref={wrapRef}>
      <button
        type="button"
        className="glossary-term__trigger"
        onClick={(event) => {
          event.stopPropagation()
          setOpen((current) => !current)
        }}
        aria-expanded={open}
      >
        {children}
      </button>
      {open ? (
        <span className="glossary-term__popover" ref={popoverRef} role="tooltip" dir="rtl">
          <span className="glossary-term__head">
            <strong>{term.english}</strong>
            <span className="glossary-term__arabic">{term.arabic}</span>
          </span>
          <span className="glossary-term__meaning">{term.meaning}</span>
          {term.category ? <span className="glossary-term__cat">{String(term.category)}</span> : null}
        </span>
      ) : null}
    </span>
  )
}
