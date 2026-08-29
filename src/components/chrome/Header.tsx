'use client'

import { useMotionValueEvent, useScroll } from 'motion/react'
import { useState } from 'react'
import { ScrambleText } from '@/components/ui/ScrambleText'

/**
 * The header is the set's front panel: wordmark, channel readout, and the
 * only navigation on the page. It sits in difference blend mode so it stays
 * legible as the ground goes bone → void → yellow without ever re-colouring.
 */

const CHANNELS = [
  { id: 'hero', label: 'CH 01', name: 'SIGNAL' },
  { id: 'about', label: 'CH 02', name: 'STUDIO' },
  { id: 'work', label: 'CH 03', name: 'WORK' },
  { id: 'tech', label: 'CH 04', name: 'SYSTEMS' },
  { id: 'team', label: 'CH 05', name: 'CREW' },
  { id: 'community', label: 'CH 06', name: 'ERISED' },
  { id: 'contact', label: 'CH 07', name: 'CONTACT' },
]

const NAV = [
  { id: 'work', label: 'Work' },
  { id: 'tech', label: 'Systems' },
  { id: 'team', label: 'Crew' },
  { id: 'community', label: 'ERISED' },
  { id: 'contact', label: 'Contact' },
]

export function Header() {
  const { scrollYProgress } = useScroll()
  const [channel, setChannel] = useState(CHANNELS[0]!)
  const [signal, setSignal] = useState(4)

  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    const index = Math.min(CHANNELS.length - 1, Math.floor(progress * CHANNELS.length))
    const next = CHANNELS[index]!
    if (next.id !== channel.id) setChannel(next)
    // Signal strength drifts with scroll — an instrument, not a progress bar.
    setSignal(1 + Math.floor(progress * 4.999))
  })

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-[100] mix-blend-difference">
      <div className="edge-x flex items-start justify-between py-5 text-bone">
        {/* Wordmark */}
        <a
          href="#hero"
          className="pointer-events-auto group flex items-baseline gap-2.5"
          aria-label="Qublox — back to top"
        >
          <ScrambleText
            text="QUBLOX"
            className="display text-[1.15rem] leading-none tracking-[0.02em] sm:text-[1.35rem]"
            dwell={340}
            stagger={55}
          />
          <span className="label hidden opacity-55 sm:inline">®</span>
        </a>

        {/* Channel readout — the current section, dressed as a tuner */}
        <div className="label hidden items-center gap-3 opacity-70 md:flex" aria-hidden="true">
          <span>{channel.label}</span>
          <span className="h-px w-6 bg-current opacity-40" />
          <span className="w-[7ch]">{channel.name}</span>
          <span className="flex items-end gap-[2px]" title="Signal">
            {[1, 2, 3, 4, 5].map((bar) => (
              <span
                key={bar}
                className="w-[3px] bg-current transition-opacity duration-300"
                style={{ height: 3 + bar * 2, opacity: bar <= signal ? 1 : 0.22 }}
              />
            ))}
          </span>
        </div>

        {/* Navigation */}
        <nav className="pointer-events-auto flex items-center gap-4 sm:gap-6" aria-label="Sections">
          {NAV.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="label relative py-1 opacity-70 transition-opacity duration-200 hover:opacity-100 focus-visible:opacity-100"
            >
              {item.label}
              <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-current transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100 [a:hover>&]:scale-x-100" />
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}
