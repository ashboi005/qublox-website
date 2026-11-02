'use client'

import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from 'motion/react'
import { useRef, useState } from 'react'
import { BEATS, RetroDesktop, eased, easeOutCurve } from '@/components/tech/RetroDesktop'
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
  // Each beat is mapped through the site's curves (see `eased`), so nothing on
  // the tube starts or stops at full speed at the edge of its range.
  const dotScale = useScrollRange(scrollYProgress, ...eased([0, 0.03, BEATS.strike[1]], [0, 1.4, 1]))
  const dotOpacity = useScrollRange(scrollYProgress, ...eased([0, 0.02, 0.06, 0.08], [0, 1, 1, 0]))
  // The scan line is drawn by scaling a full-width line from its centre: a
  // transform, not a width.
  const lineScale = useScrollRange(scrollYProgress, ...eased(BEATS.scan, [0, 1], easeOutCurve, 8))
  const lineOpacity = useScrollRange(
    scrollYProgress,
    ...eased([BEATS.scan[0] - 0.01, BEATS.scan[0] + 0.01, BEATS.raster[0], BEATS.raster[1]], [0, 1, 1, 0]),
  )
  const noiseOpacity = useScrollRange(
    scrollYProgress,
    ...eased([BEATS.noise[0], BEATS.noise[0] + 0.02, BEATS.noise[1] - 0.01, BEATS.noise[1]], [0, 0.4, 0.4, 0]),
  )
  // The raster opens from the centre line outward as a clip, so the screen
  // under it never changes size and nothing inside it reflows.
  const rasterOpen = useScrollRange(scrollYProgress, ...eased(BEATS.raster, [0, 1], easeOutCurve, 8))
  const rasterClip = useTransform(rasterOpen, (v) => {
    const edge = ((1 - v) * 50).toFixed(3)
    return `inset(${edge}% 0% ${edge}% 0%)`
  })
  const bootOpacity = useScrollRange(
    scrollYProgress,
    ...eased([BEATS.boot[0], BEATS.boot[0] + 0.02, BEATS.paint[0], BEATS.paint[1]], [0, 1, 1, 0]),
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
        className="edge-x relative py-[14svh]"
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
      className="relative h-[700svh]"
      aria-labelledby="tech-heading"
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-void">
        {/* the tube strikes */}
        <motion.span
          className="absolute top-1/2 left-1/2 block h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-dos-white"
          style={{
            scale: dotScale,
            opacity: dotOpacity,
            boxShadow: '0 0 48px 14px color-mix(in oklab, var(--color-dos-white) 60%, transparent)',
          }}
          aria-hidden="true"
        />
        <motion.span
          className="absolute inset-x-0 top-1/2 block h-[2px] -translate-y-1/2 bg-dos-white will-change-transform"
          style={{
            scaleX: lineScale,
            opacity: lineOpacity,
            boxShadow: '0 0 28px 6px color-mix(in oklab, var(--color-dos-white) 55%, transparent)',
          }}
          aria-hidden="true"
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
          className="absolute inset-0 overflow-hidden bg-dos-blue"
          style={{ clipPath: rasterClip }}
        >
          <div className="scanlines absolute inset-0 z-10 opacity-25" aria-hidden="true" />
          <div
            className="pointer-events-none absolute inset-0 z-10"
            style={{
              background:
                'radial-gradient(88% 72% at 50% 50%, transparent 54%, color-mix(in oklab, var(--color-void) 50%, transparent) 100%)',
            }}
            aria-hidden="true"
          />
          <motion.pre
            className="absolute inset-0 overflow-hidden px-[max(1.25rem,5vw)] py-[9svh] font-mono text-[clamp(0.75rem,1.3vw,0.95rem)] leading-[1.9] text-dos-grey"
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
  // than one state update per line. The clip steps a whole line at a time, the
  // way a BIOS prints, so a line is never shown sliced through its middle.
  const clip = useTransform(count, (value) => {
    const shown = Math.min(lines.length, Math.max(0, Math.floor(value + 0.0001)))
    return `inset(0 0 ${(100 - (shown / lines.length) * 100).toFixed(3)}% 0)`
  })
  return (
    <motion.span className="block whitespace-pre" style={{ clipPath: clip }}>
      {lines.join('\n')}
    </motion.span>
  )
}
