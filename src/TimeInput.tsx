import {
  useEffect,
  useRef,
  useState,
  type InputHTMLAttributes,
  type KeyboardEvent,
} from 'react'
import { SafariDesktopTimeInput } from './SafariDesktopTimeInput'

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

function isPureWebKit(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  if (!/AppleWebKit/.test(ua)) return false
  return !/\b(?:Chrome|Chromium|CriOS|EdgA?)\b/.test(ua)
}

function readDesktopTimeDropdown(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(min-width: 640px) and (pointer: fine)').matches
}

/**
 * Blink / Chrome-family: native `pointerdown` + `showPicker()` keeps user
 * activation. Pure WebKit (Safari): no listener on the native input path.
 */
function shouldApplyProgrammaticTimePicker(): boolean {
  return !isPureWebKit()
}

type Props = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value' | 'onChange' | 'ref'
> & {
  value: string
  onValueChange: (next: string | null) => void
}

/**
 * Desktop (wide + fine pointer): same custom hour/minute control as Safari
 * (`SafariDesktopTimeInput` — locale 12h label + caret). Narrow viewports and
 * touch use native `input type="time"`; Blink still uses `showPicker()` there.
 */
export function TimeInput({
  value,
  onValueChange,
  onKeyDown,
  className,
  id,
  disabled,
  name,
  ...rest
}: Props) {
  const ref = useRef<HTMLInputElement>(null)
  const [desktopTimeDropdown, setDesktopTimeDropdown] = useState(
    readDesktopTimeDropdown,
  )

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px) and (pointer: fine)')
    const sync = () => setDesktopTimeDropdown(readDesktopTimeDropdown())
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

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

  if (desktopTimeDropdown) {
    return (
      <SafariDesktopTimeInput
        id={id}
        name={name}
        disabled={disabled}
        value={value}
        onValueChange={onValueChange}
        onKeyDown={
          onKeyDown as
            | ((e: KeyboardEvent<HTMLButtonElement>) => void)
            | undefined
        }
        className={className}
      />
    )
  }

  const mergedClass = [className, 'time-input'].filter(Boolean).join(' ')

  return (
    <input
      {...rest}
      ref={ref}
      id={id}
      name={name}
      disabled={disabled}
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
