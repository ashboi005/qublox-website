'use client'

import { motion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { useScrollRange } from '@/lib/useScrollRange'
import { useRef } from 'react'
import { IdCard } from '@/components/team/IdCard'
import { ramp } from '@/lib/range'
import { useReducedMotion } from '@/lib/useReducedMotion'
import type { TeamMember, TeamSettings } from '@/types/content'

/**
 * Team — CH 05, CREW.
 *
 * Each card gets an equal slice of the section's scroll. Inside its slice it
 * flies in from depth, rotates square to the viewer, holds, then continues
 * past the camera and out of frame while the next one is already on its way.
 * The overlap is deliberate: at the hand-off you briefly see two plates in the
 * same space, which is what makes it read as a stack being dealt rather than a
 * slideshow.
 *
 * Every card takes a different route. Five identical fly-throughs read as a
 * loop after the second one, so the entry corner, the spin axis and the exit
 * vector all rotate through the crew — fixed per position rather than random,
 * so the sequence is the same every time you scroll it.
 */

/** Approach and departure, one per position in the crew. */
const ROUTES = [
  { from: [26, -14], to: [-18, 10], tilt: [16, -70, -12], exit: [-14, 58, 10] },
  { from: [-30, 12], to: [16, -14], tilt: [-20, 66, 14], exit: [18, -54, -12] },
  { from: [4, -30], to: [-6, 22], tilt: [34, -8, -22], exit: [-30, 12, 18] },
  { from: [-22, -20], to: [22, 16], tilt: [-14, -58, 20], exit: [16, 50, -16] },
  { from: [28, 22], to: [-14, -18], tilt: [24, 62, -18], exit: [-20, -46, 14] },
]
export function Team({ team, copy }: { team: TeamMember[]; copy: TeamSettings }) {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })

  if (reduced) {
    return (
      <section id="team" data-ground="void" data-channel="team" className="edge-x py-[12vh]" aria-labelledby="team-heading">
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
      style={{ height: `${team.length * 120 + 60}vh` }}
      aria-labelledby="team-heading"
    >
      <div
        className="sticky top-0 grid h-[100svh] place-items-center overflow-hidden"
        style={{ perspective: '1400px' }}
      >
        <div className="edge-x pointer-events-none absolute inset-x-0 top-0 z-40 pt-24">
          <Heading copy={copy} />
        </div>

        {team.map((member, index) => (
          <FlyingCard
            key={member._id}
            member={member}
            index={index}
            total={team.length}
            progress={scrollYProgress}
            copy={copy}
          />
        ))}

        {/* scanner readout at the foot of the frame */}
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

function FlyingCard({
  member,
  index,
  total,
  progress,
  copy,
}: {
  member: TeamMember
  index: number
  total: number
  progress: MotionValue<number>
  copy: TeamSettings
}) {
  const slice = 1 / total
  const start = index * slice

  // Slices overlap slightly, so one card is leaving as the next arrives. Every
  // range goes through ramp() because these feed a native ScrollTimeline.
  const beats = ramp([start, start + slice * 0.34, start + slice * 0.62, start + slice * 1.02])
  const fade = ramp([
    beats[0]!,
    start + slice * 0.22,
    beats[2]!,
    start + slice * 0.94,
    beats[3]!,
  ])

  const route = ROUTES[index % ROUTES.length]!

  const z = useScrollRange(progress, beats, [-1700, 0, 40, 950])
  const rotateX = useScrollRange(progress, beats, [route.tilt[0]!, 0, 0, route.exit[0]!])
  const rotateY = useScrollRange(progress, beats, [route.tilt[1]!, 0, 4, route.exit[1]!])
  const rotateZ = useScrollRange(progress, beats, [route.tilt[2]!, 0, 0, route.exit[2]!])
  const opacity = useScrollRange(progress, fade, [0, 1, 1, 1, 0])
  const x = useTransform(progress, beats, [
    `${route.from[0]}%`,
    '0%',
    '0%',
    `${route.to[0]}%`,
  ])
  const y = useTransform(progress, beats, [
    `${route.from[1]}%`,
    '0%',
    '0%',
    `${route.to[1]}%`,
  ])

  return (
    <motion.div
      className="absolute"
      style={{ z, x, y, rotateX, rotateY, rotateZ, opacity, transformStyle: 'preserve-3d' }}
    >
      <IdCard member={member} index={index} total={total} copy={copy} />
    </motion.div>
  )
}
