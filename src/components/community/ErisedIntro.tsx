'use client'

import { motion, type MotionValue } from 'motion/react'
import { ErisedMark } from './ErisedMark'
import { Splash } from './Splash'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { useScrollRange } from '@/lib/useScrollRange'

/**
 * The arrival: paint is thrown at the page, the ground turns, ink lands and
 * resolves into the mark.
 *
 * It takes a normalised progress value rather than reading scroll itself,
 * which is what lets the same sequence be scroll-driven in one context and
 * time-driven in another. The order is strict and is the whole thing:
 *
 *   0.00 – 0.35  yellow paint is thrown at the page, hit by hit
 *   0.48 – 0.56  the ground seals flat behind it
 *   0.40 – 0.92  black ink lands and builds the mark by the same logic
 *   0.78 – 0.86  the line of copy arrives under it
 *
 * Nothing may fade in over a ground that is still moving: a half-opacity mark
 * over black the paint has not reached yet composites to olive.
 *
 * The copy sits well clear of the mark because the artwork is scaled up by a
 * transform — its layout box stays the stage's size while it paints ~46px
 * past it, and the file's own ground is opaque, so a tight gap put the first
 * line of copy underneath it.
 */
export function ErisedIntro({ progress, lead }: { progress: MotionValue<number>; lead: string }) {
  const reduced = useReducedMotion()
  const markProgress = useScrollRange(progress, [0.4, 0.92], [0, 1])
  const leadOpacity = useScrollRange(progress, [0.78, 0.86], [0, 1])

  return (
    <div className="relative h-[100svh] overflow-hidden bg-black">
      {reduced ? <div className="absolute inset-0 bg-erised-yellow" /> : <Splash progress={progress} />}

      <div className="absolute inset-0 grid place-items-center px-6">
        <div className="flex flex-col items-center text-center">
          <ErisedMark progress={markProgress} />
          <motion.p
            className="mx-auto mt-16 max-w-[44ch] font-round text-[1.1rem] leading-relaxed text-erised-ink/85 sm:text-[1.25rem]"
            style={reduced ? undefined : { opacity: leadOpacity }}
          >
            {lead}
          </motion.p>
        </div>
      </div>
    </div>
  )
}
