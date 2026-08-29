'use client'

import Image from 'next/image'
import { motion, type MotionValue } from 'motion/react'
import { SPLAT_VARIANTS } from './Splat'
import { useScrollRange } from '@/lib/useScrollRange'

/**
 * The mark arriving as ink.
 *
 * A small black droplet lands, flecks are thrown out ahead of it and swallowed
 * as the body swells, the blue offset catches up behind — and then the whole
 * thing resolves into the real artwork.
 *
 * That last step matters. The liquid stage has to be vector, because a PNG
 * cannot merge, overshoot or be driven by scroll; but the mark people know is
 * the supplied lockup, hand-lettered, with proportions no substitute face
 * reproduces. So the animation is vector and the destination is the actual
 * file, cross-faded at the moment the ink settles. The two are aligned in size
 * and position, and the file's own ground was sampled to set
 * `--color-erised-yellow`, so the swap happens against a matching field and
 * reads as the ink resolving rather than as one image replacing another.
 *
 * The liquid is a blur-and-threshold filter over the body and the flecks
 * together: shapes within a blur radius of each other fuse into one
 * silhouette, which is what reads as ink joining a puddle instead of circles
 * overlapping.
 */

// Flecks thrown out ahead of the body, which the body then swallows.
const FLECKS = [
  { x: -30, y: -20, r: 5, at: 0.02 },
  { x: 25, y: -27, r: 4, at: 0.06 },
  { x: 33, y: 17, r: 5.5, at: 0.04 },
  { x: -23, y: 25, r: 4.5, at: 0.08 },
  { x: 3, y: -33, r: 3.4, at: 0.1 },
  { x: -36, y: 4, r: 3.8, at: 0.12 },
]

/** The ink's own silhouette — the closest variant to the lockup's blob. */
const INK = SPLAT_VARIANTS[0]!
const OUTLINE = SPLAT_VARIANTS[2]!

export function ErisedMark({ progress }: { progress: MotionValue<number> }) {
  const bodyScale = useScrollRange(progress, [0.08, 0.34, 0.46], [0, 1.1, 1])
  const bodySpin = useScrollRange(progress, [0.08, 0.46], [-22, -5])
  const outlineScale = useScrollRange(progress, [0.18, 0.48, 0.58], [0, 1.14, 1.07])

  // The hand-off. The ink holds its settled shape while the artwork comes up
  // over it, so there is never a frame with neither on screen.
  const inkOpacity = useScrollRange(progress, [0.6, 0.74], [1, 0])
  const artOpacity = useScrollRange(progress, [0.6, 0.74], [0, 1])
  const artScale = useScrollRange(progress, [0.6, 0.78], [1.06, 1])

  return (
    <div className="relative w-[min(84vw,32rem)]">
      {/* ---- the liquid stage ------------------------------------------ */}
      <motion.svg
        viewBox="0 0 100 100"
        className="w-full overflow-visible"
        style={{ opacity: inkOpacity }}
        aria-hidden="true"
      >
        <defs>
          <filter id="erised-goo" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.8" result="soft" />
            <feColorMatrix
              in="soft"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -11"
            />
          </filter>
        </defs>

        <motion.path
          d={OUTLINE}
          fill="#3a6ea5"
          style={{
            scale: outlineScale,
            rotate: bodySpin,
            x: 1.6,
            y: 2.2,
            originX: '50px',
            originY: '50px',
          }}
        />

        <g filter="url(#erised-goo)">
          <motion.path
            d={INK}
            fill="#1e1f20"
            style={{ scale: bodyScale, rotate: bodySpin, originX: '50px', originY: '50px' }}
          />
          {FLECKS.map((fleck) => (
            <Fleck key={`${fleck.x}-${fleck.y}`} fleck={fleck} progress={progress} />
          ))}
        </g>
      </motion.svg>

      {/* ---- what the ink resolves into -------------------------------- */}
      <motion.div
        className="absolute inset-0 grid place-items-center"
        style={{ opacity: artOpacity, scale: artScale }}
      >
        <Image
          src="/brand/erised-logo.png"
          alt="ERISED, a community by Qublox"
          width={900}
          height={900}
          priority={false}
          className="w-[118%] max-w-none"
        />
      </motion.div>
    </div>
  )
}

function Fleck({
  fleck,
  progress,
}: {
  fleck: (typeof FLECKS)[number]
  progress: MotionValue<number>
}) {
  // Thrown out fast, then drawn back in as the body swells to meet it.
  const scale = useScrollRange(progress, [fleck.at, fleck.at + 0.12, 0.4], [0, 1, 0.25])
  const x = useScrollRange(progress, [fleck.at, fleck.at + 0.16], [-fleck.x * 0.75, 0])
  const y = useScrollRange(progress, [fleck.at, fleck.at + 0.16], [-fleck.y * 0.75, 0])

  return (
    <motion.circle
      cx={50 + fleck.x}
      cy={50 + fleck.y}
      r={fleck.r}
      fill="#1e1f20"
      style={{ scale, x, y, originX: `${50 + fleck.x}px`, originY: `${50 + fleck.y}px` }}
    />
  )
}
