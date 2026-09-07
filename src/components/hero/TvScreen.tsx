'use client'

import Image from 'next/image'
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

/**
 * What the television is showing, and the tube it is showing it on.
 *
 * This renders the supplied artwork — `public/brand/qublox-logo.jpg` — and
 * puts the tube's faults on top of it. An earlier pass redrew the mark as
 * vectors so the colour channels could be separated, and the redraw was never
 * going to be right: the Q's bowl, the U's stem and the vertical BLOX. all
 * carry proportions that only the original file has. Filtering the real file
 * gets both.
 *
 * Channel separation on a raster is done with feColorMatrix rather than by
 * redrawing: the logo is white on near-black, so mapping luminance onto both a
 * single colour and the alpha gives a clean per-channel copy of the exact
 * artwork, cut out of its own background. Four of
 * those are screen-blended and pulled apart; six horizontal slices of the
 * white master are torn sideways over them. Both are driven by scroll
 * velocity, so the picture holds steady when you stop and shreds when you
 * move — a badly converged tube, which is the point.
 *
 * The same machinery carries the channel changes: `glitch` adds into the tear,
 * so switching channel shreds the picture exactly the way scrolling does
 * rather than needing an effect of its own. A word and the logo go through
 * identical layers — a channel copy of a word is just the word in that colour,
 * where a channel copy of the artwork needs the luminance filter, so only the
 * innermost content differs.
 */

