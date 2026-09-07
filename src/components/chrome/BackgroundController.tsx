'use client'

import { useMotionValueEvent, useScroll, useTransform } from 'motion/react'
import { useLayoutEffect, useState } from 'react'

/**
 * The ground colour is storytelling, so it is owned in exactly one place.
 *
 * It is interpolated continuously against scroll position rather than switched
 * at section boundaries. Switching was the original approach and it was wrong
 * twice over: the cut to black landed all at once, in a single CSS transition
 * that had no relationship to how fast you were scrolling, and it fired when a
 * section crossed the viewport's midpoint rather than when the section
 * actually arrived.
 *
 * Now every section declares `data-ground`, we measure where those sections
 * are, and each change is blended across a zone ending just inside the new
 * section. Scrolling slowly means the room dims slowly.
 *
 * Cost: two colour interpolations per frame, written to two custom properties.
 * Nothing re-renders — the values go straight to the document element.
 */

type Ground = { bg: string; fg: string; blend: number }

const GROUNDS: Record<string, Ground> = {
  // `blend` is the fraction of a viewport over which this ground arrives.
  bone: { bg: '#f2f1ec', fg: '#0f1014', blend: 0.7 },
  // The lights going down before the camera runs. Short: this is a cut, not a
  // dissolve, and it must be finished before the section it belongs to
  // arrives — a fade still running while the camera is under way reads as a
  // rendering fault rather than as a transition.
  // Short on purpose. The slate covers the frame while this happens, so the
  // ground flips behind it — the clap is the cut, and a long dissolve either
  // side of it would show the page changing its mind before the board lands.
  void: { bg: '#000000', fg: '#f2f1ec', blend: 0.12 },
  ink: { bg: '#0f1014', fg: '#f2f1ec', blend: 0.7 },
  yellow: { bg: '#fecb56', fg: '#1e1f20', blend: 0.45 },
}

const FALLBACK = GROUNDS.bone!

export function BackgroundController() {
  const { scrollY } = useScroll()
  const [stops, setStops] = useState<{ at: number[]; bg: string[]; fg: string[] } | null>(null)

  useLayoutEffect(() => {
    const measure = () => {
      const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-ground]'))
      if (sections.length === 0) return

      const viewport = window.innerHeight
      const at: number[] = []
      const bg: string[] = []
      const fg: string[] = []

      sections.forEach((section, index) => {
        const ground = GROUNDS[section.dataset.ground ?? ''] ?? FALLBACK
        const top = section.getBoundingClientRect().top + window.scrollY

        if (index === 0) {
          at.push(0)
          bg.push(ground.bg)
          fg.push(ground.fg)
          return
        }

        const previous = GROUNDS[sections[index - 1]!.dataset.ground ?? ''] ?? FALLBACK
        if (previous.bg === ground.bg) return

        // The blend finishes exactly as the section arrives, never inside it.
        const end = top - viewport * 0.05
        const begin = Math.max(at[at.length - 1]! + 1, end - viewport * ground.blend)

        at.push(begin, end)
        bg.push(previous.bg, ground.bg)
        fg.push(previous.fg, ground.fg)
      })

      setStops({ at, bg, fg })
    }

    measure()
    // Section heights are in viewport units, so a resize moves every boundary.
    window.addEventListener('resize', measure)
    // Fonts landing shifts the flowed sections underneath the sticky ones.
    document.fonts?.ready.then(measure).catch(() => {})
    return () => window.removeEventListener('resize', measure)
  }, [])

  const at = stops?.at ?? [0, 1]
  const background = useTransform(scrollY, at, stops?.bg ?? [FALLBACK.bg, FALLBACK.bg])
  const foreground = useTransform(scrollY, at, stops?.fg ?? [FALLBACK.fg, FALLBACK.fg])

  useMotionValueEvent(background, 'change', (value) => {
    document.documentElement.style.setProperty('--page-bg', value)
    document.documentElement.style.setProperty('--ground-dark', String(darkness(value)))
  })
  useMotionValueEvent(foreground, 'change', (value) => {
    document.documentElement.style.setProperty('--page-fg', value)
  })

  // Paint the opening state before the first scroll event arrives.
  useLayoutEffect(() => {
    if (!stops) return
    const root = document.documentElement
    root.style.setProperty('--page-bg', background.get())
    root.style.setProperty('--page-fg', foreground.get())
    root.style.setProperty('--ground-dark', String(darkness(background.get())))
  }, [stops, background, foreground])

  return null
}

/**
 * How dark the current ground is, 0 → 1.
 *
 * Published alongside the colour so anything that should only exist over a
 * dark page — the CRT vignette, for one — can follow the ground itself rather
 * than a hand-tuned fraction of total scroll. Those fractions silently drift
 * every time a section changes length, which is how a vignette meant for the
 * dark chapters ended up greying out a deliberately white one.
 *
 * The band is deliberately narrow: the grounds this site uses are either
 * clearly dark or clearly light, and the only time a value falls between them
 * is mid-blend, which is exactly when the vignette should be arriving.
 */
function darkness(color: string): number {
  const parts = color.match(/[\d.]+/g)
  if (!parts || parts.length < 3) return 0
  const [r, g, b] = parts.map(Number) as [number, number, number]
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
  return Math.min(1, Math.max(0, (0.5 - luminance) / 0.25))
}
