// One source feeding both the in-app "What's new" and release notes.
// Bump APP_VERSION (in App.jsx) together with adding an entry here.
export const CHANGELOG = [
  {
    version: '0.1.1',
    date: '2026-06-17',
    notes: [
      'Reverse button now flips the direction arrow instantly and reliably (it no longer briefly snapped back to the old direction).',
      'Reverse shows an "↻ turning at next change…" armed state so you can see the tap registered — the pitch turns around at the next key change, not mid-phrase.',
      'Reverse label now spells out the current direction (going up / going down).',
    ],
  },
  {
    version: '0.1.0',
    date: '2026-06-17',
    notes: [
      'First playable build: pick a warm-up, set a start note, hit play.',
      'Auto-transposition up/down the chromatic scale with a big Reverse button.',
      'Auto-reverse at your working/full range boundary (hands-free bounce).',
      'Sustained, singable reference tone (organ-ish + hum timbres).',
      'Tempo adjustable during playback; optional tonic drone.',
      'Settings + practice journal saved on-device. Installable offline PWA.',
    ],
  },
]
