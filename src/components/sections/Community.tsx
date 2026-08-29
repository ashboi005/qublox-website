'use client'

import { motion, useScroll, type MotionValue } from 'motion/react'
import { useRef } from 'react'
import { ErisedMark } from '@/components/community/ErisedMark'
import { Splash } from '@/components/community/Splash'
import { Splat } from '@/components/community/Splat'
import { ramp } from '@/lib/range'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { useScrollRange } from '@/lib/useScrollRange'
import type { CommunityEvent, SiteSettings } from '@/types/content'

/**
 * Community — CH 06, ERISED.
 *
 * The section is two plain blocks: a sticky stage where the paint lands and the
 * mark arrives, then the events in normal flow underneath. An earlier version
 * overlapped them with a negative margin to fake a single scene; it fell apart
 * at every viewport that was not the one it was built on. Two blocks, stacked,
 * behave.
 *
 * This is the only place on the site that uses the rounded face, and the only
 * ground that is neither bone nor black — ERISED is a different room.
 */
export function Community({
  settings,
  events,
}: {
  settings: SiteSettings
  events: CommunityEvent[]
}) {
  const stageRef = useRef<HTMLDivElement>(null)
  const eventsRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  const { scrollYProgress: stage } = useScroll({
    target: stageRef,
    offset: ['start start', 'end end'],
  })
  const { scrollYProgress: reveal } = useScroll({
    target: eventsRef,
    offset: ['start 0.9', 'start 0.3'],
  })

  /**
   * Strict order, and the order is the whole thing:
   *
   *   0.00 – 0.35  yellow paint is thrown at the page, hit by hit
   *   0.30 – 0.37  the ground seals flat behind it
   *   0.40 – 0.92  black ink lands and builds the mark by the same logic
   *
   * Nothing may fade in over a ground that is still moving. Overlapping the
   * seal and the mark was an earlier bug: a half-opacity mark sitting over
   * black the paint had not reached yet composited to olive.
   */
  const markProgress = useScrollRange(stage, [0.4, 0.92], [0, 1])
  const leadOpacity = useScrollRange(stage, [0.78, 0.86], [0, 1])

  return (
    <section id="community" data-channel="community" aria-labelledby="community-heading">
      {/*
        The ground is declared on the two blocks, not on the section. Declaring
        yellow at section level made the page turn yellow half a screen *before*
        the section arrived — a flash of yellow behind the still-black team
        cards. The stage stays void; only the events block, which is already
        yellow by the time you reach it, asks for the yellow ground.
      */}
      <div ref={stageRef} data-ground="void" className="relative h-[240vh]">
        <div className="sticky top-0 h-[100svh] overflow-hidden bg-black">
          {reduced ? (
            <div className="absolute inset-0 bg-erised-yellow" />
          ) : (
            <Splash progress={stage} />
          )}

          <div className="absolute inset-0 grid place-items-center px-6">
            <div className="flex flex-col items-center text-center">
              <ErisedMark progress={markProgress} />
              <motion.p
                className="mx-auto mt-4 max-w-[44ch] font-round text-[1.1rem] leading-relaxed text-erised-ink/85 sm:text-[1.25rem]"
                style={reduced ? undefined : { opacity: leadOpacity }}
              >
                {settings.communityLead}
              </motion.p>
            </div>
          </div>
        </div>
      </div>

      {/* ---- the events ------------------------------------------------ */}
      <div
        ref={eventsRef}
        data-ground="yellow"
        className="edge-x bg-erised-yellow pt-[6vh] pb-[14vh]"
      >
        <div className="mx-auto max-w-[76rem] text-erised-ink">
          <div className="flex items-baseline justify-between border-b border-erised-ink/25 pb-3">
            <h2 id="community-heading" className="label">
              CH 06 — ERISED / EVENTS
            </h2>
            <span className="label">OPEN TO ALL</span>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {events.map((event, index) => (
              <EventCard
                key={event._id}
                event={event}
                index={index}
                progress={reveal}
                reduced={reduced}
              />
            ))}
          </div>

          <p className="mt-10 max-w-[52ch] font-round text-[1.05rem] leading-relaxed">
            Nothing is ticketed and nothing is filmed.{' '}
            <a href="#contact" className="underline decoration-2 underline-offset-4 hover:text-erised-blue">
              Ask to be on the list.
            </a>
          </p>
        </div>
      </div>
    </section>
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
  // Cards deal out one after another as the block comes up.
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
        <Splat className="h-full w-full" fill="#3a6ea5" stroke="#1e1e20" strokeWidth={2} />
      </span>
    </motion.article>
  )
}
