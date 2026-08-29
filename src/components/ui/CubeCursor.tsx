'use client'

import { motion, useMotionValue, useSpring } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '@/lib/useReducedMotion'

/**
 * The cursor is the Qublox mark: a cube that turns for no reason at all, and
 * physically rotates one of its layers every time you click.
 *
 * It is drawn to a canvas rather than built from CSS 3D elements, and that is
 * the whole reason it works. Three CSS attempts each failed the same way:
 * browsers sort `preserve-3d` layers per element rather than per pixel, so
 * with dozens of coplanar faces a far one wins a depth test it should lose and
 * you see through the cube. Backface culling trades that for holes wherever a
 * face rotates away; an opaque core trades the holes for a black slab winning
 * against the stickers in front of it. There is no arrangement of those three
 * that is correct at every angle, because the depth order is not ours to set.
 *
 * On a canvas it is. Every cubie contributes six quads — its sticker where it
 * faces out, black plastic where it faces in — and all of them are sorted
 * back-to-front and painted in that order. Occlusion is then correct by
 * construction, at every angle and mid-turn, with no culling and nothing to
 * see through.
 *
 * A turn is a real rotation: the nine cubies of a layer are rotated about the
 * axis before the cube's own rotation is applied, and when the animation
 * finishes the model commits — positions and sticker orientations permuted by
 * the same rotation, so the cube stays solvable-looking rather than just
 * recoloured.
 *
 * It sits on top of the native pointer rather than replacing it, so nobody
 * loses track of what is clickable.
 */

// The standard Western scheme, on black plastic.
const COLORS = {
  'x+': '#c41e3a', // red
  'x-': '#ff5800', // orange
  'y+': '#f8f8f8', // white
  'y-': '#ffd500', // yellow
  'z+': '#009e60', // green
  'z-': '#0051ba', // blue
} as const

type Dir = keyof typeof COLORS
type Axis = 'x' | 'y' | 'z'
type Vec = [number, number, number]
type Cubie = { x: number; y: number; z: number; colors: Record<Dir, string> }

const DIRS = Object.keys(COLORS) as Dir[]

const NORMAL: Record<Dir, Vec> = {
  'x+': [1, 0, 0],
  'x-': [-1, 0, 0],
  'y+': [0, 1, 0],
  'y-': [0, -1, 0],
  'z+': [0, 0, 1],
  'z-': [0, 0, -1],
}

/** The two in-plane axes for each face, used to walk out its four corners. */
const TANGENTS: Record<Dir, [Vec, Vec]> = {
  'x+': [[0, 1, 0], [0, 0, 1]],
  'x-': [[0, 1, 0], [0, 0, 1]],
  'y+': [[1, 0, 0], [0, 0, 1]],
  'y-': [[1, 0, 0], [0, 0, 1]],
  'z+': [[1, 0, 0], [0, 1, 0]],
  'z-': [[1, 0, 0], [0, 1, 0]],
}

const PLASTIC = '#0b0b0d'
/**
 * How wide the cube reads on screen, across its flat face, in CSS pixels.
 * This is the only number that controls its apparent size — 31px keeps it at
 * exactly the size it was before padding and size were separated.
 */
const CUBE = 31

/**
 * Transparent room around it.
 *
 * The canvas has to clear the cube's *projected space diagonal*, not its face.
 * A corner cubie's far corner sits 1.5·√3 ≈ 2.6 model units from centre — 1.5×
 * the half-face — and perspective magnifies whatever is nearest the viewer by
 * FOCAL/(FOCAL − z) ≈ 1.6. So a rotation can paint about 2.6 × 1.6 ≈ 4.2 model
 * units out, against the 1.5 a face-sized box allows, and the top and bottom
 * were clipped off every turn.
 *
 * Padding and size were previously the same constant, so the only way to stop
 * the clipping was to make the cube bigger. They are separate now: PAD adds
 * room, CUBE sets the size, and neither moves the other.
 */
const PAD = 34

/** The drawing surface. Derived — never tune this directly. */
const BOX = CUBE + PAD * 2
/** Model units per cubie: the cube spans three of them across its face. */
const SCALE = CUBE / 3
/** How much of a cubie face the coloured sticker covers. */
const STICKER = 0.84
/** Weak perspective. Lower is more extreme. */
const FOCAL = 7
const TURN_MS = 240

