'use client'

import { motion, useTransform, type MotionValue } from 'motion/react'
import { useScrollRange } from '@/lib/useScrollRange'
import type { MachineSettings } from '@/types/content'

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

/** The site's two curves, as functions of t in [0,1]. */
export const easeOutCurve = (t: number) => 1 - Math.pow(1 - t, 3)
export const easeInOutCurve = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/**
 * Scroll ranges are linear by nature, so a value mapped straight across a beat
 * starts and stops at full speed and every waypoint is a visible kink. This
 * samples a curve across each segment of a route, so a scroll-linked value
 * leaves and settles gently and a multi-stop route (the cursor) slows into
 * each waypoint instead of bouncing off it. Holds (equal neighbouring values)
 * stay flat.
 */
export function eased(
  stops: readonly number[],
  values: readonly number[],
  curve: (t: number) => number = easeInOutCurve,
  samples = 6,
): [number[], number[]] {
  const outStops: number[] = []
  const outValues: number[] = []
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i]!
    const b = stops[i + 1]!
    const from = values[i]!
    const to = values[i + 1]!
    const n = from === to ? 1 : samples
    for (let j = 0; j < n; j++) {
      const t = j / n
      outStops.push(a + (b - a) * t)
      outValues.push(from + (to - from) * curve(t))
    }
  }
  outStops.push(stops[stops.length - 1]!)
  outValues.push(values[values.length - 1]!)
  return [outStops, outValues]
}

