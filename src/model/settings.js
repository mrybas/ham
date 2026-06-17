// User settings + persistence (localStorage). Pure helpers + a thin storage
// wrapper. See brief §4.
import { nameToMidi } from './midi.js'

const KEY = 'ham.settings.v1'

export const DEFAULT_SETTINGS = {
  warmupId: 'five-tone-major',
  defaultStartMidi: nameToMidi('D4'), // 62
  fullRange: { lowMidi: nameToMidi('C3'), highMidi: nameToMidi('C6') }, // 48..84
  workingRange: { lowMidi: nameToMidi('A3'), highMidi: nameToMidi('A5') }, // 57..81
  tempoBpm: 84,
  transposeStep: 1, // semitones per move (1 = chromatic)
  autoReverseAtWorkingRange: true,
}

// Merge stored values over defaults so new fields appear for old users.
export function loadSettings(storage = globalThis.localStorage) {
  if (!storage) return { ...DEFAULT_SETTINGS }
  try {
    const raw = storage.getItem(KEY)
    if (!raw) return { ...DEFAULT_SETTINGS }
    const parsed = JSON.parse(raw)
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      fullRange: { ...DEFAULT_SETTINGS.fullRange, ...(parsed.fullRange || {}) },
      workingRange: { ...DEFAULT_SETTINGS.workingRange, ...(parsed.workingRange || {}) },
    }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveSettings(settings, storage = globalThis.localStorage) {
  if (!storage) return
  try {
    storage.setItem(KEY, JSON.stringify(settings))
  } catch {
    /* quota / private mode — ignore */
  }
}

// Clamp tempo to a sane singable range.
export function clampTempo(bpm) {
  return Math.max(40, Math.min(200, Math.round(bpm)))
}
