import { Children, Fragment, isValidElement, type ReactNode } from 'react'
import { GlossaryTerm } from './GlossaryTooltip'
import type { GlossaryIndex } from './glossary-hook'

const SKIPPED_ELEMENTS = new Set(['code', 'pre', 'a', 'h1', 'h2', 'h3', 'h4'])

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

let cachedRegex: { pattern: RegExp; terms: string[] } | null = null

function getRegex(index: GlossaryIndex): RegExp {
  if (cachedRegex && cachedRegex.terms === index.englishTerms) {
    return cachedRegex.pattern
  }
  // Word-boundary on ASCII boundaries; Arabic doesn't have \b so we rely on whitespace/punctuation.
  const alternatives = index.englishTerms.map(escapeRegex).join('|')
  const pattern = new RegExp(`(?<![A-Za-z])(${alternatives})(?![A-Za-z])`, 'gi')
  cachedRegex = { pattern, terms: index.englishTerms }
  return pattern
}

function decorateString(text: string, index: GlossaryIndex): ReactNode[] {
  if (text.length < 3 || index.englishTerms.length === 0) return [text]
  const pattern = getRegex(index)
  const result: ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  pattern.lastIndex = 0
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push(text.slice(lastIndex, match.index))
    }
    const matched = match[0]
    const entry = index.byEnglish[matched.toLowerCase()]
    if (entry) {
      result.push(
        <GlossaryTerm key={`${match.index}-${matched}`} term={entry}>
          {matched}
        </GlossaryTerm>,
      )
    } else {
      result.push(matched)
    }
    lastIndex = match.index + matched.length
    if (match.index === pattern.lastIndex) pattern.lastIndex++
  }
  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex))
  }
  return result.length === 0 ? [text] : result
}

export function decorateChildren(children: ReactNode, index: GlossaryIndex): ReactNode {
  if (index.englishTerms.length === 0) return children
  return Children.map(children, (child, i) => {
    if (typeof child === 'string') {
      const parts = decorateString(child, index)
      return <Fragment key={i}>{parts}</Fragment>
    }
    if (isValidElement(child)) {
      const tag = typeof child.type === 'string' ? child.type : null
      if (tag && SKIPPED_ELEMENTS.has(tag)) return child
    }
    return child
  })
}
