// Lookahead scheduler for vocal warm-ups (Chris Wilson "A Tale of Two Clocks",
// same pattern as shed.'s Scheduler). A worker timer wakes every `lookaheadMs`
// and schedules any notes due within `scheduleAheadSec` on absolute
// AudioContext time, so timing is solid regardless of UI jank.
//
// "What to play": the current warm-up pattern at `root + offset` for each step;
// after the pattern + a breath gap, shift `root` by the transpose step in the
// current direction, auto-reversing at the range boundary. Manual Reverse flips
// direction immediately and wins over the next auto-reverse (see transpose.js).
import { getAudioContext, getMaster, outputLatency } from './AudioEngine.js'
import { voice, drone } from './voice.js'
import { midiToFreq } from '../model/midi.js'
import { patternExtent } from '../data/warmups.js'
import { nextRoot, bounceRangeFor, clampStartRoot } from '../model/transpose.js'

// Shared worker ticker — main-thread timers are throttled to ~1s in background
// tabs, which would starve the loop; worker timers keep firing.
let tickerUrl = null
function getTickerUrl() {
  if (!tickerUrl) {
    const src = 'let id=null;onmessage=(e)=>{clearInterval(id);id=null;if(e.data&&e.data.ms)id=setInterval(()=>postMessage(0),e.data.ms)}'
    tickerUrl = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }))
  }
  return tickerUrl
}

export class VocalScheduler {
  constructor() {
    this.bpm = 84
    this.warmup = null
    this.settings = null
    this.root = 62
    this.direction = 1 // +1 up, -1 down
    this.gapBeats = 1 // a breath between transpositions
    this.droneEnabled = false

    this.isPlaying = false
    this.nextNoteTime = 0
    this.lookaheadMs = 25
    this.scheduleAheadSec = 0.1
    this._i = 0 // index within the current pattern
    this._manualPending = false // a manual Reverse owns the next transposition
    this._events = [] // {time, root, direction, stepIndex, isFirst} for visuals
    this._drone = null

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        this.scheduleAheadSec = document.hidden ? 0.5 : 0.1
      })
    }
  }

  configure({ warmup, settings, startMidi }) {
    if (warmup) this.warmup = warmup
    if (settings) {
      this.settings = settings
      this.bpm = settings.tempoBpm
    }
    if (startMidi != null) this.root = startMidi
  }

  setTempo(bpm) {
    this.bpm = bpm
    if (this.settings) this.settings = { ...this.settings, tempoBpm: bpm }
  }

  _secondsPerBeat() {
    return 60.0 / this.bpm
  }

  start() {
    if (this.isPlaying || !this.warmup || !this.settings) return
    const ctx = getAudioContext()
    const extent = patternExtent(this.warmup)
    this.root = clampStartRoot(this.root, extent, this.settings.fullRange)
    this.direction = 1
    this._i = 0
    this._manualPending = false
    this._events = []
    this.isPlaying = true
    this.nextNoteTime = ctx.currentTime + 0.12
    if (this.droneEnabled) this._startDrone()
    this._startTicker()
  }

  stop() {
    this.isPlaying = false
    this._stopTicker()
    this._stopDrone()
    this._events = []
    this._i = 0
  }

  // Hero control: flip direction now, and claim the next transposition so the
  // auto-reverse can't undo the singer's choice.
  reverse() {
    if (!this.isPlaying) return
    this.direction = -this.direction
    this._manualPending = true
    this.onReverse?.(this.direction)
  }

  _startDrone() {
    const ctx = getAudioContext()
    this._drone = drone(ctx, midiToFreq(this.root), getMaster(), { timbre: this.warmup.tone || 'tone' })
    this._droneRoot = this.root
  }

  _stopDrone() {
    if (this._drone) { this._drone.stop(); this._drone = null }
  }

  _startTicker() {
    if (typeof Worker !== 'undefined' && typeof Blob !== 'undefined') {
      try {
        if (!this._worker) {
          this._worker = new Worker(getTickerUrl())
          this._worker.onmessage = this._tick
        }
        this._worker.postMessage({ ms: this.lookaheadMs })
        this._usingWorker = true
        this._tick()
        return
      } catch { /* fall back */ }
    }
    this._usingWorker = false
    this._tick()
  }

  _stopTicker() {
    if (this._worker) { try { this._worker.postMessage({ ms: 0 }) } catch { /* ignore */ } }
    if (this.timerId) { clearTimeout(this.timerId); this.timerId = null }
  }

  _tick = () => {
    if (!this.isPlaying) return
    const ctx = getAudioContext()
    while (this.nextNoteTime < ctx.currentTime + this.scheduleAheadSec) {
      this._scheduleStep(this._i, this.nextNoteTime)
      this._advance()
    }
    if (!this._usingWorker) this.timerId = setTimeout(this._tick, this.lookaheadMs)
  }

  _scheduleStep(i, time) {
    const ctx = getAudioContext()
    const master = getMaster()
    const step = this.warmup.steps[i]
    const dur = step.beats * this._secondsPerBeat()
    const freq = midiToFreq(this.root + step.semitone)
    voice(ctx, freq, time, Math.max(dur * 0.96, 0.08), master, {
      timbre: this.warmup.tone || 'tone',
      gain: 0.7,
    })
    this._events.push({ time, root: this.root, direction: this.direction, stepIndex: i, isFirst: i === 0 })
  }

  _advance() {
    const step = this.warmup.steps[this._i]
    this.nextNoteTime += step.beats * this._secondsPerBeat()
    this._i += 1
    if (this._i >= this.warmup.steps.length) {
      // Pattern done: breath gap, then transpose.
      this.nextNoteTime += this.gapBeats * this._secondsPerBeat()
      this._transpose()
      this._i = 0
    }
  }

  _transpose() {
    const extent = patternExtent(this.warmup)
    const res = nextRoot({
      root: this.root,
      direction: this.direction,
      step: this.settings.transposeStep,
      extent,
      bounceRange: bounceRangeFor(this.settings),
      fullRange: this.settings.fullRange,
      suppressAuto: this._manualPending,
    })
    this._manualPending = false
    this.root = res.root
    this.direction = res.direction
    if (this.droneEnabled && this._droneRoot !== this.root) {
      this._stopDrone()
      this._startDrone()
    }
  }

  // Latency-compensated view of "where the sound is right now" for the UI:
  // returns the most recent event the listener can actually hear.
  visualState() {
    const ctx = getAudioContext()
    const now = ctx.currentTime - outputLatency()
    let cur = null
    let drop = 0
    while (this._events.length && this._events[0].time <= now) {
      cur = this._events.shift()
      if (++drop > 64) break // safety: never spin
    }
    if (cur) this._last = cur
    return this._last || null
  }
}
