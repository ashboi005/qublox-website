'use client'

import { motion, useScroll } from 'motion/react'
import { useRef } from 'react'
import { StretchHeading } from '@/components/ui/StretchHeading'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { useScrollRange } from '@/lib/useScrollRange'

/**
 * FEATURED — the one broadcast that interrupts the channel lineup.
 *
 * Qublox makes the film and builds the thing the film is about; Lokey is the
 * thing, shipped and live. It sits between TECH and CREW as a sponsor spot
 * rather than a numbered channel, so it never renumbers the dial.
 *
 * The chapter opens by tearing the black screen open with the Lokey mark's own
 * devil horns — three red claw slashes rake across, and the wordmark bleeds up
 * through the gashes. Everything after is the same grammar as the rest of the
 * site: condensed Archivo opening to full width, mono instrument labels, the
 * signal red used once and loud.
 *
 * The copy is Lokey's own and specific to the product, so it lives here rather
 * than in the shared Sanity model the studio's own sections read from. Swapping
 * the product out means editing this file, which is the honest cost of a
 * hand-built spotlight.
 */

const LOKEY_URL = 'https://lokey.qubloxhq.com'

/** The three claw gashes — curved, tapered diagonals raked top-left to bottom-right. */
const CLAWS = [
  { d: 'M12,8 C34,30 40,52 30,94', start: 0.0 },
  { d: 'M40,4 C60,30 66,54 54,98', start: 0.035 },
  { d: 'M70,8 C88,32 92,56 80,96', start: 0.07 },
]

/** The product, in three moves — PROBE, PROOF, PLAIN. */
const FEATURES = [
  {
    code: 'PROBE',
    title: 'Thinks like a real intruder',
    body: 'An autonomous agent maps your site and chases whatever it finds — the way an attacker would, not the way a checklist would.',
  },
  {
    code: 'PROOF',
    title: 'Proves what it can actually reach',
    body: 'No theoretical severity scores. Lokey demonstrates real, exploitable exposure, so you fix what genuinely matters.',
  },
  {
    code: 'PLAIN',
    title: 'Ranked fixes in plain English',
    body: 'The lasting output is a report: findings ordered by what they expose, written so anyone on the team can act on them.',
  },
]

