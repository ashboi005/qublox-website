'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { Channel } from '@/types/content'
import { ScrambleText } from '@/components/ui/ScrambleText'

/**
 * The header is the set's front panel: wordmark, channel readout, and the
 * only navigation on the page. It sits in difference blend mode so it stays
 * legible as the ground goes bone → void → yellow without ever re-colouring.
 */

/**
 * Two destinations. Everything else on this page is reached by scrolling
 * through it, which is the point of the page; a full nav invites you to skip
 * the thing you came to see. ERISED is here because it is a different room
 * entirely — its own page, not a stop on this one.
 */
const NAV = [
  { href: '/erised', label: 'ERISED' },
  { href: '#contact', label: 'Contact', home: true },
]

export function Header({ channels = [] }: { channels?: Channel[] }) {
  const pathname = usePathname()
  const onHome = pathname === '/'
  // Null until the first measurement, and on any page that has no channels at
  // all — the tuner is a readout of this page's sections, so it should show
  // nothing rather than a channel that is not there.
  const [current, setCurrent] = useState<string | null>(null)

  /**
   * The readout follows whichever section's top edge has passed the top of the
   * viewport — not whichever holds the middle.
   *
   * The middle rule is right for the ground colour, but wrong here: a section
   * that pins for five screens does not reach its own midpoint until you are
   * deep inside it, so the readout still said CH 02 while CH 03 was pinned and
   * filling the frame, contradicting the section's own label.
   */
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-channel]'))
    if (sections.length === 0) {
      setCurrent(null)
      return
    }

    let queued = false
    const sync = () => {
      queued = false
      let active = sections[0]?.dataset.channel ?? 'hero'
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= 1) {
          active = section.dataset.channel ?? active
        }
      }
      setCurrent((previous) => (previous === active ? previous : active))
    }

    const onScroll = () => {
      if (queued) return
      queued = true
      requestAnimationFrame(sync)
    }

    sync()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  const index = current ? channels.findIndex((entry) => entry.id === current) : -1
  const channel = index >= 0 ? channels[index] : undefined
  // Signal strength climbs as you get further into the broadcast. An
  // instrument, not a progress bar — but it should still mean something.
  const signal = index >= 0 ? 1 + Math.min(4, index) : 0

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-[100] mix-blend-difference">
      <div className="edge-x flex items-start justify-between py-5 text-bone">
        {/* Wordmark */}
        <a
          href={onHome ? '#hero' : '/'}
          className="pointer-events-auto group flex items-baseline gap-2.5"
          aria-label={onHome ? 'Qublox — back to top' : 'Qublox — home'}
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
        <div
          className="label hidden items-center gap-3 opacity-70 md:flex"
          style={{ visibility: channel ? 'visible' : 'hidden' }}
          aria-hidden="true"
        >
          <span>{channel?.label}</span>
          <span className="h-px w-6 bg-current opacity-40" />
          <span className="w-[7ch]">{channel?.name}</span>
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
              key={item.href}
              href={item.home && !onHome ? `/${item.href}` : item.href}
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
