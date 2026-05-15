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
 * Chromium + Safari: synchronous `showPicker()` from `click` can fail on fine
 * pointers. `pointerdown` + `preventDefault` for mouse keeps user activation
 * and defers `showPicker` to a microtask. Touch keeps default behavior (works
 * well on phones) and we do not preventDefault.
 */
export function onTimeInputPointerDown(
  e: PointerEvent<HTMLInputElement>,
): void {
  if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return
  e.preventDefault()
  const el = e.currentTarget
  queueMicrotask(() => callShowPicker(el))
}

export function onTimeInputKeyDown(
  e: KeyboardEvent<HTMLInputElement>,
): void {
  if (e.key !== 'Enter' && e.key !== ' ') return
  e.preventDefault()
  callShowPicker(e.currentTarget)
}
