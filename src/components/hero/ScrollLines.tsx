'use client'

import { motion, type MotionValue } from 'motion/react'
import { useScrollRange } from '@/lib/useScrollRange'

/**
 * What we make, running across the page behind the set.
 *
 * The type is set word by word rather than row by row. Giving each row a
 * single face made the stack read as five separate bands of type that happened
 * to be stacked; mixing the faces *within* a line — a grotesque next to a
 * serif italic next to an outline next to spaced monospace — makes the whole
 * wall read as one specimen sheet, and means no two passes of the same word
 * ever look alike.
 *
 * Faces and separator colours are assigned from a hash of the word plus its
 * position, so the mix is varied but fixed: the same word in the same slot is
 * always set the same way, on every render and every viewport.
 *
 * Each row is a marquee holding two copies of its sequence and sliding by
 * exactly half its width, which loops seamlessly with no measuring and no
 * JavaScript — a CSS animation on a transform, so it never touches the main
 * thread once it starts.
 */

type Props = {
  lines: string[]
  progress: MotionValue<number>
}

/**
 * The faces the wall is set in.
 *
 * Three of the eight are cursive — a wall of bold grotesques reads as one
 * voice shouting, and the italics are what make it read as a specimen sheet
 * instead. They also do the most work per appearance, so they are weighted to
 * come up often.
 *
 * `trim` compensates for a face whose letter-spacing or italic angle leaves
 * air after its last glyph — a spaced monospace word opened a gap roughly a
 * whole character wide before the next separator. It is only applied where
 * the cause is the face: the residual variance between words is per-glyph side
 * bearing, and trying to flatten that with per-face values measurably widened
 * the spread rather than closing it.
 */
const FACES = [
  {
    className: 'display',
    style: { ['--wdth' as string]: 122, fontWeight: 900, letterSpacing: '-0.035em' },
  },
  {
    className: 'italic',
    style: {
      fontFamily: 'var(--font-cursive)',
      fontWeight: 400,
      letterSpacing: '-0.005em',
      textTransform: 'none' as const,
    },
    titleCase: true,
    trim: '-0.1em',
  },
  {
    className: 'display',
    // Outlined. On bone this reads as a printed keyline, not as a ghost.
    style: {
      ['--wdth' as string]: 70,
      fontWeight: 800,
      color: 'transparent',
      WebkitTextStroke: '1.1px currentColor',
      letterSpacing: '0.01em',
    },
  },
  {
    className: 'italic',
    style: {
      fontFamily: 'var(--font-serif)',
      fontWeight: 400,
      letterSpacing: '-0.02em',
      textTransform: 'none' as const,
    },
    titleCase: true,
    trim: '-0.09em',
  },
  {
    className: '',
    style: {
      fontFamily: 'var(--font-mono)',
      fontWeight: 500,
      letterSpacing: '0.18em',
      fontSize: '0.72em',
    },
    // Monospace tracking is applied after the final glyph too.
    trim: '-0.18em',
  },
  {
    className: 'italic',
    style: {
      fontFamily: 'var(--font-cursive)',
      fontWeight: 700,
      letterSpacing: '-0.015em',
      textTransform: 'none' as const,
    },
    titleCase: true,
    trim: '-0.1em',
  },
  {
    className: '',
    style: {
      fontFamily: 'var(--font-round)',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      textTransform: 'none' as const,
    },
    titleCase: true,
    trim: '-0.06em',
  },
  {
    className: 'display',
    style: { ['--wdth' as string]: 62, fontWeight: 700, letterSpacing: '0.02em' },
  },
]

/**
 * The separators carry the brand's three colours. Muted rather than saturated:
 * at this size, full-strength red on bone vibrates and pulls the eye off the
 * set, which is the one thing in the hero that should hold it.
 *
 * They are drawn, not typed. As glyphs they inherited whichever face the word
 * beside them happened to use, and a face without the character rendered a
 * tofu box — a solid pink square in the middle of the wall. Shapes have no
 * font to fall back from.
 */
const MARKS = [
  { shape: 'dot' as const, color: 'var(--color-signal)', opacity: 0.5 },
  { shape: 'cross' as const, color: 'var(--color-erised-blue)', opacity: 0.55 },
  { shape: 'diamond' as const, color: 'var(--color-erised-yellow-deep)', opacity: 0.6 },
  { shape: 'bar' as const, color: 'currentColor', opacity: 0.26 },
]

// Four rows. Five packed the stack tight enough that neighbouring lines
// collided, and the set has to sit in front of a wall, not a thicket.
const ROWS = [
  { speed: 40, reverse: false, opacity: 0.2 },
  { speed: 27, reverse: true, opacity: 0.26 },
  { speed: 52, reverse: false, opacity: 0.4 },
  { speed: 34, reverse: true, opacity: 0.22 },
]

