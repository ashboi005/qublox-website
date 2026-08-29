'use client'

import { useEffect, useState } from 'react'
import { ScrambleText } from '@/components/ui/ScrambleText'

/**
 * The header is the set's front panel: wordmark, channel readout, and the
 * only navigation on the page. It sits in difference blend mode so it stays
 * legible as the ground goes bone → void → yellow without ever re-colouring.
 */

/**
 * Keyed by the `data-channel` each section declares. Deriving the channel from
 * a fraction of total scroll was wrong the moment the sections stopped being
 * the same height — and they never were.
 */
const CHANNELS: Record<string, { label: string; name: string }> = {
  hero: { label: 'CH 01', name: 'SIGNAL' },
  about: { label: 'CH 02', name: 'STUDIO' },
  work: { label: 'CH 03', name: 'MEDIA' },
  tech: { label: 'CH 04', name: 'TECH' },
  team: { label: 'CH 05', name: 'CREW' },
  community: { label: 'CH 06', name: 'ERISED' },
  contact: { label: 'CH 07', name: 'CONTACT' },
}

const ORDER = Object.keys(CHANNELS)

/**
 * What the wordmark cycles through. Six characters or fewer, so the slot does
 * not resize under the scramble, and each one is a thing the studio actually
 * sells rather than an adjective.
 */
const KEYWORDS = ['FILMS', 'AGENTS', 'ADS', 'CODE', 'POST']

// One destination only. Everything else on this page is reached by scrolling
// through it, which is the point of the page; a full nav invites you to skip
// the thing you came to see.
const NAV = [{ id: 'contact', label: 'Contact' }]

export function Header() {
  const [current, setCurrent] = useState('hero')

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
    if (sections.length === 0) return

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

  const channel = CHANNELS[current] ?? CHANNELS.hero!
  // Signal strength climbs as you get further into the broadcast. An
  // instrument, not a progress bar — but it should still mean something.
  const signal = 1 + Math.min(4, ORDER.indexOf(current))

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-[100] mix-blend-difference">
      <div className="edge-x flex items-start justify-between py-5 text-bone">
        {/* Wordmark */}
        <a
          href="#hero"
          className="pointer-events-auto group flex items-baseline gap-2.5"
          aria-label="Qublox — back to top"
        >
          {/* A fixed slot, so a shorter keyword never shifts the ® beside it. */}
          <span className="inline-block min-w-[7ch]">
            <ScrambleText
              text="QUBLOX"
              className="display text-[1.15rem] leading-none tracking-[0.02em] sm:text-[1.35rem]"
              dwell={340}
              stagger={55}
              cycle={KEYWORDS}
              brandHold={10000}
              wordHold={4500}
            />
          </span>
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
