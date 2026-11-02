'use client'

import Image from 'next/image'
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react'
import { useScrollRange } from '@/lib/useScrollRange'
import { useRef, useState } from 'react'
import { MovieCamera } from '@/components/media/MovieCamera'
import { Prism } from '@/components/media/Prism'
import { ProjectPlate } from '@/components/media/ProjectPlate'
import {
  EASE_IN_OUT,
  LINEAR,
  SCRUB_IN,
  SCRUB_OUT,
  useEasedRange,
  useTrailPath,
} from '@/components/media/useTrailPath'
import { sampleAt, type PathSample } from '@/lib/path'
import { ramp } from '@/lib/range'
import { useReducedMotion } from '@/lib/useReducedMotion'
import type { MediaSettings, Project } from '@/types/content'

/**
 * Media — CH 03, WORK.
 *
 * The camera runs a serpentine path and pays out a beam of white light behind
 * it. The work hangs off that beam.
 *
 * Two things make it feel like travel rather than a value being tweened:
 *
 * 1. The world moves, not the camera. The path is drawn across a track several
 *    screens wide, and the track slides left to keep the camera at roughly
 *    45% of the viewport. Scrolling down reads as scrolling sideways, and the
 *    work gets a clear half-screen of space between each frame.
 *
 *    The beam and the camera sit *behind* the work. They belong to the same
 *    object and have to share a plane; in front, the beam cut across the
 *    artwork, because a card is taller than the beam's own amplitude and a
 *    steep stretch of the wave will always cross something that size. Behind,
 *    the frames occlude it and the whole thing reads as depth.
 *
 * 2. The beam is white for the whole run, is paid out from the back of the
 *    camera, and at the very end meets a prism and fans into a spectrum. Coloured copies of the path riding along
 *    the whole way read as a mis-registered stroke; real dispersion diverges,
 *    and holding it back until the last stretch makes the split an event
 *    rather than a texture.
 *
 * Performance: the path is sampled into a lookup table on mount and on resize
 * only. Track position, camera transform, beam length and every frame's reveal
 * are motion values, so scrolling never re-renders React. The only state that
 * changes is the frame counter in the footer.
 */

/**
 * Two constraints that pull against each other, and both have to hold:
 *
 *   the beam is paid out from the back of the camera, so its drawn length has
 *   to track the camera exactly — otherwise the light runs out ahead of the
 *   thing emitting it;
 *
 *   the spectrum opens only once the beam has *reached* the glass — otherwise
 *   the colours arrive before the light does.
 *
 * Satisfying both means the camera must finish its run before the section
 * does. It reaches the glass at ARRIVE and holds there while the spectrum
 * opens over the remainder. Mapping the camera to the full range instead put
 * its arrival at the very last frame, leaving nowhere for the dispersion to
 * happen — which is how the two ended up in the wrong order.
 */
const ARRIVE = 0.82
const PRISM_IN = 0.46

const CARD_MAX = 340
/**
 * Clear of the chapter head, which sits below the site header's scrim: set
 * inside the scrim, the head was washed to grey by it.
 */
const TOP_PAD = 208
const BOTTOM_PAD = 88
/** Space between a frame's leading edge and the beam it hangs from. */
const CARD_GUTTER = 24
const EDGE_PAD = 20
/**
 * Where the camera sits on screen while the world slides past it.
 *
 * It used to hold at 45%, which left the entire right half of the frame empty:
 * the work trails *behind* the camera, so everything on screen was crowded
 * into the left, and only one frame was ever legible at a time. Holding it far
 * right gives that trail most of the viewport, so the frame the camera has
 * just shot and the one before it are both readable at once.
 */
const CAMERA_HOLD = 0.78

