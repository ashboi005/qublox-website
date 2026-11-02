'use client'

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  type MotionValue,
  type TargetAndTransition,
  type Variants,
} from 'motion/react'
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Splat } from './Splat'
import { useReducedMotion } from '@/lib/useReducedMotion'
import type { CommunityEvent } from '@/types/content'

/**
 * An event, opened as an issue of a retro magazine.
 *
 * The layouts are templates, not artwork: every page is composed from the
 * event's own fields, and the palette and cover arrangement rotate with the
 * event's position so no two issues on the rack look like reprints. Adding an
 * event in the studio adds an issue — nothing to design by hand.
 *
 * Pages turn on the left edge like paper. Arrow keys, the wheel, a swipe or
 * the page buttons all turn them; Escape closes the issue.
 */

type Swatch = 'paper' | 'ink' | 'a' | 'b' | 'c' | 'd'

export type Palette = {
  paper: string
  ink: string
  a: string
  b: string
  c: string
  d: string
  /** The coloured ink that holds 4.5:1 on this stock: small coloured text. */
  accent: string
  /** The coloured ink for big type: the masthead, the stamp (3:1 or better). */
  headline: string
  /** The pale plate: stickers, pull quotes, the second-plate offset. */
  light: string
  /** The spine of the back issue, and the ink that reads on it. */
  spine: string
  onSpine: string
  /** The three particulars, each a swatch with the ink that reads on it. */
  rows: { bg: string; fg: string }[]
}

const swatch = (n: number, key: Swatch) => `var(--color-mag-${n}-${key})`

/**
 * One issue's stock and inks. Every pairing below was measured: a swatch only
 * carries small text in the ink that clears 4.5:1 on it, which is why the
 * spine and the particulars pick their fills per issue instead of by slot.
 */
function issue(
  n: number,
  pick: {
    accent: Swatch
    headline: Swatch
    light: Swatch
    spine: [Swatch, Swatch]
    rows: [Swatch, Swatch][]
  },
): Palette {
  return {
    paper: swatch(n, 'paper'),
    ink: swatch(n, 'ink'),
    a: swatch(n, 'a'),
    b: swatch(n, 'b'),
    c: swatch(n, 'c'),
    d: swatch(n, 'd'),
    accent: swatch(n, pick.accent),
    headline: swatch(n, pick.headline),
    light: swatch(n, pick.light),
    spine: swatch(n, pick.spine[0]),
    onSpine: swatch(n, pick.spine[1]),
    rows: pick.rows.map(([bg, fg]) => ({ bg: swatch(n, bg), fg: swatch(n, fg) })),
  }
}

/** Lifted from the 70s supergraphic plates: cream stock, four warm inks. */
export const PALETTES: Palette[] = [
  issue(1, {
    accent: 'c',
    headline: 'c',
    light: 'b',
    spine: ['c', 'paper'],
    rows: [['c', 'paper'], ['b', 'ink'], ['ink', 'paper']],
  }),
  issue(2, {
    accent: 'c',
    headline: 'c',
    light: 'b',
    spine: ['a', 'ink'],
    rows: [['a', 'ink'], ['d', 'ink'], ['c', 'paper']],
  }),
  issue(3, {
    accent: 'a',
    headline: 'c',
    light: 'b',
    spine: ['a', 'paper'],
    rows: [['a', 'paper'], ['b', 'ink'], ['ink', 'paper']],
  }),
  issue(4, {
    accent: 'b',
    headline: 'a',
    light: 'c',
    spine: ['c', 'ink'],
    rows: [['c', 'ink'], ['b', 'paper'], ['ink', 'paper']],
  }),
]

export function paletteFor(index: number) {
  return PALETTES[index % PALETTES.length]!
}

/** A quieter step of the issue's ink, mixed with its own stock (≈9:1). */
export function softInk(palette: Palette, amount = 78) {
  return `color-mix(in oklab, ${palette.ink} ${amount}%, ${palette.paper})`
}

