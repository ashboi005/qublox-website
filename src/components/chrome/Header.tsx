'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { Channel } from '@/types/content'
import { ScrambleText } from '@/components/ui/ScrambleText'

/**
 * The header is the set's front panel: wordmark, channel readout, and the
 * only navigation on the page. It takes its ink from `--page-fg`, which the
 * background controller interpolates alongside the ground, so it re-inks
 * with the room instead of relying on a blend mode that no contrast check
 * (and no screen reader user zooming in) can trust.
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
  // The scrim only exists once the page has moved: at rest the header sits on
  // the opening frame (the TV, the ERISED splash) with nothing behind it.
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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
    <header
      className="pointer-events-none fixed inset-x-0 top-0 z-[100]"
      style={{ color: 'var(--header-fg, var(--page-fg))' }}
    >
      {/* A scrim in the ground's own colour, so copy scrolling up under the
          header fades out instead of colliding with the wordmark. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-28 transition-opacity duration-[var(--dur-long)] ease-out"
        style={{
          opacity: scrolled ? 1 : 0,
          background:
            'linear-gradient(to bottom, var(--page-bg) 0%, color-mix(in oklab, var(--page-bg) 82%, transparent) 45%, transparent 100%)',
        }}
      />
      <div className="edge-x relative flex items-center justify-between py-5">
        {/* Wordmark */}
        <a
          href={onHome ? '#hero' : '/'}
          className="pointer-events-auto group flex items-baseline gap-2.5"
          aria-label={onHome ? 'Qublox, back to top' : 'Qublox, home'}
        >
          <ScrambleText
            text="QUBLOX"
            className="display text-[1.15rem] leading-none tracking-[0.02em] sm:text-[1.35rem]"
            dwell={340}
            stagger={55}
          />
          <span className="hidden text-xs opacity-60 sm:inline" aria-hidden="true">
            ®
          </span>
        </a>

        {/* Channel readout: the current section, dressed as a tuner */}
        <div
          className="readout hidden items-center gap-3 opacity-75 transition-opacity duration-[var(--dur-short)] md:flex"
          style={{ visibility: channel ? 'visible' : 'hidden' }}
          aria-hidden="true"
        >
          <span>{channel?.label}</span>
          <span className="h-px w-6 bg-current opacity-40" />
          <span className="w-[8ch] font-body text-sm">{channel?.name}</span>
          <span className="flex items-end gap-[2px]" title="Signal">
            {[1, 2, 3, 4, 5].map((bar) => (
              <span
                key={bar}
                className="w-[3px] bg-current transition-opacity duration-[var(--dur-long)] ease-out"
                style={{ height: 3 + bar * 2, opacity: bar <= signal ? 1 : 0.22 }}
              />
            ))}
          </span>
        </div>

        {/* Navigation */}
        <nav className="pointer-events-auto flex items-center gap-2 sm:gap-4" aria-label="Sections">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.home && !onHome ? `/${item.href}` : item.href}
              className="relative inline-flex min-h-11 items-center px-2 text-md font-semibold opacity-80 transition-opacity duration-[var(--dur-short)] ease-out hover:opacity-100 focus-visible:opacity-100"
            >
              {item.label}
              <span
                aria-hidden="true"
                className="absolute inset-x-2 bottom-2 h-px origin-left scale-x-0 bg-current transition-transform duration-[var(--dur-long)] ease-out [a:hover>&]:scale-x-100"
              />
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}