export function Media({ projects, copy }: { projects: Project[]; copy: MediaSettings }) {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const { stageRef, pathRef, samples, length, d, size, trackWidth } = useTrailPath()

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })

  // The camera lags the scroll slightly, so it reads as a physical object being
  // pulled rather than a value being set.
  const travel = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.6 })

  const cardWidth = Math.min(size.width * 0.66, CARD_MAX)

  // Path position, which the camera and the beam's drawn length both read.
  const pathT = useScrollRange(travel, [0, ARRIVE], [0, 1])
  const dashOffset = useScrollRange(travel, [0, ARRIVE], [length, 0])

  /**
   * The track slides so the camera holds its place on screen.
   *
   * The leading clamp is a full card width rather than zero. Frames hang to
   * the *left* of their anchor, so the track needs that much room to its left
   * before the first anchor or the card has nowhere to go — clamped at zero,
   * a project anchored early in the path had its frame pinned off the left
   * edge for its entire visible life, half of it never on screen. This is the
   * structural version of the fix: it holds for any anchor an editor picks,
   * rather than depending on the first project starting late enough.
   */
  const lead = cardWidth + CARD_GUTTER + EDGE_PAD
  const trackX = useTransform(pathT, (t) => {
    const camera = sampleAt(samples, t).x
    const wanted = -(camera - size.width * CAMERA_HOLD)
    return Math.min(lead, Math.max(-(trackWidth - size.width), wanted))
  })

  const camX = useTransform(pathT, (t) => sampleAt(samples, t).x)
  const camY = useTransform(pathT, (t) => sampleAt(samples, t).y)
  // The camera's scale, the peel and the reveals all ride eased ranges: a
  // linear ramp starts and stops dead at its edges, which is the pop.
  const camScale = useEasedRange(
    travel,
    [0, 0.12, ARRIVE, 1],
    [0.18, 0.82, 0.82, 0.72],
    [SCRUB_OUT, LINEAR, EASE_IN_OUT],
  )
  // The camera reaches the glass at the end of the run and hands the beam
  // over. Leaving it sitting on top of the prism buries the one moment the
  // whole section has been building to.
  /**
   * The camera peels off before the light reaches the glass.
   *
   * Leaving it parked at the prism while the spectrum fans out of the same
   * point read as an object sitting in the way of the effect. It banks up and
   * out of frame instead, handing the beam over — the light carries on to the
   * glass on its own, which is what the rest of the section has been setting
   * up.
   */
  // An exit: it eases off its line and accelerates away, fading as it goes.
  const camOpacity = useEasedRange(travel, [ARRIVE - 0.2, ARRIVE - 0.06], [1, 0], EASE_IN_OUT)
  const camPeelY = useEasedRange(travel, [ARRIVE - 0.2, ARRIVE], [0, -280], SCRUB_IN)
  const camPeelX = useEasedRange(travel, [ARRIVE - 0.2, ARRIVE], [0, 110], SCRUB_IN)
  const camPeelSpin = useEasedRange(travel, [ARRIVE - 0.2, ARRIVE], [0, -28], SCRUB_IN)
  const camRotate = useTransform(pathT, (t) => sampleAt(samples, t).angle * 0.5)

  // The glass arrives early and waits; the spectrum only opens once the beam
  // has actually reached it.
  const prismIn = useScrollRange(travel, [PRISM_IN, PRISM_IN + 0.12], [0, 1])
  const dispersion = useScrollRange(travel, [ARRIVE, 1], [0, 1])
  const prismPoint = samples.length > 0 ? sampleAt(samples, 1) : null

  const [frameNumber, setFrameNumber] = useState(0)
  useMotionValueEvent(travel, 'change', (t) => {
    const next = Math.round(Math.min(1, Math.max(0, t)) * 240)
    if (next !== frameNumber) setFrameNumber(next)
  })


  return (
    <section
      ref={ref}
      id="work"
      data-ground="void"
      data-channel="work"
      className="relative h-[560svh]"
      aria-labelledby="work-heading"
    >
      {/*
        The stage paints its own black.
        The clapper's veil lives inside that section's sticky, so it rides away
        with it — without a black underneath here, the bone ground showed
        through the seam for the screen's worth of scroll between the slate
        unpinning and the ground blend reaching black.
      */}
      <div ref={stageRef} className="sticky top-0 h-[100svh] overflow-hidden bg-void">

        {/* ---- the track: everything that travels sideways --------------- */}
        <motion.div
          className="absolute top-0 left-0 h-full"
          style={{ width: trackWidth || '100%', x: reduced ? 0 : trackX }}
        >
          {d && (
            <svg
              className="pointer-events-none absolute inset-0 z-[6] h-full w-full"
              viewBox={`0 0 ${trackWidth} ${size.height}`}
              aria-hidden="true"
            >
              <defs>
                <filter id="fringe-blur" x="-5%" y="-30%" width="110%" height="160%">
                  <feGaussianBlur stdDeviation="5" />
                </filter>
                <filter id="beam" x="-5%" y="-40%" width="110%" height="180%">
                  <feGaussianBlur stdDeviation="11" result="wide" />
                  <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="tight" />
                  <feMerge>
                    <feMergeNode in="wide" />
                    <feMergeNode in="tight" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Measured copy. Invisible, exists only to be sampled. */}
              <path ref={pathRef} d={d} fill="none" stroke="none" />

              {length > 0 && (
                <g style={{ mixBlendMode: 'screen' }}>
                  {/* The beam. White, the whole way. */}
                  <motion.path
                    d={d}
                    fill="none"
                    className="stroke-on-void"
                    strokeWidth="4"
                    strokeLinecap="round"
                    filter="url(#beam)"
                    style={{ strokeDasharray: length, strokeDashoffset: reduced ? 0 : dashOffset }}
                  />
                </g>
              )}
            </svg>
          )}

          {/* ---- where the beam meets the glass ------------------------- */}
          {prismPoint && !reduced && (
            <Prism
              x={prismPoint.x}
              y={prismPoint.y}
              reach={size.width * 0.9}
              arrival={prismIn}
              progress={dispersion}
            />
          )}

          {/* ---- work, hung off the beam -------------------------------- */}
          {samples.length > 0 &&
            projects.map((project, index) => (
              <TrailFrame
                key={project._id}
                project={project}
                index={index}
                travel={travel}
                point={sampleAt(samples, project.anchor)}
                stageHeight={size.height}
                cardWidth={cardWidth}
                reduced={reduced}
              />
            ))}

          {/* ---- the camera --------------------------------------------- */}
          {samples.length > 0 && !reduced && (
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute top-0 left-0 z-[7] w-[clamp(5.5rem,11vw,11rem)]"
              style={{
                x: camX,
                y: camY,
                // The path point is the back of the camera — where the light
                // is paid out from — not its centre.
                translateX: '-13%',
                translateY: '-58%',
                scale: camScale,
                rotate: camRotate,
                // A faint spill of the beam's own light on the housing; the
                // line art carries the shape, not a halo.
                filter:
                  'drop-shadow(0 0 14px color-mix(in oklab, var(--color-on-void) 28%, transparent))',
              }}
            >
              <motion.div
                style={{ x: camPeelX, y: camPeelY, rotate: camPeelSpin, opacity: camOpacity }}
              >
                <MovieCamera className="h-auto w-full" />
              </motion.div>
            </motion.div>
          )}
        </motion.div>

        {/* ---- section chrome, fixed to the viewport ------------------- */}
        {/*
          The chapter's head, set as the title of the reel: the heading itself
          in the display face, the years beside it as the reel's folio. No
          label sits over it announcing it.
        */}
        <div className="edge-x pointer-events-none absolute inset-x-0 top-0 z-40 pt-28">
          <div className="rule-b flex items-baseline justify-between gap-6 pb-3 text-on-void-muted">
            <h2
              id="work-heading"
              className="section-head text-on-void"
            >
              {copy.eyebrow}
            </h2>
            <p className="label tabular-nums">{copy.yearRange}</p>
          </div>
        </div>

        {/* the viewfinder's own readouts, along the bottom of the gate */}
        <div className="edge-x pointer-events-none absolute inset-x-0 bottom-0 z-40 pb-6">
          <div className="rule-t grid grid-cols-[1fr_auto_1fr] items-baseline gap-4 pt-3 text-on-void-muted">
            <span className="readout text-signal">{copy.recLabel}</span>
            <span className="readout">
              frame {String(frameNumber).padStart(4, '0')} / 0240
            </span>
            <span className="readout hidden justify-self-end sm:inline">{copy.formatLabel}</span>
          </div>
        </div>
      </div>
    </section>
  )
}


