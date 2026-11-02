'use client'

import { motion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { useLayoutEffect, useRef, useState } from 'react'
import { useReducedMotion } from '@/lib/useReducedMotion'
import type { MediaSettings } from '@/types/content'
import {
  EASE_IN,
  EASE_IN_OUT,
  EASE_OUT,
  LINEAR,
  SCRUB_IN,
  SCRUB_OUT,
  useEasedRange,
} from './useTrailPath'

/**
 * The cut into CH 03.
 *
 * A slate rushes the lens, fills the frame — header, chapter readout and all —
 * claps, and is pulled away onto black. Fading the ground to black was the
 * previous approach and it was too polite for the seam it has to cover: the
 * page changes from a bone-coloured document into a dark cinema, and a
 * dissolve made that read as a rendering artefact rather than as a decision.
 * A slate is the thing that is literally used to mark a cut, so it is the
 * honest object for the job.
 *
 * Beats, over the section's own scroll:
 *
 *   0.00 – 0.30  the slate swings in and squares up to the lens
 *   0.30 – 0.43  it holds, sticks open
 *   0.43 – 0.49  CLAP — the arm accelerates shut and lands, once
 *   0.49 – 0.60  it holds shut, covering everything
 *   0.60 – 0.70  the sticks open again
 *   0.70 – 0.92  it is pulled back and out of frame, onto black
 *
 * It sits above the header on purpose. A transition that covers the page
 * except for the fixed chrome does not read as a cut, it reads as a modal.
 */

/** Diagonal stripes down the clapper stick and its jaw. */
function Stripes({ count = 12 }: { count?: number }) {
  return (
    <span aria-hidden="true" className="absolute inset-0 flex overflow-hidden">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className="h-full flex-1 skew-x-[-18deg]"
          style={{
            background: i % 2 === 0 ? 'var(--color-bone)' : 'var(--color-void-2)',
          }}
        />
      ))}
    </span>
  )
}

/**
 * One field on the slate: the printed caption small and lowercase, the value
 * chalked in large. That is how a real board reads, and it keeps the only
 * caps on the slate at display size.
 */
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-[1em] border-b border-on-void/20 pb-[0.4em]">
      <span
        className="w-[4.2rem] shrink-0 font-mono text-on-void-muted sm:w-[6.5rem]"
        style={{ fontSize: 'clamp(0.75rem, 1.5vmin, 1rem)' }}
      >
        {label}
      </span>
      <span
        className="truncate font-display font-bold tracking-[-0.01em] text-on-void"
        style={{ fontSize: 'clamp(1rem, 3.6vmin, 2.25rem)', fontVariationSettings: "'wdth' 112" }}
      >
        {value}
      </span>
    </div>
  )
}

/**
 * How much scroll the slate borrows either side of CH 03's top edge, in
 * screens. The lead is spent over the tail of CH 02, the tail over the head of
 * CH 03 — so the board arrives onto the studio page and leaves onto a camera
 * run that is already moving.
 */
const LEAD_VH = 1.3
const TAIL_VH = 0.9

export function Clapperboard({ copy }: { copy: MediaSettings }) {
  const reduced = useReducedMotion()
  const { scrollY } = useScroll()

  /**
   * The scroll window the slate plays across, in document pixels.
   *
   * Held in a ref because the transform below reads it every frame: it is
   * measured after mount, and a transform built from state would keep
   * interpolating against whatever the range was when it was created.
   */
  const range = useRef<[number, number] | null>(null)
  const [, setMeasured] = useState(0)

  useLayoutEffect(() => {
    const measure = () => {
      const media = document.getElementById('work')
      if (!media) return
      const top = media.getBoundingClientRect().top + window.scrollY
      const vh = window.innerHeight
      range.current = [top - vh * LEAD_VH, top + vh * TAIL_VH]
      setMeasured((n) => n + 1)
    }

    measure()
    window.addEventListener('resize', measure)
    // Section heights are in viewport units and the display face loads late;
    // both move CH 03's top edge after first paint.
    document.fonts?.ready.then(measure).catch(() => {})
    const settle = window.setTimeout(measure, 400)
    return () => {
      window.removeEventListener('resize', measure)
      window.clearTimeout(settle)
    }
  }, [])

  const progress = useTransform(scrollY, (y) => {
    const window_ = range.current
    if (!window_) return 0
    const [from, to] = window_
    return Math.min(1, Math.max(0, (y - from) / (to - from)))
  })

  // Reduced motion drops the performance entirely; the ground still changes.
  if (reduced) return null

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[130] overflow-hidden"
    >
      <Slate copy={copy} progress={progress} />
    </div>
  )
}

