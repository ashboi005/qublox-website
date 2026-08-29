'use client'

import { motion, type MotionValue } from 'motion/react'
import { useScrollRange } from '@/lib/useScrollRange'

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
const BANDS = [
  { color: '#ff2f36', angle: -19, reach: 0.82 },
  { color: '#ff8a1f', angle: -13, reach: 0.87 },
  { color: '#ffd23f', angle: -7.5, reach: 0.92 },
  { color: '#c6ff4a', angle: -2.5, reach: 0.96 },
  { color: '#3bffa8', angle: 2.5, reach: 1 },
  { color: '#2f6bff', angle: 8, reach: 0.95 },
  { color: '#8b5cf6', angle: 14, reach: 0.88 },
  { color: '#d24bff', angle: 20, reach: 0.8 },
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
  const glassScale = useScrollRange(arrival, [0, 1], [0.4, 1])
  const glassOpacity = useScrollRange(arrival, [0, 1], [0, 1])

  return (
    <div className="pointer-events-none absolute top-0 left-0 z-[8]" style={{ left: x, top: y }}>
      {/* the fan */}
      <div className="absolute top-0 left-0" style={{ mixBlendMode: 'screen' }}>
        {BANDS.map((band, index) => (
          <Band key={band.color} band={band} index={index} reach={reach} progress={progress} />
        ))}
      </div>

      {/* the glass */}
      <motion.svg
        viewBox="0 0 100 100"
        className="absolute top-0 left-0 h-[7rem] w-[7rem] -translate-x-1/2 -translate-y-1/2 overflow-visible"
        style={{ scale: glassScale, opacity: glassOpacity }}
      >
        <defs>
          <linearGradient id="media-prism" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
            <stop offset="52%" stopColor="rgba(255,255,255,0.28)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
          </linearGradient>
        </defs>
        <path
          d="M50 10 L88 84 L12 84 Z"
          fill="url(#media-prism)"
          stroke="rgba(255,255,255,0.85)"
          strokeWidth="2"
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
  const start = index * 0.05
  const width = useScrollRange(progress, [start, start + 0.5], [0, reach * band.reach])
  const opacity = useScrollRange(progress, [start, start + 0.12], [0, 0.95])

  return (
    <motion.span
      className="absolute top-0 left-0 block h-[6px] origin-left rounded-full"
      style={{
        width,
        opacity,
        rotate: band.angle,
        y: -3,
        background: `linear-gradient(90deg, ${band.color}, ${band.color} 62%, transparent)`,
        boxShadow: `0 0 26px 5px ${band.color}`,
      }}
    />
  )
}
