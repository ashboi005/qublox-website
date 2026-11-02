'use client'

import { motion, useScroll } from 'motion/react'
import { useScrollRange } from '@/lib/useScrollRange'
import { useRef } from 'react'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { TvScreen } from '@/components/hero/TvScreen'
import { useBroadcast } from '@/components/hero/useBroadcast'
import { RetroTV } from '@/components/hero/RetroTV'
import { ScrollLines } from '@/components/hero/ScrollLines'
import type { SiteSettings } from '@/types/content'

/**
 * Hero — CH 01, SIGNAL.
 *
 * The service names run up the page in outsized type and the set stands in
 * front of them, masking whatever passes behind it. The screen carries one
 * thing only: the mark, broadcast through the tube.
 */

export function Hero({ settings }: { settings: SiteSettings }) {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  const hero = settings.hero
  // Channel 0 is the logo; the broadcast words follow it.
  const broadcasts = hero.broadcasts
  const { channel, powered, glitch, tune, togglePower } = useBroadcast(broadcasts.length + 1)
  // Falls back to the services' own short forms if the wall is left empty.
  const lines = hero.marquee

  const tvOpacity = useScrollRange(scrollYProgress, [0, 0.72, 1], [1, 1, 0])
  const chromeOpacity = useScrollRange(scrollYProgress, [0, 0.35], [1, 0])

  return (
    <section
      ref={ref}
      id="hero"
      data-ground="bone"
      className="relative h-[220svh]"
      data-channel="hero"
      aria-label="Qublox"
    >
      <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden">
        {/* ---- the plate copy of the scrolling column, behind the set ---- */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 flex h-[190svh] w-[190vw] -translate-x-1/2 -translate-y-1/2 items-center justify-center">
          <ScrollLines lines={lines} progress={scrollYProgress} />
        </div>

        {/* ---- the set --------------------------------------------------- */}
        <motion.div className="relative z-10" style={{ opacity: tvOpacity }}>
          <RetroTV
            brand={hero.tvBrand}
            model={hero.tvModel}
            channel={`${hero.tvChannel} ${String(channel + 1).padStart(2, '0')}`}
            channelIndex={channel}
            powered={powered}
            onTune={(direction) => tune(channel + direction)}
            onPower={togglePower}
          >
            <div className="absolute inset-0 z-10 grid place-items-center p-[6%]">
              <div className="h-full w-auto" style={{ aspectRatio: '1 / 1' }}>
                <TvScreen
                  word={channel === 0 ? null : (broadcasts[channel - 1] ?? null)}
                  powered={powered}
                  glitch={glitch}
                />
              </div>
            </div>
          </RetroTV>
        </motion.div>

        {/* ---- instrument chrome ----------------------------------------- */}
        <motion.div
          style={{ opacity: chromeOpacity }}
          className="pointer-events-none absolute inset-0 z-20"
        >
          {/* bottom instrument strip, lifted from the cassette plate: the
              set's papers, quiet, in the reading voice. */}
          <div className="edge-x rule-t absolute inset-x-0 bottom-0 grid grid-cols-2 items-center gap-x-6 py-4 text-muted sm:grid-cols-3">
            <span className="label font-normal tabular-nums">{hero.serial}</span>
            <span className="label hidden text-center font-normal tabular-nums sm:inline">
              {settings.location}
            </span>
            <span className="label text-right font-normal">{hero.established}</span>
          </div>

          {/* scroll cue: the words, and a short hairline under them that
              breathes downward. Slow, small, and still under reduced motion. */}
          <div className="absolute inset-x-0 bottom-[3.75rem] flex flex-col items-center gap-2">
            <span className="label text-ink-2">{hero.scrollCue}</span>
            <span aria-hidden="true" className="relative block h-6 w-px overflow-hidden">
              <span className="absolute inset-0 bg-rule" />
              <motion.span
                className="absolute inset-x-0 top-0 block h-full origin-top bg-ink-2"
                initial={false}
                animate={reduced ? { scaleY: 0.5, y: '0%' } : { scaleY: [0, 1, 1], y: ['0%', '0%', '100%'] }}
                transition={
                  reduced
                    ? { duration: 0 }
                    : {
                        duration: 2.6,
                        times: [0, 0.45, 1],
                        ease: [[0.16, 1, 0.3, 1], [0.65, 0, 0.35, 1]],
                        repeat: Infinity,
                        repeatDelay: 0.6,
                      }
                }
              />
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
