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
 * The Qublox mark, displayed by the television rather than placed inside it.
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
      <ChannelFilters />

      {reduced ? (
        <Plate className="h-full w-full object-contain" />
      ) : (
        <>
          {/* Colour channels. Screen blend is additive, so where all four
              overlap the mark returns to white. */}
          {CHANNELS.map((channel) => (
            <ChannelLayer key={channel.id} {...channel} tear={tear} />
          ))}

          {/* Torn slices of the white master, each sliding at its own rate */}
          {SLICES.map((slice, index) => (
            <SliceLayer key={index} {...slice} tear={tear} />
          ))}

          {/* The crisp master on top. The channels supply the fringe and the
              bloom; this is what keeps the mark legible. */}
          <Plate
            className="absolute inset-0 h-full w-full object-contain opacity-95"
            style={{ filter: 'url(#crt-white)' }}
          />
        </>
      )}

      {/* Bloom */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 blur-3xl"
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
}: {
  id: string
  color: string
  base: number
  factor: number
  tear: MotionValue<number>
}) {
  const x = useTransform(tear, (v) => base + v * factor)
  return (
    <motion.div className="absolute inset-0 opacity-90 mix-blend-screen" style={{ x }}>
      <Plate
        className="h-full w-full object-contain"
        style={{ filter: `url(#crt-${id}) drop-shadow(0 0 3px ${color})` }}
      />
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
      className="absolute inset-0 opacity-55 mix-blend-screen"
      style={{ clipPath: `inset(${top}% 0 ${bottom}% 0)`, x }}
    >
      <Plate className="h-full w-full object-contain" style={{ filter: 'url(#crt-white)' }} />
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
