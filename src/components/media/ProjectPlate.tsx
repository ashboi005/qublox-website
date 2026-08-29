import type { PlateSpec } from '@/types/content'

/**
 * Generated stand-in artwork, so the gallery is never a row of grey boxes
 * before real images land. Each variant is a different test-card motif and
 * takes its tint from the project's own hue.
 */
export function ProjectPlate({ plate, label }: { plate: PlateSpec; label: string }) {
  const base = `hsl(${plate.hue} 68% 56%)`
  const deep = `hsl(${plate.hue} 72% 22%)`
  const dark = `hsl(${plate.hue} 40% 8%)`

  return (
    <svg viewBox="0 0 160 100" className="h-full w-full" aria-label={`${label} — placeholder artwork`} role="img">
      <rect width="160" height="100" fill={dark} />

      {plate.variant === 'bars' && (
        <g>
          {['#f2f1ec', '#ffd23f', '#3bffa8', '#2f6bff', base, '#f5333f', deep].map((color, index) => (
            <rect key={color} x={index * 22.9} y="0" width="22.9" height="72" fill={color} opacity="0.9" />
          ))}
          <rect y="72" width="160" height="28" fill={deep} />
          <rect x="8" y="80" width="44" height="3" fill={base} />
        </g>
      )}

      {plate.variant === 'grid' && (
        <g stroke={base} strokeWidth="0.6" opacity="0.85">
          {Array.from({ length: 17 }, (_, i) => (
            <line key={`v${i}`} x1={i * 10} y1="0" x2={i * 10} y2="100" />
          ))}
          {Array.from({ length: 11 }, (_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 10} x2="160" y2={i * 10} />
          ))}
          <circle cx="80" cy="50" r="30" fill="none" stroke="#f2f1ec" strokeWidth="1.4" />
          <circle cx="80" cy="50" r="12" fill={base} opacity="0.55" />
        </g>
      )}

      {plate.variant === 'aperture' && (
        <g>
          <circle cx="80" cy="50" r="40" fill={deep} />
          {Array.from({ length: 8 }, (_, i) => (
            <path
              key={i}
              d="M80 50 L80 10 A40 40 0 0 1 108 21 Z"
              fill={i % 2 ? base : deep}
              opacity={0.55 + (i % 3) * 0.15}
              transform={`rotate(${i * 45} 80 50)`}
            />
          ))}
          <circle cx="80" cy="50" r="11" fill="#000" />
          <circle cx="74" cy="43" r="3.5" fill="#f2f1ec" opacity="0.6" />
        </g>
      )}

      {plate.variant === 'waveform' && (
        <g>
          <path
            d={Array.from({ length: 81 }, (_, i) => {
              const x = i * 2
              const y = 50 + Math.sin(i / 3.1) * 26 * Math.sin(i / 17)
              return `${i === 0 ? 'M' : 'L'}${x} ${y.toFixed(1)}`
            }).join(' ')}
            stroke={base}
            strokeWidth="1.6"
            fill="none"
          />
          {Array.from({ length: 40 }, (_, i) => (
            <rect
              key={i}
              x={i * 4 + 1}
              y={50 - Math.abs(Math.sin(i / 2.4)) * 34}
              width="2"
              height={Math.abs(Math.sin(i / 2.4)) * 68}
              fill="#f2f1ec"
              opacity="0.16"
            />
          ))}
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
                fill={i % 7 === 0 ? base : '#f2f1ec'}
                opacity={0.08 + ((i % 9) / 9) * 0.5}
              />
            )
          })}
          <rect y="42" width="160" height="7" fill={base} opacity="0.35" />
        </g>
      )}

      {plate.variant === 'orbit' && (
        <g fill="none" stroke={base}>
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
          <circle cx="80" cy="50" r="7" fill={base} stroke="none" />
          <circle cx="128" cy="38" r="3" fill="#f5333f" stroke="none" />
        </g>
      )}

      {/* every plate wears the same film edge */}
      <g opacity="0.9">
        {Array.from({ length: 16 }, (_, i) => (
          <rect key={`t${i}`} x={i * 10 + 2.5} y="1.5" width="5" height="3.2" rx="0.8" fill="#000" />
        ))}
        {Array.from({ length: 16 }, (_, i) => (
          <rect key={`b${i}`} x={i * 10 + 2.5} y="95.3" width="5" height="3.2" rx="0.8" fill="#000" />
        ))}
      </g>
    </svg>
  )
}
