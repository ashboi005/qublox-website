'use client'

import { motion, useTransform, type MotionValue } from 'motion/react'
import { useScrollRange } from '@/lib/useScrollRange'

/**
 * The desktop the BIOS boots into.
 *
 * The section used to hand off by scrolling from a boot screen to a terminal
 * panel, which threw away everything the boot had built up — you sat through a
 * machine starting and then simply scrolled past it. This keeps the machine in
 * charge: the desktop paints, a cursor crosses it, opens the app, hits an
 * error, dismisses it, and types the command that fills the window. Every step
 * is a scroll position, so you are driving the machine rather than watching a
 * recording of one.
 *
 * The look is CGA-era: a dithered teal ground, chunky bevels, a taskbar with a
 * clock that does not tick.
 */

/**
 * Beats as fractions of the whole machine section — the boot and the desktop
 * share one scroll range, because they are one machine starting up. Splitting
 * them across two sticky sections left a screen's worth of scroll between the
 * BIOS finishing and the desktop appearing, which read as the machine being
 * switched off and a different one switched on.
 */
export const BEATS = {
  /** the tube strikes, static, the raster opens, the BIOS runs */
  strike: [0.0, 0.05] as const,
  scan: [0.05, 0.11] as const,
  noise: [0.1, 0.16] as const,
  raster: [0.16, 0.23] as const,
  boot: [0.23, 0.35] as const,
  /** the desktop takes over */
  paint: [0.36, 0.44] as const,
  travel: [0.45, 0.56] as const,
  select: [0.56, 0.59] as const,
  open: [0.59, 0.65] as const,
  error: [0.67, 0.71] as const,
  dismiss: [0.74, 0.79] as const,
  command: [0.81, 0.88] as const,
  listing: [0.88, 0.99] as const,
}

const ICONS = [
  { label: 'CAPABILITIES.TXT', kind: 'doc' as const, x: 1.5, y: 9 },
  { label: 'QUBLOX.EXE', kind: 'app' as const, x: 1.5, y: 31 },
  { label: 'REEL_2025.AVI', kind: 'film' as const, x: 1.5, y: 53 },
]

/** Cursor waypoints, as percentages of the desktop. */
const WAYPOINTS = {
  start: { x: 78, y: 86 },
  icon: { x: 6, y: 36 },
  ok: { x: 51, y: 58 },
  prompt: { x: 34, y: 16 },
}

export function RetroDesktop({
  progress,
  children,
}: {
  progress: MotionValue<number>
  children: React.ReactNode
}) {
  const paint = useScrollRange(progress, [...BEATS.paint], [0, 1])

  // The cursor's whole route as one interpolation across four waypoints, so it
  // never jumps between beats.
  const route = [BEATS.travel[0], BEATS.travel[1], BEATS.dismiss[0], BEATS.dismiss[1], BEATS.command[0]]
  const cursorX = useScrollRange(progress, route, [
    WAYPOINTS.start.x,
    WAYPOINTS.icon.x,
    WAYPOINTS.icon.x,
    WAYPOINTS.ok.x,
    WAYPOINTS.prompt.x,
  ])
  const cursorY = useScrollRange(progress, route, [
    WAYPOINTS.start.y,
    WAYPOINTS.icon.y,
    WAYPOINTS.icon.y,
    WAYPOINTS.ok.y,
    WAYPOINTS.prompt.y,
  ])
  const left = useTransform(cursorX, (v) => `${v}%`)
  const top = useTransform(cursorY, (v) => `${v}%`)

  // Each click is a single beat of compression at the moment of contact.
  const cursorScale = useScrollRange(
    progress,
    [BEATS.select[0], BEATS.select[0] + 0.012, BEATS.select[1], BEATS.dismiss[1], BEATS.dismiss[1] + 0.012, BEATS.dismiss[1] + 0.03],
    [1, 0.75, 1, 1, 0.75, 1],
  )

  const selected = useScrollRange(progress, [...BEATS.select], [0, 1])
  const selectedBg = useTransform(selected, (v) => `rgba(0,0,168,${v})`)

  const windowScale = useScrollRange(progress, [...BEATS.open], [0.1, 1])
  const windowOpacity = useScrollRange(progress, [BEATS.open[0], BEATS.open[0] + 0.02], [0, 1])

  const errorOpacity = useScrollRange(
    progress,
    [BEATS.error[0], BEATS.error[1], BEATS.dismiss[1], BEATS.dismiss[1] + 0.02],
    [0, 1, 1, 0],
  )
  const errorScale = useScrollRange(progress, [...BEATS.error], [0.86, 1])

  return (
    <motion.div
      className="absolute inset-0 overflow-hidden"
      style={{
        opacity: paint,
        backgroundColor: '#0f7373',
        // A 2px checker at 4px pitch: the CGA dither, not a gradient.
        backgroundImage: 'repeating-conic-gradient(#0d6a6a 0% 25%, #0f7373 0% 50%)',
        backgroundSize: '4px 4px',
      }}
    >
      {ICONS.map((icon, index) => (
        <DesktopIcon
          key={icon.label}
          icon={icon}
          highlight={index === 1 ? selectedBg : undefined}
        />
      ))}

      {/*
        The window opens from the icon it was launched from, so its transform
        origin is the top-left and it is inset far enough from the left edge to
        leave the icon column visible. A window that covers the icons makes the
        double-click that opened it unreadable in hindsight.
      */}
      <motion.div
        className="absolute top-[6%] right-[3%] bottom-[11%] left-[15%] origin-top-left sm:left-[13%]"
        style={{ scale: windowScale, opacity: windowOpacity }}
      >
        {children}
      </motion.div>

      {/* the error box */}
      <motion.div
        className="absolute top-1/2 left-1/2 z-40 w-[min(88vw,26rem)] -translate-x-1/2 -translate-y-1/2"
        style={{ opacity: errorOpacity, scale: errorScale }}
        aria-hidden="true"
      >
        <Bevel>
          <div className="flex items-center justify-between bg-dos-blue px-2 py-1">
            <span className="font-mono text-[0.68rem] tracking-[0.1em] text-dos-white">QUBLOX.EXE</span>
            <span className="border border-[#5a5a5a] bg-[#c0c0c0] px-1.5 font-mono text-[0.6rem] leading-none text-black">
              ×
            </span>
          </div>
          <div className="flex gap-3 px-4 py-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-[#a80000] font-mono text-lg font-bold text-[#a80000]">
              !
            </span>
            <div className="font-mono text-[0.72rem] leading-[1.7] text-black">
              <p>Cannot enumerate capabilities from the shell.</p>
              <p className="mt-1 opacity-70">Read CAPABILITIES.TXT directly instead?</p>
            </div>
          </div>
          <div className="flex justify-center gap-2 pb-4">
            <BevelButton>OK</BevelButton>
            <BevelButton>Cancel</BevelButton>
          </div>
        </Bevel>
      </motion.div>

      {/* taskbar */}
      <div className="absolute inset-x-0 bottom-0 z-30 flex items-center gap-2 border-t-2 border-t-white/70 bg-[#c0c0c0] px-2 py-1">
        <BevelButton>START</BevelButton>
        <span className="h-4 w-px bg-[#8a8a8a]" />
        <motion.span
          className="border border-[#8a8a8a] px-2 py-0.5 font-mono text-[0.62rem] text-black"
          style={{ opacity: windowOpacity }}
        >
          QUBLOX.EXE
        </motion.span>
        <span className="ml-auto border border-[#8a8a8a] px-2 py-0.5 font-mono text-[0.62rem] tabular-nums text-black">
          04:12
        </span>
      </div>

      {/* the cursor */}
      <motion.svg
        viewBox="0 0 12 18"
        className="pointer-events-none absolute z-50 h-5 w-4 drop-shadow-[1px_1px_0_rgba(0,0,0,0.55)]"
        style={{ left, top, scale: cursorScale, originX: 0, originY: 0 }}
        aria-hidden="true"
      >
        <path
          d="M0 0 L0 14 L3.4 10.8 L5.6 16 L7.8 15 L5.7 10 L10 10 Z"
          fill="#ffffff"
          stroke="#000000"
          strokeWidth="1"
        />
      </motion.svg>
    </motion.div>
  )
}

