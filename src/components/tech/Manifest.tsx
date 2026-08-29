'use client'

import { motion } from 'motion/react'
import type { SiteSettings, TechModule } from '@/types/content'

/**
 * What is inside CAPABILITIES.TXT. Modules list out one at a time as the
 * scroll advances, so the reader is reading at the rate the machine types.
 */

const STATUS: Record<TechModule['status'], { color: string; mark: string }> = {
  ONLINE: { color: 'text-dos-cyan', mark: '■' },
  STABLE: { color: 'text-dos-grey', mark: '■' },
  BETA: { color: 'text-dos-yellow', mark: '▲' },
}

export function Manifest({ settings, revealed }: { settings: SiteSettings; revealed: number }) {
  return (
    <div>
      <h2 id="tech-heading" className="sr-only">
        What Qublox can do
      </h2>
      <p className="mb-3 max-w-[74ch] text-[clamp(0.66rem,1.05vw,0.8rem)] leading-[1.7]">
        {settings.techIntro}
      </p>

      <div>
        {settings.techModules.map((module, index) => (
          <motion.div
            key={module._id}
            className="border-t border-dos-grey/25 py-2 first:border-t-0 first:pt-0"
            initial={false}
            animate={{ opacity: index < revealed ? 1 : 0, x: index < revealed ? 0 : -8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
              <span className="text-[0.66rem] tabular-nums opacity-60">
                {String(index + 1).padStart(2, '0')}:
              </span>
              <span className="border border-dos-cyan/50 px-1.5 text-[0.62rem] tracking-[0.12em] text-dos-cyan">
                {module.code}
              </span>
              <h3 className="text-[clamp(0.82rem,1.5vw,1rem)] font-bold tracking-[0.02em] text-dos-yellow">
                {module.name}
              </h3>
              <span className={`ml-auto text-[0.62rem] tracking-[0.14em] ${STATUS[module.status].color}`}>
                {STATUS[module.status].mark} {module.status}
              </span>
            </div>

            <ul className="mt-1 space-y-px">
              {module.lines.map((line) => (
                <li
                  key={line}
                  className="flex gap-2 text-[clamp(0.62rem,1.02vw,0.78rem)] leading-[1.55]"
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
    </div>
  )
}