/** The second plate, printed a hair out of register. */
export function misregister(palette: Palette, offset = 0.04) {
  return `${offset}em ${offset * 0.85}em 0 ${palette.light}`
}

/**
 * The global focus style rounds every ring to 2px, and it sits outside the
 * utility layer, so a pill's own radius has to be set inline to keep its
 * ring a pill.
 */
const PILL: CSSProperties = { borderRadius: 'var(--radius-pill)' }

function paragraphs(event: CommunityEvent) {
  return (event.story ?? event.blurb).split(/\n\s*\n/).filter(Boolean)
}

const PAGE_COUNT = 3

/** A turn: long enough to watch the paper go over, short enough to read on. */
const TURN = 0.82
const TURN_EASE: [number, number, number, number] = [0.65, 0, 0.35, 1]
const ARRIVE: [number, number, number, number] = [0.16, 1, 0.3, 1]
const LEAVE: [number, number, number, number] = [0.7, 0, 0.84, 0]
/** How far over a page goes before it is gone: past upright, never flat. */
const FAR = -118

export function ErisedMagazine({
  event,
  index,
  onClose,
}: {
  event: CommunityEvent
  index: number
  onClose: () => void
}) {
  const [[page, direction], setPage] = useState<[number, number]>([0, 1])
  const lastWheel = useRef(0)
  const closeRef = useRef<HTMLButtonElement>(null)
  const palette = paletteFor(index)
  const reduced = useReducedMotion()
  // The angle of whichever leaf is in the air, so the one under it can take
  // its shadow.
  const lift = useMotionValue(0)

  const turn = useCallback((delta: number) => {
    setPage(([current]) => {
      const next = Math.min(PAGE_COUNT - 1, Math.max(0, current + delta))
      return next === current ? [current, delta] : [next, delta]
    })
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowRight') turn(1)
      if (event.key === 'ArrowLeft') turn(-1)
    }
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKey)
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = overflow
      document.removeEventListener('keydown', onKey)
    }
  }, [onClose, turn])

  // One turn per gesture: a trackpad fires dozens of wheel events per swipe.
  const onWheel = (event: React.WheelEvent) => {
    const now = performance.now()
    if (Math.abs(event.deltaY) + Math.abs(event.deltaX) < 12 || now - lastWheel.current < 650) return
    lastWheel.current = now
    turn((Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY) > 0 ? 1 : -1)
  }

  const pages = [Cover, Feature, Particulars]
  const Page = pages[page]!

  return (
    <motion.div
      className="fixed inset-0 z-[150] flex flex-col items-center justify-center gap-5 bg-erised-ink/85 px-4 py-6 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.32, ease: ARRIVE } }}
      exit={{ opacity: 0, transition: { duration: 0.24, ease: LEAVE } }}
      onClick={onClose}
      onWheel={onWheel}
      data-lenis-prevent
      role="dialog"
      aria-modal="true"
      aria-label={`${event.title}, ERISED issue`}
    >
      <motion.div
        className="relative h-[min(76svh,42rem)] w-[calc(100vw-2rem)] sm:aspect-[3/4] sm:h-[min(82svh,calc((100vw-2rem)*4/3))] sm:w-auto"
        style={{ perspective: '2400px' }}
        onClick={(e) => e.stopPropagation()}
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: ARRIVE } }}
        exit={reduced ? { opacity: 0 } : { opacity: 0, y: 14, transition: { duration: 0.22, ease: LEAVE } }}
      >
        {/* the rest of the issue, under the page being turned */}
        <div
          className="absolute inset-0 translate-x-[5px] translate-y-[5px] rounded-[3px]"
          style={{
            background: `color-mix(in oklab, ${palette.paper} 84%, ${palette.ink})`,
            boxShadow: '0 40px 90px -30px color-mix(in oklab, var(--color-void) 85%, transparent)',
          }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 translate-x-[2.5px] translate-y-[2.5px] rounded-[3px]"
          style={{ background: `color-mix(in oklab, ${palette.paper} 93%, ${palette.ink})` }}
          aria-hidden="true"
        />
        <AnimatePresence initial={false} custom={direction}>
          <Leaf
            key={page}
            direction={direction}
            palette={palette}
            reduced={reduced}
            lift={lift}
            onSwipe={turn}
          >
            <Page event={event} index={index} palette={palette} />
          </Leaf>
        </AnimatePresence>
      </motion.div>

      <div
        className="flex items-center gap-2 text-sm font-medium"
        style={{ color: palette.paper, '--color-focus': palette.paper } as CSSProperties}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => turn(-1)}
          disabled={page === 0}
          className="grid size-11 place-items-center rounded-full border transition-opacity duration-[var(--dur-short)] ease-out disabled:opacity-30"
          style={{ ...PILL, borderColor: `color-mix(in oklab, ${palette.paper} 60%, transparent)` }}
          aria-label="Previous page"
        >
          <Chevron flip />
        </button>
        <span aria-live="polite" className="min-w-[7.5rem] text-center tabular-nums">
          Page {page + 1} of {PAGE_COUNT}
        </span>
        <button
          type="button"
          onClick={() => turn(1)}
          disabled={page === PAGE_COUNT - 1}
          className="grid size-11 place-items-center rounded-full border transition-opacity duration-[var(--dur-short)] ease-out disabled:opacity-30"
          style={{ ...PILL, borderColor: `color-mix(in oklab, ${palette.paper} 60%, transparent)` }}
          aria-label="Next page"
        >
          <Chevron />
        </button>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="ml-4 inline-flex h-11 items-center gap-2.5 rounded-full border px-5"
          style={{ ...PILL, borderColor: `color-mix(in oklab, ${palette.paper} 60%, transparent)` }}
        >
          Close
          <svg viewBox="0 0 12 12" className="size-3" aria-hidden="true">
            <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </motion.div>
  )
}

