import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import { createPortal } from 'react-dom'

type Props = {
  id?: string
  name?: string
  className?: string
  disabled?: boolean
  value: string
  onValueChange: (next: string | null) => void
  onKeyDown?: (e: ReactKeyboardEvent<HTMLButtonElement>) => void
}

const HOURS12 = Array.from({ length: 12 }, (_, i) => i + 1)
const MINUTES = Array.from({ length: 60 }, (_, i) => i)
const PERIODS = [
  { value: 'am' as const, label: 'AM' },
  { value: 'pm' as const, label: 'PM' },
]

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

function parseParts(value: string): { hour: number; minute: number } {
  const m = /^(\d{1,2}):(\d{2})$/.exec(value.trim())
  if (!m) return { hour: 0, minute: 0 }
  let h = Number(m[1])
  let min = Number(m[2])
  if (!Number.isFinite(h) || h < 0) h = 0
  if (!Number.isFinite(min) || min < 0) min = 0
  if (h > 23) h = 23
  if (min > 59) min = 59
  return { hour: h, minute: min }
}

function to12(h24: number): { hour12: number; period: 'am' | 'pm' } {
  if (h24 === 0) return { hour12: 12, period: 'am' }
  if (h24 < 12) return { hour12: h24, period: 'am' }
  if (h24 === 12) return { hour12: 12, period: 'pm' }
  return { hour12: h24 - 12, period: 'pm' }
}

function to24(hour12: number, period: 'am' | 'pm'): number {
  if (period === 'am') return hour12 === 12 ? 0 : hour12
  return hour12 === 12 ? 12 : hour12 + 12
}

function parse12FromValue(value: string): {
  hour12: number
  minute: number
  period: 'am' | 'pm'
} {
  const { hour: h24, minute } = parseParts(value)
  const { hour12, period } = to12(h24)
  return { hour12, minute, period }
}

function toValue(hour24: number, minute: number) {
  return `${pad2(hour24)}:${pad2(minute)}`
}

function formatTriggerLabel(value: string) {
  if (!value?.trim()) return '—'
  if (!/^\d{1,2}:\d{2}$/.test(value.trim())) return '—'
  const { hour, minute } = parseParts(value)
  const d = new Date(2000, 0, 1, hour, minute)
  return d.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function SafariDesktopTimeInput({
  value,
  onValueChange,
  onKeyDown,
  className,
  disabled,
  id,
  name,
}: Props) {
  const uid = useId()
  const panelId = `${uid}-panel`
  const btnRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 })
  const hourSelectRef = useRef<HTMLSelectElement>(null)
  const init = parse12FromValue(value)
  const [hour12, setHour12] = useState(init.hour12)
  const [minute, setMinute] = useState(init.minute)
  const [period, setPeriod] = useState<'am' | 'pm'>(init.period)

  useEffect(() => {
    const p = parse12FromValue(value)
    setHour12(p.hour12)
    setMinute(p.minute)
    setPeriod(p.period)
  }, [value])

  const applyTime = useCallback(
    (h12: number, m: number, per: 'am' | 'pm') => {
      const h24 = to24(h12, per)
      onValueChange(toValue(h24, m))
    },
    [onValueChange],
  )

  const placePanel = useCallback(() => {
    const el = btnRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const w = Math.max(r.width, 17 * 16)
    const left = Math.min(r.left, window.innerWidth - w - 8)
    setPos({ top: r.bottom + 6, left: Math.max(8, left), width: w })
  }, [])

  useLayoutEffect(() => {
    if (!open) return
    placePanel()
    queueMicrotask(() => hourSelectRef.current?.focus())
  }, [open, placePanel])

  useEffect(() => {
    if (!open) return
    const onScroll = () => placePanel()
    const onResize = () => placePanel()
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onResize)
    }
  }, [open, placePanel])

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node
      if (panelRef.current?.contains(t) || btnRef.current?.contains(t)) return
      setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const mergedClass = [className, 'time-input', 'time-dropdown-trigger']
    .filter(Boolean)
    .join(' ')

  const panel = open ? (
    <div
      ref={panelRef}
      id={panelId}
      className="time-dropdown-panel"
      role="dialog"
      aria-modal="true"
      aria-label="Choose time"
      style={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        width: pos.width,
        zIndex: 4000,
      }}
    >
      <div className="time-dropdown-panel__row">
        <label className="visually-hidden" htmlFor={`${uid}-h`}>
          Hour
        </label>
        <select
          ref={hourSelectRef}
          id={`${uid}-h`}
          className="time-dropdown-panel__select time-dropdown-panel__select--hour"
          value={hour12}
          disabled={disabled}
          onChange={(e) => {
            const h = Number(e.target.value)
            setHour12(h)
            applyTime(h, minute, period)
          }}
        >
          {HOURS12.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
        <span className="time-dropdown-panel__sep" aria-hidden>
          :
        </span>
        <label className="visually-hidden" htmlFor={`${uid}-m`}>
          Minute
        </label>
        <select
          id={`${uid}-m`}
          className="time-dropdown-panel__select time-dropdown-panel__select--minute"
          value={minute}
          disabled={disabled}
          onChange={(e) => {
            const m = Number(e.target.value)
            setMinute(m)
            applyTime(hour12, m, period)
          }}
        >
          {MINUTES.map((m) => (
            <option key={m} value={m}>
              {pad2(m)}
            </option>
          ))}
        </select>
        <label className="visually-hidden" htmlFor={`${uid}-ap`}>
          AM or PM
        </label>
        <select
          id={`${uid}-ap`}
          className="time-dropdown-panel__select time-dropdown-panel__select--period"
          value={period}
          disabled={disabled}
          onChange={(e) => {
            const per = e.target.value as 'am' | 'pm'
            setPeriod(per)
            applyTime(hour12, minute, per)
          }}
        >
          {PERIODS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>
      <div className="time-dropdown-panel__footer">
        <button
          type="button"
          className="time-dropdown-panel__link"
          disabled={disabled}
          onClick={() => {
            onValueChange(null)
            setOpen(false)
          }}
        >
          Clear
        </button>
        <button
          type="button"
          className="time-dropdown-panel__done"
          disabled={disabled}
          onClick={() => setOpen(false)}
        >
          Done
        </button>
      </div>
    </div>
  ) : null

  return (
    <div className="time-input-shell">
      <button
        ref={btnRef}
        type="button"
        id={id}
        name={name}
        disabled={disabled}
        className={mergedClass || undefined}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            if (!disabled) setOpen((o) => !o)
          }
          onKeyDown?.(e)
        }}
      >
        <span className="time-dropdown-trigger__value">
          {formatTriggerLabel(value)}
        </span>
        <span className="time-dropdown-trigger__caret" aria-hidden>
          ▾
        </span>
      </button>
      {typeof document !== 'undefined' && panel
        ? createPortal(panel, document.body)
        : null}
    </div>
  )
}
