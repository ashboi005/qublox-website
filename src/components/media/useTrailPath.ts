'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { samplePath, type PathSample } from '@/lib/path'
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