function Chevron({ flip }: { flip?: boolean }) {
  return (
    <svg viewBox="0 0 16 16" className={`size-4 ${flip ? 'rotate-180' : ''}`} aria-hidden="true">
      <path
        d="M3 8h9.5M8.5 3.5 13 8l-4.5 4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * One sheet of the issue.
 *
 * A page that turns forward lifts off the left edge, goes past upright to
 * show its blank reverse, and is gone just before it would lie flat; a page
 * that turns back comes down the same way. The sheet is two faces in 3D, so
 * past ninety degrees you see the back of the paper, not the front mirrored.
 * Light runs with the angle: the face darkens as it tips away, and the page
 * underneath sits in the lifting sheet's shadow until it clears.
 *
 * The leaf that stays put during a turn holds for the full turn too, so the
 * stack under it never shows through mid-gesture.
 */
function Leaf({
  direction,
  palette,
  reduced,
  lift,
  onSwipe,
  children,
}: {
  direction: number
  palette: Palette
  reduced: boolean
  lift: MotionValue<number>
  onSwipe: (delta: number) => void
  children: ReactNode
}) {
  const rot = useMotionValue(0)
  useMotionValueEvent(rot, 'change', (v) => lift.set(v))

  // The sheet is fully there until it is nearly over, and gone at the end of
  // its travel, whichever way it is going.
  const sheet = useTransform(rot, [FAR, FAR * 0.8, 0], [0, 1, 1])
  // The face tipping away from the light.
  const faceShade = useTransform(rot, [FAR, -90, -40, 0], [0.5, 0.42, 0.16, 0])
  // The reverse catches less light the further over it goes.
  const backShade = useTransform(rot, [FAR, -90], [0.18, 0.4])
  // The shadow a lifting sheet casts on the one beneath: deepest while it
  // still hangs low over the page, gone once it stands clear or lands.
  const cast = useTransform([lift, rot] as MotionValue<number>[], ([l, r]: number[]) => {
    if (r !== 0) return 0
    const a = Math.abs(l!)
    if (a <= 0) return 0
    if (a < 24) return (a / 24) * 0.38
    return Math.max(0, 0.38 * (1 - (a - 24) / 80))
  })

  const variants: Variants = reduced
    ? {
        enter: { opacity: 0, zIndex: 2 },
        center: { opacity: 1, zIndex: 1, transition: { duration: 0.24, ease: ARRIVE } },
        exit: { opacity: 0, zIndex: 0, transition: { duration: 0.24, ease: LEAVE } },
      }
    : {
        // Opacity never animates on the leaf itself: Chrome flattens a
        // preserve-3d element while an opacity animation runs on it, and the
        // reverse of the sheet turns back into the front, mirrored. The fade
        // lives on the faces, driven by the angle (see `sheet`).
        enter: (d: number) => (d > 0 ? { rotateY: 0, zIndex: 0 } : { rotateY: FAR, zIndex: 2 }),
        center: {
          rotateY: 0,
          zIndex: 1,
          transition: { rotateY: { duration: TURN, ease: TURN_EASE }, zIndex: { duration: 0 } },
        },
        exit: (d: number): TargetAndTransition =>
          d > 0
            ? {
                rotateY: FAR,
                zIndex: 2,
                transition: { rotateY: { duration: TURN, ease: TURN_EASE }, zIndex: { duration: 0 } },
              }
            : {
                // The sheet that stays put holds for the whole turn. Motion
                // finishes a tween between equal values at once, so the hold
                // is a throwaway variable that actually moves.
                '--hold': 1,
                zIndex: 0,
                transition: { '--hold': { duration: TURN, ease: 'linear' }, zIndex: { duration: 0 } },
              },
      }

  // Both faces carry their own 3D transform: Chrome only culls the back of a
  // face that is itself transformed, so the front needs its rotateY(0).
  const face: CSSProperties = { backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }

  return (
    <motion.div
      custom={direction}
      className="absolute inset-0"
      style={{ rotateY: rot, transformOrigin: 'left center', transformStyle: 'preserve-3d', ['--hold' as string]: 0 }}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.15}
      onDragEnd={(_, info) => {
        if (info.offset.x < -60) onSwipe(1)
        else if (info.offset.x > 60) onSwipe(-1)
      }}
    >
      {/* the front of the sheet */}
      <motion.div
        className="absolute inset-0 overflow-hidden rounded-[3px]"
        style={{ ...face, opacity: sheet, transform: 'rotateY(0deg)', background: palette.paper, color: palette.ink }}
      >
        {children}
        {/* paper: a little tooth, the gutter, and the light */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.22] mix-blend-multiply"
          style={{ backgroundImage: 'var(--grain-url)', backgroundSize: '180px 180px' }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-[9%]"
          style={{
            background: `linear-gradient(to right, color-mix(in oklab, ${palette.ink} 22%, transparent), color-mix(in oklab, ${palette.ink} 6%, transparent) 40%, transparent)`,
          }}
          aria-hidden="true"
        />
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: cast,
            background: `linear-gradient(to right, color-mix(in oklab, ${palette.ink} 70%, transparent), color-mix(in oklab, ${palette.ink} 20%, transparent) 45%, transparent 85%)`,
          }}
          aria-hidden="true"
        />
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: faceShade,
            background: `linear-gradient(to left, color-mix(in oklab, ${palette.ink} 75%, transparent), color-mix(in oklab, ${palette.ink} 25%, transparent) 60%, transparent)`,
          }}
          aria-hidden="true"
        />
      </motion.div>

      {/* the reverse: blank stock, shaded as it goes over */}
      <motion.div
        className="absolute inset-0 overflow-hidden rounded-[3px]"
        style={{ ...face, opacity: sheet, transform: 'rotateY(180deg)', background: palette.paper }}
        aria-hidden="true"
      >
        <div
          className="absolute inset-0 opacity-[0.22] mix-blend-multiply"
          style={{ backgroundImage: 'var(--grain-url)', backgroundSize: '180px 180px' }}
        />
        <motion.div
          className="absolute inset-0"
          style={{
            opacity: backShade,
            background: `linear-gradient(to left, color-mix(in oklab, ${palette.ink} 55%, transparent), transparent 70%)`,
          }}
        />
      </motion.div>
    </motion.div>
  )
}

