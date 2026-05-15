import type { KeyboardEvent, PointerEvent } from 'react'

function callShowPicker(el: HTMLInputElement) {
  try {
    const ext = el as HTMLInputElement & {
      showPicker?: () => void | Promise<void>
    }
    void Promise.resolve(ext.showPicker?.()).catch(() => {})
  } catch {
    /* Unsupported or blocked — native typing / clock icon still available. */
  }
}

/**
 * Mouse / pen: open the picker in the **same synchronous** user gesture.
 * (`queueMicrotask` breaks desktop Chrome; `(pointer: fine)` + `click` misses
 * some desktop setups.)
 *
 * Touch: do nothing so native tap behavior matches phones.
 */
export function onTimeInputPointerDown(
  e: PointerEvent<HTMLInputElement>,
): void {
  if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return
  e.preventDefault()
  callShowPicker(e.currentTarget)
}

export function onTimeInputKeyDown(
  e: KeyboardEvent<HTMLInputElement>,
): void {
  if (e.key !== 'Enter' && e.key !== ' ') return
  e.preventDefault()
  callShowPicker(e.currentTarget)
}
