/** YYYY-MM-DD in local time, or null for unscheduled (inbox). */
export type Todo = {
  id: string
  title: string
  done: boolean
  createdAt: number
  dueDate: string | null
  /** Local wall time HH:mm from `<input type="time">`, or null if none. */
  time: string | null
}

export type Filter = 'all' | 'active' | 'completed'

export type MainTab = 'planner' | 'notes'
