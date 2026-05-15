import type { KeyboardEvent, MouseEvent } from 'react'

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

function prefersFinePointer(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(pointer: fine)').matches
  )
}

/**
 * Touch / coarse pointers: skip so the browser’s native tap behavior runs.
 * Mouse / fine pointers: `showPicker()` must run in the same synchronous turn
 * as the user gesture — deferring (e.g. `queueMicrotask`) breaks desktop Chrome.
 */
export function onTimeInputClick(e: MouseEvent<HTMLInputElement>): void {
  if (!prefersFinePointer()) return
  if (e.detail === 0) return
  callShowPicker(e.currentTarget)
}

export function onTimeInputKeyDown(
  e: KeyboardEvent<HTMLInputElement>,
): void {
  if (e.key !== 'Enter' && e.key !== ' ') return
  e.preventDefault()
  callShowPicker(e.currentTarget)
}