function Slate({ copy, progress }: { copy: MediaSettings; progress: MotionValue<number> }) {
  /**
   * The slate is carried into frame, claps, opens, and is taken back out.
   *
   *   0.00 – 0.30  swung up into the lens from below and to the left
   *   0.30 – 0.43  held square to it, sticks open
   *   0.43 – 0.49  CLAP — the arm accelerates shut and the board takes the hit
   *   0.49 – 0.60  held shut
   *   0.60 – 0.70  the sticks open again
   *   0.70 – 0.92  pulled back and away, out of the top corner
   *
   * It travels rather than growing in place: a slate that scales up from the
   * centre of the frame reads as a graphic appearing, and one that arcs in
   * from off-camera reads as an object someone is holding. Same for the exit —
   * it leaves the way a slate leaves, which is backwards and out of shot, not
   * upwards through the lens.
   *
   * The chapter's black is already behind it by then, so the shrink happens
   * against CH 03's ground rather than against the page it came from.
   */
  const ARRIVE = 0.3
  const LEAVE = 0.7
  const GONE = 0.92
  /** The frame the sticks meet. Everything about the cut keys off it. */
  const IMPACT = 0.49

  // In: decelerates onto its mark. Held: nothing moves. Out: accelerates away.
  // One curve per segment, so the board never starts or stops dead.
  const travelStops = [0, ARRIVE, LEAVE, GONE]
  const travelEase = [SCRUB_OUT, LINEAR, SCRUB_IN]
  const scale = useEasedRange(progress, travelStops, [0.08, 1, 1, 0.05], travelEase)
  const boardX = useEasedRange(progress, travelStops, ['-58%', '0%', '0%', '54%'], travelEase)
  const boardY = useEasedRange(progress, travelStops, ['68%', '0%', '0%', '-80%'], travelEase)
  const swing = useEasedRange(progress, travelStops, [-38, 0, 0, 40], travelEase)

  /**
   * The clap. The arm accelerates into the jaw and stops on it: one landing,
   * no bounce. A stick that rebounds off its mark reads as jitter when it is
   * scrubbed by hand, and a cut is decisive. It holds shut, then opens again
   * before the board is taken away, since a slate is carried open, in and out.
   */
  const armAngle = useEasedRange(
    progress,
    [0, 0.43, IMPACT, 0.6, LEAVE],
    [-30, -30, 0, 0, -30],
    [LINEAR, EASE_IN, LINEAR, EASE_IN_OUT],
  )

  // The board takes the hit once: a short dip on contact that settles out
  // long. A single excursion, never a wobble either side of rest.
  const jolt = useEasedRange(progress, [IMPACT, IMPACT + 0.008, 0.56], [0, 0.6, 0], [
    EASE_OUT,
    EASE_OUT,
  ])

  /**
   * The chapter's black, cut in on the frame the sticks meet — and taken away
   * again before the board is.
   *
   * It earns its place twice. The arm hinges at its left, so while the sticks
   * are open there is a wedge of page showing past the board's top-right
   * corner; this plugs it. And cutting it in on the impact rather than fading
   * it is what makes the clap read as the thing that changed the chapter,
   * instead of the page having quietly decided beforehand.
   *
   * It has to clear before the board does, or the slate would shrink away onto
   * a black plane rather than onto CH 03. By then the real ground has flipped
   * and the camera run is under way, so the handover is invisible.
   */
  // Completes *on* the impact rather than starting from it, so the frame the
  // sticks meet is already black. Beginning at 0.50 left the sticks closing
  // over a page that was still visible through the gap the open arm makes.
  const backing = useEasedRange(
    progress,
    [IMPACT - 0.012, IMPACT, LEAVE, 0.8],
    [0, 1, 1, 0],
    [EASE_IN, LINEAR, EASE_IN_OUT],
  )

  /**
   * `rotate` and `rotateZ` are the same transform, so the swing and the recoil
   * have to be summed rather than set as two properties — one silently wins
   * otherwise.
   */
  const rotate = useTransform([swing, jolt], ([a, b]: number[]) => (a ?? 0) + (b ?? 0))

  return (
    <>
      <motion.div className="absolute inset-0 bg-void" style={{ opacity: backing }} />

      <motion.div className="absolute inset-0 grid place-items-center">
        <motion.div
          // Must exceed the frame on *both* axes or a tall viewport shows the
          // page around the board. At 16:10 that means the width has to clear
          // 1.6 viewport heights as well as the viewport's own width. This
          // stays `vh`, the large viewport, on purpose: it is a cover, and it
          // has to cover the frame with the browser chrome retracted too.
          className="relative aspect-[16/10] w-[max(106vw,170vh)]"
          style={{ scale, rotate, x: boardX, y: boardY }}
        >
          {/* ---- the clapper arm, hinged at the left ------------------- */}
          <motion.div
            className="absolute inset-x-0 top-0 h-[15%] origin-left"
            style={{ rotate: armAngle }}
          >
            <div className="relative h-full w-full overflow-hidden rounded-[0.4vmin] bg-void-2 shadow-[0_1vmin_2.5vmin_color-mix(in_oklab,var(--color-void)_55%,transparent)]">
              <Stripes />
            </div>
          </motion.div>

          {/* ---- the jaw the arm lands on ------------------------------ */}
          <div className="absolute inset-x-0 top-[15.5%] h-[11%] overflow-hidden rounded-[0.4vmin] bg-void-2">
            <Stripes />
          </div>

          {/* ---- the slate body --------------------------------------- */}
          <div
            className="absolute inset-x-0 top-[27.5%] bottom-0 overflow-hidden rounded-[0.5vmin] px-[4%] py-[3%]"
            style={{
              // Light from the top left, as on everything else on the set.
              background:
                'linear-gradient(168deg, var(--color-void-3) 0%, var(--color-void-2) 55%, var(--color-void) 100%)',
              boxShadow:
                'inset 0 0 0 0.25vmin color-mix(in oklab, var(--color-on-void) 12%, transparent)',
            }}
          >
            <div className="grid h-full grid-cols-2 content-center gap-x-[7%] gap-y-[5%]">
              <Row label="prod" value={copy.slateProduction} />
              <Row label="roll" value="A" />
              <Row label="scene" value="03" />
              <Row label="take" value="01" />
              <Row label="dir" value={copy.slateDirector} />
              <Row label="date" value={copy.yearRange} />
              <div
                className="col-span-2 flex items-end justify-between pt-[1%] font-mono text-on-void-muted"
                style={{ fontSize: 'clamp(0.75rem, 1.7vmin, 1.125rem)' }}
              >
                <span>{copy.formatLabel}</span>
                <span className="text-signal">{copy.recLabel}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  )
}
