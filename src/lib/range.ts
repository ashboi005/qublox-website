/**
 * Motion promotes scroll-linked style transforms to native WAAPI animations
 * driven by a ScrollTimeline. WAAPI rejects keyframe offsets outside [0,1] and
 * offsets that do not strictly increase, so every input range fed by a scroll
 * progress value has to be conditioned first.
 *
 * Clamps into [0,1] and nudges any collision forward by the smallest amount
 * that keeps the sequence strictly increasing, preserving the shape of the
 * ramp instead of dropping stops.
 */
export function ramp(stops: number[]): number[] {
  const EPSILON = 1e-4
  const out: number[] = []

  for (let i = 0; i < stops.length; i++) {
    let value = Math.min(1, Math.max(0, stops[i]!))
    const previous = out[i - 1]
    if (previous !== undefined && value <= previous) {
      value = Math.min(1, previous + EPSILON)
    }
    out.push(value)
  }

  // If clamping at the top collapsed the tail, walk backwards to re-separate.
  for (let i = out.length - 1; i > 0; i--) {
    if (out[i]! <= out[i - 1]!) {
      out[i - 1] = Math.max(0, out[i]! - EPSILON)
    }
  }

  return out
}

