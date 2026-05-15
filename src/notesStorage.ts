const NOTES_PREFIX = 'planner-notes:'

/** `inbox` or calendar date key `YYYY-MM-DD`. */
export function notesStorageKey(scopeKey: string): string {
  return `${NOTES_PREFIX}${scopeKey}`
}

export function loadNotesForScope(scopeKey: string): string {
  try {
    const key = notesStorageKey(scopeKey)
    let v = localStorage.getItem(key) ?? ''
    if (!v && scopeKey === 'inbox') {
      const legacy = localStorage.getItem('planner-notes-v1')
      if (legacy) {
        v = legacy
        localStorage.setItem(key, legacy)
      }
    }
    return v
  } catch {
    return ''
  }
}

export function saveNotesForScope(scopeKey: string, body: string) {
  try {
    localStorage.setItem(notesStorageKey(scopeKey), body)
  } catch {
    /* quota / private mode */
  }
}
