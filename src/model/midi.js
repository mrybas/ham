// MIDI note helpers. 12-TET, A4 = 440 Hz (MIDI 69).
// Pure functions — unit-tested in midi.test.js.

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

// MIDI note number → frequency in Hz.
export function midiToFreq(midi) {
  return 440 * 2 ** ((midi - 69) / 12)
}

// MIDI note number → { name, octave } e.g. 60 → { name: 'C', octave: 4 }.
export function midiToParts(midi) {
  const m = Math.round(midi)
  return { name: NOTE_NAMES[((m % 12) + 12) % 12], octave: Math.floor(m / 12) - 1 }
}

// MIDI note number → display label e.g. 60 → 'C4', 61 → 'C#4'.
export function midiToName(midi) {
  const { name, octave } = midiToParts(midi)
  return `${name}${octave}`
}

// 'C4' / 'F#3' / 'Db5' → MIDI note number (null if unparseable).
export function nameToMidi(label) {
  const m = /^([A-Ga-g])([#b]?)(-?\d+)$/.exec(String(label).trim())
  if (!m) return null
  const letter = m[1].toUpperCase()
  const accidental = m[2]
  const octave = parseInt(m[3], 10)
  const base = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[letter]
  const acc = accidental === '#' ? 1 : accidental === 'b' ? -1 : 0
  return base + acc + (octave + 1) * 12
}

export { NOTE_NAMES }
