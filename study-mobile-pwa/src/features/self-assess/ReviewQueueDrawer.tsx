import { useEffect } from 'react'
import { Calendar, Clock, X } from 'lucide-react'
import { useReviewQueue } from './hooks'
import type { ReviewItem } from './types'

type Props = {
  open: boolean
  onClose: () => void
  /** Resolves a sourceId (e.g. lesson id) to a human title via the content index. */
  resolveTitle: (sourceId: string) => string | null
  onOpenItem: (sourceId: string) => void
}

const RATING_TONE: Record<string, string> = {
  low: 'review-queue__rating--low',
  medium: 'review-queue__rating--medium',
  high: 'review-queue__rating--high',
}

const RATING_LABEL: Record<string, string> = {
  low: 'يحتاج مراجعة',
  medium: 'فهم جزئي',
  high: 'مستقر',
}

function formatDue(timestamp: number): string {
  const now = Date.now()
  const delta = timestamp - now
  const oneDay = 24 * 60 * 60 * 1000
  if (delta <= 0) return 'مستحقّ الآن'
  const days = Math.round(delta / oneDay)
  if (days < 1) return 'خلال ساعات'
  if (days === 1) return 'غداً'
  if (days <= 7) return `بعد ${days} أيام`
  return new Date(timestamp).toLocaleDateString('ar')
}

function renderItem(item: ReviewItem, resolveTitle: (id: string) => string | null, onOpen: () => void) {
  const title = resolveTitle(item.sourceId) ?? item.sourceId
  return (
    <button key={item.sourceId} type="button" className="review-queue__item" onClick={onOpen}>
      <div className="review-queue__item-main">
        <span className={`review-queue__rating ${item.lastRating ? RATING_TONE[item.lastRating] : ''}`}>
          {item.lastRating ? RATING_LABEL[item.lastRating] : 'جديد'}
        </span>
        <strong>{title}</strong>
      </div>
      <div className="review-queue__item-meta">
        <Clock size={13} />
        <span>{formatDue(item.dueAt)}</span>
      </div>
    </button>
  )
}

export function ReviewQueueDrawer({ open, onClose, resolveTitle, onOpenItem }: Props) {
  const { due, upcoming, refresh } = useReviewQueue()

  useEffect(() => {
    if (open) refresh()
  }, [open, refresh])

  if (!open) return null

  return (
    <>
      <button type="button" className="drawer-backdrop" aria-label="إغلاق" onClick={onClose} />
      <aside className="review-queue" dir="rtl" role="dialog" aria-modal="true">
        <header className="review-queue__head">
          <div>
            <Calendar size={18} />
            <strong>قائمة المراجعة</strong>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="إغلاق">
            <X size={18} />
          </button>
        </header>

        <div className="review-queue__body">
          <section>
            <h4 className="review-queue__section-title">
              مستحقّة الآن
              <span className="review-queue__count">{due.length}</span>
            </h4>
            {due.length === 0 ? (
              <p className="review-queue__empty">لا يوجد عناصر مستحقّة للمراجعة الآن.</p>
            ) : (
              <div className="review-queue__list">
                {due
                  .sort((a, b) => a.dueAt - b.dueAt)
                  .map((item) =>
                    renderItem(item, resolveTitle, () => {
                      onOpenItem(item.sourceId)
                      onClose()
                    }),
                  )}
              </div>
            )}
          </section>

          <section>
            <h4 className="review-queue__section-title">
              قادمة
              <span className="review-queue__count">{upcoming.length}</span>
            </h4>
            {upcoming.length === 0 ? (
              <p className="review-queue__empty">لا توجد مراجعات مجدولة.</p>
            ) : (
              <div className="review-queue__list">
                {upcoming
                  .sort((a, b) => a.dueAt - b.dueAt)
                  .slice(0, 12)
                  .map((item) =>
                    renderItem(item, resolveTitle, () => {
                      onOpenItem(item.sourceId)
                      onClose()
                    }),
                  )}
              </div>
            )}
          </section>
        </div>
      </aside>
    </>
  )
}