/**
 * The X tilt never leaves this band, so the cube is always read from slightly
 * above — the angle a cube is normally held at, and the one that shows three
 * faces rather than two.
 */
const TILT_CENTRE = 0.5
const TILT_SWING = 0.22

function solved(): Cubie[] {
  const cubies: Cubie[] = []
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        if (x === 0 && y === 0 && z === 0) continue // the core is never seen
        cubies.push({ x, y, z, colors: { ...COLORS } })
      }
    }
  }
  return cubies
}

/** A quarter turn about an axis, applied to a point or a normal. */
function quarter(axis: Axis, [x, y, z]: Vec): Vec {
  if (axis === 'x') return [x, -z, y]
  if (axis === 'y') return [z, y, -x]
  return [-y, x, z]
}

function quarters(axis: Axis, vector: Vec, count: number): Vec {
  let out = vector
  const times = ((count % 4) + 4) % 4
  for (let i = 0; i < times; i++) out = quarter(axis, out)
  return out
}

function dirOf([x, y, z]: Vec): Dir {
  return DIRS.find((d) => {
    const n = NORMAL[d]
    return n[0] === x && n[1] === y && n[2] === z
  })!
}

function coord(cubie: Cubie, axis: Axis) {
  return axis === 'x' ? cubie.x : axis === 'y' ? cubie.y : cubie.z
}

/** Commit a finished turn: permute the layer's positions and its stickers. */
function commit(cubies: Cubie[], axis: Axis, layer: number, count: number): Cubie[] {
  return cubies.map((cubie) => {
    if (coord(cubie, axis) !== layer) return cubie
    const [x, y, z] = quarters(axis, [cubie.x, cubie.y, cubie.z], count)
    const colors = { ...cubie.colors }
    for (const dir of DIRS) {
      colors[dirOf(quarters(axis, NORMAL[dir], count))] = cubie.colors[dir]
    }
    return { x, y, z, colors }
  })
}

/** Rotate about an arbitrary axis by a free angle — used for the live turn. */
function spin(axis: Axis, [x, y, z]: Vec, angle: number): Vec {
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  if (axis === 'x') return [x, y * c - z * s, y * s + z * c]
  if (axis === 'y') return [x * c + z * s, y, -x * s + z * c]
  return [x * c - y * s, x * s + y * c, z]
}

type Turn = { axis: Axis; layer: number; count: number }

