import { describe, it, expect } from 'vitest'
import { midiToFreq, midiToName, nameToMidi } from './midi.js'

describe('midiToFreq', () => {
  it('A4 = 440 Hz', () => {
    expect(midiToFreq(69)).toBeCloseTo(440, 5)
  })
  it('A5 = 880 Hz (octave up doubles)', () => {
    expect(midiToFreq(81)).toBeCloseTo(880, 5)
  })
  it('C4 ≈ 261.63 Hz', () => {
    expect(midiToFreq(60)).toBeCloseTo(261.626, 2)
  })
})

describe('midiToName', () => {
  it('names natural notes with octave', () => {
    expect(midiToName(60)).toBe('C4')
    expect(midiToName(69)).toBe('A4')
  })
  it('names sharps', () => {
    expect(midiToName(61)).toBe('C#4')
  })
})

describe('nameToMidi', () => {
  it('round-trips with midiToName', () => {
    for (let m = 36; m <= 96; m++) expect(nameToMidi(midiToName(m))).toBe(m)
  })
  it('parses flats', () => {
    expect(nameToMidi('Db4')).toBe(61)
  })
  it('returns null for garbage', () => {
    expect(nameToMidi('hello')).toBe(null)
  })
})
