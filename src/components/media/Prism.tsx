'use client'

import { motion, type MotionValue } from 'motion/react'
import { EASE_OUT, useEasedRange } from './useTrailPath'

/**
 * Where the beam ends.
 *
 * The camera's light runs white for the whole section and then meets a prism,
 * which fans it into a spectrum. Parallel coloured copies of the path were the
 * first attempt and they read as a mis-registered stroke — real dispersion
 * *diverges*, so the bands here radiate from a single point at increasing
 * angles, each one longer than the last.
 *
 * The fan is the hand-off: the section after this one opens on the same
 * spectrum and carries it forward.
 */

// Ordered as they leave the glass, with the deviation each colour takes.
// Every hue is a token; the two the palette has no stop for are mixed from
// their neighbours, which is what a spectrum is anyway.
const BANDS = [
  { id: 'red', color: 'var(--color-chan-red)', angle: -19, reach: 0.82 },
  { id: 'orange', color: 'var(--color-amber)', angle: -13, reach: 0.87 },
  { id: 'yellow', color: 'var(--color-chan-yellow)', angle: -7.5, reach: 0.92 },
  {
    id: 'lime',
    color: 'color-mix(in oklch, var(--color-chan-yellow), var(--color-chan-green))',
    angle: -2.5,
    reach: 0.96,
  },
  { id: 'green', color: 'var(--color-chan-green)', angle: 2.5, reach: 1 },
  { id: 'blue', color: 'var(--color-chan-blue)', angle: 8, reach: 0.95 },
  { id: 'violet', color: 'var(--color-deco-violet)', angle: 14, reach: 0.88 },
  {
    id: 'magenta',
    color: 'color-mix(in oklch, var(--color-deco-violet), var(--color-mag-2-a))',
    angle: 20,
    reach: 0.8,
  },
]

export function Prism({
  x,
  y,
  reach,
  arrival,
  progress,
}: {
  x: number
  y: number
  /** How far the fan throws, in pixels. */
  reach: number
  /** The glass fading in. Runs well before the beam gets here. */
  arrival: MotionValue<number>
  /** 0 until the beam reaches the glass, 1 when the spectrum is fully open. */
  progress: MotionValue<number>
}) {
  // The glass settles in rather than growing at a constant rate.
  const glassScale = useEasedRange(arrival, [0, 1], [0.6, 1], EASE_OUT)
  const glassOpacity = useEasedRange(arrival, [0, 1], [0, 1], EASE_OUT)

  return (
    <div className="pointer-events-none absolute top-0 left-0 z-[8]" style={{ left: x, top: y }}>
      {/* the fan */}
      <div className="absolute top-0 left-0" style={{ mixBlendMode: 'screen' }}>
        {BANDS.map((band, index) => (
          <Band key={band.id} band={band} index={index} reach={reach} progress={progress} />
        ))}
      </div>

      {/* the glass */}
      <motion.svg
        aria-hidden="true"
        viewBox="0 0 100 100"
        className="absolute top-0 left-0 h-[7rem] w-[7rem] -translate-x-1/2 -translate-y-1/2 overflow-visible"
        style={{ scale: glassScale, opacity: glassOpacity }}
      >
        <defs>
          <linearGradient id="media-prism" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" style={{ stopColor: 'var(--color-on-void)', stopOpacity: 0.05 }} />
            <stop offset="52%" style={{ stopColor: 'var(--color-on-void)', stopOpacity: 0.24 }} />
            <stop offset="100%" style={{ stopColor: 'var(--color-on-void)', stopOpacity: 0.05 }} />
          </linearGradient>
        </defs>
        <path
          d="M50 10 L88 84 L12 84 Z"
          fill="url(#media-prism)"
          style={{ stroke: 'color-mix(in oklab, var(--color-on-void) 85%, transparent)' }}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </motion.svg>
    </div>
  )
}

function Band({
  band,
  index,
  reach,
  progress,
}: {
  band: (typeof BANDS)[number]
  index: number
  reach: number
  progress: MotionValue<number>
}) {
  // Each band leaves the glass a beat after the one before it, which is what
  // makes the fan open rather than appear. The first leaves the instant the
  // beam lands, so there is no dead moment at the point of contact.
  //
  // The band is laid out at its full length and drawn out with scaleX, never
  // by animating its width: transform only, so the fan opens on the
  // compositor. The throw decelerates, like light finding its length.
  const start = index * 0.05
  const throwOut = useEasedRange(progress, [start, start + 0.5], [0, 1], EASE_OUT)
  const opacity = useEasedRange(progress, [start, start + 0.12], [0, 0.95], EASE_OUT)

  return (
    <motion.span
      className="absolute top-0 left-0 block origin-left"
      style={{ rotate: band.angle, y: -3 }}
    >
      <motion.span
        className="block h-[6px] origin-left rounded-full"
        style={{
          width: reach * band.reach,
          scaleX: throwOut,
          opacity,
          background: `linear-gradient(90deg, ${band.color}, ${band.color} 62%, transparent)`,
          boxShadow: `0 0 18px 2px color-mix(in oklab, ${band.color} 70%, transparent)`,
        }}
      />
    </motion.span>
  )
}
