'use client'

import { AnimatePresence, motion, useScroll, type MotionValue } from 'motion/react'
import { useCallback, useRef, useState } from 'react'
import { ErisedMagazine, Rainbow, Stripes, misregister, paletteFor, softInk } from './ErisedMagazine'
import { Splat } from './Splat'
import { ramp } from '@/lib/range'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { useScrollRange } from '@/lib/useScrollRange'
import type { CommunityEvent, CommunitySettings } from '@/types/content'

/**
 * What the room actually runs. Each event is a back issue on the rack; open
 * one and it comes up as a magazine you can page through.
 */
export function ErisedEvents({
  events,
  copy,
}: {
  events: CommunityEvent[]
  copy: CommunitySettings
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.9', 'start 0.3'] })
  const [open, setOpen] = useState<number | null>(null)
  const close = useCallback(() => setOpen(null), [])

  return (
    <div
      ref={ref}
      className="edge-x bg-erised-yellow pt-[var(--section-gap-s)] pb-[var(--section-gap)]"
    >
      <div className="mx-auto max-w-[76rem] text-erised-ink">
        <div className="rule-b flex flex-wrap items-end justify-between gap-x-8 gap-y-3 pb-6">
          <h2
            id="community-heading"
            className="font-round text-section leading-[1] font-semibold tracking-[-0.015em] text-balance"
          >
            {copy.eventsEyebrow}
          </h2>
          <span className="font-round text-lg font-medium">{copy.openNote}</span>
        </div>

        <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2">
          {events.map((event, index) => (
            <EventCard
              key={event._id}
              event={event}
              index={index}
              progress={scrollYProgress}
              reduced={reduced}
              onOpen={() => setOpen(index)}
            />
          ))}
        </div>

        <AnimatePresence>
          {open !== null && events[open] && (
            <ErisedMagazine key={events[open]._id} event={events[open]} index={open} onClose={close} />
          )}
        </AnimatePresence>

        <p className="mt-16 max-w-[52ch] font-round text-lg leading-[1.55]">
          {copy.closing}{' '}
          <a
            href="/#contact"
            className="font-semibold underline decoration-2 underline-offset-4 transition-[text-decoration-color] duration-[var(--dur-short)] ease-out hover:decoration-erised-blue"
          >
            {copy.closingLinkLabel}
          </a>
        </p>
      </div>
    </div>
  )
}

/**
 * A back issue on the rack: cream stock, a coloured spine, the masthead's
 * stripes, a rainbow printed a hair out of register. The whole card is the
 * button; nothing inside it pretends to be another one.
 *
 * The cards are on the page at rest. Scroll only settles them the last few
 * pixels and the last degree of tilt as the rack comes up, so nothing is
 * ever hidden waiting for a scroll that may not come.
 */
function EventCard({
  event,
  index,
  progress,
  reduced,
  onOpen,
}: {
  event: CommunityEvent
  index: number
  progress: MotionValue<number>
  reduced: boolean
  onOpen: () => void
}) {
  const beats = ramp([index * 0.09, 0.42 + index * 0.09])
  const y = useScrollRange(progress, beats, [12, 0])
  const rotate = useScrollRange(progress, beats, [index % 2 ? 0.8 : -0.8, 0])

  const past = event.status === 'past'
  const palette = paletteFor(index)
  const number = String(index + 1).padStart(2, '0')

  return (
    <motion.article className="group relative h-full" style={reduced ? undefined : { y, rotate }}>
      <button
        type="button"
        onClick={onOpen}
        className="relative flex h-full w-full overflow-hidden rounded-[var(--radius-card)] text-left transition-transform duration-[var(--dur-short)] ease-out hover:-translate-y-0.5 active:translate-y-0"
        style={{
          background: palette.paper,
          color: palette.ink,
          boxShadow: `0 0 0 1px color-mix(in oklab, ${palette.ink} 12%, transparent), 0 1px 2px color-mix(in oklab, var(--color-erised-ink) 18%, transparent), 0 22px 44px -26px color-mix(in oklab, var(--color-erised-ink) 60%, transparent)`,
        }}
        aria-label={`Open the ${event.title} issue`}
      >
        {/* the spine: kind and number, set sideways like the edge of a back issue */}
        <span
          className="relative flex w-12 shrink-0 flex-col items-center justify-between py-5"
          style={{ background: palette.spine, color: palette.onSpine }}
        >
          <span className="font-round text-[0.9375rem] font-semibold [writing-mode:vertical-rl]">
            {event.kind}
          </span>
          <span className="font-round text-[0.9375rem] font-semibold tabular-nums [writing-mode:vertical-rl]">
            No. {number}
          </span>
          {/* the spine's fold, catching light */}
          <span
            className="pointer-events-none absolute inset-y-0 right-0 w-[3px]"
            style={{
              background: `linear-gradient(to right, transparent, color-mix(in oklab, ${palette.ink} 22%, transparent))`,
            }}
            aria-hidden="true"
          />
        </span>

        <span className="relative flex min-w-0 flex-1 flex-col px-6 pt-5 pb-5 sm:px-7">
          <span className="flex items-start justify-between gap-4">
            <span className="mt-1.5 w-24">
              <Stripes palette={palette} weight={4} />
            </span>
            <span className="font-round text-[0.9375rem] font-medium">{past ? 'Archived' : event.seats}</span>
          </span>

          <span
            className="mt-5 block font-round text-[1.875rem] leading-[0.95] font-bold tracking-[-0.01em] uppercase"
            style={{ textShadow: misregister(palette, 0.03) }}
          >
            {event.title}
          </span>

          <span className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm font-medium">
            <span className="font-semibold tabular-nums" style={{ color: palette.accent }}>
              {event.date}
            </span>
            <span style={{ color: softInk(palette) }}>{event.location}</span>
          </span>

          <span className="mt-3 mb-6 block max-w-[46ch] text-md leading-[1.6]" style={{ color: softInk(palette, 84) }}>
            {event.blurb}
          </span>

          <span
            className="mt-auto flex items-end justify-between gap-4 border-t pt-4"
            style={{ borderColor: `color-mix(in oklab, ${palette.ink} 18%, transparent)` }}
          >
            <span className="mb-0.5 font-round text-[1.0625rem] font-semibold">Read the issue</span>
            {past ? (
              <span
                className="mr-1 mb-1 rotate-[-9deg] rounded-[5px] border-[2.5px] px-2.5 py-0.5 font-round text-[1.25rem] leading-tight font-bold mix-blend-multiply"
                style={{ borderColor: palette.headline, color: palette.headline }}
                aria-hidden="true"
              >
                Archived
              </span>
            ) : (
              <Rainbow palette={palette} className="w-20 shrink-0" />
            )}
          </span>
        </span>

        {/* paper tooth over the whole sheet */}
        <span
          className="pointer-events-none absolute inset-0 opacity-[0.2] mix-blend-multiply"
          style={{ backgroundImage: 'var(--grain-url)', backgroundSize: '180px 180px' }}
          aria-hidden="true"
        />
      </button>

      {/* the splat, small, as the card's own marker */}
      <span className="pointer-events-none absolute -top-4 -right-3 z-10 h-10 w-14 rotate-12 opacity-0 transition-opacity duration-[var(--dur-short)] ease-out group-hover:opacity-100">
        <Splat className="h-full w-full" fill={palette.light} stroke={palette.ink} strokeWidth={2} />
      </span>
    </motion.article>
  )
}
