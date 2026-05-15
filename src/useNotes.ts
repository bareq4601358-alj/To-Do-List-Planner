import { useEffect, useState } from 'react'

const NOTES_KEY = 'planner-notes-v1'

function load(): string {
  try {
    return localStorage.getItem(NOTES_KEY) ?? ''
  } catch {
    return ''
  }
}

export function useNotes() {
  const [notes, setNotes] = useState(load)

  useEffect(() => {
    try {
      localStorage.setItem(NOTES_KEY, notes)
    } catch {
      /* quota or private mode */
    }
  }, [notes])

  return { notes, setNotes }
}
