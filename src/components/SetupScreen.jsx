// The calm setup screen (brief §5): pick a warm-up, start note, ranges, tempo,
// options. Distinct from the stripped-down running screen.
import { WARMUPS } from '../data/warmups.js'
import { currentStreak, totals } from '../model/journal.js'
import NotePicker from './NotePicker.jsx'

function fmtMins(seconds) {
  return Math.round(seconds / 60)
}

export default function SetupScreen({ settings, onChange, journal, onStart, onShowDrone }) {
  const set = (patch) => onChange({ ...settings, ...patch })
  const setRange = (key, patch) => set({ [key]: { ...settings[key], ...patch } })
  const t = totals(journal)

  return (
    <div className="setup">
      <header className="su-head">
        <h1 className="su-logo">ham<span>.</span></h1>
        <p className="su-tag">warm up your voice — no pianist, no account, offline.</p>
      </header>

      <section className="su-card">
        <h2>Warm-up</h2>
        <select
          className="su-select"
          value={settings.warmupId}
          onChange={(e) => set({ warmupId: e.target.value })}
        >
          {WARMUPS.map((w) => (
            <option key={w.id} value={w.id}>{w.name} · {w.level}</option>
          ))}
        </select>
      </section>

      <section className="su-card">
        <h2>Start note</h2>
        <NotePicker
          label="Begin on"
          value={settings.defaultStartMidi}
          onChange={(v) => set({ defaultStartMidi: v })}
        />
      </section>

      <section className="su-card">
        <h2>Range</h2>
        <p className="su-hint">Working range is where you bounce; full range is your hard limit.</p>
        <NotePicker label="Working low" value={settings.workingRange.lowMidi} onChange={(v) => setRange('workingRange', { lowMidi: v })} />
        <NotePicker label="Working high" value={settings.workingRange.highMidi} onChange={(v) => setRange('workingRange', { highMidi: v })} />
        <NotePicker label="Full low" value={settings.fullRange.lowMidi} onChange={(v) => setRange('fullRange', { lowMidi: v })} />
        <NotePicker label="Full high" value={settings.fullRange.highMidi} onChange={(v) => setRange('fullRange', { highMidi: v })} />
        <label className="su-check">
          <input
            type="checkbox"
            checked={settings.autoReverseAtWorkingRange}
            onChange={(e) => set({ autoReverseAtWorkingRange: e.target.checked })}
          />
          Auto-reverse at working range (hands-free bounce)
        </label>
      </section>

      <section className="su-card">
        <h2>Tempo & transpose</h2>
        <div className="su-row">
          <span>Tempo</span>
          <div className="np-controls">
            <button className="np-btn" onClick={() => set({ tempoBpm: Math.max(40, settings.tempoBpm - 2) })}>−</button>
            <span className="np-val">{settings.tempoBpm}<small>bpm</small></span>
            <button className="np-btn" onClick={() => set({ tempoBpm: Math.min(200, settings.tempoBpm + 2) })}>＋</button>
          </div>
        </div>
        <div className="su-row">
          <span>Move by</span>
          <div className="np-controls">
            <button className="np-btn" onClick={() => set({ transposeStep: Math.max(1, settings.transposeStep - 1) })}>−</button>
            <span className="np-val">{settings.transposeStep} st</span>
            <button className="np-btn" onClick={() => set({ transposeStep: Math.min(4, settings.transposeStep + 1) })}>＋</button>
          </div>
        </div>
      </section>

      <p className="su-latency">🎧 Use wired headphones or the speaker — Bluetooth adds delay that makes pitch-matching feel off.</p>

      <section className="su-journal">
        <div><strong>{currentStreak(journal)}</strong><span>day streak</span></div>
        <div><strong>{fmtMins(t.seconds)}</strong><span>minutes</span></div>
        <div><strong>{t.warmups}</strong><span>warm-ups</span></div>
      </section>

      <button className="su-start" onClick={onStart}>▶ Start warming up</button>
    </div>
  )
}
