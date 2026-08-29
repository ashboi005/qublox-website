/**
 * Sampling an SVG path with getPointAtLength() is cheap once and ruinous every
 * frame. We build a lookup table at mount and interpolate inside it, which
 * keeps the camera rig at a constant per-frame cost no matter how complex the
 * path is.
 */

export type PathSample = { x: number; y: number; angle: number }

export function samplePath(path: SVGPathElement, steps = 300): PathSample[] {
  const total = path.getTotalLength()
  const samples: PathSample[] = []

  for (let i = 0; i <= steps; i++) {
    const distance = (i / steps) * total
    const point = path.getPointAtLength(distance)
    // Look slightly ahead to derive heading, so the camera banks into turns.
    const ahead = path.getPointAtLength(Math.min(distance + total / steps, total))
    const angle = (Math.atan2(ahead.y - point.y, ahead.x - point.x) * 180) / Math.PI
    samples.push({ x: point.x, y: point.y, angle })
  }

  return samples
}

/** Linear interpolation inside the table. `t` is 0–1 along the path. */
export function sampleAt(samples: PathSample[], t: number): PathSample {
  if (samples.length === 0) return { x: 0, y: 0, angle: 0 }

  const clamped = Math.min(Math.max(t, 0), 1)
  const position = clamped * (samples.length - 1)
  const index = Math.floor(position)
  const next = Math.min(index + 1, samples.length - 1)
  const mix = position - index

  const a = samples[index]!
  const b = samples[next]!

  // Angles are unwrapped so a wrap from 179° to -179° does not spin the rig.
  let delta = b.angle - a.angle
  if (delta > 180) delta -= 360
  if (delta < -180) delta += 360

  return {
    x: a.x + (b.x - a.x) * mix,
    y: a.y + (b.y - a.y) * mix,
    angle: a.angle + delta * mix,
  }
}
