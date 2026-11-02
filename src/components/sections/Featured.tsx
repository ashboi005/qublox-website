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
    body: 'An autonomous agent maps your site and chases whatever it finds, the way an attacker would, not the way a checklist would.',
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
  const taglineOpacity = useScrollRange(scrollYProgress, [0.32, 0.46], [0, 1])
  const taglineY = useScrollRange(scrollYProgress, [0.32, 0.46], [12, 0])
  // The ident sits under the tagline as a caption, after the line it captions.
  const identOpacity = useScrollRange(scrollYProgress, [0.4, 0.5], [0, 1])
  const cueOpacity = useScrollRange(scrollYProgress, [0.46, 0.52, 0.62], [0, 1, 0])

  return (
    <section
      id="featured"
      data-ground="void"
      data-channel="lokey"
      className="relative bg-void"
      aria-labelledby="featured-heading"
    >
      <div ref={trackRef} className="relative h-[200svh]">
      <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden bg-void">
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

        {/*
          The wordmark, bleeding up through the gashes. The column is not its
          own stacking context, so the mark can blend with the bloom: its
          near-black plate lightens away and only the horns and letters read,
          never the rectangle of the PNG.
        */}
        <div className="relative flex w-full max-w-[64rem] flex-col items-center px-6 text-center">
          <motion.img
            // eslint-disable-next-line @next/next/no-img-element
            src="/brand/lokey-mark.png"
            alt="Lokey"
            className="relative z-20 w-[min(72vw,42rem)] select-none mix-blend-lighten"
            style={{
              opacity: reduced ? 1 : markOpacity,
              scale: reduced ? 1 : markScale,
            }}
            draggable={false}
          />

          <motion.p
            id="featured-heading"
            className="relative z-20 mt-8 max-w-2xl text-balance font-display text-[clamp(1.375rem,3.2vw,2.375rem)] font-semibold leading-[1.08] tracking-[-0.025em] text-on-void"
            style={{ opacity: reduced ? 1 : taglineOpacity, y: reduced ? 0 : taglineY }}
          >
            Someone will try to break into your site.{' '}
            <span className="text-signal">Better it&apos;s us.</span>
          </motion.p>

          {/* the ident: two facts held apart by a hairline, the nav's own grammar */}
          <motion.p
            className="label relative z-20 mt-6 flex items-center gap-3 text-on-void-muted"
            style={{ opacity: reduced ? 1 : identOpacity }}
          >
            <span>Featured broadcast</span>
            <span aria-hidden="true" className="h-px w-8 bg-on-void-muted/50" />
            <span className="text-signal">Product 001</span>
          </motion.p>
        </div>

        {/* scroll cue, visible only in the handoff between the reveal and the pitch */}
        <motion.span
          className="label absolute bottom-7 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 text-on-void-muted"
          style={{ opacity: reduced ? 0 : cueOpacity }}
          aria-hidden="true"
        >
          Keep scrolling
          <span className="h-6 w-px bg-on-void-muted/50" />
        </motion.span>
      </div>
      </div>

      {/* the pitch — flowed, in the site's own reading grammar */}
      <div className="edge-x relative z-20 bg-void pb-[16svh] text-on-void">
        <div className="mx-auto max-w-[76rem]">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="min-w-0 lg:col-span-7">
              <StretchHeading
                as="h3"
                className="text-[clamp(2.25rem,6vw,5rem)] text-on-void"
                from={72}
                to={116}
              >
                An AI that attacks<br />your site first.
              </StretchHeading>
            </div>
            <p className="max-w-xl text-pretty text-lead leading-[1.55] text-on-void-muted lg:col-span-5 lg:pb-2">
              Lokey points an autonomous security agent at your website. It probes it the way a
              real intruder would, proves what it can actually reach, and hands you a ranked list
              of what to fix, in plain English.
            </p>
          </div>

          {/* the three moves: a ruled spec sheet, read across, not three tiles */}
          <ol className="mt-20 border-b border-on-void/15">
            {FEATURES.map((feature) => (
              <motion.li
                key={feature.code}
                className="relative grid gap-x-8 gap-y-3 py-8 md:grid-cols-12 md:items-baseline md:py-10"
                initial={reduced ? false : { y: 12 }}
                whileInView={{ y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* the hairline draws itself across as the row arrives */}
                <motion.span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-px origin-left bg-on-void/15"
                  initial={reduced ? false : { scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                />
                <span
                  className="display text-[clamp(1.75rem,3vw,2.5rem)] text-signal md:col-span-3"
                  style={{ ['--wdth' as string]: 112 }}
                >
                  {feature.code}
                </span>
                <h4 className="text-balance font-display text-title font-semibold leading-[1.15] tracking-[-0.015em] text-on-void md:col-span-4">
                  {feature.title}
                </h4>
                <p className="max-w-[46ch] text-pretty text-md leading-[1.6] text-on-void-muted md:col-span-5">
                  {feature.body}
                </p>
              </motion.li>
            ))}
          </ol>

          {/* CTA — the flagship, and where to find it */}
          <div className="mt-20 flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-end">
            <div>
              <p className="max-w-md text-balance font-display text-[clamp(1.5rem,2.6vw,2.25rem)] font-semibold leading-[1.08] tracking-[-0.02em] text-on-void">
                See it probe a live site.
              </p>
              <p className="label mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-on-void-muted">
                <span>Qublox flagship product</span>
                <span aria-hidden="true" className="h-px w-8 bg-on-void-muted/50" />
                <span className="font-mono text-on-void">lokey.qubloxhq.com</span>
              </p>
            </div>
            <a
              href={LOKEY_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex min-h-12 shrink-0 items-center rounded-card bg-accent-deep px-7 text-md font-semibold text-on-accent-deep transition-transform duration-[var(--dur-short)] ease-out hover:-translate-y-0.5"
            >
              Open Lokey
              <span className="sr-only"> (opens lokey.qubloxhq.com in a new tab)</span>
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
