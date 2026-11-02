import type { PlateSpec } from '@/types/content'

/**
 * The title card a frame shows until the studio's stills land.
 *
 * A test-card motif at full saturation, tinted from the project's hue, with
 * the discipline and year at the head of the frame. The title and client are
 * set once, in the card's caption, so the frame never repeats them. When a project gets an `imageUrl`, the still replaces
 * this whole card.
 */

/**
 * The plate hue is authored as an HSL hue in the CMS. OKLCH puts the same
 * name at a different angle (HSL 168 is a teal, OKLCH 168 a green), so the
 * authored hue is carried across through OKLab once, and every tint below is
 * built on the angle the editor actually picked.
 */
function oklchHue(hslHue: number): number {
  const k = (n: number) => (n + hslHue / 30) % 12
  const channel = (n: number) => 0.5 - 0.5 * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))
  const linear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  const [r, g, b] = [linear(channel(0)), linear(channel(8)), linear(channel(4))]

  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)

  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  const hue = (Math.atan2(bb, a) * 180) / Math.PI
  return Math.round((hue + 360) % 360)
}

export function ProjectPlate({
  plate,
  label,
  client,
  year,
  discipline,
}: {
  plate: PlateSpec
  label: string
  client?: string
  year?: string
  discipline?: string
}) {
  const hue = oklchHue(plate.hue)
  // Test-card saturation: the plate is the loudest thing on the trail.
  const base = `oklch(76% 0.17 ${hue})`
  const deep = `oklch(44% 0.15 ${hue})`
  const dark = `oklch(16% 0.04 ${hue})`
  const veil = (amount: number) => `color-mix(in oklab, ${dark} ${amount}%, transparent)`

  return (
    <div
      role="img"
      aria-label={`${label}, placeholder artwork`}
      className="@container relative h-full w-full overflow-hidden"
      style={{ background: dark }}
    >
      <svg
        viewBox="0 0 160 100"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <g opacity="0.62">
          {plate.variant === 'bars' && (
            <g>
              {[
                'var(--color-on-void)',
                'var(--color-chan-yellow)',
                'var(--color-chan-green)',
                'var(--color-chan-blue)',
                base,
                'var(--color-chan-red)',
                deep,
              ].map((color, index) => (
                <rect
                  key={index}
                  x={index * 22.9}
                  y="0"
                  width="22.9"
                  height="72"
                  style={{ fill: color }}
                  opacity="0.8"
                />
              ))}
              <rect y="72" width="160" height="28" style={{ fill: deep }} />
            </g>
          )}

          {plate.variant === 'grid' && (
            <g style={{ stroke: base }} strokeWidth="0.5" opacity="0.8">
              {Array.from({ length: 17 }, (_, i) => (
                <line key={`v${i}`} x1={i * 10} y1="0" x2={i * 10} y2="100" />
              ))}
              {Array.from({ length: 11 }, (_, i) => (
                <line key={`h${i}`} x1="0" y1={i * 10} x2="160" y2={i * 10} />
              ))}
              <circle
                cx="80"
                cy="50"
                r="30"
                fill="none"
                style={{ stroke: 'var(--color-on-void)' }}
                strokeWidth="1.2"
              />
              <circle cx="80" cy="50" r="12" style={{ fill: base }} stroke="none" opacity="0.5" />
            </g>
          )}

          {plate.variant === 'aperture' && (
            <g>
              <circle cx="80" cy="50" r="40" style={{ fill: deep }} />
              {Array.from({ length: 8 }, (_, i) => (
                <path
                  key={i}
                  d="M80 50 L80 10 A40 40 0 0 1 108 21 Z"
                  style={{ fill: i % 2 ? base : deep }}
                  opacity={0.55 + (i % 3) * 0.15}
                  transform={`rotate(${i * 45} 80 50)`}
                />
              ))}
              <circle cx="80" cy="50" r="11" style={{ fill: 'var(--color-void)' }} />
              <circle cx="74" cy="43" r="3.5" style={{ fill: 'var(--color-on-void)' }} opacity="0.5" />
            </g>
          )}

          {plate.variant === 'waveform' && (
            <g>
              {Array.from({ length: 40 }, (_, i) => (
                <rect
                  key={i}
                  x={i * 4 + 1}
                  y={50 - Math.abs(Math.sin(i / 2.4)) * 34}
                  width="2"
                  height={Math.abs(Math.sin(i / 2.4)) * 68}
                  style={{ fill: 'var(--color-on-void)' }}
                  opacity="0.14"
                />
              ))}
              <path
                d={Array.from({ length: 81 }, (_, i) => {
                  const x = i * 2
                  const y = 50 + Math.sin(i / 3.1) * 26 * Math.sin(i / 17)
                  return `${i === 0 ? 'M' : 'L'}${x} ${y.toFixed(1)}`
                }).join(' ')}
                style={{ stroke: base }}
                strokeWidth="1.4"
                fill="none"
              />
            </g>
          )}

          {plate.variant === 'noise' && (
            <g>
              {Array.from({ length: 220 }, (_, i) => {
                const x = ((i * 37) % 160) + ((i * 13) % 3)
                const y = ((i * 71) % 100) + ((i * 7) % 3)
                return (
                  <rect
                    key={i}
                    x={x}
                    y={y}
                    width={1 + (i % 3)}
                    height="1.4"
                    style={{ fill: i % 7 === 0 ? base : 'var(--color-on-void)' }}
                    opacity={0.08 + ((i % 9) / 9) * 0.5}
                  />
                )
              })}
              <rect y="42" width="160" height="7" style={{ fill: base }} opacity="0.35" />
            </g>
          )}

          {plate.variant === 'orbit' && (
            <g fill="none" style={{ stroke: base }}>
              {[12, 22, 32, 42].map((r, i) => (
                <ellipse
                  key={r}
                  cx="80"
                  cy="50"
                  rx={r * 1.5}
                  ry={r * 0.55}
                  strokeWidth="0.8"
                  opacity={0.9 - i * 0.16}
                  transform={`rotate(${i * 24} 80 50)`}
                />
              ))}
              <circle cx="80" cy="50" r="7" style={{ fill: base }} stroke="none" />
              <circle
                cx="128"
                cy="38"
                r="3"
                style={{ fill: 'var(--color-chan-red)' }}
                stroke="none"
              />
            </g>
          )}
        </g>
      </svg>

      {/* the vignette: a lens falls off at the edges, and the type needs the ground */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, ${veil(78)} 0%, ${veil(0)} 26%, ${veil(0)} 82%, ${veil(45)} 100%)`,
        }}
      />

      {/* the card itself */}
      {/* the slate on the frame: discipline and year. The title and client
          are set once, in the caption under the frame. */}
      <div className="absolute inset-0 flex flex-col p-[5.5cqw]">
        <div className="flex items-baseline justify-between gap-3 font-mono text-[0.75rem] leading-none text-on-void-muted tabular-nums">
          <span className="truncate">{discipline}</span>
          <span>{year}</span>
        </div>
      </div>
    </div>
  )
}
