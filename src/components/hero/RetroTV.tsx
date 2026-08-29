'use client'

import { motion, type MotionValue } from 'motion/react'
import { ChannelSplitLogo } from './ChannelSplitLogo'
import { ScrollLines } from './ScrollLines'

/**
 * The set. Everything about it is drawn — no images — so it can be sized
 * fluidly and lit from behind without a single raster asset.
 *
 * The screen is the mask. The second copy of ScrollLines lives inside it,
 * centred on exactly the same point as the copy on the page behind, which is
 * why the words appear to be picked up and re-broadcast as they pass through.
 * Both copies are centred on the hero's midpoint, so alignment needs no
 * measurement and survives every viewport.
 */

export function RetroTV({
  lines,
  linesProgress,
}: {
  lines: string[]
  linesProgress: MotionValue<number>
}) {
  return (
    <div className="relative w-[min(78vw,44rem)]">
      {/* ---- cabinet -------------------------------------------------- */}
      <div
        className="relative rounded-[1.6rem] p-[3.2%] shadow-[0_40px_80px_-30px_rgba(16,17,20,0.55)]"
        style={{
          background: 'linear-gradient(168deg, #2a2b30 0%, #16171b 42%, #0c0d10 100%)',
        }}
      >
        {/* faceplate bevel */}
        <div className="rounded-[1.1rem] bg-[#0a0b0d] p-[2.2%] ring-1 ring-white/8 ring-inset">
          {/* ---- screen ------------------------------------------------ */}
          <div
            className="relative isolate overflow-hidden rounded-[0.9rem] bg-black"
            style={{
              aspectRatio: '4 / 3',
              // The classic CRT bulge, faked with a corner-heavy inner shadow.
              boxShadow:
                'inset 0 0 60px 20px rgba(0,0,0,0.9), inset 0 0 14px 2px rgba(59,255,168,0.09)',
            }}
          >
            {/* masked copy of the scrolling lines, centred on the same point
                as the plate copy behind the set */}
            <div className="absolute top-1/2 left-1/2 h-[220vh] w-[190vw] -translate-x-1/2 -translate-y-1/2">
              <div className="flex h-full w-full items-center justify-center">
                <ScrollLines lines={lines} progress={linesProgress} variant="screen" />
              </div>
            </div>

            {/* the mark, broadcast */}
            <div className="absolute inset-0 z-10 grid place-items-center p-[9%]">
              <div className="h-full w-auto" style={{ aspectRatio: '300 / 340' }}>
                <ChannelSplitLogo />
              </div>
            </div>

            {/* phosphor wash */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-20"
              style={{
                background:
                  'radial-gradient(80% 60% at 50% 42%, rgba(59,255,168,0.10), transparent 70%)',
              }}
            />

            {/* scanlines + rolling bar */}
            <div className="scanlines pointer-events-none absolute inset-0 z-30 opacity-70" aria-hidden="true" />
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 z-30 h-[22%]"
              style={{
                background:
                  'linear-gradient(to bottom, transparent, rgba(255,255,255,0.045) 45%, transparent)',
                animation: 'crt-roll 7.5s linear infinite',
              }}
            />

            {/* glass */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-40 rounded-[0.9rem]"
              style={{
                background:
                  'linear-gradient(128deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.03) 28%, transparent 46%)',
              }}
            />
          </div>

          {/* ---- control strip ----------------------------------------- */}
          <div className="mt-[3%] flex items-center justify-between px-[2%]">
            <div className="label text-bone/35">QUBLOX · MODEL QX-CRT · 1984</div>
            <div className="flex items-center gap-[0.5rem]">
              {/* speaker grille */}
              <div className="flex gap-[2px]" aria-hidden="true">
                {Array.from({ length: 11 }, (_, i) => (
                  <span key={i} className="h-3 w-[2px] rounded-full bg-white/12" />
                ))}
              </div>
              {/* dials */}
              <span className="h-3.5 w-3.5 rounded-full bg-gradient-to-br from-white/30 to-white/5 ring-1 ring-white/15 ring-inset" />
              <span className="h-3.5 w-3.5 rounded-full bg-gradient-to-br from-white/30 to-white/5 ring-1 ring-white/15 ring-inset" />
              {/* power lamp */}
              <span className="h-2 w-2 rounded-full bg-signal shadow-[0_0_10px_2px_rgba(245,51,63,0.7)]" />
            </div>
          </div>
        </div>
      </div>

      {/* ---- antenna: where the signal thread is born ------------------ */}
      <svg
        aria-hidden="true"
        viewBox="0 0 200 120"
        className="absolute -top-[14%] left-1/2 h-[16%] w-[46%] -translate-x-1/2 overflow-visible text-ink/45"
      >
        <path d="M100 120 L54 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M100 120 L152 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="54" cy="8" r="4.5" fill="currentColor" />
        <circle cx="152" cy="18" r="4.5" fill="#f5333f" />
      </svg>

      {/* ---- legs ------------------------------------------------------ */}
      <div aria-hidden="true" className="mx-auto flex w-[62%] justify-between">
        <span className="h-4 w-6 skew-x-[16deg] rounded-b-md bg-[#16171b]" />
        <span className="h-4 w-6 -skew-x-[16deg] rounded-b-md bg-[#16171b]" />
      </div>
    </div>
  )
}
