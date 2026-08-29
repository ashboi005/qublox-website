'use client'

import { motion, useScroll } from 'motion/react'
import { useScrollRange } from '@/lib/useScrollRange'
import { useRef } from 'react'
import { ChannelSplitLogo } from '@/components/hero/ChannelSplitLogo'
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
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  const hero = settings.hero
  // Falls back to the services' own short forms if the wall is left empty.
  const lines = hero.marquee

  const tvOpacity = useScrollRange(scrollYProgress, [0, 0.72, 1], [1, 1, 0])
  const chromeOpacity = useScrollRange(scrollYProgress, [0, 0.35], [1, 0])

  return (
    <section
      ref={ref}
      id="hero"
      data-ground="bone"
      className="relative h-[220vh]"
      data-channel="hero"
      aria-label="Qublox"
    >
      <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden">
        {/* ---- the plate copy of the scrolling column, behind the set ---- */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 flex h-[190vh] w-[190vw] -translate-x-1/2 -translate-y-1/2 items-center justify-center">
          <ScrollLines lines={lines} progress={scrollYProgress} />
        </div>

        {/* ---- the set --------------------------------------------------- */}
        <motion.div className="relative z-10" style={{ opacity: tvOpacity }}>
          <RetroTV brand={hero.tvBrand} model={hero.tvModel} channel={hero.tvChannel}>
            <div className="absolute inset-0 z-10 grid place-items-center p-[6%]">
              <div className="h-full w-auto" style={{ aspectRatio: '1 / 1' }}>
                <ChannelSplitLogo />
              </div>
            </div>
          </RetroTV>
        </motion.div>

        {/* ---- instrument chrome ----------------------------------------- */}
        <motion.div
          style={{ opacity: chromeOpacity }}
          className="pointer-events-none absolute inset-0 z-20"
        >
          {/* bottom instrument strip, lifted from the cassette plate */}
          <div className="edge-x rule-t absolute inset-x-0 bottom-0 flex items-center justify-between py-4 text-ink/45">
            <span className="label">{hero.serial}</span>
            <span className="label hidden sm:inline">{settings.location}</span>
            <span className="label">{hero.established}</span>
          </div>

          {/* scroll cue */}
          <div className="absolute inset-x-0 bottom-[3.4rem] flex justify-center">
            <motion.span
              className="label text-ink/40"
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              {hero.scrollCue}
            </motion.span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
