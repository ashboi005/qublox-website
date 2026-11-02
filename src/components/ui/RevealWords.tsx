'use client'

import { motion, useScroll, type MotionValue } from 'motion/react'
import { useScrollRange } from '@/lib/useScrollRange'
import { useRef } from 'react'
import { cn } from '@/lib/cn'
import type { Highlight } from '@/types/content'

/**
 * Word-by-word opacity reveal tied to scroll position, not to a trigger. The
 * sentence writes itself at exactly the rate you scroll, which reads as
 * reading rather than as an entrance animation.
 *
 * Named words can be picked out in the brand colours. Red and blue are set as
 * ink; yellow is set as a marker stripe behind the word instead, because
 * yellow type on a bone ground fails contrast at any size — a highlighter is
 * both the accessible answer and the more characterful one.
 */

const HIGHLIGHT: Record<Highlight['color'], string> = {
  red: 'text-signal',
  blue: 'text-erised-blue',
  yellow:
    'relative z-0 before:absolute before:inset-x-[-0.12em] before:bottom-[0.04em] before:top-[0.14em] before:-z-10 before:bg-erised-yellow before:content-[""]',
}

/** Match on the bare word, so punctuation and case never break a highlight. */
function normalise(word: string): string {
  return word.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function Word({
  word,
  range,
  progress,
  highlight,
}: {
  word: string
  range: [number, number]
  progress: MotionValue<number>
  highlight?: Highlight['color']
}) {
  const opacity = useScrollRange(progress, range, [0.18, 1])
  const y = useScrollRange(progress, range, [4, 0])
  return (
    <motion.span
      aria-hidden="true"
      className={cn('mr-[0.28em] inline-block', highlight && HIGHLIGHT[highlight])}
      style={{ opacity, y }}
    >
      {word}
    </motion.span>
  )
}

export function RevealWords({
  text,
  className,
  highlights = [],
  as: Tag = 'p',
  id,
}: {
  text: string
  className?: string
  highlights?: Highlight[]
  as?: 'p' | 'h2'
  id?: string
}) {
  const ref = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.85', 'end 0.42'],
  })

  const words = text.split(' ')
  const step = 1 / words.length
  const marked = new Map(highlights.map((h) => [normalise(h.word), h.color]))

  return (
    <Tag ref={ref} id={id} className={cn('flex flex-wrap', className)} aria-label={text}>
      {words.map((word, index) => {
        // A highlight marks the first time its word appears, not every time:
        // the second "film" in a sentence is the same word, not a new accent.
        const key = normalise(word)
        const highlight = marked.get(key)
        if (highlight) marked.delete(key)
        return (
        <Word
          key={`${word}-${index}`}
          word={word}
          progress={scrollYProgress}
          // Words overlap slightly so the sentence flows instead of ticking.
          range={[index * step, Math.min(1, index * step + step * 2.4)]}
          highlight={highlight}
        />
        )
      })}
    </Tag>
  )
}
