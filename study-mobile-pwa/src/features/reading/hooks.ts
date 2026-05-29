import { useCallback, useEffect, useState } from 'react'
import * as storage from '../../engine/storage'

const FONT_SIZE_KEY = 'reader.fontScale'
const FOCUS_MODE_KEY = 'reader.focusMode'

const FONT_MIN = 0.8
const FONT_MAX = 1.6
const FONT_STEP = 0.1
const FONT_DEFAULT = 1.0

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function roundStep(value: number) {
  return Math.round(value * 10) / 10
}

export function useFontScale() {
  const [scale, setScale] = useState<number>(() => storage.get(FONT_SIZE_KEY, FONT_DEFAULT))

  useEffect(() => {
    storage.set(FONT_SIZE_KEY, scale)
    document.documentElement.style.setProperty('--reader-font-scale', String(scale))
  }, [scale])

  const increase = useCallback(() => {
    setScale((current) => roundStep(clamp(current + FONT_STEP, FONT_MIN, FONT_MAX)))
  }, [])

  const decrease = useCallback(() => {
    setScale((current) => roundStep(clamp(current - FONT_STEP, FONT_MIN, FONT_MAX)))
  }, [])

  const reset = useCallback(() => {
    setScale(FONT_DEFAULT)
  }, [])

  return { scale, increase, decrease, reset, min: FONT_MIN, max: FONT_MAX, defaultValue: FONT_DEFAULT }
}

export function useFocusMode() {
  const [enabled, setEnabled] = useState<boolean>(() => storage.get(FOCUS_MODE_KEY, false))

  useEffect(() => {
    storage.set(FOCUS_MODE_KEY, enabled)
    document.body.classList.toggle('focus-mode', enabled)
  }, [enabled])

  const toggle = useCallback(() => {
    setEnabled((current) => !current)
  }, [])

  return { enabled, toggle }
}
