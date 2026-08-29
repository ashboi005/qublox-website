'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&@*+=/\\<>[]{}'

type Props = {
  text: string
  className?: string
  /** ms each character spends unresolved before it locks. */
  dwell?: number
  /** ms between the start of one character and the next. */
  stagger?: number
  /** Run once on mount. */
  playOnMount?: boolean
  /**
   * Words to cycle through on a timer, returning to `text` between each one.
   * The wordmark uses this to name what the studio does without a strapline
   * taking up room to say it.
   */
  cycle?: string[]
  /** How long `text` holds before the next keyword. */
  brandHold?: number
  /** How long each keyword holds before returning to `text`. */
  wordHold?: number
  as?: 'span' | 'h1' | 'h2' | 'div'
}

/**
 * Characters resolve left to right; everything still unresolved cycles random
 * glyphs. The animation runs on a rAF loop writing to a single state string,
 * so a twelve-character word is one re-render per frame rather than twelve.
 *
 * Spaces are never scrambled — keeping word boundaries intact is what makes
 * the effect read as text decoding rather than as noise.
 */
export function ScrambleText({
  text,
  className,
  dwell = 380,
  stagger = 42,
  playOnMount = true,
  cycle,
  brandHold = 10000,
  wordHold = 4200,
  as: Tag = 'span',
}: Props) {
  const [target, setTarget] = useState(text)
  const [display, setDisplay] = useState(text)
  const frame = useRef<number | null>(null)
  const startedAt = useRef(0)

  const stop = useCallback(() => {
    if (frame.current !== null) {
      cancelAnimationFrame(frame.current)
      frame.current = null
    }
  }, [])

  const play = useCallback(
    (word: string) => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setDisplay(word)
        return
      }
      stop()
      startedAt.current = performance.now()

      const tick = (now: number) => {
        const elapsed = now - startedAt.current
        let settled = true

        const next = word
          .split('')
          .map((char, index) => {
            if (char === ' ') return char
            const begins = index * stagger
            if (elapsed >= begins + dwell) return char
            settled = false
            if (elapsed < begins) return char === ' ' ? char : GLYPHS[index % GLYPHS.length]
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
          })
          .join('')

        setDisplay(next)

        if (settled) {
          setDisplay(word)
          frame.current = null
          return
        }
        frame.current = requestAnimationFrame(tick)
      }

      frame.current = requestAnimationFrame(tick)
    },
    [dwell, stagger, stop],
  )

  useEffect(() => {
    if (playOnMount) play(target)
    return stop
    // Deliberately mount-only: `play` is re-run by the cycle timer below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * The cycle alternates brand → keyword → brand → next keyword, rather than
   * running the keywords back to back. The wordmark has to be readable as the
   * name most of the time; the keywords are asides, and returning between them
   * is what keeps them reading that way.
   */
  useEffect(() => {
    if (!cycle || cycle.length === 0) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let index = 0
    let onBrand = true
    let timer = 0

    const step = () => {
      const next = onBrand ? cycle[index % cycle.length]! : text
      if (!onBrand) index += 1
      onBrand = !onBrand
      setTarget(next)
      play(next)
      timer = window.setTimeout(step, onBrand ? wordHold : brandHold)
    }

    timer = window.setTimeout(step, brandHold)
    return () => window.clearTimeout(timer)
  }, [cycle, text, brandHold, wordHold, play])

  return (
    <Tag
      className={className}
      onPointerEnter={() => play(target)}
      onFocus={() => play(target)}
      // The scrambled glyphs are decoration, and so are the cycled keywords;
      // assistive tech reads the name and nothing else.
      aria-label={text}
    >
      <span aria-hidden="true">{display}</span>
    </Tag>
  )
}