type PageProps = { event: CommunityEvent; index: number; palette: Palette }

/** Concentric 70s arcs — the supergraphic every reference page leans on. */
export function Rainbow({ palette, className }: { palette: Palette; className?: string }) {
  const bands = [palette.c, palette.a, palette.b, palette.d]
  return (
    <svg viewBox="0 0 200 104" className={className} aria-hidden="true">
      {/* the key plate, a hair out of register under the colour */}
      <path
        d="M 11 102 A 89 89 0 0 1 189 102"
        fill="none"
        style={{ stroke: palette.ink }}
        strokeWidth={1.4}
        transform="translate(1.6 1.2)"
        opacity={0.55}
      />
      {bands.map((color, i) => (
        <path
          key={i}
          d={`M ${10 + i * 18} 102 A ${90 - i * 18} ${90 - i * 18} 0 0 1 ${190 - i * 18} 102`}
          fill="none"
          style={{ stroke: color, mixBlendMode: 'multiply' }}
          strokeWidth={14.5}
        />
      ))}
    </svg>
  )
}

/** Halftone: the riso's way of printing a tint, one dot at a time. */
function Halftone({ color, className, style }: { color: string; className?: string; style?: CSSProperties }) {
  return (
    <div
      className={`pointer-events-none absolute ${className ?? ''}`}
      style={{
        backgroundImage: `radial-gradient(${color} 1.1px, transparent 1.5px)`,
        backgroundSize: '6px 6px',
        maskImage: 'radial-gradient(closest-side, var(--color-ink) 35%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(closest-side, var(--color-ink) 35%, transparent 100%)',
        mixBlendMode: 'multiply',
        ...style,
      }}
      aria-hidden="true"
    />
  )
}

