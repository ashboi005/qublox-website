/**
 * The ERISED splat.
 *
 * Two wrong turns got here. Hand-drawn beziers gave a cloud — no points at
 * all. Straight-sided spikes gave a comic-book bang — all points, no flow. The
 * mark is neither: it is one continuous, *curved* outline that swells into
 * rounded lobes and tapers into soft points, with no corner anywhere on it.
 *
 * So the shape is a closed Catmull-Rom spline through alternating far and near
 * radii. A spline is curvature-continuous by construction, which is exactly
 * the property that separates flowing paint from a star polygon — the tips
 * round over instead of meeting at a vertex, and the valleys scoop instead of
 * creasing.
 */

type Node = { angle: number; radius: number }

const CENTRE = 50

/**
 * Alternating tips and valleys.
 *
 * The contrast between the two radii is what decides whether this reads as a
 * splat or as an egg. Too little and the spline smooths every lobe away — a
 * first pass ran tips at ~40 against valleys at ~28 and produced a blob with
 * no shape in it at all. Tips at roughly twice the valley radius is where the
 * lobes actually stand out.
 *
 * Radii are uneven on purpose: matched tips read as a flower. Two of them run
 * long, left and right, which is the mark's own proportion.
 */
const NODES: Node[] = [
  { angle: 176, radius: 53 }, // long left lobe
  { angle: 198, radius: 20 },
  { angle: 221, radius: 41 },
  { angle: 243, radius: 19 },
  { angle: 266, radius: 46 },
  { angle: 288, radius: 22 },
  { angle: 311, radius: 39 },
  { angle: 333, radius: 18 },
  { angle: 356, radius: 54 }, // long right lobe
  { angle: 18, radius: 21 },
  { angle: 41, radius: 42 },
  { angle: 63, radius: 19 },
  { angle: 86, radius: 45 },
  { angle: 108, radius: 23 },
  { angle: 131, radius: 40 },
  { angle: 153, radius: 20 },
]

/** How much of the neighbour span each tangent takes. Higher is rounder. */
const TENSION = 0.33

function polar({ angle, radius }: Node): [number, number] {
  const radians = (angle * Math.PI) / 180
  return [CENTRE + Math.cos(radians) * radius, CENTRE + Math.sin(radians) * radius]
}

/**
 * Closed Catmull-Rom, converted to cubic beziers. Each segment's control
 * points come from the chord between the neighbours on either side, which is
 * what makes the curve pass smoothly through every node.
 */
function buildSplat(nodes: Node[]): string {
  const points = nodes.map(polar)
  const count = points.length
  const at = (i: number) => points[((i % count) + count) % count]!

  const parts: string[] = [`M${at(0)[0].toFixed(2)} ${at(0)[1].toFixed(2)}`]

  for (let i = 0; i < count; i++) {
    const previous = at(i - 1)
    const start = at(i)
    const end = at(i + 1)
    const next = at(i + 2)

    const c1x = start[0] + (end[0] - previous[0]) * TENSION
    const c1y = start[1] + (end[1] - previous[1]) * TENSION
    const c2x = end[0] - (next[0] - start[0]) * TENSION
    const c2y = end[1] - (next[1] - start[1]) * TENSION

    parts.push(
      `C${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${end[0].toFixed(2)} ${end[1].toFixed(2)}`,
    )
  }

  return `${parts.join(' ')}Z`
}

export const SPLAT_MAIN = buildSplat(NODES)

/**
 * Six distinct splats.
 *
 * Thrown paint never lands the same way twice, and a screen covered by one
 * repeated silhouette reads as a pattern rather than as a mess. Each variant
 * rotates the node list to a different starting point and perturbs the radii
 * on its own cycle, so no two share a lobe arrangement — while all six keep
 * the same node count, spline tension and radius band, which is what keeps
 * them recognisably the same substance.
 */
export const SPLAT_VARIANTS: string[] = Array.from({ length: 6 }, (_, variant) =>
  buildSplat(
    NODES.map((node, index) => ({
      angle: node.angle + variant * 11 + Math.sin(index * 2.3 + variant) * 5,
      radius: node.radius * (1 + Math.sin(index * 1.7 + variant * 2.1) * 0.16),
    })),
  ),
)

/** Flecks that land a beat before the main hit. Fewer nodes, rounder. */
export const SPLAT_DROPS = [
  buildSplat(NODES.filter((_, i) => i % 2 === 0)),
  buildSplat(NODES.filter((_, i) => i % 4 !== 2)),
  buildSplat(NODES.filter((_, i) => i % 3 !== 1)),
]

export function Splat({
  className,
  fill = '#fecb56',
  stroke = '#3a6ea5',
  strokeWidth = 3,
}: {
  className?: string
  fill?: string
  stroke?: string
  strokeWidth?: number
}) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true" preserveAspectRatio="none">
      <path
        d={SPLAT_MAIN}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