/** Where each icon sits, in order. The labels themselves come from the CMS. */
const ICON_SLOTS = [
  { x: 1.5, y: 9 },
  { x: 1.5, y: 31 },
  { x: 1.5, y: 53 },
  { x: 1.5, y: 75 },
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
  machine,
  children,
}: {
  progress: MotionValue<number>
  machine: MachineSettings
  children: React.ReactNode
}) {
  const icons = machine.icons.slice(0, ICON_SLOTS.length)
  // The application icon is the one the cursor opens; second if there is one.
  const launched = Math.min(1, icons.length - 1)
  const paint = useScrollRange(progress, ...eased(BEATS.paint, [0, 1]))

  // The cursor's whole route as one interpolation across four waypoints, so it
  // never jumps between beats; each leg eases out of one waypoint and into the
  // next, the way a hand moves a mouse.
  const route = [BEATS.travel[0], BEATS.travel[1], BEATS.dismiss[0], BEATS.dismiss[1], BEATS.command[0]]
  const cursorX = useScrollRange(
    progress,
    ...eased(route, [WAYPOINTS.start.x, WAYPOINTS.icon.x, WAYPOINTS.icon.x, WAYPOINTS.ok.x, WAYPOINTS.prompt.x]),
  )
  const cursorY = useScrollRange(
    progress,
    ...eased(route, [WAYPOINTS.start.y, WAYPOINTS.icon.y, WAYPOINTS.icon.y, WAYPOINTS.ok.y, WAYPOINTS.prompt.y]),
  )
  // The cursor rides a full-size layer that is translated, so its position is
  // a transform, never a layout property. A layer's own percentage translate
  // is a percentage of the desktop because the layer is the desktop's size.
  const cursorLayerX = useTransform(cursorX, (v) => `${v}%`)
  const cursorLayerY = useTransform(cursorY, (v) => `${v}%`)

  // Each click is a single beat of compression at the moment of contact.
  const cursorScale = useScrollRange(
    progress,
    [BEATS.select[0], BEATS.select[0] + 0.012, BEATS.select[1], BEATS.dismiss[1], BEATS.dismiss[1] + 0.012, BEATS.dismiss[1] + 0.03],
    [1, 0.82, 1, 1, 0.82, 1],
  )

  const selected = useScrollRange(progress, ...eased(BEATS.select, [0, 1]))
  const selectedBg = useTransform(
    selected,
    (v) => `color-mix(in oklab, var(--color-dos-blue) ${Math.round(v * 100)}%, transparent)`,
  )

  // The window grows out of the icon on the arrival curve, and is fully
  // opaque before it is a third grown so it never reads as a ghost.
  const windowScale = useScrollRange(progress, ...eased(BEATS.open, [0.12, 1], easeOutCurve, 10))
  const windowOpacity = useScrollRange(progress, ...eased([BEATS.open[0], BEATS.open[0] + 0.02], [0, 1]))

  const errorOpacity = useScrollRange(
    progress,
    ...eased([BEATS.error[0], BEATS.error[1], BEATS.dismiss[1], BEATS.dismiss[1] + 0.02], [0, 1, 1, 0]),
  )
  const errorScale = useScrollRange(progress, ...eased(BEATS.error, [0.94, 1], easeOutCurve))

  return (
    <motion.div
      className="absolute inset-0 overflow-hidden"
      style={{
        opacity: paint,
        backgroundColor: 'var(--color-dos-teal)',
        // A 2px checker at 4px pitch: the CGA dither, not a gradient.
        backgroundImage:
          'repeating-conic-gradient(color-mix(in oklab, var(--color-dos-teal) 86%, var(--color-void)) 0% 25%, var(--color-dos-teal) 0% 50%)',
        backgroundSize: '4px 4px',
      }}
    >
      {icons.map((icon, index) => (
        <DesktopIcon
          key={icon.label}
          icon={{ ...icon, ...ICON_SLOTS[index]! }}
          highlight={index === launched ? selectedBg : undefined}
        />
      ))}

      {/*
        The window opens from the icon it was launched from, so its transform
        origin is the top-left and it is inset far enough from the left edge to
        leave the icon column visible. A window that covers the icons makes the
        double-click that opened it unreadable in hindsight.
      */}
      <motion.div
        className="absolute top-[6%] right-[3%] bottom-[11%] left-[15%] origin-top-left will-change-transform sm:left-[13%]"
        style={{ scale: windowScale, opacity: windowOpacity }}
      >
        {children}
      </motion.div>

      {/* the error box */}
      <motion.div
        className="absolute top-1/2 left-1/2 z-40 w-[min(88vw,27rem)] -translate-x-1/2 -translate-y-1/2"
        style={{ opacity: errorOpacity, scale: errorScale }}
        aria-hidden="true"
      >
        <Bevel>
          <div className="flex items-center justify-between bg-dos-blue px-2 py-1">
            <span className="font-mono text-xs text-dos-white">{machine.errorTitle}</span>
            <span className="border border-muted bg-dos-grey px-1.5 font-mono text-xs leading-none text-ink">
              ×
            </span>
          </div>
          <div className="flex gap-3 px-4 py-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-dos-maroon font-mono text-lg font-bold text-dos-maroon">
              !
            </span>
            <div className="font-mono text-xs leading-[1.6] text-ink">
              {machine.errorLines.map((line, index) => (
                <p key={line} className={index === 0 ? undefined : 'mt-1 text-ink-2'}>
                  {line}
                </p>
              ))}
            </div>
          </div>
          <div className="flex justify-center gap-2 pb-4">
            <BevelButton>OK</BevelButton>
            <BevelButton>Cancel</BevelButton>
          </div>
        </Bevel>
      </motion.div>

      {/* taskbar */}
      <div className="absolute inset-x-0 bottom-0 z-30 flex items-center gap-2 border-t-2 border-t-dos-white/70 bg-dos-grey px-2 py-1">
        <BevelButton>Start</BevelButton>
        <span className="h-4 w-px bg-muted" aria-hidden="true" />
        <motion.span
          className="border border-muted px-2 py-0.5 font-mono text-xs text-ink"
          style={{ opacity: windowOpacity }}
        >
          {machine.errorTitle}
        </motion.span>
        <span className="ml-auto border border-muted px-2 py-0.5 font-mono text-xs tabular-nums text-ink">
          04:12
        </span>
      </div>

      {/* the cursor, on a desktop-sized layer that is translated, not placed */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-50 will-change-transform"
        style={{ x: cursorLayerX, y: cursorLayerY }}
        aria-hidden="true"
      >
        <motion.svg
          viewBox="0 0 12 18"
          className="absolute top-0 left-0 h-5 w-4"
          style={{
            scale: cursorScale,
            originX: 0,
            originY: 0,
            filter: 'drop-shadow(1px 1px 0 color-mix(in oklab, var(--color-void) 55%, transparent))',
          }}
          aria-hidden="true"
        >
          <path
            d="M0 0 L0 14 L3.4 10.8 L5.6 16 L7.8 15 L5.7 10 L10 10 Z"
            className="fill-dos-white stroke-void"
            strokeWidth="1"
          />
        </motion.svg>
      </motion.div>
    </motion.div>
  )
}

function DesktopIcon({
  icon,
  highlight,
}: {
  icon: { label: string; kind: 'doc' | 'app' | 'film'; x: number; y: number }
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
        className="mt-1 inline-block px-1 font-mono text-xs leading-tight break-all text-dos-white"
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
      <svg viewBox="0 0 24 28" className="h-9 w-9" aria-hidden="true">
        <path d="M2 1h13l7 7v19H2Z" className="fill-dos-white stroke-void" strokeWidth="1.2" />
        <path d="M15 1v7h7" className="fill-dos-grey stroke-void" strokeWidth="1.2" />
        <g className="stroke-dos-blue" strokeWidth="1.2">
          <path d="M5 13h13M5 16h13M5 19h9" />
        </g>
      </svg>
    )
  }
  if (kind === 'film') {
    return (
      <svg viewBox="0 0 26 26" className="h-9 w-9" aria-hidden="true">
        <rect x="1" y="5" width="24" height="16" className="fill-void-3 stroke-void" strokeWidth="1.2" />
        <g className="fill-dos-grey">
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={`t${i}`} x={3 + i * 4.6} y="6.5" width="2.6" height="2.4" />
          ))}
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={`b${i}`} x={3 + i * 4.6} y="17.2" width="2.6" height="2.4" />
          ))}
        </g>
        <rect x="4" y="10.5" width="18" height="5" className="fill-dos-teal" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 26 26" className="h-9 w-9" aria-hidden="true">
      <rect x="1" y="1" width="24" height="24" className="fill-dos-grey stroke-void" strokeWidth="1.2" />
      <rect x="4" y="4" width="18" height="12" className="fill-dos-blue" />
      <path d="M7 8h4M7 11h9" className="stroke-dos-cyan" strokeWidth="1.2" />
      <rect x="6" y="19" width="14" height="3" className="fill-muted" />
    </svg>
  )
}

/** The raised chrome every box on this desktop is made of. */
function Bevel({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-2 border-t-dos-white border-l-dos-white border-r-muted border-b-muted bg-dos-grey shadow-lift">
      {children}
    </div>
  )
}

function BevelButton({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block border-2 border-t-dos-white border-l-dos-white border-r-muted border-b-muted bg-dos-grey px-3 py-0.5 font-mono text-xs text-ink">
      {children}
    </span>
  )
}