/** The perforation strip down each edge of a 16mm frame. */
function Sprockets() {
  return (
    <div aria-hidden="true" className="flex w-3 shrink-0 flex-col justify-around py-1">
      {Array.from({ length: 6 }, (_, i) => (
        <span key={i} className="h-2 w-full rounded-[1.5px] bg-void" />
      ))}
    </div>
  )
}

/**
 * One frame hanging off the beam.
 *
 * It develops in as the camera reaches its anchor and clears out once the
 * camera is well past, so the eye always has one or two in focus rather than
 * six competing.
 *
 * The frame sits *behind* its anchor — to the left, in the direction the
 * camera has already travelled — rather than centred on it. Centred, the card
 * occupied exactly the spot the camera was passing through and swallowed it.
 * Trailing, it reads correctly as the shot the camera has just taken, and the
 * camera stays clear in front of it.
 */
function TrailFrame({
  project,
  index,
  travel,
  point,
  stageHeight,
  cardWidth,
  reduced,
}: {
  project: Project
  index: number
  travel: MotionValue<number>
  point: PathSample
  stageHeight: number
  cardWidth: number
  reduced: boolean
}) {
  // Wide enough that two frames hold the screen together and a third is on its
  // way in. A narrow window left one card alone in the middle of the frame,
  // which reads as a slideshow rather than as a run of work.
  const beats = ramp([
    project.anchor - 0.13,
    project.anchor - 0.02,
    project.anchor + 0.27,
    project.anchor + 0.37,
  ])
  const [enter, settled] = [beats[0]!, beats[1]!]

  // Develops in on a long deceleration, holds, then falls away on an
  // acceleration: the same curve family as everything else on the site.
  const opacity = useEasedRange(travel, beats, [0, 1, 1, 0], [SCRUB_OUT, LINEAR, SCRUB_IN])
  const scale = useEasedRange(travel, [enter, settled], [0.9, 1], SCRUB_OUT)
  const blur = useEasedRange(travel, [enter, settled], [6, 0], SCRUB_OUT)
  // Dropped entirely once in focus, so a settled frame is not re-filtered.
  const filter = useTransform(blur, (value) => (value < 0.05 ? 'none' : `blur(${value.toFixed(2)}px)`))

  /**
   * Which side of the beam the card hangs off follows the wave, not the CMS.
   *
   * A card is taller than half the stage, so one pinned above a crest cannot
   * fit between the beam and the header — the clamp drags it back down onto
   * the beam and the light cuts straight through the artwork. Hanging cards
   * off whichever side has room means the clamp almost never binds, and the
   * beam stays clear of everything.
   *
   * `project.side` still decides the tie when the beam is near the middle, so
   * the field is not dead weight in the Studio.
   */
  const cardHeight = cardWidth * 0.625 + 176
  const NUDGE = 0.14
  const middle = stageHeight * 0.5
  const nearMiddle = Math.abs(point.y - middle) < stageHeight * 0.08
  const above = nearMiddle ? project.side === 'above' : point.y > middle

  const top = above
    ? Math.max(point.y, TOP_PAD + cardHeight * (1 + NUDGE))
    : Math.min(point.y, stageHeight - BOTTOM_PAD - cardHeight * (1 + NUDGE))

  return (
    <motion.article
      className="absolute top-0 left-0 z-20"
      style={{
        width: cardWidth,
        x: point.x,
        y: top,
        translateX: `calc(-100% - ${CARD_GUTTER}px)`,
        translateY: above ? '-114%' : '14%',
        ...(reduced ? {} : { opacity, scale, filter }),
      }}
    >
      {/* the connector, running from the frame's leading edge back to the beam */}
      <span
        aria-hidden="true"
        className={`absolute right-6 h-7 w-px bg-gradient-to-b from-transparent to-on-void/60 ${
          above ? 'top-full' : 'bottom-full rotate-180'
        }`}
      />

      <div className="rounded-[2px] bg-void-2 shadow-lift ring-1 ring-on-void/15">
        {/* the frame, with the sprocket strips a 16mm frame actually has */}
        <div className="flex items-stretch gap-1 rounded-t-[2px] bg-void-3 p-1">
          <Sprockets />
          <div className="relative flex-1 overflow-hidden">
            <div className="relative aspect-[16/10]">
              {project.imageUrl ? (
                <Image
                  src={project.imageUrl}
                  alt={`${project.title} for ${project.client}`}
                  fill
                  sizes="(max-width: 768px) 62vw, 19rem"
                  className="object-cover"
                />
              ) : (
                <ProjectPlate
                  plate={project.plate}
                  label={project.title}
                  client={project.client}
                  year={project.year}
                  discipline={project.discipline}
                />
              )}
            </div>
          </div>
          <Sprockets />
        </div>

        {/* the caption, set like a can label */}
        <div className="px-3.5 pt-2.5 pb-3.5">
          <div className="flex items-baseline justify-between gap-3 border-b border-on-void/12 pb-2 text-on-void-muted">
            <span className="readout">roll {String(index + 1).padStart(2, '0')}</span>
            <span className="readout">{project.year}</span>
          </div>

          <h3 className="mt-2.5 font-display text-[1.125rem] leading-tight font-semibold tracking-[-0.015em] text-on-void">
            {project.title}
          </h3>
          <p className="label mt-1 flex items-center gap-2.5">
            <span className="text-on-void">{project.client}</span>
            <span aria-hidden="true" className="h-3 w-px bg-on-void/25" />
            <span className="text-dos-cyan">{project.discipline}</span>
          </p>
          <p className="mt-2 text-sm leading-normal text-on-void-muted">{project.blurb}</p>
        </div>
      </div>
    </motion.article>
  )
}
