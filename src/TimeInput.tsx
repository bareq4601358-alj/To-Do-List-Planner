import { useEffect, useRef, type InputHTMLAttributes } from 'react'

function openPicker(el: HTMLInputElement) {
  try {
    const x = el as HTMLInputElement & {
      showPicker?: () => void | Promise<void>
    }
    void Promise.resolve(x.showPicker?.()).catch(() => {})
  } catch {
    /* unsupported */
  }
}

/**
 * Pure WebKit (Safari desktop, iOS Safari, in-app WKWebView): native time UI is
 * opened from the default pointer/click path. Calling `showPicker()` here often
 * rejects or fights that path, leaving the field unresponsive.
 *
 * Blink-based browsers (Chrome, Edge, Opera, Chrome iOS) still benefit from a
 * native capture listener so `showPicker()` runs in a real user gesture (React
 * synthetics can drop activation).
 */
function shouldApplyProgrammaticTimePicker(): boolean {
  if (typeof navigator === 'undefined') return true
  const ua = navigator.userAgent
  if (!/AppleWebKit/.test(ua)) return true
  if (/\b(?:Chrome|Chromium|CriOS|EdgA?)\b/.test(ua)) return true
  return false
}

type Props = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value' | 'onChange' | 'ref'
> & {
  value: string
  onValueChange: (next: string | null) => void
}

/**
 * Blink: native `pointerdown` capture + `showPicker()` keeps user activation.
 * Safari / pure WebKit: no listener — rely on native picker + CSS that does not
 * cover the field with an invisible calendar indicator (see App.css).
 *
 * Touch is skipped on Blink so phones keep a single native time UI.
 */
export function TimeInput({
  value,
  onValueChange,
  onKeyDown,
  className,
  ...rest
}: Props) {
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !shouldApplyProgrammaticTimePicker()) return

    const onPointerDownCapture = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      openPicker(el)
    }

    el.addEventListener('pointerdown', onPointerDownCapture, { capture: true })
    return () =>
      el.removeEventListener('pointerdown', onPointerDownCapture, {
        capture: true,
      })
  }, [])

  const mergedClass = [className, 'time-input'].filter(Boolean).join(' ')

  return (
    <input
      {...rest}
      ref={ref}
      className={mergedClass || undefined}
      type="time"
      step={60}
      value={value}
      onChange={(e) => onValueChange(e.target.value || null)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          openPicker(e.currentTarget)
        }
        onKeyDown?.(e)
      }}
    />
  )
}
