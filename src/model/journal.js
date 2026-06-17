// Practice journal — per-day seconds sung + warm-ups completed, plus a day
// streak. Mirrors shed's progress.js. Pure logic + localStorage wrapper.

const KEY = 'ham.journal.v1'

// 'YYYY-MM-DD' in local time for a Date.
export function dayKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function emptyJournal() {
  return { days: {} } // days: { 'YYYY-MM-DD': { seconds, warmups } }
}

export function loadJournal(storage = globalThis.localStorage) {
  if (!storage) return emptyJournal()
  try {
    const raw = storage.getItem(KEY)
    if (!raw) return emptyJournal()
    const parsed = JSON.parse(raw)
    return { days: parsed.days || {} }
  } catch {
    return emptyJournal()
  }
}

export function saveJournal(journal, storage = globalThis.localStorage) {
  if (!storage) return
  try {
    storage.setItem(KEY, JSON.stringify(journal))
  } catch {
    /* ignore */
  }
}

// Record a finished session. Returns a NEW journal (pure); persist separately.
export function recordSession(journal, { seconds = 0, warmups = 0, date = new Date() } = {}) {
  const key = dayKey(date)
  const prev = journal.days[key] || { seconds: 0, warmups: 0 }
  return {
    days: {
      ...journal.days,
      [key]: { seconds: prev.seconds + Math.max(0, seconds), warmups: prev.warmups + Math.max(0, warmups) },
    },
  }
}

// Consecutive days (ending today or yesterday) with any practice.
export function currentStreak(journal, today = new Date()) {
  let streak = 0
  const cursor = new Date(today)
  // Allow the streak to "survive" until end of today even if today is empty.
  if (!journal.days[dayKey(cursor)]) cursor.setDate(cursor.getDate() - 1)
  while (journal.days[dayKey(cursor)]) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export function totals(journal) {
  let seconds = 0
  let warmups = 0
  for (const d of Object.values(journal.days)) {
    seconds += d.seconds || 0
    warmups += d.warmups || 0
  }
  return { seconds, warmups, days: Object.keys(journal.days).length }
}
