'use client'

import { animate, useMotionValue } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '@/lib/useReducedMotion'

/** How long each channel holds before the set tunes itself to the next one. */
const DWELL_MS = 5000
/** How long the picture takes to re-converge after a change. */
const GLITCH_MS = 460

/**
 * What the television is showing, and the fault that runs through the picture
 * when it changes.
 *
 * Channel 0 is the logo and is always present; the rest are the broadcast
 * words. The set advances itself on a timer, and the dial on its front does
 * the same thing by hand — turning it restarts the timer rather than fighting
 * it, so a viewer who takes over is not interrupted a moment later by the
 * set changing under them.
 *
 * `glitch` is a motion value the screen adds into its own tear, so a channel
 * change shreds the picture exactly the way scrolling does. It spikes hard and
 * settles rather than easing, because a tube re-converging is not a fade.
 *
 * Auto-advance is off under reduced motion: content that changes itself every
 * few seconds is the thing that guidance is asking us not to do. The dial
 * still works, so the words remain reachable — they are just no longer
 * something that happens *to* the viewer.
 */
export function useBroadcast(count: number) {
  const reduced = useReducedMotion()
  const [channel, setChannel] = useState(0)
  const [powered, setPowered] = useState(true)
  const glitch = useMotionValue(0)
  const timer = useRef<number | null>(null)

  const shred = useCallback(() => {
    if (reduced) return
    glitch.set(1)
    animate(glitch, 0, { duration: GLITCH_MS / 1000, ease: [0.16, 1, 0.3, 1] })
  }, [glitch, reduced])

  const tune = useCallback(
    (next: number) => {
      setChannel(((next % count) + count) % count)
      shred()
    },
    [count, shred],
  )

  const togglePower = useCallback(() => {
    setPowered((on) => !on)
    shred()
  }, [shred])

  // The set tunes itself. Any manual change resets the dwell, because
  // `channel` is a dependency — the effect tears down and starts over.
  useEffect(() => {
    if (!powered || reduced || count < 2) return
    timer.current = window.setTimeout(() => {
      setChannel((c) => (c + 1) % count)
      shred()
    }, DWELL_MS)
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current)
    }
  }, [channel, powered, reduced, count, shred])

  return { channel, powered, glitch, tune, togglePower }
}
