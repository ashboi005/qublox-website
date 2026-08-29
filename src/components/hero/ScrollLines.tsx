'use client'

import { motion, useTransform, type MotionValue } from 'motion/react'
import { QubloxMark } from './QubloxMark'

/**
 * The service names scroll vertically behind the set, each line travelling at
 * its own rate so the column shears as it moves rather than sliding as a
 * block. Two copies of this render in the hero at identical coordinates: one
 * behind the TV in the page's ink, one inside the screen in phosphor. The
 * screen's overflow does the masking, so the same words appear to be picked
 * up and re-broadcast by the set as they pass behind it.
 *
 * `variant` only changes colour. Geometry must stay byte-identical between the
 * two copies or the mask drifts.
 */

type Props = {
  lines: string[]
  progress: MotionValue<number>
  variant: 'plate' | 'screen'
}

// Unequal rates are the whole effect. Keep this list longer than any plausible
// service list so every line has its own.
const RATES = [1, 1.42, 0.78, 1.24, 0.92, 1.62, 0.66, 1.1, 1.34, 0.84]

function Line({
  text,
  index,
  progress,
  variant,
  total,
}: {
  text: string
  index: number
  progress: MotionValue<number>
  variant: 'plate' | 'screen'
  total: number
}) {
  const rate = RATES[index % RATES.length]!
  const y = useTransform(progress, [0, 1], [0, -420 * rate])
  const opacity = useTransform(
    progress,
    [0, 0.12, 0.85, 1],
    variant === 'screen' ? [0.85, 1, 1, 0.6] : [0.14, 0.2, 0.2, 0.06],
  )

  return (
    <motion.div
      className="display flex shrink-0 items-center gap-6 whitespace-nowrap"
      style={{
        y,
        opacity,
        fontSize: 'clamp(3.5rem, 11vw, 10rem)',
        // Alternate the width axis line to line so the column has texture.
        ['--wdth' as string]: index % 2 === 0 ? 112 : 78,
        color: variant === 'screen' ? 'var(--color-phosphor)' : 'currentColor',
      }}
    >
      <span>{text}</span>
      <span className="opacity-40" aria-hidden="true">
        <span className="inline-block h-[0.42em] w-[0.42em] translate-y-[-0.08em] rounded-full bg-current" />
      </span>
      {/* Repeat so the line always fills the width at any viewport size */}
      <span className="opacity-55">{text}</span>
      <span className="label self-end pb-[0.9em] opacity-50">
        {String(index + 1).padStart(2, '0')}/{String(total).padStart(2, '0')}
      </span>
    </motion.div>
  )
}

export function ScrollLines({ lines, progress, variant }: Props) {
  return (
    <div
      aria-hidden="true"
      className={
        variant === 'screen'
          ? 'flex select-none flex-col items-center justify-center gap-[0.06em]'
          : 'flex select-none flex-col items-center justify-center gap-[0.06em]'
      }
    >
      {lines.map((line, index) => (
        <Line
          key={line}
          text={line}
          index={index}
          total={lines.length}
          progress={progress}
          variant={variant}
        />
      ))}
    </div>
  )
}

/** Small helper so the screen copy can also carry the mark when idle. */
export function ScreenIdleMark() {
  return (
    <div className="h-1/2 w-1/2 text-phosphor opacity-25">
      <QubloxMark cut="#000" showWordmark={false} />
    </div>
  )
}
