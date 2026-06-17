import { describe, it, expect } from 'vitest'
import { patternFits, nextRoot, clampStartRoot, bounceRangeFor } from './transpose.js'

// A 5-tone pattern reaches 0..7 semitones above root.
const extent = { min: 0, max: 7 }
const full = { lowMidi: 48, highMidi: 84 } // C3..C6
const working = { lowMidi: 57, highMidi: 81 } // A3..A5

describe('patternFits', () => {
  it('accepts a pattern inside the range', () => {
    expect(patternFits(60, extent, full)).toBe(true) // 60..67 in 48..84
  })
  it('rejects when the top spills over', () => {
    expect(patternFits(80, extent, full)).toBe(false) // 80..87 > 84
  })
  it('rejects when the bottom spills under', () => {
    expect(patternFits(47, extent, full)).toBe(false) // 47 < 48
  })
})

describe('nextRoot — normal stepping', () => {
  it('moves up by the step while inside range', () => {
    const r = nextRoot({ root: 60, direction: 1, step: 1, extent, bounceRange: working, fullRange: full })
    expect(r).toEqual({ root: 61, direction: 1, reversed: false })
  })
  it('honours a multi-semitone step', () => {
    const r = nextRoot({ root: 60, direction: 1, step: 2, extent, bounceRange: working, fullRange: full })
    expect(r.root).toBe(62)
  })
})

describe('nextRoot — auto-reverse at the bounce boundary', () => {
  it('reverses down when the next pattern would exceed the working top', () => {
    // root 74 → next 75 → 75..82 > 81, so flip down to 73.
    const r = nextRoot({ root: 74, direction: 1, step: 1, extent, bounceRange: working, fullRange: full })
    expect(r).toEqual({ root: 73, direction: -1, reversed: true })
  })
  it('reverses up when the next pattern would drop below the working low', () => {
    const r = nextRoot({ root: 57, direction: -1, step: 1, extent, bounceRange: working, fullRange: full })
    expect(r).toEqual({ root: 58, direction: 1, reversed: true })
  })
})

describe('nextRoot — manual reverse wins (suppressAuto)', () => {
  it('does NOT auto-reverse a manual press toward the working boundary', () => {
    // Singer manually went up near the top; suppressAuto means we keep going up
    // even though we are about to cross the working boundary (full range allows).
    const r = nextRoot({ root: 74, direction: 1, step: 1, extent, bounceRange: working, fullRange: full, suppressAuto: true })
    expect(r).toEqual({ root: 75, direction: 1, reversed: false })
  })
  it('still obeys the hard full-range ceiling even with suppressAuto', () => {
    // root 77 → up would be 78..85 > 84 full ceiling, so flip despite manual.
    const r = nextRoot({ root: 77, direction: 1, step: 1, extent, bounceRange: working, fullRange: full, suppressAuto: true })
    expect(r).toEqual({ root: 76, direction: -1, reversed: true })
  })
})

describe('nextRoot — narrow range holds', () => {
  it('holds the root when the pattern cannot move either way', () => {
    const tight = { lowMidi: 60, highMidi: 67 } // exactly the pattern
    const r = nextRoot({ root: 60, direction: 1, step: 1, extent, bounceRange: tight, fullRange: tight })
    expect(r.root).toBe(60)
  })
})

describe('bounceRangeFor', () => {
  it('uses the working range when auto-bounce is on', () => {
    expect(bounceRangeFor({ workingRange: working, fullRange: full, autoReverseAtWorkingRange: true })).toBe(working)
  })
  it('uses the full range when auto-bounce is off', () => {
    expect(bounceRangeFor({ workingRange: working, fullRange: full, autoReverseAtWorkingRange: false })).toBe(full)
  })
})

describe('clampStartRoot', () => {
  it('pulls a too-high start down so the pattern fits', () => {
    expect(clampStartRoot(82, extent, full)).toBe(77) // 77..84 fits
  })
  it('pushes a too-low start up', () => {
    expect(clampStartRoot(40, extent, full)).toBe(48)
  })
  it('leaves a valid start untouched', () => {
    expect(clampStartRoot(62, extent, full)).toBe(62)
  })
})