export function CubeCursor() {
  const reduced = useReducedMotion()
  const [enabled, setEnabled] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // The model and the in-flight turn live in refs: the draw loop reads them
  // every frame and nothing here should re-render React.
  const cubies = useRef<Cubie[]>(solved())
  const turn = useRef<Turn | null>(null)
  const turnStart = useRef(0)
  const spinY = useRef(0.6)

  const x = useSpring(useMotionValue(-100), { stiffness: 520, damping: 34, mass: 0.35 })
  const y = useSpring(useMotionValue(-100), { stiffness: 520, damping: 34, mass: 0.35 })

  useEffect(() => {
    const query = window.matchMedia('(pointer: fine)')
    const sync = () => setEnabled(query.matches)
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  const click = useCallback(() => {
    // One turn at a time; a queue would let a fast clicker desynchronise the
    // model from what is on screen.
    if (turn.current) return
    const axis: Axis = (['x', 'y', 'z'] as const)[Math.floor(Math.random() * 3)]!
    turn.current = {
      axis,
      layer: Math.floor(Math.random() * 3) - 1,
      count: Math.random() < 0.5 ? 1 : -1,
    }
    turnStart.current = performance.now()
  }, [])

  useEffect(() => {
    if (!enabled || reduced) return
    const move = (event: PointerEvent) => {
      x.set(event.clientX)
      y.set(event.clientY)
    }
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerdown', click)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', click)
    }
  }, [enabled, reduced, x, y, click])

  useEffect(() => {
    if (!enabled || reduced) return
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return

    const dpr = Math.min(window.devicePixelRatio || 1, 3)
    canvas.width = BOX * dpr
    canvas.height = BOX * dpr
    context.scale(dpr, dpr)

    let frame = 0
    let last = performance.now()

    const draw = (now: number) => {
      const delta = (now - last) / 1000
      last = now

      // The useless rotation. Y spins freely; X only ever oscillates.
      spinY.current += delta * 0.38
      const rotY = spinY.current
      const rotX = TILT_CENTRE + Math.sin(now / 2600) * TILT_SWING

      // Resolve the in-flight turn.
      let angle = 0
      const active = turn.current
      if (active) {
        const elapsed = now - turnStart.current
        const t = Math.min(1, elapsed / TURN_MS)
        // Ease so the layer snaps rather than drifting into place.
        const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
        angle = eased * active.count * (Math.PI / 2)
        if (t >= 1) {
          cubies.current = commit(cubies.current, active.axis, active.layer, active.count)
          turn.current = null
          angle = 0
        }
      }

      const cosY = Math.cos(rotY)
      const sinY = Math.sin(rotY)
      const cosX = Math.cos(rotX)
      const sinX = Math.sin(rotX)

      const project = (p: Vec): [number, number, number] => {
        // Y first, then X.
        const x1 = p[0] * cosY + p[2] * sinY
        const z1 = -p[0] * sinY + p[2] * cosY
        const y2 = p[1] * cosX - z1 * sinX
        const z2 = p[1] * sinX + z1 * cosX
        const k = FOCAL / (FOCAL - z2)
        // Canvas Y runs down; the model's runs up.
        return [BOX / 2 + x1 * k * SCALE, BOX / 2 - y2 * k * SCALE, z2]
      }

      type Quad = { points: [number, number][]; depth: number; fill: string }
      const quads: Quad[] = []

      for (const cubie of cubies.current) {
        const turning = active && coord(cubie, active.axis) === active.layer
        const place = (v: Vec): Vec => (turning ? spin(active!.axis, v, angle) : v)
        const centre: Vec = [cubie.x, cubie.y, cubie.z]

        for (const dir of DIRS) {
          const n = NORMAL[dir]
          const [u, v] = TANGENTS[dir]
          const faceCentre: Vec = [
            centre[0] + n[0] * 0.5,
            centre[1] + n[1] * 0.5,
            centre[2] + n[2] * 0.5,
          ]

          // Outward faces carry a sticker; inward faces are plastic. Drawing
          // both is what makes each cubie a closed, opaque box.
          const outward =
            (n[0] !== 0 && cubie.x === n[0]) ||
            (n[1] !== 0 && cubie.y === n[1]) ||
            (n[2] !== 0 && cubie.z === n[2])

          const corner = (su: number, sv: number, size: number): Vec =>
            place([
              faceCentre[0] + u[0] * su * size + v[0] * sv * size,
              faceCentre[1] + u[1] * su * size + v[1] * sv * size,
              faceCentre[2] + u[2] * su * size + v[2] * sv * size,
            ])

          const half = 0.5
          const plate = [
            project(corner(-half, -half, 1)),
            project(corner(half, -half, 1)),
            project(corner(half, half, 1)),
            project(corner(-half, half, 1)),
          ]
          const depth = (plate[0]![2] + plate[1]![2] + plate[2]![2] + plate[3]![2]) / 4

          quads.push({
            points: plate.map((p) => [p[0]!, p[1]!] as [number, number]),
            depth,
            fill: PLASTIC,
          })

          if (outward) {
            const s = half * STICKER
            const face = [
              project(corner(-s, -s, 1)),
              project(corner(s, -s, 1)),
              project(corner(s, s, 1)),
              project(corner(-s, s, 1)),
            ]
            quads.push({
              points: face.map((p) => [p[0]!, p[1]!] as [number, number]),
              // A hair in front of its own backing, so it never ties with it.
              depth: depth + 0.002,
              fill: cubie.colors[dir],
            })
          }
        }
      }

      // Back to front. This single line is what CSS could not be made to do.
      quads.sort((a, b) => a.depth - b.depth)

      context.clearRect(0, 0, BOX, BOX)
      for (const quad of quads) {
        context.beginPath()
        context.moveTo(quad.points[0]![0], quad.points[0]![1])
        for (let i = 1; i < quad.points.length; i++) {
          context.lineTo(quad.points[i]![0], quad.points[i]![1])
        }
        context.closePath()
        context.fillStyle = quad.fill
        context.fill()
      }

      frame = requestAnimationFrame(draw)
    }

    frame = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(frame)
  }, [enabled, reduced])

  if (!enabled || reduced) return null

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-[150] hidden md:block"
      style={{ x, y, translateX: '-50%', translateY: '-50%' }}
    >
      <canvas ref={canvasRef} style={{ width: BOX, height: BOX, display: 'block' }} />
    </motion.div>
  )
}
