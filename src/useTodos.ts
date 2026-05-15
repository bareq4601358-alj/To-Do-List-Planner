import { useCallback, useEffect, useState } from 'react'
import type { Todo } from './types'

const STORAGE_KEY = 'todo-list-v1'

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null
}

function migrateItem(raw: unknown): Todo | null {
  if (!isRecord(raw)) return null
  const { id, title, done, createdAt, dueDate, time } = raw
  if (
    typeof id !== 'string' ||
    typeof title !== 'string' ||
    typeof done !== 'boolean' ||
    typeof createdAt !== 'number'
  ) {
    return null
  }
  let normalizedDue: string | null = null
  if (typeof dueDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
    normalizedDue = dueDate
  }
  let normalizedTime: string | null = null
  if (typeof time === 'string' && /^\d{2}:\d{2}$/.test(time)) {
    normalizedTime = time
  }
  return {
    id,
    title,
    done,
    createdAt,
    dueDate: normalizedDue,
    time: normalizedTime,
  }
}

function load(): Todo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map(migrateItem).filter((t): t is Todo => t !== null)
  } catch {
    return []
  }
}

function persist(todos: Todo[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>(load)

  useEffect(() => {
    persist(todos)
  }, [todos])

  const add = useCallback(
    (
      title: string,
      dueDate: string | null,
      time: string | null,
    ): string | undefined => {
      const trimmed = title.trim()
      if (!trimmed) return undefined
      const id = crypto.randomUUID()
      const normalizedTime =
        time && /^\d{2}:\d{2}$/.test(time) ? time : null
      setTodos((prev) => [
        ...prev,
        {
          id,
          title: trimmed,
          done: false,
          createdAt: Date.now(),
          dueDate,
          time: normalizedTime,
        },
      ])
      return id
    },
    [],
  )

  const toggle = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    )
  }, [])

  const remove = useCallback((id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const setDueDate = useCallback((id: string, dueDate: string | null) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, dueDate } : t)),
    )
  }, [])

  const setTime = useCallback((id: string, time: string | null) => {
    setTodos((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t
        const next =
          time && /^\d{2}:\d{2}$/.test(time) ? time : null
        return { ...t, time: next }
      }),
    )
  }, [])

  const clearCompletedWhere = useCallback((predicate: (t: Todo) => boolean) => {
    setTodos((prev) => prev.filter((t) => !(t.done && predicate(t))))
  }, [])

  return {
    todos,
    add,
    toggle,
    remove,
    setDueDate,
    setTime,
    clearCompletedWhere,
  }
}