function DesktopIcon({
  icon,
  highlight,
}: {
  icon: (typeof ICONS)[number]
  highlight?: MotionValue<string>
}) {
  return (
    <div
      className="absolute w-[11%] min-w-[4.5rem] text-center"
      style={{ left: `${icon.x}%`, top: `${icon.y}%` }}
      aria-hidden="true"
    >
      <div className="mx-auto grid h-10 w-10 place-items-center">
        <IconArt kind={icon.kind} />
      </div>
      <motion.span
        className="mt-1 inline-block px-1 font-mono text-[0.55rem] leading-tight break-words text-white"
        style={highlight ? { backgroundColor: highlight } : undefined}
      >
        {icon.label}
      </motion.span>
    </div>
  )
}

function IconArt({ kind }: { kind: 'doc' | 'app' | 'film' }) {
  if (kind === 'doc') {
    return (
      <svg viewBox="0 0 24 28" className="h-9 w-9">
        <path d="M2 1h13l7 7v19H2Z" fill="#ffffff" stroke="#000" strokeWidth="1.2" />
        <path d="M15 1v7h7" fill="#d4d0c8" stroke="#000" strokeWidth="1.2" />
        <g stroke="#0000a8" strokeWidth="1.2">
          <path d="M5 13h13M5 16h13M5 19h9" />
        </g>
      </svg>
    )
  }
  if (kind === 'film') {
    return (
      <svg viewBox="0 0 26 26" className="h-9 w-9">
        <rect x="1" y="5" width="24" height="16" fill="#1e1f20" stroke="#000" strokeWidth="1.2" />
        <g fill="#c0c0c0">
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={`t${i}`} x={3 + i * 4.6} y="6.5" width="2.6" height="2.4" />
          ))}
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={`b${i}`} x={3 + i * 4.6} y="17.2" width="2.6" height="2.4" />
          ))}
        </g>
        <rect x="4" y="10.5" width="18" height="5" fill="#0f7373" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 26 26" className="h-9 w-9">
      <rect x="1" y="1" width="24" height="24" fill="#c0c0c0" stroke="#000" strokeWidth="1.2" />
      <rect x="4" y="4" width="18" height="12" fill="#0000a8" />
      <path d="M7 8h4M7 11h9" stroke="#55ffff" strokeWidth="1.2" />
      <rect x="6" y="19" width="14" height="3" fill="#8a8a8a" />
    </svg>
  )
}

/** The raised chrome every box on this desktop is made of. */
function Bevel({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-2 border-t-white border-l-white border-r-[#5a5a5a] border-b-[#5a5a5a] bg-[#c0c0c0] shadow-[2px_2px_0_rgba(0,0,0,0.45)]">
      {children}
    </div>
  )
}

function BevelButton({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block border-2 border-t-white border-l-white border-r-[#5a5a5a] border-b-[#5a5a5a] bg-[#c0c0c0] px-3 py-0.5 font-mono text-[0.66rem] tracking-[0.06em] text-black">
      {children}
    </span>
  )
}
