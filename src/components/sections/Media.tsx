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
import { useTrailPath } from '@/components/media/useTrailPath'
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
const TOP_PAD = 120
const BOTTOM_PAD = 88
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

  // Path position, which the camera and the beam's drawn length both read.
  const pathT = useScrollRange(travel, [0, ARRIVE], [0, 1])
  const dashOffset = useScrollRange(travel, [0, ARRIVE], [length, 0])

  // The track slides so the camera holds its place on screen. Clamped at both
  // ends so the first and last stretch of path are reachable.
  const trackX = useTransform(pathT, (t) => {
    const camera = sampleAt(samples, t).x
    const wanted = -(camera - size.width * CAMERA_HOLD)
    return Math.min(0, Math.max(-(trackWidth - size.width), wanted))
  })

  const camX = useTransform(pathT, (t) => sampleAt(samples, t).x)
  const camY = useTransform(pathT, (t) => sampleAt(samples, t).y)
  const camScale = useScrollRange(travel, [0, 0.12, ARRIVE, 1], [0.18, 0.82, 0.82, 0.72])
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
  const camOpacity = useScrollRange(travel, [ARRIVE - 0.2, ARRIVE - 0.06], [1, 0])
  const camPeelY = useScrollRange(travel, [ARRIVE - 0.2, ARRIVE], [0, -280])
  const camPeelX = useScrollRange(travel, [ARRIVE - 0.2, ARRIVE], [0, 110])
  const camPeelSpin = useScrollRange(travel, [ARRIVE - 0.2, ARRIVE], [0, -28])
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

  const cardWidth = Math.min(size.width * 0.66, CARD_MAX)

  return (
    <section
      ref={ref}
      id="work"
      data-ground="void"
      data-channel="work"
      className="relative h-[560vh]"
      aria-labelledby="work-heading"
    >
      <div ref={stageRef} className="sticky top-0 h-[100svh] overflow-hidden">
        <h2 id="work-heading" className="sr-only">
          Selected work
        </h2>

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
                    stroke="#ffffff"
                    strokeWidth="4.5"
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
                filter: 'drop-shadow(0 0 30px rgba(255,255,255,0.5))',
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
        <div className="edge-x pointer-events-none absolute inset-x-0 top-0 z-40 pt-24">
          <div className="rule-b flex items-baseline justify-between pb-3 text-bone/45">
            <span className="label">{copy.eyebrow}</span>
            <span className="label">{copy.yearRange}</span>
          </div>
        </div>

        <div className="edge-x pointer-events-none absolute inset-x-0 bottom-0 z-40 pb-6">
          <div className="rule-t flex items-baseline justify-between pt-3 text-bone/45">
            <span className="label">
              <span className="text-signal">●</span> {copy.recLabel}
            </span>
            <span className="label tabular-nums">
              FRAME {String(frameNumber).padStart(4, '0')} / 0240
            </span>
            <span className="label hidden sm:inline">{copy.formatLabel}</span>
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
        <span key={i} className="h-2 w-full rounded-[1px] bg-[#26282c]" />
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

  const opacity = useScrollRange(travel, beats, [0, 1, 1, 0])
  const scale = useScrollRange(travel, [enter, settled], [0.84, 1])
  const blur = useScrollRange(travel, [enter, settled], [9, 0])
  const filter = useTransform(blur, (value) => `blur(${value}px)`)

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
        translateX: 'calc(-100% - 1.5rem)',
        translateY: above ? '-114%' : '14%',
        ...(reduced ? {} : { opacity, scale, filter }),
      }}
    >
      {/* the connector, running from the frame's leading edge back to the beam */}
      <span
        aria-hidden="true"
        className={`absolute right-6 h-7 w-px bg-gradient-to-b from-transparent to-white/70 ${
          above ? 'top-full' : 'bottom-full rotate-180'
        }`}
      />

      <div className="bg-[#07080a] shadow-[0_0_0_1px_rgba(242,241,236,0.22),0_30px_70px_-28px_rgba(0,0,0,1)]">
        {/* the frame, with the sprocket strips a 16mm frame actually has */}
        <div className="flex items-stretch gap-1 bg-[#0d0e11] p-1">
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
                <ProjectPlate plate={project.plate} label={project.title} />
              )}
            </div>
          </div>
          <Sprockets />
        </div>

        {/* the caption, set like a can label */}
        <div className="px-3 pt-2.5 pb-3">
          <div className="flex items-baseline justify-between gap-3 border-b border-white/12 pb-1.5">
            <span className="label text-white/40 tabular-nums">
              ROLL {String(index + 1).padStart(2, '0')}
            </span>
            <span className="label text-white/40">{project.year}</span>
          </div>

          <h3 className="mt-2.5 text-[1.05rem] leading-tight font-medium tracking-[-0.015em] text-bone">
            {project.title}
          </h3>
          <p className="label mt-1 text-dos-cyan/85">
            {project.client} · {project.discipline}
          </p>
          <p className="mt-2 text-[0.8rem] leading-[1.6] text-bone/55">{project.blurb}</p>
        </div>
      </div>
    </motion.article>
  )
}
