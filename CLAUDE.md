# ham. — guide for AI coding agents

Vocal warm-up PWA: React + Vite, all sound synthesized via Web Audio. No
backend — state lives in `localStorage`, hosted statically on GitHub Pages at
the custom domain https://ham.beardlabs.cc (see `public/CNAME`), so Vite `base`
is `/`. Sibling subdomain to shed.beardlabs.cc — separate repo/Pages site.

Core promise (brief §5): a **don't-look-at-it** app. Warm-ups transpose
themselves up/down; the singer taps one big **Reverse** button. Build the
*feel* (timing + singable tone + one-button flow) before polish.

## Commands

```sh
npm run dev      # dev server (Vite, http://localhost:5173/)
npm test         # unit tests (Vitest, jsdom)
npm run build    # production build + PWA service worker
npm run e2e      # Playwright e2e (starts its own dev server)
node scripts/gen-icons.mjs   # regenerate placeholder PWA icons
```

## Map

- `src/audio/` — `AudioEngine.js` (singleton ctx + iOS unlock),
  `VocalScheduler.js` (lookahead scheduler — the heart of timing),
  `voice.js` (sustained additive reference tone + drone).
- `src/model/` — pure, unit-tested logic: `transpose.js` (auto-transpose +
  range + the "manual reverse wins" rule), `midi.js`, `settings.js`,
  `journal.js`. Tests live next to each module (`*.test.js`).
- `src/data/` — `warmups.js` (built-in patterns), `changelog.js`.
- `src/components/` — UI; `src/App.jsx` wires it together.
- `src/hooks/useScheduler.js` — the only bridge between UI and the audio clock.
- `e2e/app.spec.js` — Playwright spec for the core flow.
- `.github/workflows/` — `ci.yml` (test+build on push/PR), `deploy.yml`
  (build+deploy to Pages on a `vX.Y.Z` tag).

## Process rules (from brief §8)

1. One feature per commit: implement → unit test → e2e → `npm run build` →
   verify → commit.
2. Every user-visible change: bump `APP_VERSION` in `src/App.jsx` **and** add a
   `src/data/changelog.js` entry.
3. Releases are tag-driven (`vX.Y.Z` must equal `APP_VERSION`), cut by the
   owner only. **Never push (commits or tags) without explicit permission.**
4. Sound changes need a human listening pass before merge — synthesis can't be
   judged by tests.
5. Mobile-first: test at 375px and in landscape; verify offline.

## Conventions

- Plain JS + JSX, no TypeScript.
- Audio scheduling must not allocate heavily in the tick loop; UI must reach the
  audio clock only through `useScheduler`.
- Design for output latency: schedule on absolute AudioContext time; compensate
  the visual playhead via `outputLatency()`. Recommend wired headphones.
- e2e selectors are CSS classes (`.rs-reverse`, `.su-start`, …) — keep stable.
