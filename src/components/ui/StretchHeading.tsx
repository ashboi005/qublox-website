'use client'

import { motion, useScroll } from 'motion/react'
import { useScrollRange } from '@/lib/useScrollRange'
import { useRef } from 'react'
import { cn } from '@/lib/cn'

/**
 * Archivo's width axis is the display voice of this site. Headings enter
 * condensed and open out to full width as they cross the viewport, so the
 * type itself does the revealing — no fade-up required.
 */
export function StretchHeading({
  children,
  className,
  from = 66,
  to = 118,
  as: Tag = 'h2',
}: {
  children: React.ReactNode
  className?: string
  from?: number
  to?: number
  as?: 'h1' | 'h2' | 'h3'
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.92', 'center 0.45'],
  })

  const wdth = useScrollRange(scrollYProgress, [0, 1], [from, to])
  const opacity = useScrollRange(scrollYProgress, [0, 0.5], [0.25, 1])
  const MotionTag = motion[Tag]

  return (
    <div ref={ref}>
      <MotionTag
        className={cn('display', className)}
        style={{ ['--wdth' as string]: wdth, opacity }}
      >
        {children}
      </MotionTag>
    </div>
  )
}
