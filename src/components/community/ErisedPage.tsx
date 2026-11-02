'use client'

import type { CSSProperties } from 'react'
import { ErisedEvents } from './ErisedEvents'
import { ErisedIntro } from './ErisedIntro'
import { Header } from '@/components/chrome/Header'
import { SmoothScroll } from '@/components/providers/SmoothScroll'
import { Footer } from '@/components/sections/Footer'
import { CubeCursor } from '@/components/ui/CubeCursor'
import { Grain } from '@/components/ui/Grain'
import { useAutoProgress } from '@/lib/useAutoProgress'
import type { CommunityEvent, SiteSettings } from '@/types/content'

/**
 * ERISED, as its own room rather than a stop on the main page.
 *
 * The arrival sequence plays on load instead of being scrolled through: you
 * came here on purpose, so the paint lands, the ink resolves into the mark,
 * and the page is ready — no dragging required. The events sit below for
 * whoever wants them.
 *
 * 4.4s is the whole sequence. Long enough that the paint reads as a series of
 * separate hits rather than a wipe, short enough that nobody is kept waiting
 * for content they navigated to deliberately.
 */
export function ErisedPage({
  settings,
  events,
}: {
  settings: SiteSettings
  events: CommunityEvent[]
}) {
  const progress = useAutoProgress(4400, 220)

  return (
    <SmoothScroll>
      <a href="#events" className="skip-link">
        Skip to events
      </a>

      {/* This room has no background controller: its ground is the yellow
          throughout, so the header and its scrim take that ground directly. */}
      <div
        style={{
          ['--page-bg' as string]: 'var(--color-erised-yellow)',
          ['--page-fg' as string]: 'var(--color-erised-ink)',
        }}
      >
        <Header />
      </div>
      <CubeCursor />
      <Grain />

      {/*
        The site's focus ring is a deep red with a paper halo, made for bone
        and void. On this yellow the red falls under 3:1, so the room rings
        focus in its own ink instead. (The magazine's controls sit on a dark
        scrim and set their own.)
      */}
      <main className="bg-erised-yellow" style={{ '--color-focus': 'var(--color-erised-ink)' } as CSSProperties}>
        <ErisedIntro progress={progress} lead={settings.community.lead} />
        <div id="events">
          <ErisedEvents events={events} copy={settings.community} />
        </div>
      </main>

      <div className="bg-erised-yellow">
        <Footer settings={settings} />
      </div>
    </SmoothScroll>
  )
}
