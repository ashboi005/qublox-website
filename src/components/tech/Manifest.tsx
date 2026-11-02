'use client'

import { motion } from 'motion/react'
import { useLayoutEffect, useRef, useState } from 'react'
import type { SiteSettings, TechModule } from '@/types/content'

/**
 * What is inside CAPABILITIES.TXT. Modules list out one at a time as the
 * scroll advances, so the reader is reading at the rate the machine types.
 */

/** Status reads as an instrument would print it: lowercase, coloured by state. */
const STATUS: Record<TechModule['status'], string> = {
  ONLINE: 'text-dos-cyan',
  STABLE: 'text-dos-grey',
  BETA: 'text-dos-yellow',
}

export function Manifest({ settings, revealed }: { settings: SiteSettings; revealed: number }) {
  // When the listing outgrows the screen (a phone, a short window), the output
  // scrolls up the way a terminal does, so the module just printed is always
  // the one in view. Measured only when the count changes or the screen
  // resizes, from layout offsets that ignore the window's opening scale.
  const rootRef = useRef<HTMLDivElement>(null)
  const [shift, setShift] = useState(0)
  useLayoutEffect(() => {
    const root = rootRef.current
    const viewport = root?.parentElement
    if (!root || !viewport) return
    const measure = () => {
      const rows = root.querySelectorAll<HTMLElement>('[data-module-row]')
      const last = revealed > 0 ? rows[Math.min(revealed, rows.length) - 1] : undefined
      // Once shifted, the root is transformed and becomes the rows' offset
      // parent; before that they share the frame as offset parent.
      const top = last ? (last.offsetParent === root ? last.offsetTop : last.offsetTop - root.offsetTop) : 0
      const bottom = last ? top + last.offsetHeight : 0
      setShift(Math.max(0, Math.ceil(bottom - viewport.clientHeight + 4)))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [revealed])

  return (
    <motion.div
      ref={rootRef}
      initial={false}
      animate={{ y: -shift }}
      transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
    >
      <h2 id="tech-heading" className="sr-only">
        What Qublox can do
      </h2>
      <p className="mb-4 max-w-[70ch] text-[clamp(0.8125rem,1.05vw,0.9375rem)] leading-[1.6]">
        {settings.machine.intro}
      </p>

      <div>
        {settings.machine.modules.map((module, index) => (
          <motion.div
            key={module._id}
            data-module-row
            className="border-t border-dos-grey/25 py-2.5 first:border-t-0 first:pt-0"
            initial={false}
            animate={{ opacity: index < revealed ? 1 : 0, x: index < revealed ? 0 : -8 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-0.5">
              <span className="text-xs tabular-nums text-dos-grey" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              {/* the module code is the first word of its own heading, not a badge above it */}
              <h3 className="text-[clamp(1rem,1.5vw,1.125rem)] leading-tight font-bold text-dos-yellow">
                <span className="mr-3 font-normal text-dos-cyan">{module.code}</span>
                {module.name}
              </h3>
              <span className={`ml-auto text-xs ${STATUS[module.status]}`}>
                {module.status.toLowerCase()}
              </span>
            </div>

            <ul className="mt-1.5 space-y-0.5">
              {module.lines.map((line) => (
                <li
                  key={line}
                  className="flex gap-2 text-[clamp(0.8125rem,1.02vw,0.9375rem)] leading-[1.55]"
                >
                  <span aria-hidden="true" className="text-dos-cyan/70">
                    ›
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
