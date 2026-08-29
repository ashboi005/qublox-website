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
  as: Tag = 'span',
}: Props) {
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
    if (playOnMount) play(text)
    return stop
  }, [play, playOnMount, stop, text])


  return (
    <Tag
      className={className}
      onPointerEnter={() => play(text)}
      onFocus={() => play(text)}
      // The scrambled glyphs are decoration; assistive tech reads the word.
      aria-label={text}
    >
      <span aria-hidden="true">{display}</span>
    </Tag>
  )
}
