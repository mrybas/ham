// Built-in warm-up patterns. Offsets are semitones from the current root.
// `beats` are in beats; the engine maps beats → seconds via tempo.
// These are generic public-domain vocalises (scales/arpeggios) — not a
// branded method's curriculum. See brief §7.

// Helper: build steps from parallel arrays of semitone offsets + beats.
function steps(semitones, beats) {
  return semitones.map((s, i) => ({ semitone: s, beats: beats[i] ?? 1 }))
}

const MAJOR = [0, 2, 4, 5, 7, 9, 11, 12]
const NAT_MINOR = [0, 2, 3, 5, 7, 8, 10, 12]

export const WARMUPS = [
  {
    id: 'three-tone-major',
    name: '3-tone (1-2-3-2-1)',
    category: 'scales',
    level: 'beginner',
    steps: steps([0, 2, 4, 2, 0], [1, 1, 2, 1, 1]),
    syllables: ['mi', 'me', 'ma', 'me', 'mi'],
  },
  {
    id: 'five-tone-major',
    name: '5-tone scale (major)',
    category: 'scales',
    level: 'beginner',
    steps: steps([0, 2, 4, 5, 7, 5, 4, 2, 0], [1, 1, 1, 1, 2, 1, 1, 1, 2]),
    syllables: ['mi', 'me', 'ma', 'mo', 'mu', 'mo', 'ma', 'me', 'mi'],
  },
  {
    id: 'five-tone-minor',
    name: '5-tone scale (natural minor)',
    category: 'scales',
    level: 'beginner',
    steps: steps([0, 2, 3, 5, 7, 5, 3, 2, 0], [1, 1, 1, 1, 2, 1, 1, 1, 2]),
    syllables: ['mi', 'me', 'ma', 'mo', 'mu', 'mo', 'ma', 'me', 'mi'],
  },
  {
    id: 'descending-five-tone',
    name: 'Descending 5-tone (5-4-3-2-1)',
    category: 'scales',
    level: 'beginner',
    steps: steps([7, 5, 4, 2, 0], [1, 1, 1, 1, 2]),
    syllables: ['noo', 'noo', 'noo', 'noo', 'noo'],
  },
  {
    id: 'major-triad',
    name: 'Major triad arpeggio (1-3-5-3-1)',
    category: 'arpeggios',
    level: 'beginner',
    steps: steps([0, 4, 7, 4, 0], [1, 1, 2, 1, 1]),
    syllables: ['mi', 'ya', 'mi', 'ya', 'mi'],
  },
  {
    id: 'octave-arpeggio',
    name: 'Octave arpeggio (1-3-5-8-5-3-1)',
    category: 'arpeggios',
    level: 'intermediate',
    steps: steps([0, 4, 7, 12, 7, 4, 0], [1, 1, 1, 2, 1, 1, 2]),
    syllables: ['mi', 'ya', 'mi', 'ya', 'mi', 'ya', 'mi'],
  },
  {
    id: 'agility-octave-run',
    name: 'Agility run (octave up & down)',
    category: 'agility',
    level: 'advanced',
    steps: steps(
      [...MAJOR, ...[...MAJOR].reverse().slice(1)],
      [...MAJOR, ...MAJOR.slice(1)].map(() => 0.5),
    ),
    syllables: ['ah'],
  },
  {
    id: 'agility-minor-run',
    name: 'Agility run (natural minor)',
    category: 'agility',
    level: 'advanced',
    steps: steps(
      [...NAT_MINOR, ...[...NAT_MINOR].reverse().slice(1)],
      [...NAT_MINOR, ...NAT_MINOR.slice(1)].map(() => 0.5),
    ),
    syllables: ['ah'],
  },
  {
    id: 'humming-five-tone',
    name: 'Humming 5-tone',
    category: 'humming',
    level: 'beginner',
    tone: 'hum', // hint for the synth (softer, closed timbre)
    steps: steps([0, 2, 4, 5, 7, 5, 4, 2, 0], [1, 1, 1, 1, 2, 1, 1, 1, 2]),
    syllables: ['hm'],
  },
  {
    id: 'lip-trill-siren',
    name: 'Lip-trill siren (octave)',
    category: 'sirens',
    level: 'beginner',
    tone: 'hum',
    steps: steps([0, 12, 0], [2, 2, 2]),
    syllables: ['brr'],
  },
]

export function getWarmup(id) {
  return WARMUPS.find((w) => w.id === id) || WARMUPS[0]
}

// Lowest/highest semitone offset a pattern reaches (relative to root).
export function patternExtent(warmup) {
  const offs = warmup.steps.map((s) => s.semitone)
  return { min: Math.min(...offs), max: Math.max(...offs) }
}
