'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Splat } from './Splat'
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

export type Palette = { paper: string; ink: string; a: string; b: string; c: string; d: string }

/** Lifted from the 70s supergraphic plates: cream stock, four warm inks. */
export const PALETTES: Palette[] = [
  { paper: '#fbeccf', ink: '#2a1a12', a: '#e5542a', b: '#f2b134', c: '#c8352b', d: '#6f7b4a' },
  { paper: '#fde9d6', ink: '#24161f', a: '#ef6fa0', b: '#f6a531', c: '#7c4fc4', d: '#f2d34f' },
  { paper: '#f4ecd8', ink: '#1d1f24', a: '#3a6ea5', b: '#fecb56', c: '#e0472f', d: '#2f8f7a' },
  { paper: '#fbe5c4', ink: '#2b170d', a: '#d9452b', b: '#6a3d9a', c: '#f0a12d', d: '#3c7b5c' },
]

export function paletteFor(index: number) {
  return PALETTES[index % PALETTES.length]!
}

function paragraphs(event: CommunityEvent) {
  return (event.story ?? event.blurb).split(/\n\s*\n/).filter(Boolean)
}

const PAGE_COUNT = 3

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
      className="fixed inset-0 z-[150] flex flex-col items-center justify-center gap-4 bg-[#120b08]/85 px-4 py-6 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      onWheel={onWheel}
      data-lenis-prevent
      role="dialog"
      aria-modal="true"
      aria-label={`${event.title} — ERISED issue`}
    >
      <div
        className="relative aspect-[3/4] h-[min(82svh,calc((100vw-2rem)*4/3))]"
        style={{ perspective: '2200px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* the rest of the issue, under the page being turned */}
        <div
          className="absolute inset-0 translate-x-[6px] translate-y-[6px] rounded-[3px]"
          style={{ background: palette.paper, filter: 'brightness(0.82)' }}
          aria-hidden="true"
        />
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={page}
            custom={direction}
            className="absolute inset-0 overflow-hidden rounded-[3px] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]"
            style={{ background: palette.paper, color: palette.ink, transformOrigin: 'left center' }}
            variants={{
              enter: (d: number) => (d > 0 ? { rotateY: 0, opacity: 1, zIndex: 0 } : { rotateY: -100, opacity: 1, zIndex: 2 }),
              center: { rotateY: 0, opacity: 1, zIndex: 1 },
              exit: (d: number) => (d > 0 ? { rotateY: -100, opacity: 1, zIndex: 2 } : { rotateY: 0, opacity: 1, zIndex: 0 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60) turn(1)
              else if (info.offset.x > 60) turn(-1)
            }}
          >
            <Page event={event} index={index} palette={palette} />
            {/* paper: a little tooth and a spine shadow */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-multiply"
              style={{ backgroundImage: 'var(--grain-url)', backgroundSize: '180px 180px' }}
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/20 to-transparent"
              aria-hidden="true"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div
        className="flex items-center gap-3 font-mono text-[0.72rem] tracking-[0.16em] text-[#fbeccf] uppercase"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => turn(-1)}
          disabled={page === 0}
          className="border border-current px-3 py-2 disabled:opacity-30"
          aria-label="Previous page"
        >
          ←
        </button>
        <span aria-live="polite">
          PAGE {page + 1} / {PAGE_COUNT}
        </span>
        <button
          type="button"
          onClick={() => turn(1)}
          disabled={page === PAGE_COUNT - 1}
          className="border border-current px-3 py-2 disabled:opacity-30"
          aria-label="Next page"
        >
          →
        </button>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="ml-3 border border-current px-3 py-2"
        >
          Close ✕
        </button>
      </div>
    </motion.div>
  )
}

type PageProps = { event: CommunityEvent; index: number; palette: Palette }

/** Concentric 70s arcs — the supergraphic every reference page leans on. */
function Rainbow({ palette, className }: { palette: Palette; className?: string }) {
  const bands = [palette.c, palette.a, palette.b, palette.d]
  return (
    <svg viewBox="0 0 200 100" className={className} aria-hidden="true">
      {bands.map((color, i) => (
        <path
          key={color + i}
          d={`M ${10 + i * 18} 100 A ${90 - i * 18} ${90 - i * 18} 0 0 1 ${190 - i * 18} 100`}
          fill="none"
          stroke={color}
          strokeWidth={14}
        />
      ))}
    </svg>
  )
}

function Stripes({ palette }: { palette: Palette }) {
  return (
    <div className="flex flex-col gap-[3px]" aria-hidden="true">
      {[palette.c, palette.a, palette.b, palette.d].map((color, i) => (
        <span key={color + i} className="block h-[5px]" style={{ background: color }} />
      ))}
    </div>
  )
}

function Folio({ event, page, palette }: { event: CommunityEvent; page: number; palette: Palette }) {
  return (
    <div
      className="absolute inset-x-[6%] bottom-[3%] flex items-center justify-between border-t-2 pt-1.5 font-mono text-[0.6rem] tracking-[0.14em] uppercase"
      style={{ borderColor: palette.ink }}
    >
      <span>ERISED · {event.kind}</span>
      <span>PAGE {page}</span>
    </div>
  )
}

function Cover({ event, index, palette }: PageProps) {
  const flipped = index % 2 === 1
  return (
    <div className="absolute inset-0 flex flex-col p-[6%]">
      <div className="flex items-start justify-between font-mono text-[0.6rem] tracking-[0.14em] uppercase">
        <span>VOL. {String(index + 1).padStart(2, '0')}</span>
        <span>{event.date}</span>
        <span>₹ 0 · FREE</span>
      </div>

      <h2
        className="mt-1 font-round leading-[0.78] font-bold tracking-[-0.04em]"
        style={{ fontSize: 'clamp(3rem, 11svh, 7rem)', color: palette.c }}
      >
        ERISED
      </h2>
      <div className="mt-2">
        <Stripes palette={palette} />
      </div>
      <p
        className={`mt-[5%] max-w-[62%] font-serif text-[clamp(1rem,3.2svh,1.8rem)] leading-[1.1] italic ${flipped ? 'ml-auto text-right' : ''}`}
      >
        {event.blurb}
      </p>

      <div className={`relative mt-auto flex ${flipped ? 'flex-row-reverse' : ''} items-end gap-[4%]`}>
        <Rainbow palette={palette} className="w-[58%] shrink-0" />
        <div className={flipped ? 'text-left' : 'text-right'}>
          <span
            className="inline-block rotate-[-4deg] px-2 py-1 font-mono text-[0.65rem] tracking-[0.14em] uppercase"
            style={{ background: palette.ink, color: palette.paper }}
          >
            {event.status === 'past' ? 'ARCHIVE ISSUE' : 'THIS MONTH'}
          </span>
          <p className="mt-2 font-serif text-[clamp(0.85rem,2.2svh,1.1rem)] leading-snug italic">
            {event.location}
          </p>
        </div>
      </div>

      <h3
        className="mt-[4%] font-round leading-[0.86] font-bold uppercase"
        style={{ fontSize: 'clamp(2rem, 7.5svh, 4.6rem)', color: palette.ink }}
      >
        {event.title}
      </h3>

      <div className="mt-[3%] flex items-center justify-between">
        <span
          className="rounded-full px-3 py-1 font-mono text-[0.65rem] tracking-[0.14em] uppercase"
          style={{ background: palette.a, color: palette.paper }}
        >
          {event.kind}
        </span>
        <span className="font-mono text-[0.65rem] tracking-[0.14em] uppercase">{event.seats}</span>
      </div>

      {/* the sticker */}
      <div
        className={`absolute top-[17%] ${flipped ? 'left-[4%] -rotate-12' : 'right-[4%] rotate-12'} grid h-[22%] w-[30%] place-items-center`}
      >
        <Splat className="absolute inset-0 h-full w-full" fill={palette.b} stroke={palette.ink} strokeWidth={2} />
        <span className="relative text-center font-round text-[clamp(0.7rem,2svh,1rem)] leading-tight font-bold uppercase">
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
    <div className="absolute inset-0 flex flex-col p-[6%] pb-[10%]">
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[0.6rem] tracking-[0.14em] uppercase" style={{ color: palette.c }}>
          THE {event.kind}
        </span>
        <span className="font-mono text-[0.6rem] tracking-[0.14em] uppercase">{event.date}</span>
      </div>
      <h3
        className="mt-2 font-serif leading-[0.9] tracking-[-0.02em]"
        style={{ fontSize: 'clamp(2rem, 7svh, 4.2rem)' }}
      >
        {event.title}
      </h3>
      <div className="mt-3 w-1/2">
        <Stripes palette={palette} />
      </div>

      <div className="mt-[5%] min-h-0 flex-1 columns-2 gap-[5%] text-[clamp(0.68rem,1.75svh,0.92rem)] leading-[1.55]">
        {first && (
          <p className="mb-3">
            <span
              className="float-left mr-1.5 font-round text-[3.2em] leading-[0.8] font-bold"
              style={{ color: palette.a }}
            >
              {first.charAt(0)}
            </span>
            {first.slice(1)}
          </p>
        )}
        <blockquote
          className="mb-3 break-inside-avoid rounded-[14px] p-3 font-round text-[1.25em] leading-tight font-semibold"
          style={{ background: palette.b, color: palette.ink }}
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
        <Rainbow palette={palette} className="w-[34%] shrink-0" />
        <p
          className="mb-1 flex-1 rounded-[14px] p-3 font-mono text-[0.62rem] leading-relaxed tracking-[0.12em] uppercase"
          style={{ background: palette.ink, color: palette.paper }}
        >
          {event.date} · {event.location} · {event.seats}
        </p>
      </div>

      <Folio event={event} page={2} palette={palette} />
    </div>
  )
}

function Particulars({ event, palette }: PageProps) {
  const past = event.status === 'past'
  const rows = [
    { label: 'WHEN', value: event.date, bg: palette.a, fg: palette.paper },
    { label: 'WHERE', value: event.location, bg: palette.d, fg: palette.paper },
    { label: 'ROOM FOR', value: event.seats, bg: palette.b, fg: palette.ink },
  ]
  return (
    <div className="absolute inset-0 flex flex-col p-[6%] pb-[10%]">
      <h3
        className="font-round leading-[0.85] font-bold uppercase"
        style={{ fontSize: 'clamp(2rem, 7svh, 4.2rem)', color: palette.c }}
      >
        The
        <br />
        particulars
      </h3>

      <div className="mt-[6%] grid gap-3">
        {rows.map((row, i) => (
          <div
            key={row.label}
            className={`rounded-[16px] p-4 ${i % 2 ? 'ml-[12%]' : 'mr-[12%]'}`}
            style={{ background: row.bg, color: row.fg }}
          >
            <p className="font-mono text-[0.6rem] tracking-[0.16em] uppercase opacity-80">{row.label}</p>
            <p className="mt-1 font-round text-[clamp(1.1rem,3.2svh,1.7rem)] leading-tight font-semibold">
              {row.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-auto flex items-end justify-between gap-4">
        <Rainbow palette={palette} className="w-[42%]" />
        {past ? (
          <span
            className="rotate-[-8deg] border-4 px-3 py-1 font-mono text-[0.85rem] font-bold tracking-[0.2em] uppercase"
            style={{ borderColor: palette.c, color: palette.c }}
          >
            ARCHIVED
          </span>
        ) : (
          <a
            href="/#contact"
            className="rounded-full px-5 py-3 font-mono text-[0.7rem] tracking-[0.16em] uppercase transition-transform hover:-rotate-2"
            style={{ background: palette.ink, color: palette.paper }}
          >
            Save me a seat →
          </a>
        )}
      </div>

      <Folio event={event} page={3} palette={palette} />
    </div>
  )
}
