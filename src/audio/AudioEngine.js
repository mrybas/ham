// Singleton AudioContext + master gain.
// The context must be created/resumed from a user gesture (autoplay policy).
// The iOS unlock dance is adapted from shed. — it matters for backstage use on
// phones, which is exactly ham.'s setting.

let ctx = null
let master = null

export function getAudioContext() {
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    ctx = new AudioCtx()
    master = ctx.createGain()
    master.gain.value = 0.9
    master.connect(ctx.destination)
  }
  return ctx
}

export function getMaster() {
  getAudioContext()
  return master
}

// A short silent WAV — playing it through an <audio> element flips iOS Safari's
// audio session to "playback", so Web Audio is no longer muted by the ringer
// switch (the classic iOS unmute trick).
function silentWavUrl() {
  const sampleRate = 8000
  const numSamples = sampleRate
  const buf = new ArrayBuffer(44 + numSamples * 2)
  const view = new DataView(buf)
  const wstr = (off, s) => { for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)) }
  wstr(0, 'RIFF'); view.setUint32(4, 36 + numSamples * 2, true); wstr(8, 'WAVE')
  wstr(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true)
  view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true); view.setUint16(34, 16, true)
  wstr(36, 'data'); view.setUint32(40, numSamples * 2, true)
  return URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }))
}

let silentEl = null
function flipAudioSession() {
  if (silentEl) return
  try {
    silentEl = new Audio(silentWavUrl())
    silentEl.loop = true
    silentEl.volume = 0.0001
    silentEl.setAttribute('playsinline', '')
    const p = silentEl.play()
    if (p && p.catch) p.catch(() => {})
  } catch { /* ignore */ }
}

// Call from a click/tap/touch handler before scheduling anything.
let warmedUp = false
export async function resumeAudio() {
  const c = getAudioContext()
  const resuming = c.state !== 'running' ? c.resume() : null

  if (!warmedUp) {
    warmedUp = true
    flipAudioSession()
    try {
      const buf = c.createBuffer(1, 1, c.sampleRate)
      const src = c.createBufferSource()
      src.buffer = buf
      src.connect(c.destination)
      src.start(0)
    } catch { /* ignore */ }
    try {
      const osc = c.createOscillator()
      const g = c.createGain()
      g.gain.value = 0.00001
      osc.connect(g).connect(c.destination)
      osc.start()
      osc.stop(c.currentTime + 0.06)
    } catch { /* ignore */ }
  }

  if (resuming) { try { await resuming } catch { /* ignore */ } }
  return c
}

export function setMasterVolume(value) {
  getMaster().gain.value = value
}

// Output latency (seconds) for visual-playhead compensation. See brief §3.
export function outputLatency() {
  const c = getAudioContext()
  return (c.baseLatency || 0) + (c.outputLatency || 0)
}
