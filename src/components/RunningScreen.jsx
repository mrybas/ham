// The running screen — a "don't-look-at-it" surface (brief §5). Stripped to the
// essentials: the current note huge and central, a direction arrow, a giant
// Reverse (the hero, biggest + thumb-reachable), Play/Stop, and fat tempo
// controls usable mid-session.
import { midiToName } from '../model/midi.js'

export default function RunningScreen({
  warmup, root, direction, stepIndex, isPlaying, reversePending,
  tempo, onTempo, onToggle, onReverse, onBack,
}) {
  const syl = warmup.syllables && warmup.syllables.length
    ? warmup.syllables[stepIndex >= 0 ? stepIndex % warmup.syllables.length : 0]
    : null

  return (
    <div className="running">
      <button className="rs-back" onClick={onBack} aria-label="Back to setup">‹ setup</button>

      <div className="rs-note">
        <div className="rs-dir" aria-label={direction > 0 ? 'going up' : 'going down'}>
          {direction > 0 ? '↑' : '↓'}
        </div>
        <div className="rs-notename">{midiToName(root)}</div>
        {syl && <div className="rs-syl">{syl}</div>}
        <div className="rs-warmup">{warmup.name}</div>
      </div>

      <button
        className={`rs-reverse ${isPlaying ? '' : 'is-idle'} ${reversePending ? 'is-armed' : ''}`}
        onClick={onReverse}
        disabled={!isPlaying}
      >
        {reversePending
          ? <>↻ Turning {direction > 0 ? 'up' : 'down'} at next change…</>
          : <>⇅ Reverse — now going {direction > 0 ? 'up' : 'down'}</>}
      </button>

      <div className="rs-bottom">
        <div className="rs-tempo">
          <button className="rs-tempo-btn" onClick={() => onTempo(tempo - 2)} aria-label="Slower">−</button>
          <span className="rs-tempo-val">{tempo}<small>bpm</small></span>
          <button className="rs-tempo-btn" onClick={() => onTempo(tempo + 2)} aria-label="Faster">＋</button>
        </div>
        <button className={`rs-play ${isPlaying ? 'is-playing' : ''}`} onClick={onToggle}>
          {isPlaying ? '■ Stop' : '▶ Play'}
        </button>
      </div>
    </div>
  )
}
