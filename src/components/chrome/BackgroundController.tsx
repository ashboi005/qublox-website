'use client'

import { useEffect } from 'react'

/**
 * The ground colour is storytelling, so it is owned in exactly one place.
 *
 * Every section declares `data-ground` on its root. Whichever section holds
 * the middle of the viewport wins, and its palette is written to the document
 * element as custom properties. A CSS transition on those properties does the
 * actual crossfade, which keeps the work off the main thread entirely.
 */

type Ground = {
  bg: string
  fg: string
  /** How hard the change lands. The media cut is meant to be violent. */
  ms: number
}

const GROUNDS: Record<string, Ground> = {
  bone: { bg: '#f2f1ec', fg: '#101114', ms: 620 },
  void: { bg: '#000000', fg: '#f2f1ec', ms: 220 },
  ink: { bg: '#101114', fg: '#f2f1ec', ms: 420 },
  yellow: { bg: '#f8c954', fg: '#1e1e20', ms: 260 },
}

export function BackgroundController() {
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-ground]'))
    if (sections.length === 0) return

    const root = document.documentElement
    let current = ''

    const apply = (name: string) => {
      const ground = GROUNDS[name]
      if (!ground || name === current) return
      current = name
      root.style.setProperty('--page-bg', ground.bg)
      root.style.setProperty('--page-fg', ground.fg)
      root.style.setProperty('--ground-ms', `${ground.ms}ms`)
      root.dataset.ground = name
    }

    // The section covering the viewport's centre line owns the ground.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const name = (entry.target as HTMLElement).dataset.ground
            if (name) apply(name)
          }
        }
      },
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 },
    )

    sections.forEach((section) => observer.observe(section))

    // Set the opening state immediately so there is no flash before the first
    // intersection callback fires.
    apply(sections[0]?.dataset.ground ?? 'bone')

    return () => observer.disconnect()
  }, [])

  return null
}