/**
 * One size for every row, and a row box that clears the tallest face in it.
 *
 * This was 0.74em, then 0.92em, and both were shorter than the line box the
 * words actually occupy — measured, the rows overlapped by 11px and italic
 * descenders reached into the line below. 1.06em clears a cursive descender
 * with a few pixels to spare and still reads as a closed wall, because cap
 * height is only about 0.72em of it.
 */
const ROW_SIZE = 'clamp(2.9rem, 9vw, 8.2rem)'
const ROW_BOX = '1.06em'

/** Small deterministic hash, so a word's setting never changes between renders. */
function hash(input: string): number {
  let value = 2166136261
  for (let i = 0; i < input.length; i++) {
    value ^= input.charCodeAt(i)
    value = Math.imul(value, 16777619)
  }
  return Math.abs(value)
}

function toTitle(line: string): string {
  return line
    .toLowerCase()
    .split(' ')
    .map((word) => (word === '+' ? '&' : word.charAt(0).toUpperCase() + word.slice(1)))
    .join(' ')
}

export function ScrollLines({ lines, progress }: Props) {
  // The stack drifts up as you scroll, so it is never only the marquees moving.
  const y = useScrollRange(progress, [0, 1], [0, -260])

  return (
    <motion.div
      aria-hidden="true"
      className="flex w-full select-none flex-col justify-center"
      style={{
        y,
        maskImage: 'linear-gradient(to right, transparent 0%, #000 9%, #000 91%, transparent 100%)',
        WebkitMaskImage:
          'linear-gradient(to right, transparent 0%, #000 9%, #000 91%, transparent 100%)',
      }}
    >
      {ROWS.map((row, index) => (
        <Row
          key={index}
          // Offset each row's starting phrase so no two rows read alike.
          lines={lines.slice(index % lines.length).concat(lines.slice(0, index % lines.length))}
          row={row}
          rowIndex={index}
        />
      ))}
    </motion.div>
  )
}

function Mark({ mark }: { mark: (typeof MARKS)[number] }) {
  const common = 'mx-[0.3em] inline-block shrink-0 align-middle'
  const style = { background: mark.color, opacity: mark.opacity }

  if (mark.shape === 'dot') {
    return <span className={`${common} h-[0.13em] w-[0.13em] rounded-full`} style={style} />
  }
  if (mark.shape === 'bar') {
    return <span className={`${common} h-[0.055em] w-[0.4em] rounded-full`} style={style} />
  }
  if (mark.shape === 'diamond') {
    return <span className={`${common} h-[0.13em] w-[0.13em] rotate-45`} style={style} />
  }
  // cross: two bars, which reads at this size where a glyph would not.
  return (
    <span className={`${common} relative h-[0.2em] w-[0.2em]`} aria-hidden="true">
      <span
        className="absolute top-1/2 left-0 h-[0.045em] w-full -translate-y-1/2 rounded-full"
        style={style}
      />
      <span
        className="absolute top-0 left-1/2 h-full w-[0.045em] -translate-x-1/2 rounded-full"
        style={style}
      />
    </span>
  )
}

function Row({
  lines,
  row,
  rowIndex,
}: {
  lines: string[]
  row: (typeof ROWS)[number]
  rowIndex: number
}) {
  // Two copies of the same sequence; sliding by half the track loops exactly.
  const track = [...lines, ...lines]

  return (
    // No per-row overflow clip: the hero already clips, and clipping here cut
    // the descenders off the serif and rounded rows.
    <div className="flex items-center" style={{ fontSize: ROW_SIZE, height: ROW_BOX }}>
      <div
        className="flex w-max"
        style={{
          animation: `marquee ${row.speed}s linear infinite`,
          animationDirection: row.reverse ? 'reverse' : 'normal',
        }}
      >
        {track.map((line, index) => {
          // Hash on the word and its slot, not on the loop index, so the two
          // copies of the track are set identically and the seam is invisible.
          const slot = index % lines.length
          const seed = hash(`${line}:${rowIndex}:${slot}`)
          const face = FACES[seed % FACES.length]!
          const mark = MARKS[(seed >> 3) % MARKS.length]!

          return (
            // The face is applied to the word only; the separator sits
            // outside it. Inside, its em-based margins were relative to each
            // face's own size — a 0.72em monospace word got margins 28%
            // narrower than a display word beside it, which is what made the
            // rhythm look uneven. Outside, every gap is the same.
            <span
              key={`${line}-${index}`}
              className="flex shrink-0 items-center whitespace-nowrap leading-none"
              style={{ opacity: row.opacity }}
            >
              <span
                className={face.className}
                style={{ ...face.style, ...(face.trim ? { marginRight: face.trim } : null) }}
              >
                {face.titleCase ? toTitle(line) : line}
              </span>
              <Mark mark={mark} />
            </span>
          )
        })}
      </div>
    </div>
  )
}
