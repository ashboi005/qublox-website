'use client'

import { motion, useScroll } from 'motion/react'
import { useScrollRange } from '@/lib/useScrollRange'

/**
 * A CRT vignette that only exists once the page has gone dark. Tying its
 * opacity to scroll rather than to a class means it fades in with the ground
 * instead of popping at the boundary.
 */
export function Vignette() {
  const { scrollYProgress } = useScroll()
  const opacity = useScrollRange(scrollYProgress, [0.12, 0.22, 0.8, 0.87], [0, 1, 1, 0])

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[88]"
      style={{
        opacity,
        background:
          'radial-gradient(120% 90% at 50% 45%, transparent 38%, rgba(0,0,0,0.42) 78%, rgba(0,0,0,0.78) 100%)',
      }}
    />
  )
}
