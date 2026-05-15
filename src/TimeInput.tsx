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

type Props = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value' | 'onChange' | 'ref'
> & {
  value: string
  onValueChange: (next: string | null) => void
}

/**
 * React synthetic `pointerdown` can miss user-activation for `showPicker()` on
 * some desktop browsers. A native capture listener keeps the gesture intact.
 * Touch is skipped so phones keep native time UI.
 */
export function TimeInput({ value, onValueChange, onKeyDown, ...rest }: Props) {
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onPointerDownCapture = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      e.preventDefault()
      openPicker(el)
    }

    el.addEventListener('pointerdown', onPointerDownCapture, { capture: true })
    return () =>
      el.removeEventListener('pointerdown', onPointerDownCapture, {
        capture: true,
      })
  }, [])

  return (
    <input
      {...rest}
      ref={ref}
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
