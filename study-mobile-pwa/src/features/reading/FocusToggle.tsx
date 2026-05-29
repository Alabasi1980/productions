import { Focus, Maximize2 } from 'lucide-react'
import { useFocusMode } from './hooks'

export function FocusToggle() {
  const { enabled, toggle } = useFocusMode()
  return (
    <button
      type="button"
      className={`focus-toggle ${enabled ? 'focus-toggle--active' : ''}`}
      onClick={toggle}
      title={enabled ? 'الخروج من وضع التركيز' : 'وضع التركيز للقراءة فقط'}
      aria-pressed={enabled}
    >
      {enabled ? <Maximize2 size={14} /> : <Focus size={14} />}
      <span>{enabled ? 'إنهاء التركيز' : 'تركيز'}</span>
    </button>
  )
}
