'use client'

import { motion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { useLayoutEffect, useRef, useState } from 'react'
import { IdCard } from '@/components/team/IdCard'
import { useReducedMotion } from '@/lib/useReducedMotion'
import type { TeamMember, TeamSettings } from '@/types/content'

/**
 * Team — CH 05, CREW.
 *
 * A rack of ID cards that travels sideways as you scroll down.
 *
 * Each card used to fly through the viewport in 3D on its own slice of
 * scroll. It read well for two cards and became a chore by the fourth: the
 * section cost 120vh per person, so hiring anyone made the page longer and the
 * sequence more repetitive, and you could never compare two people because
 * only one was ever on screen. A rack fixes all three — the crew is visible at
 * once, adding someone costs a card's width rather than a screen and a half,
 * and there is nothing to sit through.
 *
 * The first card still arrives in 3D, alone, because the section needs an
 * entrance and the plates deserve one. The rest of the rack only develops once
 * it has settled — with the crew already laid out behind it, the entrance read
 * as one card misbehaving in a row that was otherwise fine.
 *
 * The travel is measured, not assumed, and the section is exactly as tall as
 * the distance the rack has to cover — so the rack moves one pixel sideways
 * per pixel scrolled, at any crew size, on any viewport.
 */

/** How much scroll the first card's entrance gets, as a share of a screen. */
const ENTRANCE_VH = 0.5

export function Team({ team, copy }: { team: TeamMember[]; copy: TeamSettings }) {
  const ref = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })

  const [travel, setTravel] = useState(0)

  /**
   * Geometry the transform reads every frame.
   *
   * It lives in a ref rather than in the transform's input range because the
   * range is captured when the transform is created — measuring the rack after
   * mount would leave the transform interpolating against the numbers it was
   * built with. Reading a ref inside the transform keeps it current.
   */
  const geom = useRef({ start: 0, end: 0, entranceEnd: 0.4 })

  useLayoutEffect(() => {
    const measure = () => {
      const el = trackRef.current
      const lead = el?.firstElementChild as HTMLElement | null
      if (!el || !lead) return

      /**
       * The rack opens with the lead card centred and the rest waiting off to
       * the right, rather than with the whole crew already laid out.
       *
       * Starting at zero put every card on screen from the first frame, which
       * left the lead card's slot sitting empty while it played its entrance —
       * so the one moment the section has read as a missing card rather than
       * an arriving one.
       */
      const start = window.innerWidth / 2 - (lead.offsetLeft + lead.offsetWidth / 2)
      const end = Math.min(0, window.innerWidth - el.scrollWidth)
      const distance = Math.max(0, start - end)
      const entrancePx = window.innerHeight * ENTRANCE_VH

      geom.current = { start, end, entranceEnd: entrancePx / (entrancePx + distance) }
      setTravel(distance)
    }

    measure()
    const observer = new ResizeObserver(measure)
    if (trackRef.current) observer.observe(trackRef.current)
    window.addEventListener('resize', measure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [team.length])

  // The rack holds still while the lead card lands, then travels.
  const x = useTransform(scrollYProgress, (p) => {
    const { start, end, entranceEnd } = geom.current
    if (p <= entranceEnd) return start
    return start + (end - start) * ((p - entranceEnd) / (1 - entranceEnd))
  })

  // 0 → 1 across the entrance alone.
  const entrance = useTransform(scrollYProgress, (p) =>
    Math.min(1, Math.max(0, p / geom.current.entranceEnd)),
  )

  if (reduced) {
    return (
      <section
        id="team"
        data-ground="void"
        data-channel="team"
        className="edge-x py-[12vh]"
        aria-labelledby="team-heading"
      >
        <Heading copy={copy} />
        <div className="mx-auto mt-12 flex max-w-[76rem] flex-wrap justify-center gap-8">
          {team.map((member, index) => (
            <IdCard key={member._id} member={member} index={index} total={team.length} copy={copy} />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section
      ref={ref}
      id="team"
      data-ground="void"
      data-channel="team"
      className="relative"
      // One pixel of scroll per pixel the rack travels, plus the entrance.
      style={{ height: `calc(${100 + ENTRANCE_VH * 100}svh + ${travel}px)` }}
      aria-labelledby="team-heading"
    >
      <div
        className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden"
        style={{ perspective: '1600px' }}
      >
        <div className="edge-x pointer-events-none absolute inset-x-0 top-0 z-40 pt-24">
          <Heading copy={copy} />
        </div>

        <motion.div
          ref={trackRef}
          className="edge-x flex w-max items-center gap-[clamp(1.5rem,3vw,3rem)]"
          style={{ x, transformStyle: 'preserve-3d' }}
        >
          {team.map((member, index) => (
            <RackCard
              key={member._id}
              member={member}
              index={index}
              total={team.length}
              copy={copy}
              entrance={entrance}
            />
          ))}
        </motion.div>

        <div className="edge-x pointer-events-none absolute inset-x-0 bottom-0 z-40 pb-6">
          <div className="rule-t flex items-baseline justify-between pt-3 text-bone/40">
            <span className="label">{copy.scanner}</span>
            <span className="label">{team.length} RECORDS ON FILE</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function Heading({ copy }: { copy: TeamSettings }) {
  return (
    <div className="rule-b mx-auto flex max-w-[76rem] items-baseline justify-between pb-3 text-bone/45">
      <h2 id="team-heading" className="label">
        {copy.eyebrow}
      </h2>
      <span className="label">{copy.note}</span>
    </div>
  )
}

/**
 * A card on the rack.
 *
 * Only the lead card animates in 3D. The rest simply develop in behind it once
 * it has landed, one just after another — enough of a stagger to read as a
 * rack filling rather than a row switching on, and nothing more. A queue of
 * cards each performing its own entrance is the thing this section replaced.
 */
function RackCard({
  member,
  index,
  total,
  copy,
  entrance,
}: {
  member: TeamMember
  index: number
  total: number
  copy: TeamSettings
  entrance: MotionValue<number>
}) {
  const lead = index === 0

  // The lead card's flight.
  const rotateY = useTransform(entrance, [0, 1], [-72, 0])
  const z = useTransform(entrance, [0, 1], [-900, 0])
  const leadOpacity = useTransform(entrance, [0, 0.55], [0, 1])

  // The rest, after it settles. Clamped so a large crew still finishes inside
  // the entrance rather than trailing into the travel.
  const from = Math.min(0.94, 0.7 + index * 0.05)
  const restOpacity = useTransform(entrance, [from, Math.min(1, from + 0.12)], [0, 1])
  const restY = useTransform(entrance, [from, Math.min(1, from + 0.12)], [18, 0])

  return (
    <motion.div
      className="shrink-0"
      style={
        lead
          ? { rotateY, z, opacity: leadOpacity, transformStyle: 'preserve-3d' }
          : { opacity: restOpacity, y: restY }
      }
    >
      <IdCard member={member} index={index} total={total} copy={copy} />
    </motion.div>
  )
}
