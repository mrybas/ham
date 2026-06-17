// Auto-transposition + range logic — the core of the engine, kept pure so it
// can be unit-tested without any audio. See brief §3 and the "manual reverse
// always wins" rule.

// Does a pattern rooted at `root` (reaching extent.min..extent.max semitones
// around it) fit entirely inside `range` (inclusive MIDI bounds)?
export function patternFits(root, extent, range) {
  return root + extent.min >= range.lowMidi && root + extent.max <= range.highMidi
}

// The boundary the engine bounces off of: the working range when auto-bounce is
// on, otherwise the full (absolute) range.
export function bounceRangeFor(settings) {
  return settings.autoReverseAtWorkingRange ? settings.workingRange : settings.fullRange
}

// Compute the next root after a pattern completes.
//
//   root        current root (MIDI)
//   direction   +1 (up) or -1 (down)
//   step        semitones per move
//   extent      { min, max } pattern offsets relative to root
//   bounceRange the soft boundary to auto-reverse at
//   fullRange   the hard ceiling/floor that is NEVER crossed
//   suppressAuto when true (set right after a manual Reverse), skip the
//               soft auto-reverse so the singer's chosen direction takes
//               effect — only the hard full-range clamp can still override.
//
// Returns { root, direction, reversed } — reversed is true when direction flipped.
export function nextRoot({ root, direction, step, extent, bounceRange, fullRange, suppressAuto = false }) {
  let dir = direction
  let candidate = root + dir * step

  // Soft auto-reverse at the bounce boundary (unless a manual press owns it).
  if (!suppressAuto && !patternFits(candidate, extent, bounceRange)) {
    dir = -dir
    candidate = root + dir * step
  }

  // Hard full-range clamp — the only override that beats a manual reverse.
  if (!patternFits(candidate, extent, fullRange)) {
    dir = -dir
    candidate = root + dir * step
    // Range narrower than the pattern in both directions: nowhere to go, hold.
    if (!patternFits(candidate, extent, fullRange)) candidate = root
  }

  return { root: candidate, direction: dir, reversed: dir !== direction }
}

// Clamp a desired start root so the pattern at least fits the full range,
// nudging it inward when it would spill over an edge.
export function clampStartRoot(root, extent, fullRange) {
  let r = root
  if (r + extent.max > fullRange.highMidi) r = fullRange.highMidi - extent.max
  if (r + extent.min < fullRange.lowMidi) r = fullRange.lowMidi - extent.min
  return r
}
