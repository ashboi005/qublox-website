'use client'

import { AnimatePresence, motion, useScroll, type MotionValue } from 'motion/react'
import { useCallback, useRef, useState } from 'react'
import { ErisedMagazine, paletteFor } from './ErisedMagazine'
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
    <div ref={ref} className="edge-x bg-erised-yellow pt-[8vh] pb-[14vh]">
      <div className="mx-auto max-w-[76rem] text-erised-ink">
        <div className="flex items-baseline justify-between border-b border-erised-ink/25 pb-3">
          <h2 id="community-heading" className="label">
            {copy.eventsEyebrow}
          </h2>
          <span className="label">{copy.openNote}</span>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
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

        <p className="mt-10 max-w-[52ch] font-round text-[1.05rem] leading-relaxed">
          {copy.closing}{' '}
          <a href="/#contact" className="underline decoration-2 underline-offset-4 hover:text-erised-blue">
            {copy.closingLinkLabel}
          </a>
        </p>
      </div>
    </div>
  )
}

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
  const y = useScrollRange(progress, beats, [44, 0])
  const opacity = useScrollRange(progress, beats, [0, 1])
  const rotate = useScrollRange(progress, beats, [index % 2 ? 2.6 : -2.6, 0])

  const past = event.status === 'past'
  const palette = paletteFor(index)

  return (
    <motion.article className="group relative" style={reduced ? undefined : { y, opacity, rotate }}>
      <button
        type="button"
        onClick={onOpen}
        className="relative flex w-full overflow-hidden rounded-[10px] border-[3px] text-left transition-[transform,box-shadow] duration-200 hover:-translate-x-1 hover:-translate-y-1 active:translate-x-0 active:translate-y-0"
        style={{
          background: palette.paper,
          color: palette.ink,
          borderColor: palette.ink,
          boxShadow: `6px 6px 0 ${palette.ink}`,
        }}
        aria-label={`Open the ${event.title} issue`}
      >
        {/* the spine: kind, set sideways like the edge of a back issue */}
        <span
          className="flex w-10 shrink-0 items-center justify-center border-r-[3px] font-mono text-[0.62rem] tracking-[0.2em] uppercase [writing-mode:vertical-rl]"
          style={{ background: palette.a, color: palette.paper, borderColor: palette.ink }}
        >
          {event.kind} · NO. {String(index + 1).padStart(2, '0')}
        </span>

        <span className="relative flex min-w-0 flex-1 flex-col p-5">
          <span className="flex items-start justify-between gap-4">
            <span className="flex w-24 flex-col gap-[3px]" aria-hidden="true">
              {[palette.c, palette.a, palette.b, palette.d].map((color, i) => (
                <span key={color + i} className="block h-[4px]" style={{ background: color }} />
              ))}
            </span>
            <span className={`label ${past ? 'opacity-55' : ''}`}>{past ? 'ARCHIVED' : event.seats}</span>
          </span>

          <span className="mt-4 block font-round text-[1.7rem] leading-[0.95] font-bold uppercase">
            {event.title}
          </span>

          <span className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            <span className="label" style={{ color: palette.c }}>
              {event.date}
            </span>
            <span className="label opacity-70">{event.location}</span>
          </span>

          <span className="mt-3 block text-[0.9rem] leading-[1.65] opacity-80">{event.blurb}</span>

          <span className="mt-5 flex items-center justify-between border-t-2 border-dashed pt-3" style={{ borderColor: `${palette.ink}55` }}>
            <span className="label">Read the issue</span>
            <span
              className="label rounded-full px-3 py-1 transition-transform duration-200 group-hover:translate-x-1"
              style={{ background: palette.ink, color: palette.paper }}
            >
              Open →
            </span>
          </span>
        </span>

        {past && (
          <span
            className="pointer-events-none absolute top-1/2 right-6 -translate-y-1/2 rotate-[-14deg] border-[3px] px-2 py-0.5 font-mono text-[0.9rem] font-bold tracking-[0.2em] opacity-30"
            style={{ borderColor: palette.c, color: palette.c }}
            aria-hidden="true"
          >
            ARCHIVED
          </span>
        )}
      </button>

      {/* the splat, small, as the card's own marker */}
      <span className="pointer-events-none absolute -top-4 -right-3 z-10 h-10 w-14 rotate-12 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <Splat className="h-full w-full" fill={palette.b} stroke={palette.ink} strokeWidth={2} />
      </span>
    </motion.article>
  )
}