const CHANNELS = [
  { id: 'red', color: '#ff3b30', base: -5, factor: -1 },
  { id: 'blue', color: '#2f6bff', base: 5, factor: 1 },
  { id: 'yellow', color: '#ffd23f', base: -2.4, factor: -0.45 },
  { id: 'green', color: '#3bffa8', base: 2.6, factor: 0.55 },
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

const ART = {
  src: '/brand/qublox-logo.jpg',
  width: 1080,
  height: 1080,
}

function Plate({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <Image
      src={ART.src}
      alt=""
      width={ART.width}
      height={ART.height}
      priority
      className={className}
      style={style}
      draggable={false}
    />
  )
}

/**
 * How wide a character runs at font-size 100 in the display face, measured
 * rather than guessed: uppercase Archivo at weight 800 and width 112 advances
 * 72–79px per character, so 79 is the worst case and the one to size against.
 */
const ADVANCE = 0.79
/** Share of the screen's width the type may occupy. */
const FILL = 0.88
/** Ceiling, so a three-letter word does not become a wall. */
const MAX_CQW = 17

/**
 * Size the broadcast so the longest word in it just fits across the tube.
 *
 * Sized against the whole phrase instead, a two-word entry came out far
 * smaller than a one-word entry and the set looked like it was changing type
 * size rather than channel. Phrases wrap at their spaces, so the line that has
 * to fit is the longest single token — which keeps every channel within a
 * reasonable size of every other.
 */
function fitCqw(word: string): number {
  const longest = word.split(/\s+/).reduce((n, token) => Math.max(n, token.length), 1)
  return Math.min(MAX_CQW, (FILL * 100) / (ADVANCE * longest))
}

/**
 * One colour copy of whatever is on air.
 *
 * `tint` is the channel's own id for the logo — which needs the luminance
 * filter to become a single-colour copy of the artwork — and a plain colour
 * for a word, which can simply be set in it.
 */
function OnAir({
  word,
  tintId,
  color,
}: {
  word: string | null
  tintId: string
  color: string
}) {
  if (word === null) {
    return (
      <Plate
        className="h-full w-full object-contain"
        style={{
          filter:
            tintId === 'white' ? 'url(#crt-white)' : `url(#crt-${tintId}) drop-shadow(0 0 3px ${color})`,
        }}
      />
    )
  }

  return (
    <div className="grid h-full w-full place-items-center px-[6%]">
      <span
        className="display text-center leading-[0.86]"
        style={{
          color,
          /**
           * Sized against the screen itself rather than the viewport, so the
           * word fills the tube identically at every breakpoint. See fitCqw.
           */
          fontSize: `${fitCqw(word).toFixed(2)}cqw`,
          ['--wdth' as string]: 112,
          textShadow: tintId === 'white' ? '0 0 14px rgba(255,255,255,0.5)' : `0 0 10px ${color}`,
        }}
      >
        {word}
      </span>
    </div>
  )
}

export function TvScreen({
  word,
  powered,
  glitch,
}: {
  /** `null` broadcasts the logo; a string broadcasts that word. */
  word: string | null
  powered: boolean
  glitch: MotionValue<number>
}) {
  const reduced = useReducedMotion()
  const { scrollY } = useScroll()
  const velocity = useVelocity(scrollY)

  // Velocity is spiky; a spring turns it into something that can drive pixels.
  const smoothed = useSpring(velocity, { stiffness: 260, damping: 42, mass: 0.4 })
  const split = useTransform(smoothed, [-2600, 0, 2600], [-16, 0, 16], { clamp: true })

  // A slow idle drift, so the set is never perfectly still even at rest, plus
  // whatever a channel change is currently throwing into the picture.
  const idle = useMotionValue(0)
  const tear = useTransform(
    [split, idle, glitch],
    ([s, i, g]: number[]) => (s ?? 0) + (i ?? 0) + (g ?? 0) * 42,
  )

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
    <div className="relative h-full w-full" style={{ containerType: 'inline-size' }}>
      <ChannelFilters />

      {/*
        Switching off is a tube losing its supply, not a light going out: the
        picture collapses to a horizontal line and the line fades. Scaling Y to
        near-zero and briefly overshooting X is the whole trick.
      */}
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={
          powered
            ? { scaleY: 1, scaleX: 1, opacity: 1 }
            : { scaleY: 0.004, scaleX: 1.06, opacity: 0 }
        }
        transition={
          powered
            ? { duration: 0.34, ease: [0.16, 1, 0.3, 1] }
            : { scaleY: { duration: 0.16, ease: [0.7, 0, 0.84, 0] }, scaleX: { duration: 0.12 }, opacity: { duration: 0.34, delay: 0.1 } }
        }
      >

      {reduced ? (
        <OnAir word={word} tintId="white" color="#ffffff" />
      ) : (
        <>
          {/* Colour channels. Screen blend is additive, so where all four
              overlap the picture returns to white. */}
          {CHANNELS.map((channel) => (
            <ChannelLayer key={channel.id} {...channel} tear={tear} word={word} />
          ))}

          {/* Torn slices of the white master, each sliding at its own rate */}
          {SLICES.map((slice, index) => (
            <SliceLayer key={index} {...slice} tear={tear} word={word} />
          ))}

          {/* The crisp master on top. The channels supply the fringe and the
              bloom; this is what keeps the picture legible. */}
          <div className="absolute inset-0 opacity-95">
            <OnAir word={word} tintId="white" color="#ffffff" />
          </div>
        </>
      )}

      </motion.div>

      {/* Bloom, which dies with the picture. */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 blur-3xl"
        initial={false}
        animate={{ opacity: powered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{
          background:
            'radial-gradient(closest-side, rgba(59,255,168,0.22), rgba(47,107,255,0.1) 55%, transparent 74%)',
        }}
      />
    </div>
  )
}

function ChannelLayer({
  id,
  color,
  base,
  factor,
  tear,
  word,
}: {
  id: string
  color: string
  base: number
  factor: number
  tear: MotionValue<number>
  word: string | null
}) {
  const x = useTransform(tear, (v) => base + v * factor)
  return (
    <motion.div className="absolute inset-0 opacity-90 mix-blend-screen" style={{ x }}>
      <OnAir word={word} tintId={id} color={color} />
    </motion.div>
  )
}

function SliceLayer({
  top,
  bottom,
  drift,
  tear,
  word,
}: {
  top: number
  bottom: number
  drift: number
  tear: MotionValue<number>
  word: string | null
}) {
  const x = useTransform(tear, (v) => v * drift * 0.6)
  return (
    <motion.div
      className="absolute inset-0 opacity-55 mix-blend-screen"
      style={{ clipPath: `inset(${top}% 0 ${bottom}% 0)`, x }}
    >
      <OnAir word={word} tintId="white" color="#ffffff" />
    </motion.div>
  )
}

/**
 * One filter per channel.
 *
 * `feComponentTransfer` first crushes the artwork's near-black ground to true
 * black, so screen blending does not lift the tube's own black. The matrix
 * then maps the source's luminance — carried equally in R, G and B on a
 * greyscale plate — onto a single tint, which gives a clean channel copy of
 * the real artwork rather than a redrawn approximation of it.
 */
function ChannelFilters() {
  return (
    <svg aria-hidden="true" className="absolute h-0 w-0" focusable="false">
      <defs>
        {[...CHANNELS, { id: 'white', color: '#ffffff' }].map((channel) => {
          const [r, g, b] = hexToUnit(channel.color)
          return (
            <filter key={channel.id} id={`crt-${channel.id}`} colorInterpolationFilters="sRGB">
              <feComponentTransfer>
                <feFuncR type="linear" slope="1.3" intercept="-0.09" />
                <feFuncG type="linear" slope="1.3" intercept="-0.09" />
                <feFuncB type="linear" slope="1.3" intercept="-0.09" />
              </feComponentTransfer>
              {/*
                The alpha row takes luminance too, so the plate comes out as
                the mark on transparency rather than the mark on an opaque
                black rectangle. That matters twice over: the drop-shadow glow
                then follows the letterforms instead of outlining the image's
                bounding box, and screen blending has nothing to lift.
              */}
              <feColorMatrix
                type="matrix"
                values={`${r} 0 0 0 0  ${g} 0 0 0 0  ${b} 0 0 0 0  1 0 0 0 0`}
              />
            </filter>
          )
        })}
      </defs>
    </svg>
  )
}

function hexToUnit(hex: string): [number, number, number] {
  const value = hex.replace('#', '')
  return [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16) / 255) as [number, number, number]
}
