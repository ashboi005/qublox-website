/**
 * The trail is authored as normalised control points and rebuilt in pixels
 * whenever the stage resizes.
 *
 * An earlier version drew it in a 0–100 viewBox with
 * preserveAspectRatio="none". That looked correct until the dash animation
 * went on: a non-uniform viewBox scales the dash pattern differently on each
 * axis, so a single dash of exactly the path's length rendered as a handful of
 * broken arcs. Pixel space keeps stroke width, dash length and blur radius all
 * in the same units, which is what makes it read as one continuous ribbon.
 */

type Point = [number, number]

/**
 * The track is several screens wide and slides horizontally under a camera
 * that stays put — so the path is authored across the *track*, not the
 * viewport, and has room for a long run of undulation with the work spaced
 * well apart along it.
 */
export const TRACK_SCREENS = 2.25

/**
 * Anchor, then (control, control, anchor) triplets. Fractions of the track.
 *
 * The path stops at 0.93 rather than running off the right edge. The track
 * clamps its slide at `trackWidth - stageWidth`, so anything past that is
 * unreachable — an earlier version ended at 1.02 and the prism at the end of
 * the beam was simply never on screen.
 *
 * The amplitude is deliberately shallow, roughly 0.37–0.64 of the stage. The
 * frames hang a card's height off the beam, so a taller wave pushed the top
 * row under the fixed header and the bottom row past the footer strip. The
 * wave has to leave room for what hangs from it.
 */
const CONTROL_POINTS: Point[] = [
  [-0.02, 0.62],
  [0.04, 0.63], [0.06, 0.42], [0.13, 0.42],
  [0.2, 0.42], [0.2, 0.64], [0.28, 0.62],
  [0.36, 0.6], [0.33, 0.38], [0.42, 0.39],
  [0.51, 0.4], [0.48, 0.63], [0.57, 0.6],
  [0.66, 0.57], [0.63, 0.37], [0.72, 0.38],
  [0.81, 0.39], [0.79, 0.6], [0.85, 0.55],
  [0.9, 0.5], [0.92, 0.46], [0.93, 0.45],
]

export function buildTrail(width: number, height: number): string {
  if (width === 0 || height === 0) return ''

  const at = (index: number) => {
    const point = CONTROL_POINTS[index]!
    return `${(point[0] * width).toFixed(2)} ${(point[1] * height).toFixed(2)}`
  }

  let d = `M ${at(0)}`
  for (let i = 1; i < CONTROL_POINTS.length; i += 3) {
    d += ` C ${at(i)}, ${at(i + 1)}, ${at(i + 2)}`
  }
  return d
}
