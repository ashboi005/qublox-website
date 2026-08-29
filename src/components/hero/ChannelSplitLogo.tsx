'use client'

import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from 'motion/react'
import { useEffect } from 'react'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { QubloxMark } from './QubloxMark'

/**
 * The logo is not placed inside the TV — it is *displayed* by it.
 *
 * Four colour channels are drawn over each other in screen blend and pulled
 * apart horizontally; six horizontal slices are torn sideways by different
 * amounts. Both are driven by scroll velocity, so the picture holds steady
 * when you stop and shreds when you move. Straight off the CRT plate.
 *
 * Each layer is its own component so the transforms are declared at a stable
 * hook position — the reduced-motion branch below must not change hook count.
 */

const CHANNELS = [
  { color: '#ff3b30', factor: -1 },
  { color: '#2f6bff', factor: 1 },
  { color: '#ffd23f', factor: -0.45 },
  { color: '#3bffa8', factor: 0.55 },
]

// Bands of unequal height read as a rolling horizontal-hold fault; equal ones
// just read as a gradient.
const SLICES = [
  { top: 0, bottom: 78, drift: 1 },
  { top: 22, bottom: 62, drift: -1.7 },
  { top: 38, bottom: 48, drift: 2.4 },
  { top: 52, bottom: 30, drift: -0.8 },
  { top: 70, bottom: 14, drift: 1.9 },
  { top: 86, bottom: 0, drift: -2.6 },
]

function ChannelLayer({ color, factor, tear }: { color: string; factor: number; tear: MotionValue<number> }) {
  const x = useTransform(tear, (v) => v * factor)
  return (
    <motion.div
      className="absolute inset-0 mix-blend-screen"
      style={{
        color,
        x,
        filter: `drop-shadow(0 0 14px ${color}) drop-shadow(0 0 3px ${color})`,
      }}
    >
      <QubloxMark cut="#000" />
    </motion.div>
  )
}

function SliceLayer({
  top,
  bottom,
  drift,
  tear,
}: {
  top: number
  bottom: number
  drift: number
  tear: MotionValue<number>
}) {
  const x = useTransform(tear, (v) => v * drift * 0.6)
  return (
    <motion.div
      className="absolute inset-0 text-bone opacity-90 mix-blend-screen"
      style={{ clipPath: `inset(${top}% 0 ${bottom}% 0)`, x }}
    >
      <QubloxMark cut="#000" />
    </motion.div>
  )
}

export function ChannelSplitLogo() {
  const reduced = useReducedMotion()
  const { scrollY } = useScroll()
  const velocity = useVelocity(scrollY)

  // Velocity is spiky; a spring turns it into something that can drive pixels.
  const smoothed = useSpring(velocity, { stiffness: 260, damping: 42, mass: 0.4 })
  const split = useTransform(smoothed, [-2600, 0, 2600], [-16, 0, 16], { clamp: true })

  // A slow idle drift, so the set is never perfectly still even at rest.
  const idle = useMotionValue(0)
  const tear = useTransform([split, idle], ([s, i]: number[]) => (s ?? 0) + (i ?? 0))

  useEffect(() => {
    if (reduced) return
    let frame = 0
    const tick = (now: number) => {
      idle.set(Math.sin(now / 620) * 1.1 + Math.sin(now / 197) * 0.45)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [idle, reduced])

  return (
    <div className="relative h-full w-full">
      {reduced ? (
        <div className="h-full w-full text-bone">
          <QubloxMark cut="#000" />
        </div>
      ) : (
        <>
          {/* Colour channels. Screen blend on black is additive, so where all
              four overlap the mark returns to white. */}
          {CHANNELS.map((channel) => (
            <ChannelLayer key={channel.color} {...channel} tear={tear} />
          ))}

          {/* Torn slices of the white master, each sliding at its own rate */}
          {SLICES.map((slice, index) => (
            <SliceLayer key={index} {...slice} tear={tear} />
          ))}
        </>
      )}

      {/* Bloom */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 blur-2xl"
        style={{
          background:
            'radial-gradient(closest-side, rgba(59,255,168,0.35), rgba(47,107,255,0.16) 55%, transparent 78%)',
        }}
      />
    </div>
  )
}
