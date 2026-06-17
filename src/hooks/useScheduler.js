// React binding for VocalScheduler. Owns one scheduler instance, drives a
// requestAnimationFrame loop that reads the latency-compensated visual state,
// and exposes imperative controls. UI never touches the audio clock directly.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { VocalScheduler } from '../audio/VocalScheduler.js'
import { resumeAudio } from '../audio/AudioEngine.js'

export function useScheduler() {
  const sched = useMemo(() => new VocalScheduler(), [])
  const [isPlaying, setPlaying] = useState(false)
  const [root, setRoot] = useState(sched.root)
  const [direction, setDirection] = useState(1)
  const [stepIndex, setStepIndex] = useState(-1)
  const [reversePending, setReversePending] = useState(false)
  const rafRef = useRef(0)
  const startedAt = useRef(0)
  const elapsedRef = useRef(0)

  // rAF loop: only runs while playing; reads what the singer can hear now.
  useEffect(() => {
    if (!isPlaying) return
    const loop = () => {
      // The note + syllable lag by output latency (what the singer hears now),
      // so they come from the scheduled-event queue. Direction is "where we're
      // heading", a live intent — read it straight off the scheduler so a tap
      // on Reverse flips the arrow instantly and never reverts to a stale value.
      const v = sched.visualState()
      if (v) {
        setRoot(v.root)
        setStepIndex(v.stepIndex)
      }
      setDirection(sched.direction)
      setReversePending(sched._manualPending)
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [isPlaying, sched])

  const configure = useCallback((opts) => sched.configure(opts), [sched])

  const play = useCallback(async () => {
    await resumeAudio()
    sched.start()
    startedAt.current = Date.now()
    setPlaying(true)
    setRoot(sched.root)
    setDirection(sched.direction)
  }, [sched])

  const stop = useCallback(() => {
    sched.stop()
    if (startedAt.current) elapsedRef.current += (Date.now() - startedAt.current) / 1000
    startedAt.current = 0
    setPlaying(false)
    setStepIndex(-1)
  }, [sched])

  const toggle = useCallback(() => (sched.isPlaying ? stop() : play()), [sched, play, stop])

  const reverse = useCallback(() => {
    sched.reverse()
    setDirection(sched.direction) // instant visual feedback
    setReversePending(sched._manualPending)
  }, [sched])

  const setTempo = useCallback((bpm) => sched.setTempo(bpm), [sched])

  const setDrone = useCallback((on) => {
    sched.droneEnabled = on
    if (sched.isPlaying) { sched._stopDrone(); if (on) sched._startDrone() }
  }, [sched])

  // Seconds practised this mount (for the journal), including the live session.
  const elapsedSeconds = useCallback(() => {
    const live = startedAt.current ? (Date.now() - startedAt.current) / 1000 : 0
    return elapsedRef.current + live
  }, [])

  const resetElapsed = useCallback(() => { elapsedRef.current = 0 }, [])

  return {
    isPlaying, root, direction, stepIndex, reversePending,
    configure, play, stop, toggle, reverse, setTempo, setDrone,
    elapsedSeconds, resetElapsed,
  }
}
