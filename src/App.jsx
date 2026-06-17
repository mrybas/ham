import { useEffect, useRef, useState } from 'react'
import SetupScreen from './components/SetupScreen.jsx'
import RunningScreen from './components/RunningScreen.jsx'
import { useScheduler } from './hooks/useScheduler.js'
import { loadSettings, saveSettings, clampTempo } from './model/settings.js'
import { loadJournal, saveJournal, recordSession } from './model/journal.js'
import { getWarmup } from './data/warmups.js'

export const APP_VERSION = '0.1.0'

export default function App() {
  const [settings, setSettings] = useState(() => loadSettings())
  const [journal, setJournal] = useState(() => loadJournal())
  const [screen, setScreen] = useState('setup') // 'setup' | 'running'
  const s = useScheduler()
  const warmup = getWarmup(settings.warmupId)

  // Persist settings on change.
  useEffect(() => { saveSettings(settings) }, [settings])

  // Keep the scheduler's tempo live when the slider moves mid-session.
  useEffect(() => { s.setTempo(settings.tempoBpm) }, [settings.tempoBpm, s])

  const goRunning = async () => {
    s.configure({ warmup, settings, startMidi: settings.defaultStartMidi })
    s.resetElapsed()
    setScreen('running')
    await s.play()
  }

  // Save a session to the journal: minutes sung + one completed warm-up.
  const saveSession = useRef(() => {})
  saveSession.current = () => {
    const seconds = s.elapsedSeconds()
    if (seconds < 5) return
    const next = recordSession(journal, { seconds, warmups: 1 })
    setJournal(next)
    saveJournal(next)
  }

  const backToSetup = () => {
    s.stop()
    saveSession.current()
    setScreen('setup')
  }

  const setTempo = (bpm) => {
    const v = clampTempo(bpm)
    setSettings((prev) => ({ ...prev, tempoBpm: v }))
  }

  if (screen === 'running') {
    return (
      <RunningScreen
        warmup={warmup}
        root={s.root}
        direction={s.direction}
        stepIndex={s.stepIndex}
        isPlaying={s.isPlaying}
        tempo={settings.tempoBpm}
        onTempo={setTempo}
        onToggle={s.toggle}
        onReverse={s.reverse}
        onBack={backToSetup}
      />
    )
  }

  return (
    <SetupScreen
      settings={settings}
      onChange={setSettings}
      journal={journal}
      onStart={goRunning}
    />
  )
}
