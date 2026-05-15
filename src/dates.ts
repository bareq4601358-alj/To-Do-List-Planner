/** Local calendar date as YYYY-MM-DD (no timezone shifts). */

export function toDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayKey(): string {
  return toDateKey(new Date())
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1, 12, 0, 0, 0)
}

export function startOfWeekMonday(d: Date): Date {
  const x = new Date(d)
  x.setHours(12, 0, 0, 0)
  const day = x.getDay()
  const diff = day === 0 ? -6 : 1 - day
  x.setDate(x.getDate() + diff)
  return x
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

export function weekKeys(weekStartMonday: Date): string[] {
  return Array.from({ length: 7 }, (_, i) => toDateKey(addDays(weekStartMonday, i)))
}

export function isSameCalendarDay(a: Date, b: Date): boolean {
  return toDateKey(a) === toDateKey(b)
}

export function formatWeekHeading(weekStartMonday: Date): string {
  const end = addDays(weekStartMonday, 6)
  const y0 = weekStartMonday.getFullYear()
  const y1 = end.getFullYear()
  const fmt = (d: Date, opts: Intl.DateTimeFormatOptions) =>
    d.toLocaleDateString(undefined, opts)

  if (isSameCalendarDay(weekStartMonday, end)) {
    return fmt(weekStartMonday, { month: 'long', day: 'numeric', year: 'numeric' })
  }

  if (weekStartMonday.getMonth() === end.getMonth() && y0 === y1) {
    return `${fmt(weekStartMonday, { month: 'long' })} ${weekStartMonday.getDate()}–${end.getDate()}, ${y0}`
  }

  if (y0 === y1) {
    return `${fmt(weekStartMonday, { month: 'short', day: 'numeric' })} – ${fmt(end, { month: 'short', day: 'numeric' })}, ${y0}`
  }

  return `${fmt(weekStartMonday, { month: 'short', day: 'numeric', year: 'numeric' })} – ${fmt(end, { month: 'short', day: 'numeric', year: 'numeric' })}`
}

export function formatSelectedHeading(dateKey: string): string {
  const d = parseDateKey(dateKey)
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

export function weekdayShort(d: Date): string {
  return d.toLocaleDateString(undefined, { weekday: 'short' })
}