export function Stripes({ palette, weight = 5 }: { palette: Palette; weight?: number }) {
  return (
    <div className="flex flex-col gap-[3px]" aria-hidden="true">
      {[palette.c, palette.a, palette.b, palette.d].map((color, i) => (
        <span key={i} className="block" style={{ background: color, height: weight }} />
      ))}
    </div>
  )
}

function Folio({ event, page, palette }: { event: CommunityEvent; page: number; palette: Palette }) {
  return (
    <div
      className="absolute inset-x-[6%] bottom-[3.5%] flex items-center justify-between border-t pt-2 text-xs font-medium"
      style={{ borderColor: palette.ink }}
    >
      <span className="flex items-baseline gap-3">
        <span className="font-round font-bold">ERISED</span>
        <span>{event.kind}</span>
      </span>
      <span className="tabular-nums">Page {page}</span>
    </div>
  )
}

function Cover({ event, index, palette }: PageProps) {
  const flipped = index % 2 === 1
  return (
    <div className="absolute inset-0 flex flex-col p-[6%]">
      <h2
        className="font-round leading-[0.78] font-bold tracking-[-0.04em]"
        style={{ fontSize: 'clamp(3rem, 11svh, 7rem)', color: palette.headline, textShadow: misregister(palette) }}
      >
        ERISED
      </h2>
      <div className="mt-3">
        <Stripes palette={palette} />
      </div>
      {/* the masthead line, under the nameplate where a real one sits */}
      <div className="mt-2 flex items-baseline justify-between text-[0.8125rem] font-medium tabular-nums">
        <span>Vol. {String(index + 1).padStart(2, '0')}</span>
        <span>{event.date}</span>
        <span>Free (₹0)</span>
      </div>
      <p
        className={`mt-[5%] max-w-[62%] font-serif text-[clamp(1.0625rem,3.2svh,1.8rem)] leading-[1.1] italic ${flipped ? 'ml-auto text-right' : ''}`}
      >
        {event.blurb}
      </p>

      <div className={`relative mt-auto flex ${flipped ? 'flex-row-reverse' : ''} items-end gap-[4%]`}>
        <Halftone
          color={palette.a}
          className={`bottom-[-6%] aspect-square w-[52%] ${flipped ? 'right-[8%]' : 'left-[8%]'}`}
          style={{ opacity: 0.5 }}
        />
        <Rainbow palette={palette} className="relative w-[58%] shrink-0" />
        <div className={`relative ${flipped ? 'text-left' : 'text-right'}`}>
          <span
            className="inline-block rotate-[-4deg] rounded-[2px] px-2.5 py-1 font-round text-[0.9375rem] font-semibold"
            style={{ background: palette.ink, color: palette.paper }}
          >
            {event.status === 'past' ? 'Archive issue' : 'This month'}
          </span>
          <p className="mt-2 font-serif text-[clamp(0.9375rem,2.2svh,1.15rem)] leading-snug italic">
            {event.location}
          </p>
        </div>
      </div>

      <h3
        className="mt-[4%] font-round leading-[0.86] font-bold uppercase"
        style={{ fontSize: 'clamp(2rem, 7.5svh, 4.6rem)', color: palette.ink, textShadow: misregister(palette) }}
      >
        {event.title}
      </h3>

      <div className="mt-[3%] flex items-center justify-between">
        <span
          className="rounded-full px-3 py-1 font-round text-sm font-semibold"
          style={{ background: palette.spine, color: palette.onSpine }}
        >
          {event.kind}
        </span>
        <span className="font-round text-[0.9375rem] font-medium">{event.seats}</span>
      </div>

      {/* the sticker */}
      <div
        className={`absolute top-[24%] ${flipped ? 'left-[4%] -rotate-12' : 'right-[4%] rotate-12'} grid h-[22%] w-[30%] place-items-center`}
      >
        <Splat className="absolute inset-0 h-full w-full" fill={palette.light} stroke={palette.ink} strokeWidth={2} />
        <span
          className="relative text-center font-round text-[clamp(0.875rem,2.2svh,1.125rem)] leading-tight font-bold"
          style={{ color: palette.ink }}
        >
          No. {String(index + 1).padStart(2, '0')}
          <br />
          inside!
        </span>
      </div>
    </div>
  )
}

