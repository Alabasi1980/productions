import { Minus, Plus, RotateCcw } from 'lucide-react'
import { useFontScale } from './hooks'

export function FontSizeControl() {
  const { scale, increase, decrease, reset, min, max, defaultValue } = useFontScale()

  return (
    <div className="font-size-control" role="group" aria-label="حجم الخط">
      <button
        type="button"
        onClick={decrease}
        disabled={scale <= min}
        aria-label="تصغير الخط"
        title="تصغير الخط"
      >
        <Minus size={14} />
      </button>
      <button
        type="button"
        onClick={reset}
        disabled={scale === defaultValue}
        aria-label="إعادة الحجم الافتراضي"
        title="إعادة الحجم الافتراضي"
        className="font-size-control__value"
      >
        {Math.round(scale * 100)}%
      </button>
      <button
        type="button"
        onClick={increase}
        disabled={scale >= max}
        aria-label="تكبير الخط"
        title="تكبير الخط"
      >
        <Plus size={14} />
      </button>
      <button
        type="button"
        onClick={reset}
        className="font-size-control__reset"
        aria-label="إعادة الحجم الافتراضي"
        title="إعادة الحجم الافتراضي"
      >
        <RotateCcw size={14} />
      </button>
    </div>
  )
}
