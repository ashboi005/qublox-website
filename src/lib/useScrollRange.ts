'use client'

import { useTransform, type MotionValue } from 'motion/react'
import { ramp } from './range'

/**
 * The only way a scroll progress value should be mapped to a style on this
 * site.
 *
 * Motion compiles scroll-linked style transforms into native ScrollTimeline
 * animations. When the input range covers only part of the timeline — say
 * [0.26, 0.31] — the generated keyframes do not hold outside it: the value
 * ramps back down across the remainder, so a fade-in silently becomes a fade
 * in and out. It reads as a timing bug and there is no timing to fix, because
 * the animation never held in the first place.
 *
 * Padding the range with explicit hold stops at 0 and 1 makes the compiled
 * keyframes cover the whole timeline, restoring the behaviour `useTransform`
 * has when it runs in JavaScript. Ranges also go through `ramp`, which clamps
 * them into [0,1] and keeps them strictly increasing — WAAPI rejects keyframe
 * offsets that are neither.
 */
export function useScrollRange(
  progress: MotionValue<number>,
  stops: number[],
  values: number[],
): MotionValue<number>
export function useScrollRange(
  progress: MotionValue<number>,
  stops: number[],
  values: string[],
): MotionValue<string>
export function useScrollRange(
  progress: MotionValue<number>,
  stops: number[],
  values: (number | string)[],
): MotionValue<number> | MotionValue<string> {
  const clamped = ramp(stops)
  const paddedStops = [...clamped]
  const paddedValues = [...values]

  if (paddedStops[0]! > 0) {
    paddedStops.unshift(0)
    paddedValues.unshift(values[0]!)
  }
  if (paddedStops[paddedStops.length - 1]! < 1) {
    paddedStops.push(1)
    paddedValues.push(values[values.length - 1]!)
  }

  return useTransform(progress, paddedStops, paddedValues as number[])
}
