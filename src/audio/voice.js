// The reference tone. For vocals the singer locks onto a SUSTAINED pitch far
// better than a piano-like ping (brief §3), so this is a warm additive sine
// stack (fundamental + a few decaying harmonics) under a gentle ADSR that holds
// through the note. Two timbres:
//   'tone' — open, organ-ish (default)
//   'hum'  — softer/closed, for humming & lip-trill patterns (lowpassed)
//
// schedules one note at absolute `time` (AudioContext seconds) for `duration`
// seconds into `destination`. All-synth, no samples — stays tiny and offline.

const HARMONICS = {
  // [harmonic number, relative gain]
  tone: [[1, 1.0], [2, 0.5], [3, 0.28], [4, 0.16], [5, 0.08]],
  hum: [[1, 1.0], [2, 0.32], [3, 0.12]],
}

export function voice(ctx, freq, time, duration, destination, { gain = 0.7, timbre = 'tone' } = {}) {
  const partials = HARMONICS[timbre] || HARMONICS.tone

  // Per-note gain (the ADSR envelope) shared by all partials.
  const env = ctx.createGain()

  // The 'hum' timbre is gently lowpassed to sound closed-mouth.
  let node = env
  if (timbre === 'hum') {
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = Math.min(freq * 4, 2200)
    lp.Q.value = 0.5
    env.connect(lp).connect(destination)
    node = env
  } else {
    env.connect(destination)
  }

  // ADSR — fast-ish attack so onset is clear, real sustain, soft release so
  // consecutive scale steps feel legato rather than chopped.
  const attack = 0.025
  const release = Math.min(0.12, duration * 0.4)
  const peak = gain
  const sustain = gain * 0.82
  const t0 = time
  const tRelease = time + Math.max(duration - release, 0.02)
  env.gain.setValueAtTime(0.0001, t0)
  env.gain.exponentialRampToValueAtTime(peak, t0 + attack)
  env.gain.exponentialRampToValueAtTime(sustain, t0 + Math.min(attack + 0.08, duration * 0.5))
  env.gain.setValueAtTime(sustain, tRelease)
  env.gain.exponentialRampToValueAtTime(0.0001, tRelease + release)

  const stopAt = tRelease + release + 0.02
  for (const [n, g] of partials) {
    const osc = ctx.createOscillator()
    const pg = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq * n
    pg.gain.value = g / partials.length // keep the stack from clipping
    osc.connect(pg).connect(node)
    osc.start(t0)
    osc.stop(stopAt)
  }
}

// A soft sustained drone at `freq` — held until `stop()` is called on the
// returned handle. Used as an optional ear-anchor (tonic drone, brief §3).
export function drone(ctx, freq, destination, { gain = 0.18, timbre = 'tone' } = {}) {
  const env = ctx.createGain()
  env.gain.setValueAtTime(0.0001, ctx.currentTime)
  env.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + 0.4)
  env.connect(destination)
  const partials = HARMONICS[timbre] || HARMONICS.tone
  const oscs = partials.map(([n, g]) => {
    const osc = ctx.createOscillator()
    const pg = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq * n
    pg.gain.value = g / partials.length
    osc.connect(pg).connect(env)
    osc.start()
    return osc
  })
  return {
    stop() {
      const t = ctx.currentTime
      env.gain.cancelScheduledValues(t)
      env.gain.setValueAtTime(env.gain.value, t)
      env.gain.exponentialRampToValueAtTime(0.0001, t + 0.3)
      oscs.forEach((o) => o.stop(t + 0.35))
    },
  }
}
