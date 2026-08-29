/**
 * A dithered portrait stand-in, in the manner of the reference ID plate.
 *
 * Rather than thousands of individual cells, three dot patterns of different
 * densities are each masked by a different luminance band of a head-and-
 * shoulders silhouette. That gives the banded, posterised look of a printed
 * halftone at roughly a dozen SVG nodes instead of five hundred.
 */
export function DitherPortrait({ hue, seed }: { hue: number; seed: string }) {
  const light = `hsl(${hue} 62% 72%)`
  const mid = `hsl(${hue} 55% 46%)`
  const dark = `hsl(${hue} 48% 16%)`
  const id = (name: string) => `${name}-${seed}`

  return (
    <svg viewBox="0 0 120 150" className="h-full w-full" aria-hidden="true">
      <defs>
        {/* three dot densities = three tonal bands */}
        <pattern id={id('fine')} width="3" height="3" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1.28" fill={light} />
        </pattern>
        <pattern id={id('med')} width="3.6" height="3.6" patternUnits="userSpaceOnUse">
          <circle cx="1.8" cy="1.8" r="0.92" fill={mid} />
        </pattern>
        <pattern id={id('coarse')} width="4.4" height="4.4" patternUnits="userSpaceOnUse">
          <circle cx="2.2" cy="2.2" r="0.62" fill={mid} />
        </pattern>

        {/* head and shoulders */}
        <clipPath id={id('figure')}>
          <path d="M60 18c14 0 24 11 24 26 0 10-3 18-8 24 14 5 26 13 32 24 4 8 6 20 6 32H6c0-12 2-24 6-32 6-11 18-19 32-24-5-6-8-14-8-24 0-15 10-26 24-26Z" />
        </clipPath>

        {/* lighting: key from upper left, so the bands read as a face */}
        <radialGradient id={id('key')} cx="0.34" cy="0.28" r="0.62">
          <stop offset="0%" stopColor="#fff" stopOpacity="1" />
          <stop offset="55%" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id('fill')} cx="0.5" cy="0.42" r="0.8">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0.05" />
        </radialGradient>
        <mask id={id('m-key')}>
          <rect width="120" height="150" fill={`url(#${id('key')})`} />
        </mask>
        <mask id={id('m-fill')}>
          <rect width="120" height="150" fill={`url(#${id('fill')})`} />
        </mask>
      </defs>

      <rect width="120" height="150" fill={dark} />
      <g clipPath={`url(#${id('figure')})`}>
        <rect width="120" height="150" fill={`url(#${id('coarse')})`} />
        <rect width="120" height="150" fill={`url(#${id('med')})`} mask={`url(#${id('m-fill')})`} />
        <rect width="120" height="150" fill={`url(#${id('fine')})`} mask={`url(#${id('m-key')})`} />
      </g>

      {/* scan interference across the plate */}
      <g opacity="0.25">
        {Array.from({ length: 50 }, (_, i) => (
          <rect key={i} y={i * 3} width="120" height="1" fill="#000" />
        ))}
      </g>
    </svg>
  )
}
