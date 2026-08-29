'use client'

import { motion, type MotionValue } from 'motion/react'
import { SPLAT_VARIANTS } from './Splat'
import { useScrollRange } from '@/lib/useScrollRange'

/**
 * The yellow arriving as paint thrown at the page.
 *
 * Two things this went through before landing here, both worth keeping:
 *
 * One splat scaled up to cover the screen does not work. Past about twice its
 * own size the shape loses every feature that made it a splat and reads as a
 * large smooth polygon crawling across the frame. A splat only looks like a
 * splat near its own scale — so the ground is covered by many hits instead of
 * one, each no larger than about two-thirds of the screen, their union filling
 * the frame.
 *
 * And they are drawn as real positioned elements rather than as shapes in one
 * clip path. A clip path over a stretched viewBox inherits the stretch, so a
 * round-ish splat came out with spikes elongated 1.6× across — the artwork was
 * correct and the coordinate space was lying about it. Each hit now carries
 * its own square viewBox and keeps its proportions at any viewport.
 *
 * This is the same gesture that forms the mark a beat later, in the other
 * colour at the other scale. That is the point: the ground and the logo arrive
 * the same way.
 */

type Hit = { x: number; y: number; size: number; spin: number; at: number; shape: number }

/**
 * Scattered and uneven, ordered so coverage builds outward from the middle.
 * Each hit takes a different silhouette from SPLAT_VARIANTS.
 *
 * The whole sequence is spread across the first two-thirds of the stage rather
 * than the first quarter. Paint arriving that fast reads as a wipe with a
 * ragged edge; given room, you watch it land.
 */
const HITS: Hit[] = [
  { x: 46, y: 50, size: 68, spin: -14, at: 0.0, shape: 0 },
  { x: 20, y: 34, size: 56, spin: 32, at: 0.05, shape: 1 },
  { x: 76, y: 60, size: 62, spin: -48, at: 0.09, shape: 2 },
  { x: 32, y: 78, size: 54, spin: 12, at: 0.13, shape: 3 },
  { x: 64, y: 20, size: 58, spin: -26, at: 0.17, shape: 4 },
  { x: 6, y: 68, size: 52, spin: 58, at: 0.21, shape: 5 },
  { x: 94, y: 28, size: 56, spin: -8, at: 0.24, shape: 1 },
  { x: 50, y: 94, size: 52, spin: 40, at: 0.27, shape: 0 },
  { x: 90, y: 88, size: 50, spin: -34, at: 0.3, shape: 3 },
  { x: 4, y: 8, size: 48, spin: 22, at: 0.32, shape: 2 },
  // The last few aim at what the others leave uncovered: corners, and the gaps
  // the splats' own concave sides open up between them.
  { x: 96, y: 6, size: 46, spin: -52, at: 0.34, shape: 5 },
  { x: 2, y: 96, size: 46, spin: 16, at: 0.36, shape: 4 },
  { x: 68, y: 76, size: 44, spin: -18, at: 0.38, shape: 0 },
  { x: 30, y: 14, size: 44, spin: 44, at: 0.4, shape: 2 },
  { x: 14, y: 52, size: 42, spin: -62, at: 0.42, shape: 1 },
  { x: 84, y: 46, size: 42, spin: 8, at: 0.44, shape: 3 },
]

export function Splash({ progress }: { progress: MotionValue<number> }) {
  return (
    <div className="absolute inset-0 isolate overflow-hidden">
      {HITS.map((hit, index) => (
        <Hit key={index} hit={hit} progress={progress} />
      ))}

      {/*
        Once the hits have run, the ground goes flat. Their union covers the
        frame, but a ragged edge is only wanted while the paint is moving.
      */}
      <Seal progress={progress} />
    </div>
  )
}

function Hit({ hit, progress }: { hit: Hit; progress: MotionValue<number> }) {
  // Overshoot, then settle: paint lands, it does not ease in.
  const scale = useScrollRange(progress, [hit.at, hit.at + 0.05, hit.at + 0.09], [0, 1.16, 1])

  return (
    <motion.svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      className="absolute"
      style={{
        left: `${hit.x}%`,
        top: `${hit.y}%`,
        width: `${hit.size}vmax`,
        height: `${hit.size}vmax`,
        translateX: '-50%',
        translateY: '-50%',
        rotate: hit.spin,
        scale,
      }}
    >
      <path d={SPLAT_VARIANTS[hit.shape % SPLAT_VARIANTS.length]} fill="#fecb56" />
    </motion.svg>
  )
}

function Seal({ progress }: { progress: MotionValue<number> }) {
  // Short and decisive, and finished before the ink starts landing on it: two
  // yellows ramping at once composite to a third, darker yellow.
  const opacity = useScrollRange(progress, [0.48, 0.56], [0, 1])
  return (
    <motion.div
      aria-hidden="true"
      className="absolute inset-0 -z-10 bg-erised-yellow"
      style={{ opacity }}
    />
  )
}
