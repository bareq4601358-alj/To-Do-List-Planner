/** YYYY-MM-DD in local time, or null for unscheduled (inbox). */
export type Todo = {
  id: string
  title: string
  done: boolean
  createdAt: number
  dueDate: string | null
}

export type Filter = 'all' | 'active' | 'completed'
