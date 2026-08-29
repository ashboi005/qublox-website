'use client'

import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from 'motion/react'
import { useRef, useState } from 'react'
import { BEATS, RetroDesktop } from '@/components/tech/RetroDesktop'
import { TurboWindow } from '@/components/tech/TurboWindow'
import { Manifest } from '@/components/tech/Manifest'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { useScrollRange } from '@/lib/useScrollRange'
import type { SiteSettings } from '@/types/content'

/**
 * CH 04 — SYSTEMS. One machine, from cold to running, under a single sticky
 * viewport.
 *
 * The tube strikes, static clears, the raster opens, the BIOS counts memory,
 * the desktop paints over it, a cursor crosses and opens the app, the app
 * throws an error, the error is dismissed, the command types itself and the
 * manifest lists out. Every step is a scroll position.
 *
 * It is one section on purpose. An earlier version split the boot and the
 * desktop across two sticky sections, which left a screen of scroll between
 * them where the boot screen slid away and nothing replaced it — the machine
 * appeared to switch off and then switch on again as a different machine.
 * Sticky sections cannot hand over to each other cleanly; they have to be the
 * same section.
 */


export function Machine({ settings }: { settings: SiteSettings }) {
  const machine = settings.machine
  const BOOT = machine.bootLines
  const COMMAND = machine.command
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })

  // ---- cold start -------------------------------------------------------
  const dotScale = useScrollRange(scrollYProgress, [0, 0.03, BEATS.strike[1]], [0, 1.6, 1])
  const dotOpacity = useScrollRange(scrollYProgress, [0, 0.02, 0.06, 0.08], [0, 1, 1, 0])
  const lineWidth = useScrollRange(scrollYProgress, [...BEATS.scan], ['0%', '100%'])
  const lineOpacity = useScrollRange(
    scrollYProgress,
    [BEATS.scan[0] - 0.01, BEATS.scan[0] + 0.01, BEATS.raster[0], BEATS.raster[1]],
    [0, 1, 1, 0],
  )
  const noiseOpacity = useScrollRange(
    scrollYProgress,
    [BEATS.noise[0], BEATS.noise[0] + 0.02, BEATS.noise[1] - 0.01, BEATS.noise[1]],
    [0, 0.5, 0.5, 0],
  )
  const rasterHeight = useScrollRange(scrollYProgress, [...BEATS.raster], ['0%', '100%'])
  const bootOpacity = useScrollRange(
    scrollYProgress,
    [BEATS.boot[0], BEATS.boot[0] + 0.02, BEATS.paint[0], BEATS.paint[1]],
    [0, 1, 1, 0],
  )
  const bootLines = useScrollRange(scrollYProgress, [...BEATS.boot], [0, BOOT.length])

  // ---- the application --------------------------------------------------
  const [typed, setTyped] = useState(0)
  const typing = useScrollRange(scrollYProgress, [...BEATS.command], [0, COMMAND.length])
  useMotionValueEvent(typing, 'change', (value) => {
    const next = Math.round(Math.min(COMMAND.length, Math.max(0, value)))
    if (next !== typed) setTyped(next)
  })

  const [revealed, setRevealed] = useState(0)
  const listing = useScrollRange(scrollYProgress, [...BEATS.listing], [0, machine.modules.length])
  useMotionValueEvent(listing, 'change', (value) => {
    const next = Math.floor(Math.min(machine.modules.length, Math.max(0, value)))
    if (next !== revealed) setRevealed(next)
  })

  if (reduced) {
    return (
      <section
        ref={ref}
        id="tech"
        data-ground="void"
        data-channel="tech"
        className="edge-x relative py-[14vh]"
        aria-labelledby="tech-heading"
      >
        <div className="mx-auto max-w-[80rem]">
          <TurboWindow command={COMMAND} typed={COMMAND.length} fileName={machine.fileName}>
            <Manifest settings={settings} revealed={machine.modules.length} />
          </TurboWindow>
        </div>
      </section>
    )
  }

  return (
    <section
      ref={ref}
      id="tech"
      data-ground="void"
      data-channel="tech"
      className="relative h-[700vh]"
      aria-labelledby="tech-heading"
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-black">
        {/* the tube strikes */}
        <motion.span
          className="absolute top-1/2 left-1/2 block h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
          style={{ scale: dotScale, opacity: dotOpacity, boxShadow: '0 0 60px 18px rgba(255,255,255,0.75)' }}
        />
        <motion.span
          className="absolute top-1/2 left-1/2 block h-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
          style={{ width: lineWidth, opacity: lineOpacity, boxShadow: '0 0 40px 8px rgba(255,255,255,0.8)' }}
        />

        {/* static in the gap, so the hold is not dead air */}
        <motion.div
          className="absolute inset-0"
          style={{
            opacity: noiseOpacity,
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='s'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23s)'/%3E%3C/svg%3E\")",
            backgroundSize: '140px 140px',
          }}
          aria-hidden="true"
        />

        {/* the raster opens, and never closes again — everything after this
            paints on top of the same blue screen */}
        <motion.div
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 overflow-hidden bg-dos-blue"
          style={{ height: rasterHeight }}
        >
          <div className="scanlines absolute inset-0 z-10 opacity-25" aria-hidden="true" />
          <div
            className="pointer-events-none absolute inset-0 z-10"
            style={{ background: 'radial-gradient(88% 72% at 50% 50%, transparent 54%, rgba(0,0,0,0.5) 100%)' }}
            aria-hidden="true"
          />
          <motion.pre
            className="absolute inset-0 overflow-hidden px-[max(1.25rem,5vw)] py-[9vh] font-mono text-[clamp(0.6rem,1.3vw,0.9rem)] leading-[1.95] text-dos-grey"
            style={{ opacity: bootOpacity }}
            aria-hidden="true"
          >
            <BootReadout lines={BOOT} count={bootLines} />
          </motion.pre>

          {/* the operating system, painting over the boot screen */}
            <RetroDesktop progress={scrollYProgress} machine={machine}>
            <TurboWindow command={COMMAND} typed={typed} fileName={machine.fileName}>
              <Manifest settings={settings} revealed={revealed} />
            </TurboWindow>
          </RetroDesktop>
        </motion.div>
      </div>
    </section>
  )
}

function BootReadout({ lines, count }: { lines: string[]; count: MotionValue<number> }) {
  // Every line renders; a clip reveals them. One transform per frame rather
  // than one state update per line.
  const clip = useTransform(
    count,
    (value) => `inset(0 0 ${Math.max(0, 100 - (value / lines.length) * 100)}% 0)`,
  )
  return (
    <motion.span className="block whitespace-pre" style={{ clipPath: clip }}>
      {lines.join('\n')}
    </motion.span>
  )
}
