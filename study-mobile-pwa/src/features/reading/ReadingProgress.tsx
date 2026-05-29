import { useEffect, useState } from 'react'

type Props = {
  /** When this changes, the progress resets and re-measures. */
  resetKey?: string | null
}

export function ReadingProgress({ resetKey }: Props) {
  const [percent, setPercent] = useState(0)

  useEffect(() => {
    setPercent(0)

    let frame = 0

    const compute = () => {
      const docEl = document.documentElement
      const scrolled = window.scrollY || docEl.scrollTop
      const max = docEl.scrollHeight - docEl.clientHeight
      const next = max > 0 ? Math.min(100, Math.max(0, (scrolled / max) * 100)) : 0
      setPercent(next)
    }

    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(compute)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    compute()

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [resetKey])

  return (
    <div className="reading-progress" aria-hidden="true">
      <div className="reading-progress__bar" style={{ width: `${percent}%` }} />
    </div>
  )
}
