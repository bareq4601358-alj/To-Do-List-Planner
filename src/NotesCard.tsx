import { useEffect, useState } from 'react'
import { formatSelectedHeading } from './dates'
import { loadNotesForScope, saveNotesForScope } from './notesStorage'

type Props = {
  scopeKey: string
}

/**
 * One instance per scope; parent should set `key={scopeKey}` so state resets
 * when switching inbox vs days.
 */
export function NotesCard({ scopeKey }: Props) {
  const [notes, setNotes] = useState(() => loadNotesForScope(scopeKey))

  useEffect(() => {
    saveNotesForScope(scopeKey, notes)
  }, [notes, scopeKey])

  const heading =
    scopeKey === 'inbox'
      ? 'Inbox notes'
      : `Notes · ${formatSelectedHeading(scopeKey)}`

  return (
    <section className="notes-card" aria-labelledby="notes-card-heading">
      <h3 className="notes-card__heading" id="notes-card-heading">
        {heading}
      </h3>
      <p className="notes-card__lede">
        {scopeKey === 'inbox'
          ? 'Notes here stay with the inbox only.'
          : 'These notes are saved only for this date.'}
      </p>
      <label className="visually-hidden" htmlFor={`notes-body-${scopeKey}`}>
        Notes for this view
      </label>
      <textarea
        id={`notes-body-${scopeKey}`}
        className="notes-card__textarea"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Write freely…"
        rows={6}
        spellCheck
      />
      <p className="notes-card__hint">Autosaved in this browser.</p>
    </section>
  )
}
