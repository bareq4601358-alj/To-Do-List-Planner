import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from 'react'
import type { Filter, Todo } from './types'
import {
  addDays,
  formatSelectedHeading,
  formatWeekHeading,
  parseDateKey,
  startOfWeekMonday,
  todayKey,
  toDateKey,
  weekdayShort,
  weekKeys,
} from './dates'
import { NotesCard } from './NotesCard'
import { TimeInput } from './TimeInput'
import { useTodos } from './useTodos'
import './App.css'

function plural(n: number, word: string) {
  return n === 1 ? word : `${word}s`
}

function sortTodosByTime(items: Todo[]): Todo[] {
  return [...items].sort((a, b) => {
    const ta = a.time
    const tb = b.time
    if (!ta && !tb) return a.createdAt - b.createdAt
    if (!ta) return 1
    if (!tb) return -1
    const c = ta.localeCompare(tb)
    if (c !== 0) return c
    return a.createdAt - b.createdAt
  })
}

export default function App() {
  const {
    todos,
    add,
    toggle,
    remove,
    setDueDate,
    setTime,
    clearCompletedWhere,
  } = useTodos()

  const mondayThisWeek = useMemo(
    () => toDateKey(startOfWeekMonday(new Date())),
    [],
  )

  const [weekMondayKey, setWeekMondayKey] = useState(mondayThisWeek)
  const [highlightId, setHighlightId] = useState<string | null>(null)
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [selected, setSelected] = useState<string | 'inbox'>(() => todayKey())
  const notesScope = selected === 'inbox' ? 'inbox' : selected
  const [draft, setDraft] = useState('')
  const [draftTime, setDraftTime] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  const weekStart = useMemo(() => parseDateKey(weekMondayKey), [weekMondayKey])
  const weekDayKeys = useMemo(() => weekKeys(weekStart), [weekStart])

  const activeCountByDay = useMemo(() => {
    const map = new Map<string, number>()
    for (const t of todos) {
      if (t.done || t.dueDate === null) continue
      map.set(t.dueDate, (map.get(t.dueDate) ?? 0) + 1)
    }
    return map
  }, [todos])

  const scopeTodos = useMemo(() => {
    if (selected === 'inbox') return todos.filter((t) => t.dueDate === null)
    return todos.filter((t) => t.dueDate === selected)
  }, [todos, selected])

  const visible = useMemo(() => {
    if (filter === 'active') return scopeTodos.filter((t) => !t.done)
    if (filter === 'completed') return scopeTodos.filter((t) => t.done)
    return scopeTodos
  }, [scopeTodos, filter])

  const visibleSorted = useMemo(() => sortTodosByTime(visible), [visible])

  const activeInScope = useMemo(
    () => scopeTodos.reduce((n, t) => n + (t.done ? 0 : 1), 0),
    [scopeTodos],
  )
  const completedInScope = scopeTodos.length - activeInScope

  const syncDayToWeek = useCallback(
    (nextMondayKey: string) => {
      const nextStart = parseDateKey(nextMondayKey)
      const keys = weekKeys(nextStart)
      if (selected !== 'inbox' && !keys.includes(selected)) {
        setSelected(keys[0]!)
      }
    },
    [selected],
  )

  const goWeek = (delta: number) => {
    const next = toDateKey(addDays(parseDateKey(weekMondayKey), delta * 7))
    setWeekMondayKey(next)
    syncDayToWeek(next)
  }

  const goToday = () => {
    const mon = toDateKey(startOfWeekMonday(new Date()))
    setWeekMondayKey(mon)
    setSelected(todayKey())
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const timeVal = draftTime.trim() || null
    const newId = add(draft, selected === 'inbox' ? null : selected, timeVal)
    setDraft('')
    setDraftTime('')
    if (newId) {
      if (highlightTimer.current) clearTimeout(highlightTimer.current)
      setHighlightId(newId)
      highlightTimer.current = setTimeout(() => {
        setHighlightId(null)
        highlightTimer.current = null
      }, 2800)
    }
  }

  function clearDoneInView() {
    const ids = new Set(visible.map((t) => t.id))
    clearCompletedWhere((t) => ids.has(t.id))
  }

  const inboxActiveCount = useMemo(
    () => todos.filter((t) => !t.done && t.dueDate === null).length,
    [todos],
  )

  useEffect(() => {
    return () => {
      if (highlightTimer.current) clearTimeout(highlightTimer.current)
    }
  }, [])

  return (
    <div className="app">
      <div className="app__tasks-panel">
      <header className="app-brand">
        <h1 className="app-brand__title">
          <span className="app-brand__line">
            <span className="app-brand__todo">To-do list</span>
            <span className="app-brand__slash" aria-hidden="true">
              /
            </span>
            <span className="app-brand__planner">Planner</span>
          </span>
        </h1>
        <p className="app-brand__tagline">
          Week view, times, and notes — saved only in this browser.
        </p>
      </header>

      <header className="app__header">
            <p className="app__eyebrow">This view</p>
            <h2 className="app__title">
              {selected === 'inbox' ? 'Inbox' : formatSelectedHeading(selected)}
            </h2>
            <p className="app__lede">
              {selected === 'inbox'
                ? 'Tasks without a date land here. Add a time if you like, then schedule on a day.'
                : 'Add a task and optional time — rows sort by time. Remove a row anytime.'}
            </p>
          </header>

          <div className="planner-toolbar">
            <button
              type="button"
              className="planner-toolbar__nav"
              aria-label="Previous week"
              onClick={() => goWeek(-1)}
            >
              ‹
            </button>
            <div className="planner-toolbar__label">
              <span className="planner-toolbar__range">
                {formatWeekHeading(weekStart)}
              </span>
              <button
                type="button"
                className="planner-toolbar__today"
                onClick={goToday}
              >
                Today
              </button>
            </div>
            <button
              type="button"
              className="planner-toolbar__nav"
              aria-label="Next week"
              onClick={() => goWeek(1)}
            >
              ›
            </button>
          </div>

          <div className="week-strip" role="group" aria-label="Week">
            <button
              type="button"
              className={`week-strip__inbox${selected === 'inbox' ? ' week-strip__inbox--active' : ''}`}
              onClick={() => setSelected('inbox')}
            >
              <span className="week-strip__inbox-label">Inbox</span>
              {inboxActiveCount > 0 && (
                <span className="week-strip__badge">{inboxActiveCount}</span>
              )}
            </button>
            {weekDayKeys.map((key) => {
              const d = parseDateKey(key)
              const isToday = key === todayKey()
              const pending = activeCountByDay.get(key) ?? 0
              return (
                <button
                  key={key}
                  type="button"
                  className={`week-strip__day${selected === key ? ' week-strip__day--active' : ''}${isToday ? ' week-strip__day--today' : ''}`}
                  onClick={() => setSelected(key)}
                >
                  <span className="week-strip__dow">{weekdayShort(d)}</span>
                  <span className="week-strip__dom">{d.getDate()}</span>
                  {pending > 0 && (
                    <span className="week-strip__badge">{pending}</span>
                  )}
                </button>
              )
            })}
          </div>

          <form className="composer" onSubmit={onSubmit}>
            <div className="composer__row">
              <label className="visually-hidden" htmlFor="task-input">
                New task
              </label>
              <input
                id="task-input"
                className="composer__input"
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={
                  selected === 'inbox'
                    ? 'Add to inbox…'
                    : `Add for ${parseDateKey(selected).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}…`
                }
                autoComplete="off"
                maxLength={280}
              />
              <div className="composer__time-block">
                <label className="composer__time-label" htmlFor="task-time">
                  Time
                </label>
                <TimeInput
                  id="task-time"
                  className="composer__time"
                  value={draftTime}
                  onValueChange={(v) => setDraftTime(v ?? '')}
                />
              </div>
              <button className="composer__submit" type="submit">
                Add
              </button>
            </div>
            <p className="composer__hint">
              Time is optional — click or tap the time field to change it.
            </p>
          </form>

          <div
            className="filters"
            role="tablist"
            aria-label="Filter tasks"
          >
            {(
              [
                ['all', 'All'],
                ['active', 'Active'],
                ['completed', 'Done'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={filter === key}
                className={`filters__btn${filter === key ? ' filters__btn--active' : ''}`}
                onClick={() => setFilter(key)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="list-wrap">
            {visibleSorted.length > 0 && (
              <div className="list__head" aria-hidden="true">
                <span>Time</span>
                <span>Task</span>
                <span>Date · remove</span>
              </div>
            )}
            <ul className="list" aria-live="polite">
              {visibleSorted.length === 0 ? (
                <li className="list__empty">
                  {scopeTodos.length === 0
                    ? selected === 'inbox'
                      ? 'Inbox is empty — capture anything without a date, then schedule it on a day.'
                      : 'No tasks for this day yet — add one above.'
                    : filter === 'active'
                      ? 'Nothing left to do here. Enjoy the win.'
                      : 'No completed tasks in this view yet.'}
                </li>
              ) : (
                visibleSorted.map((todo) => (
                  <li key={todo.id} className="list__item">
                    <div className="list__cell list__cell--time">
                      <label className="field-label" htmlFor={`time-${todo.id}`}>
                        Time
                      </label>
                      <TimeInput
                        id={`time-${todo.id}`}
                        className="row__time"
                        value={todo.time ?? ''}
                        onValueChange={(v) => setTime(todo.id, v)}
                      />
                    </div>
                    <div className="list__cell list__cell--task">
                      <label className="row">
                        <input
                          className="row__check"
                          type="checkbox"
                          checked={todo.done}
                          onChange={() => toggle(todo.id)}
                        />
                        <span
                          className={`row__title${todo.done ? ' row__title--done' : ''}${highlightId === todo.id ? ' row__title--fresh' : ''}`}
                        >
                          {todo.title}
                        </span>
                      </label>
                    </div>
                    <div className="list__cell list__cell--actions">
                      <label className="row__date-wrap">
                        <span className="field-label">Date</span>
                        <input
                          className="row__date"
                          type="date"
                          value={todo.dueDate ?? ''}
                          onChange={(e) =>
                            setDueDate(todo.id, e.target.value || null)
                          }
                        />
                      </label>
                      <button
                        type="button"
                        className="row__remove"
                        aria-label={`Remove row: ${todo.title}`}
                        onClick={() => remove(todo.id)}
                      >
                        <span aria-hidden="true">×</span>
                      </button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>

          {scopeTodos.length > 0 && (
            <footer className="footer">
              <p className="footer__counts">
                <span className="footer__stat">
                  {activeInScope} active {plural(activeInScope, 'task')}
                </span>
                {completedInScope > 0 && (
                  <>
                    <span className="footer__dot" aria-hidden>
                      ·
                    </span>
                    <span className="footer__stat">{completedInScope} done</span>
                  </>
                )}
              </p>
              {completedInScope > 0 && (
                <button
                  type="button"
                  className="footer__clear"
                  onClick={clearDoneInView}
                >
                  Clear done in view
                </button>
              )}
            </footer>
          )}
      </div>

      <NotesCard key={notesScope} scopeKey={notesScope} />
    </div>
  )
}
