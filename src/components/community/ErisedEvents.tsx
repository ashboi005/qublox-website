'use client'

import { motion, useScroll, type MotionValue } from 'motion/react'
import { useRef } from 'react'
import { Splat } from './Splat'
import { ramp } from '@/lib/range'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { useScrollRange } from '@/lib/useScrollRange'
import type { CommunityEvent, CommunitySettings } from '@/types/content'

/** What the room actually runs. Cards deal out as the block comes up. */
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

  return (
    <div ref={ref} className="edge-x bg-erised-yellow pt-[8vh] pb-[14vh]">
      <div className="mx-auto max-w-[76rem] text-erised-ink">
        <div className="flex items-baseline justify-between border-b border-erised-ink/25 pb-3">
          <h2 id="community-heading" className="label">
            {copy.eventsEyebrow}
          </h2>
          <span className="label">{copy.openNote}</span>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {events.map((event, index) => (
            <EventCard
              key={event._id}
              event={event}
              index={index}
              progress={scrollYProgress}
              reduced={reduced}
            />
          ))}
        </div>

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
}: {
  event: CommunityEvent
  index: number
  progress: MotionValue<number>
  reduced: boolean
}) {
  const beats = ramp([index * 0.09, 0.42 + index * 0.09])
  const y = useScrollRange(progress, beats, [44, 0])
  const opacity = useScrollRange(progress, beats, [0, 1])
  const rotate = useScrollRange(progress, beats, [index % 2 ? 2.6 : -2.6, 0])

  const past = event.status === 'past'

  return (
    <motion.article
      className="group relative border-2 border-erised-ink bg-erised-yellow-deep/35 p-5 transition-colors duration-300 hover:border-erised-ink hover:bg-erised-ink hover:text-erised-yellow"
      style={reduced ? undefined : { y, opacity, rotate }}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="label border border-current px-1.5 py-0.5">{event.kind}</span>
        <span className={`label ${past ? 'opacity-45' : ''}`}>{past ? 'ARCHIVED' : event.seats}</span>
      </div>

      <h3 className="mt-4 font-round text-[1.6rem] leading-tight font-semibold">{event.title}</h3>

      <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        <div>
          <dt className="sr-only">Date</dt>
          <dd className="label">{event.date}</dd>
        </div>
        <div>
          <dt className="sr-only">Location</dt>
          <dd className="label opacity-70">{event.location}</dd>
        </div>
      </dl>

      <p className="mt-3 text-[0.9rem] leading-[1.7] opacity-80">{event.blurb}</p>

      {/* the splat, small, as the card's own marker */}
      <span className="pointer-events-none absolute -top-3 -right-3 h-9 w-12 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <Splat className="h-full w-full" fill="#3a6ea5" stroke="#1e1f20" strokeWidth={2} />
      </span>
    </motion.article>
  )
}
