import { useMemo, useState } from 'react'
import { GitCompareArrows, X } from 'lucide-react'
import { SYSTEM_ALIASES, aliasCategories } from './system-aliases'

type Props = {
  open: boolean
  onClose: () => void
}

export function SystemMapScreen({ open, onClose }: Props) {
  const categories = useMemo(() => ['الكل', ...aliasCategories()], [])
  const [activeCategory, setActiveCategory] = useState<string>('الكل')

  if (!open) return null

  const filtered = activeCategory === 'الكل'
    ? SYSTEM_ALIASES
    : SYSTEM_ALIASES.filter((alias) => alias.category === activeCategory)

  return (
    <div className="system-map-screen" dir="rtl" role="dialog" aria-modal="true">
      <header className="system-map-screen__head">
        <button type="button" className="icon-button" onClick={onClose} aria-label="إغلاق">
          <X size={20} />
        </button>
        <h2>
          <GitCompareArrows size={18} />
          خريطة المصطلحات بين الأنظمة
        </h2>
        <span aria-hidden="true" style={{ width: 36 }} />
      </header>

      <nav className="system-map__filters">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={`system-map__filter ${activeCategory === category ? 'system-map__filter--active' : ''}`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </nav>

      <main className="system-map-screen__body">
        <div className="system-map__list">
          {filtered.map((alias) => (
            <article key={alias.concept} className="system-card">
              <header className="system-card__head">
                <span className="system-card__concept">{alias.arabic}</span>
                <span className="system-card__name">{alias.concept}</span>
              </header>
              <div className="system-card__grid">
                <div className="system-cell system-cell--dynamics">
                  <span className="system-cell__label">Dynamics 365</span>
                  <span className="system-cell__value">{alias.dynamics}</span>
                </div>
                <div className="system-cell system-cell--oracle">
                  <span className="system-cell__label">Oracle Fusion</span>
                  <span className="system-cell__value">{alias.oracle}</span>
                </div>
                <div className="system-cell system-cell--sap">
                  <span className="system-cell__label">SAP S/4HANA</span>
                  <span className="system-cell__value">{alias.sap}</span>
                </div>
              </div>
              {alias.note ? <p className="system-card__note">💡 {alias.note}</p> : null}
            </article>
          ))}
        </div>
      </main>
    </div>
  )
}
