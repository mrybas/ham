// One source feeding both the in-app "What's new" and release notes.
// Bump APP_VERSION (in App.jsx) together with adding an entry here.
export const CHANGELOG = [
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
