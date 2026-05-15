import { useCallback, useEffect, useState } from 'react'
import type { Todo } from './types'

const STORAGE_KEY = 'todo-list-v1'

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null
}

function migrateItem(raw: unknown): Todo | null {
  if (!isRecord(raw)) return null
  const { id, title, done, createdAt, dueDate } = raw
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
  } else if (dueDate !== undefined && dueDate !== null) {
    normalizedDue = null
  }
  return {
    id,
    title,
    done,
    createdAt,
    dueDate: normalizedDue,
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

  const add = useCallback((title: string, dueDate: string | null) => {
    const trimmed = title.trim()
    if (!trimmed) return
    setTodos((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: trimmed,
        done: false,
        createdAt: Date.now(),
        dueDate,
      },
    ])
  }, [])

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

  const clearCompletedWhere = useCallback((predicate: (t: Todo) => boolean) => {
    setTodos((prev) => prev.filter((t) => !(t.done && predicate(t))))
  }, [])

  return { todos, add, toggle, remove, setDueDate, clearCompletedWhere }
}
