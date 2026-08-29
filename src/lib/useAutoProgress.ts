'use client'

import { animate, useMotionValue, type MotionValue } from 'motion/react'
import { useEffect } from 'react'
import { useReducedMotion } from './useReducedMotion'

/**
 * A 0 → 1 progress value driven by time rather than by scroll.
 *
 * Everything in the ERISED sequence is authored against a normalised progress
 * value, which is what lets the same components play either way. On the home
 * page that value came from `useScroll`; on its own page it comes from here,
 * so the sequence performs itself on arrival instead of waiting to be dragged
 * through.
 *
 * Reduced motion jumps straight to the composed end state, exactly as the
 * scroll-driven version does.
 */
export function useAutoProgress(durationMs: number, delayMs = 0): MotionValue<number> {
  const progress = useMotionValue(0)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) {
      progress.set(1)
      return
    }
    progress.set(0)
    const controls = animate(progress, 1, {
      duration: durationMs / 1000,
      delay: delayMs / 1000,
      /**
       * Close to even, with a gentle start and finish.
       *
       * A front-loaded curve put the sequence two-thirds through in its first
       * second: the paint hits blurred into a single wipe and the mark was
       * already up before you had registered the ground changing. The beats
       * are the content here, so they each need roughly equal time.
       */
      ease: [0.4, 0.05, 0.2, 1],
    })
    return () => controls.stop()
  }, [progress, durationMs, delayMs, reduced])

  return progress
}
