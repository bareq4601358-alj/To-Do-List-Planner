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

function readSafariDesktopDropdown(): boolean {
  if (typeof window === 'undefined') return false
  return (
    isPureWebKit() &&
    window.matchMedia('(min-width: 640px) and (pointer: fine)').matches
  )
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
 * Safari desktop: custom hour/minute dropdown (Chrome-like). Other platforms:
 * native `input type="time"` with programmatic picker on Blink desktop.
 * Touch stays native everywhere.
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
  const [safariDesktopDropdown, setSafariDesktopDropdown] = useState(
    readSafariDesktopDropdown,
  )

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px) and (pointer: fine)')
    const sync = () => setSafariDesktopDropdown(readSafariDesktopDropdown())
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

  if (safariDesktopDropdown) {
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
