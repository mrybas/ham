import { describe, it, expect } from 'vitest'
import { emptyJournal, recordSession, currentStreak, totals, dayKey } from './journal.js'

const d = (s) => new Date(s + 'T12:00:00')

describe('recordSession', () => {
  it('accumulates seconds and warm-ups per day', () => {
    let j = emptyJournal()
    j = recordSession(j, { seconds: 120, warmups: 1, date: d('2026-06-17') })
    j = recordSession(j, { seconds: 60, warmups: 2, date: d('2026-06-17') })
    expect(j.days[dayKey(d('2026-06-17'))]).toEqual({ seconds: 180, warmups: 3 })
  })
  it('is pure — does not mutate the input', () => {
    const j0 = emptyJournal()
    recordSession(j0, { seconds: 10, warmups: 1, date: d('2026-06-17') })
    expect(j0.days).toEqual({})
  })
})

describe('currentStreak', () => {
  it('counts consecutive days up to today', () => {
    let j = emptyJournal()
    j = recordSession(j, { seconds: 60, warmups: 1, date: d('2026-06-15') })
    j = recordSession(j, { seconds: 60, warmups: 1, date: d('2026-06-16') })
    j = recordSession(j, { seconds: 60, warmups: 1, date: d('2026-06-17') })
    expect(currentStreak(j, d('2026-06-17'))).toBe(3)
  })
  it('survives an empty today if yesterday was practised', () => {
    let j = emptyJournal()
    j = recordSession(j, { seconds: 60, warmups: 1, date: d('2026-06-16') })
    expect(currentStreak(j, d('2026-06-17'))).toBe(1)
  })
  it('breaks on a gap', () => {
    let j = emptyJournal()
    j = recordSession(j, { seconds: 60, warmups: 1, date: d('2026-06-14') })
    j = recordSession(j, { seconds: 60, warmups: 1, date: d('2026-06-17') })
    expect(currentStreak(j, d('2026-06-17'))).toBe(1)
  })
})

describe('totals', () => {
  it('sums across days', () => {
    let j = emptyJournal()
    j = recordSession(j, { seconds: 100, warmups: 1, date: d('2026-06-16') })
    j = recordSession(j, { seconds: 200, warmups: 3, date: d('2026-06-17') })
    expect(totals(j)).toEqual({ seconds: 300, warmups: 4, days: 2 })
  })
})