function Feature({ event, palette }: PageProps) {
  const [first, ...rest] = paragraphs(event)
  return (
    <div className="absolute inset-0 flex flex-col p-[6%] pb-[max(11%,3.75rem)]">
      <h3
        className="font-serif leading-[0.9] tracking-[-0.02em]"
        style={{ fontSize: 'clamp(2rem, min(7svh, 10vw), 4.2rem)' }}
      >
        {event.title}
      </h3>
      {/* the dek, under the head */}
      <div className="mt-2 flex items-baseline justify-between gap-4 text-[0.8125rem] font-medium">
        <span className="font-round text-[0.9375rem] font-semibold" style={{ color: palette.accent }}>
          The {event.kind.toLowerCase()}
        </span>
        <span className="tabular-nums">{event.date}</span>
      </div>
      <div className="mt-3 w-1/2">
        <Stripes palette={palette} weight={4} />
      </div>

      <div className="mt-[5%] min-h-0 flex-1 gap-[5%] overflow-y-auto overscroll-contain pb-4 [mask-image:linear-gradient(to_bottom,var(--color-ink)_82%,transparent)] min-[30rem]:columns-2 min-[30rem]:overflow-visible min-[30rem]:pb-0 min-[30rem]:[mask-image:none] text-[clamp(0.8125rem,1.8svh,0.9375rem)] leading-[1.55]">
        {first && (
          <p className="mb-3">
            <span
              className="float-left mt-[0.08em] mr-1.5 font-round text-[3.2em] leading-[0.8] font-bold"
              style={{ color: palette.accent, textShadow: misregister(palette) }}
            >
              {first.charAt(0)}
            </span>
            {first.slice(1)}
          </p>
        )}
        <blockquote
          className="mb-3 break-inside-avoid rounded-[14px] p-3.5 font-round text-[1.2em] leading-tight font-semibold"
          style={{ background: palette.light, color: palette.ink }}
        >
          “{event.pullQuote ?? event.blurb}”
        </blockquote>
        {rest.map((paragraph) => (
          <p key={paragraph.slice(0, 24)} className="mb-3">
            {paragraph}
          </p>
        ))}
      </div>

      <div className="mt-auto flex items-end gap-[4%]">
        <Rainbow palette={palette} className="hidden w-[30%] shrink-0 sm:block" />
        <dl
          className="mb-1 grid flex-1 grid-cols-[auto_1fr_auto] gap-x-4 rounded-[12px] px-4 py-3 sm:gap-x-5"
          style={{ background: palette.ink, color: palette.paper }}
        >
          {[
            ['When', event.date],
            ['Where', event.location],
            ['Room for', event.seats],
          ].map(([label, value]) => (
            <div key={label} className="min-w-0">
              <dt
                className="text-xs font-medium"
                style={{ color: `color-mix(in oklab, ${palette.paper} 78%, ${palette.ink})` }}
              >
                {label}
              </dt>
              <dd className="mt-0.5 font-round text-[0.9375rem] leading-tight font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <Folio event={event} page={2} palette={palette} />
    </div>
  )
}

function Particulars({ event, palette }: PageProps) {
  const past = event.status === 'past'
  const rows = [
    { label: 'When', value: event.date, ...palette.rows[0]! },
    { label: 'Where', value: event.location, ...palette.rows[1]! },
    { label: 'Room for', value: event.seats, ...palette.rows[2]! },
  ]
  return (
    <div className="absolute inset-0 flex flex-col p-[6%] pb-[max(11%,3.75rem)]">
      <h3
        className="font-round leading-[0.85] font-bold uppercase"
        style={{ fontSize: 'clamp(2rem, min(7svh, 10vw), 4.2rem)', color: palette.headline, textShadow: misregister(palette) }}
      >
        The
        <br />
        particulars
      </h3>

      <div className="mt-[6%] grid gap-3">
        {rows.map((row, i) => (
          <div
            key={row.label}
            className={`relative overflow-hidden rounded-[16px] px-5 py-4 ${i % 2 ? 'ml-[12%]' : 'mr-[12%]'}`}
            style={{ background: row.bg, color: row.fg }}
          >
            <p className="text-[0.8125rem] font-medium">{row.label}</p>
            <p className="mt-1 font-round text-[clamp(1.125rem,3.2svh,1.7rem)] leading-tight font-semibold">
              {row.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-auto flex items-end justify-between gap-4">
        <Rainbow palette={palette} className="w-[42%]" />
        {past ? (
          <span
            className="mb-2 rotate-[-8deg] rounded-[6px] border-[3px] px-3 py-1 font-round text-[1.5rem] font-bold mix-blend-multiply"
            style={{ borderColor: palette.headline, color: palette.headline }}
          >
            Archived
          </span>
        ) : (
          <a
            href="/#contact"
            className="mb-1 inline-flex min-h-11 items-center rounded-full px-6 font-round text-[1.0625rem] font-semibold transition-transform duration-[var(--dur-short)] ease-out hover:-translate-y-0.5"
            style={{ ...PILL, background: palette.ink, color: palette.paper }}
          >
            Save me a seat
          </a>
        )}
      </div>

      <Folio event={event} page={3} palette={palette} />
    </div>
  )
}