export function Featured() {
  // The reveal is driven by scroll through its own tall track, so the sticky
  // viewport pins and releases cleanly before the pitch flows in beneath it —
  // a sticky child followed by flowed content in one container would overlap.
  const trackRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start start', 'end end'] })

  // The gashes rake across first; the mark bleeds up through them; the slashes
  // then fade to faint scars so they texture the frame without crossing the type.
  const markOpacity = useScrollRange(scrollYProgress, [0.16, 0.26], [0, 1])
  const markScale = useScrollRange(scrollYProgress, [0.16, 0.3], [1.08, 1])
  // Flares during the tear, then clears — nothing bright may sit behind the
  // opaque mark at rest, or its PNG edge reads as a faint box on the ground.
  const bloom = useScrollRange(scrollYProgress, [0.12, 0.22, 0.34], [0, 0.85, 0])
  const clawFade = useScrollRange(scrollYProgress, [0.18, 0.34], [1, 0.1])
  const eyebrowOpacity = useScrollRange(scrollYProgress, [0.24, 0.32], [0, 1])
  const taglineOpacity = useScrollRange(scrollYProgress, [0.32, 0.46], [0, 1])
  const taglineY = useScrollRange(scrollYProgress, [0.32, 0.46], [18, 0])
  const cueOpacity = useScrollRange(scrollYProgress, [0.46, 0.52, 0.62], [0, 1, 0])

  return (
    <section
      id="featured"
      data-ground="void"
      data-channel="lokey"
      className="relative bg-black"
      aria-labelledby="featured-heading"
    >
      <div ref={trackRef} className="relative h-[200vh]">
      <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden bg-black">
        {/* red bloom behind the mark, as the gashes open */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            opacity: reduced ? 0.35 : bloom,
            background:
              'radial-gradient(60% 50% at 50% 46%, color-mix(in srgb, var(--color-signal) 42%, transparent), transparent 70%)',
          }}
          aria-hidden="true"
        />

        {/* the claw scratch — the mark's horns, raking the black open */}
        <motion.svg
          className="pointer-events-none absolute inset-0 z-10 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ opacity: reduced ? 0.1 : clawFade }}
          aria-hidden="true"
        >
          <defs>
            <filter id="claw-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="0.8" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {CLAWS.map((claw) => (
            <Claw key={claw.d} d={claw.d} start={claw.start} progress={scrollYProgress} reduced={reduced} />
          ))}
        </motion.svg>

        {/* the wordmark, bleeding up through the gashes */}
        <div className="relative z-20 flex w-full max-w-[64rem] flex-col items-center px-6 text-center">
          <motion.span
            className="label text-signal"
            style={{ opacity: reduced ? 1 : eyebrowOpacity }}
          >
            Featured broadcast · Product 001
          </motion.span>

          <motion.img
            // eslint-disable-next-line @next/next/no-img-element
            src="/brand/lokey-mark.png"
            alt="Lokey"
            className="mt-6 w-[min(72vw,42rem)] select-none"
            style={{
              opacity: reduced ? 1 : markOpacity,
              scale: reduced ? 1 : markScale,
              filter: 'drop-shadow(0 0 48px rgba(255,47,54,0.35))',
            }}
            draggable={false}
          />

          <motion.p
            id="featured-heading"
            className="mt-7 max-w-2xl text-balance font-display text-[clamp(1.3rem,3.2vw,2.3rem)] font-semibold leading-[1.04] tracking-[-0.025em] text-bone"
            style={{ opacity: reduced ? 1 : taglineOpacity, y: reduced ? 0 : taglineY }}
          >
            Someone will try to break into your site.{' '}
            <span className="text-signal">Better it&apos;s us.</span>
          </motion.p>
        </div>

        {/* scroll cue, visible only in the handoff between the reveal and the pitch */}
        <motion.span
          className="label absolute bottom-7 left-1/2 z-20 -translate-x-1/2 text-bone/60"
          style={{ opacity: reduced ? 0 : cueOpacity }}
          aria-hidden="true"
        >
          ↓ Keep scrolling
        </motion.span>
      </div>
      </div>

      {/* the pitch — flowed, in the site's own reading grammar */}
      <div className="edge-x relative z-20 bg-black pb-[16vh] text-bone">
        <div className="mx-auto max-w-[76rem]">
          <div className="max-w-3xl">
            <p className="label text-signal">What it is</p>
            <StretchHeading
              as="h3"
              className="mt-4 text-[clamp(2.2rem,6vw,5rem)] text-bone"
              from={72}
              to={116}
            >
              An AI that attacks<br />your site first.
            </StretchHeading>
            <p className="mt-6 max-w-xl text-pretty text-[clamp(1rem,1.3vw,1.15rem)] leading-relaxed text-bone/70">
              Lokey points an autonomous security agent at your website. It probes it the way a
              real intruder would, proves what it can actually reach, and hands you a ranked list
              of what to fix — in plain English.
            </p>
          </div>

          <div className="mt-16 grid gap-px overflow-hidden rounded-xl border border-bone/15 bg-bone/15 sm:grid-cols-3">
            {FEATURES.map((feature) => (
              <motion.article
                key={feature.code}
                className="flex flex-col gap-3 bg-black p-7"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="label text-signal">{feature.code}</span>
                <h4 className="text-balance font-display text-[clamp(1.2rem,1.9vw,1.5rem)] font-semibold leading-[1.1] tracking-[-0.02em] text-bone">
                  {feature.title}
                </h4>
                <p className="text-pretty text-[14.5px] leading-relaxed text-bone/65">{feature.body}</p>
              </motion.article>
            ))}
          </div>

          {/* CTA — the flagship, and where to find it */}
          <div className="mt-16 flex flex-col items-start justify-between gap-8 rounded-xl border border-signal/30 bg-signal/[0.06] p-8 sm:flex-row sm:items-center sm:p-10">
            <div>
              <p className="label text-signal">Qublox flagship product</p>
              <p className="mt-3 max-w-md text-balance font-display text-[clamp(1.35rem,2.4vw,2rem)] font-semibold leading-[1.08] tracking-[-0.02em] text-bone">
                See it probe a live site.
              </p>
            </div>
            <a
              href={LOKEY_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="group inline-flex shrink-0 items-center gap-3 rounded-full bg-signal px-7 py-4 text-bone transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.03] focus-visible:scale-[1.03]"
            >
              <span className="label !text-[0.8rem] !tracking-[0.1em] text-bone">lokey.qubloxhq.com</span>
              <span className="transition-transform duration-300 group-hover:translate-x-1">↗</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * One claw gash. Drawn by scroll — pathLength rakes from the tip, with a hot
 * leading cap. Kept out of the parent so each gash owns its own transform.
 */
function Claw({
  d,
  start,
  progress,
  reduced,
}: {
  d: string
  start: number
  progress: ReturnType<typeof useScroll>['scrollYProgress']
  reduced: boolean
}) {
  const length = useScrollRange(progress, [start, start + 0.12], [0, 1])
  return (
    <motion.path
      d={d}
      fill="none"
      stroke="var(--color-signal)"
      strokeWidth={1.3}
      strokeLinecap="round"
      vectorEffect="non-scaling-stroke"
      filter="url(#claw-glow)"
      style={{ pathLength: reduced ? 1 : length }}
    />
  )
}
