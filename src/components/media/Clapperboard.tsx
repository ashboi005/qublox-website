'use client'

import { motion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { useLayoutEffect, useRef, useState } from 'react'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { useScrollRange } from '@/lib/useScrollRange'
import type { MediaSettings } from '@/types/content'

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
 *   0.00 – 0.34  the slate rushes in and squares up to the lens
 *   0.34 – 0.44  it holds, sticks open
 *   0.44 – 0.52  CLAP — the arm slams and the whole board jolts
 *   0.52 – 0.66  it holds shut, covering everything
 *   0.66 – 0.88  it is pulled up out of frame, onto black
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
          style={{ background: i % 2 === 0 ? '#f2f1ec' : '#101114' }}
        />
      ))}
    </span>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-[0.6em] border-b border-white/20 pb-[0.28em]">
      <span className="w-[4.6em] shrink-0 text-white/45">{label}</span>
      <span className="truncate text-white">{value}</span>
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
   *   0.30 – 0.44  held square to it, sticks open
   *   0.44 – 0.52  CLAP — the arm slams and the board recoils
   *   0.52 – 0.60  held shut
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

  const scale = useScrollRange(progress, [0, ARRIVE, LEAVE, GONE], [0.08, 1, 1, 0.05])
  const boardX = useScrollRange(progress, [0, ARRIVE, LEAVE, GONE], ['-58%', '0%', '0%', '54%'])
  const boardY = useScrollRange(progress, [0, ARRIVE, LEAVE, GONE], ['68%', '0%', '0%', '-80%'])
  const swing = useScrollRange(progress, [0, ARRIVE, LEAVE, GONE], [-38, 0, 0, 40])

  /**
   * The clap. It overshoots so the arm bounces off the jaw rather than
   * arriving at it, holds shut, then opens again before the board is taken
   * away — a slate is carried open, in and out.
   */
  const armAngle = useScrollRange(
    progress,
    [0, 0.44, 0.5, 0.52, 0.56, 0.6, LEAVE],
    [-30, -30, 1.5, -4, 0, 0, -34],
  )

  // The whole board recoils from the impact.
  const jolt = useScrollRange(progress, [0.49, 0.505, 0.53, 0.56], [0, 1.6, -0.7, 0])

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
  const backing = useScrollRange(progress, [0.484, 0.499, 0.7, 0.8], [0, 1, 1, 0])

  /**
   * `rotate` and `rotateZ` are the same transform, so the swing and the recoil
   * have to be summed rather than set as two properties — one silently wins
   * otherwise.
   */
  const rotate = useTransform([swing, jolt], ([a, b]: number[]) => (a ?? 0) + (b ?? 0))

  return (
    <>
      <motion.div className="absolute inset-0 bg-black" style={{ opacity: backing }} />

      <motion.div className="absolute inset-0 grid place-items-center">
        <motion.div
          // Must exceed the frame on *both* axes or a tall viewport shows the
          // page around the board. At 16:10 that means the width has to clear
          // 1.6 viewport heights as well as the viewport's own width.
          className="relative aspect-[16/10] w-[max(106vw,170vh)]"
          style={{ scale, rotate, x: boardX, y: boardY }}
        >
          {/* ---- the clapper arm, hinged at the left ------------------- */}
          <motion.div
            className="absolute inset-x-0 top-0 h-[15%] origin-left"
            style={{ rotate: armAngle }}
          >
            <div className="relative h-full w-full overflow-hidden rounded-[0.4vmin] bg-[#101114] shadow-[0_1vmin_2vmin_rgba(0,0,0,0.6)]">
              <Stripes />
            </div>
          </motion.div>

          {/* ---- the jaw the arm lands on ------------------------------ */}
          <div className="absolute inset-x-0 top-[15.5%] h-[11%] overflow-hidden rounded-[0.4vmin] bg-[#101114]">
            <Stripes />
          </div>

          {/* ---- the slate body --------------------------------------- */}
          <div
            className="absolute inset-x-0 top-[27.5%] bottom-0 overflow-hidden rounded-[0.5vmin] px-[4%] py-[3%]"
            style={{
              background: 'linear-gradient(168deg,#23252b 0%,#15171b 55%,#0b0c0e 100%)',
              boxShadow: 'inset 0 0 0 0.25vmin rgba(242,241,236,0.14)',
            }}
          >
            <div
              className="grid h-full grid-cols-2 content-center gap-x-[7%] gap-y-[5%] font-mono uppercase"
              style={{ fontSize: 'clamp(0.7rem, 2.9vmin, 1.7rem)', letterSpacing: '0.1em' }}
            >
              <Row label="Prod" value={copy.slateProduction} />
              <Row label="Roll" value="A" />
              <Row label="Scene" value="03" />
              <Row label="Take" value="01" />
              <Row label="Dir" value={copy.slateDirector} />
              <Row label="Date" value={copy.yearRange} />
              <div className="col-span-2 flex items-end justify-between pt-[1%] text-white/35">
                <span>{copy.formatLabel}</span>
                <span className="text-signal">● {copy.recLabel}</span>
              </div>
            </div>
          </div>
      </motion.div>
      </motion.div>
    </>
  )
}
