'use client'

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

      <Header />
      <CubeCursor />
      <Grain />

      <main className="bg-erised-yellow">
        <ErisedIntro progress={progress} lead={settings.communityLead} />
        <div id="events">
          <ErisedEvents events={events} />
        </div>
      </main>

      <div className="bg-erised-yellow">
        <Footer settings={settings} />
      </div>
    </SmoothScroll>
  )
}
