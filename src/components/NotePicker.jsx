// A compact stepper for picking a MIDI note by name (e.g. start note / range
// edge). Big tap targets; no precision aiming.
import { midiToName } from '../model/midi.js'

export default function NotePicker({ label, value, min = 36, max = 96, onChange }) {
  const dec = () => onChange(Math.max(min, value - 1))
  const inc = () => onChange(Math.min(max, value + 1))
  return (
    <div className="notepicker">
      <span className="np-label">{label}</span>
      <div className="np-controls">
        <button className="np-btn" onClick={dec} aria-label={`${label} down`}>−</button>
        <span className="np-val">{midiToName(value)}</span>
        <button className="np-btn" onClick={inc} aria-label={`${label} up`}>＋</button>
      </div>
    </div>
  )
}
