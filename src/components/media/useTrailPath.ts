'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  cubicBezier,
  transform,
  useTransform,
  type EasingFunction,
  type MotionValue,
} from 'motion/react'
import { samplePath, type PathSample } from '@/lib/path'
import { ramp } from '@/lib/range'
import { buildTrail, TRACK_SCREENS } from './trail'

/**
 * Measures the stage, rebuilds the trail in pixels, and samples it once into a
 * lookup table. Sampling only ever happens on mount and on resize — never per
 * frame — so the camera costs the same to move no matter how long the path is.
 */
export function useTrailPath() {
  const stageRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const [samples, setSamples] = useState<PathSample[]>([])
  const [length, setLength] = useState(0)

  useLayoutEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    const measure = () => {
      const rect = stage.getBoundingClientRect()
      setSize((current) =>
        Math.abs(current.width - rect.width) < 1 && Math.abs(current.height - rect.height) < 1
          ? current
          : { width: rect.width, height: rect.height },
      )
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(stage)
    return () => observer.disconnect()
  }, [])

  // The track is wider than the stage; it slides horizontally beneath a camera
  // that stays roughly put, which is what produces the horizontal-scroll feel.
  const trackWidth = size.width * TRACK_SCREENS
  const d = useMemo(() => buildTrail(trackWidth, size.height), [trackWidth, size.height])

  useEffect(() => {
    const path = pathRef.current
    if (!path || !d) return
    setSamples(samplePath(path, 420))
    setLength(path.getTotalLength())
  }, [d])

  return { stageRef, pathRef, samples, length, d, size, trackWidth }
}

/**
 * The site's one curve family, as functions motion can interpolate with.
 * Arrivals decelerate long, exits accelerate short, holds-and-toggles ease
 * both ways. Nothing overshoots: a value that passes its mark and comes back
 * reads as jitter when it is scrubbed by hand.
 */
export const EASE_OUT = cubicBezier(0.16, 1, 0.3, 1)
export const EASE_IN = cubicBezier(0.7, 0, 0.84, 0)
export const EASE_IN_OUT = cubicBezier(0.65, 0, 0.35, 1)
export const LINEAR = (t: number) => t
/**
 * The same family, softened for long scrubbed ranges. The site curves are
 * tuned for timed transitions; stretched across a screen of scroll their
 * steep ends crowd the motion into a few pixels at one edge, which is a pop
 * by another name. These keep the shape (decelerate in, accelerate out) with
 * the travel spread across the range.
 */
export const SCRUB_OUT = cubicBezier(0.33, 1, 0.68, 1)
export const SCRUB_IN = cubicBezier(0.12, 0, 0.39, 0)

/**
 * `useScrollRange`, with a curve on every segment.
 *
 * A linear ramp over a scrubbed range starts and stops dead, which is what
 * makes a value pop at the edges of its window. Easing each segment lets it
 * leave and land softly. The mapping runs as a JS function rather than a
 * range transform, so motion never compiles it into a ScrollTimeline and the
 * holds either side of the window are real. Stops still go through `ramp`.
 */
export function useEasedRange(
  progress: MotionValue<number>,
  stops: number[],
  values: number[],
  ease?: EasingFunction | EasingFunction[],
): MotionValue<number>
export function useEasedRange(
  progress: MotionValue<number>,
  stops: number[],
  values: string[],
  ease?: EasingFunction | EasingFunction[],
): MotionValue<string>
export function useEasedRange(
  progress: MotionValue<number>,
  stops: number[],
  values: (number | string)[],
  ease: EasingFunction | EasingFunction[] = EASE_IN_OUT,
): MotionValue<number> | MotionValue<string> {
  // Rebuilt on render, which is rare here (resize, the frame counter); the
  // transform below re-subscribes each render, so it always reads the latest.
  const map = transform(ramp(stops), values as number[], { ease, clamp: true })
  return useTransform(progress, (v) => map(v))
}
