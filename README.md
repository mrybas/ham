# ham.

**Warm up your voice — no pianist, no keyboard, no account, fully offline.**

ham. plays vocal warm-ups (scales, arpeggios, sirens) and transposes them
chromatically up and down on its own. When it gets too high or too low, you tap
one big **Reverse** button. That's the whole interaction — designed to be used
while standing and singing, phone on a stand, *without staring at the screen*.

- 🎵 Built-in warm-up library (scales, arpeggios, agility runs, humming, sirens)
- 🔁 Auto-transposition with hands-free auto-reverse at your range boundary
- 🎚️ Tempo adjustable mid-session; optional tonic drone
- 🎧 Sustained, singable reference tone — all synthesized, no samples
- 📴 Installable PWA, works with zero signal
- 🔒 Everything on-device: settings + practice journal in `localStorage`. No
  accounts, no ads, no tracking.

## Develop

```sh
npm install
npm run dev      # http://localhost:5173/ham/
npm test         # unit tests
npm run e2e      # end-to-end
npm run build    # production build
```

Hosted as a GitHub Pages project page: `https://mrybas.github.io/ham/`.
A push of a `vX.Y.Z` tag triggers the deploy workflow.

## Status

v0.1 — first playable build. See [`vocal-warmup-handoff.md`](../vocal-warmup-handoff.md)
for the full brief and roadmap. Pitch detection, gamification, and any backend
are explicitly out of scope for now.

## License

TBD — to be confirmed with the owner (the brief suggests AGPL-3.0; for an
on-device PWA, MIT/GPL may fit the "free forever + donate" goal better).
