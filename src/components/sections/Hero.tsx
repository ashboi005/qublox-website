'use client'

import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { RetroTV } from '@/components/hero/RetroTV'
import { ScrollLines } from '@/components/hero/ScrollLines'
import type { Service, SiteSettings } from '@/types/content'

/**
 * Hero — CH 01, SIGNAL.
 *
 * The set is centred and the scrolling service column is centred on the same
 * point, which is what lets the screen mask the words without measuring
 * anything. Scroll drives three things at once: the column travels, the set
 * recedes, and the whole hero dims as the next section takes over.
 */

export function Hero({ settings, services }: { settings: SiteSettings; services: Service[] }) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  const lines = services.map((service) => service.marquee)

  // The set pulls back and away as you leave.
  const tvScale = useTransform(scrollYProgress, [0, 1], [1, 0.72])
  const tvY = useTransform(scrollYProgress, [0, 1], [0, -60])
  const tvOpacity = useTransform(scrollYProgress, [0, 0.72, 1], [1, 1, 0])
  const chromeOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0])

  return (
    <section
      ref={ref}
      id="hero"
      data-ground="bone"
      className="relative h-[220vh]"
      aria-label="Qublox"
    >
      <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden">
        {/* ---- the plate copy of the scrolling column, behind the set ---- */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 flex h-[220vh] w-[190vw] -translate-x-1/2 -translate-y-1/2 items-center justify-center">
          <ScrollLines lines={lines} progress={scrollYProgress} variant="plate" />
        </div>

        {/* ---- the set --------------------------------------------------- */}
        <motion.div
          className="relative z-10"
          style={{ scale: tvScale, y: tvY, opacity: tvOpacity }}
        >
          <RetroTV lines={lines} linesProgress={scrollYProgress} />
        </motion.div>

        {/* ---- instrument chrome ----------------------------------------- */}
        <motion.div
          style={{ opacity: chromeOpacity }}
          className="pointer-events-none absolute inset-0 z-20"
        >
          {/* tagline, under the set */}
          <div className="edge-x absolute inset-x-0 bottom-[6.5rem] flex justify-center">
            <p className="max-w-[34ch] text-center text-[0.95rem] leading-relaxed text-ink/70 sm:text-base">
              {settings.tagline}
            </p>
          </div>

          {/* bottom instrument strip, lifted from the cassette plate */}
          <div className="edge-x rule-t absolute inset-x-0 bottom-0 flex items-center justify-between py-4 text-ink/45">
            <span className="label">NDFR-00 NMB 00001</span>
            <span className="label hidden sm:inline">{settings.location}</span>
            <span className="label">EST. 2019</span>
          </div>

          {/* scroll cue */}
          <div className="absolute inset-x-0 bottom-[3.4rem] flex justify-center">
            <motion.span
              className="label text-ink/40"
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              ↓ SCROLL TO TUNE
            </motion.span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
