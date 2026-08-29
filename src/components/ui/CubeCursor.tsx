'use client'

import { animate, motion, useMotionValue, useSpring } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useReducedMotion } from '@/lib/useReducedMotion'

/**
 * The cursor is the Qublox mark: a cube that turns for no reason at all, and
 * shuffles its faces when you click. It sits on top of the real cursor rather
 * than replacing it — the native pointer stays visible over links and inputs,
 * so nobody loses track of what is clickable.
 */

const FACE_COLORS = ['#f5333f', '#ffd23f', '#3bffa8', '#2f6bff', '#f2f1ec', '#ff8a1f']
const SIZE = 34
const HALF = SIZE / 2

type Face = { transform: string; seed: number }

const FACES: Face[] = [
  { transform: `rotateY(0deg) translateZ(${HALF}px)`, seed: 0 },
  { transform: `rotateY(90deg) translateZ(${HALF}px)`, seed: 1 },
  { transform: `rotateY(180deg) translateZ(${HALF}px)`, seed: 2 },
  { transform: `rotateY(-90deg) translateZ(${HALF}px)`, seed: 3 },
  { transform: `rotateX(90deg) translateZ(${HALF}px)`, seed: 4 },
  { transform: `rotateX(-90deg) translateZ(${HALF}px)`, seed: 5 },
]

export function CubeCursor() {
  const reduced = useReducedMotion()
  const [enabled, setEnabled] = useState(false)
  const [shuffle, setShuffle] = useState(0)

  // Position is a motion value, so pointer movement never re-renders React.
  const x = useSpring(useMotionValue(-100), { stiffness: 520, damping: 34, mass: 0.35 })
  const y = useSpring(useMotionValue(-100), { stiffness: 520, damping: 34, mass: 0.35 })

  // Idle tumble. Two axes at different periods so it never repeats visibly.
  const rotateX = useMotionValue(-24)
  const rotateY = useMotionValue(32)
  const scale = useMotionValue(1)

  const idle = useRef<number | null>(null)

  // A fine pointer with no coarse fallback — phones and trackpads-in-tablet
  // mode keep their own cursor and skip all of this.
  useEffect(() => {
    const query = window.matchMedia('(pointer: fine)')
    const sync = () => setEnabled(query.matches)
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (!enabled || reduced) return

    const move = (event: PointerEvent) => {
      x.set(event.clientX)
      y.set(event.clientY)
    }

    // Click gives it a purpose it does not have: a hard quarter-turn plus a
    // re-shuffle of every sticker.
    const press = () => {
      animate(scale, [1, 0.78, 1.14, 1], { duration: 0.45, ease: [0.16, 1, 0.3, 1] })
      animate(rotateY, rotateY.get() + 90, { duration: 0.5, ease: [0.85, 0, 0.15, 1] })
      animate(rotateX, rotateX.get() + (Math.random() > 0.5 ? 90 : -90), {
        duration: 0.5,
        ease: [0.85, 0, 0.15, 1],
      })
      setShuffle((n) => n + 1)
    }

    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerdown', press)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', press)
    }
  }, [enabled, reduced, x, y, rotateX, rotateY, scale])

  // The useless rotation. Driven off rAF deltas added on top of whatever the
  // click animation left behind, so the two never fight.
  useEffect(() => {
    if (!enabled || reduced) return
    let last = performance.now()

    const tick = (now: number) => {
      const delta = (now - last) / 1000
      last = now
      rotateY.set(rotateY.get() + delta * 22)
      rotateX.set(rotateX.get() + delta * 13)
      idle.current = requestAnimationFrame(tick)
    }

    idle.current = requestAnimationFrame(tick)
    return () => {
      if (idle.current !== null) cancelAnimationFrame(idle.current)
    }
  }, [enabled, reduced, rotateX, rotateY])

  const stickers = useMemo(() => buildStickers(shuffle), [shuffle])

  if (!enabled || reduced) return null

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-[150] hidden md:block mix-blend-difference"
      style={{ x, y, translateX: '-50%', translateY: '-50%' }}
    >
      <motion.div
        style={{
          width: SIZE,
          height: SIZE,
          transformStyle: 'preserve-3d',
          rotateX,
          rotateY,
          scale,
        }}
      >
        {FACES.map((face) => (
          <div
            key={face.seed}
            className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-[1.5px] bg-black/90 p-[1.5px]"
            style={{ transform: face.transform, backfaceVisibility: 'hidden' }}
          >
            {stickers[face.seed]!.map((color, cell) => (
              <span key={cell} className="rounded-[1px]" style={{ background: color }} />
            ))}
          </div>
        ))}
      </motion.div>
    </motion.div>
  )
}

/**
 * Deterministic per shuffle count, so the same click always produces the same
 * arrangement on re-render and React never sees a changing value mid-paint.
 */
function buildStickers(seed: number): string[][] {
  return FACES.map((face) =>
    Array.from({ length: 9 }, (_, cell) => {
      const n = Math.sin((face.seed + 1) * 12.9898 + cell * 78.233 + seed * 43.7) * 43758.5453
      const fraction = n - Math.floor(n)
      // Bias toward the face's own colour so it still reads as a solved-ish cube.
      const index = fraction < 0.55 ? face.seed : Math.floor(fraction * FACE_COLORS.length)
      return FACE_COLORS[index % FACE_COLORS.length]!
    }),
  )
}
