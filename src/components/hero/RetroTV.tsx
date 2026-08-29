'use client'

/**
 * A 1970s portable television set, built out of layered gradients rather than
 * a raster image so it stays crisp at any size and can be lit from behind.
 *
 * The proportions are the ones that make a set read as a set: a picture area
 * that is close to 4:3 but never square, a bezel thick enough to cast its own
 * shadow, and a control column down the right with two rotary dials, a channel
 * card and a speaker grille. The screen corners are barrel-rounded and the
 * glass carries a bulge highlight, which is what separates a CRT from a
 * rectangle with scanlines on it.
 */
export function RetroTV({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-[min(80vw,46rem)]">
      {/* ---- antenna --------------------------------------------------- */}
      <svg
        aria-hidden="true"
        viewBox="0 0 200 130"
        className="absolute -top-[16%] left-[40%] h-[18%] w-[52%] -translate-x-1/2 overflow-visible"
      >
        <g stroke="#8d8478" strokeLinecap="round">
          <path d="M100 128 L44 12" strokeWidth="3" />
          <path d="M100 128 L158 26" strokeWidth="3" />
        </g>
        <circle cx="44" cy="12" r="5" fill="#a49a8b" />
        <circle cx="158" cy="26" r="5" fill="#a49a8b" />
        {/* the base the rods pivot in */}
        <ellipse cx="100" cy="128" rx="13" ry="6" fill="#211d19" />
      </svg>

      {/* ---- cabinet ---------------------------------------------------- */}
      <div
        className="relative rounded-[1.4rem] p-[2.6%]"
        style={{
          background:
            'linear-gradient(158deg,#4b433a 0%,#332c25 26%,#241e19 58%,#191410 100%)',
          boxShadow:
            'inset 0 2px 0 rgba(255,255,255,0.16), inset 0 -3px 6px rgba(0,0,0,0.7), 0 46px 90px -36px rgba(16,17,20,0.65)',
        }}
      >
        <div className="flex gap-[2.4%]">
          {/* ---- picture area ------------------------------------------ */}
          <div className="relative flex-1">
            {/* bezel */}
            <div
              className="relative rounded-[1.1rem] p-[3.6%]"
              style={{
                background: 'linear-gradient(165deg,#2a241e 0%,#15110d 70%)',
                boxShadow:
                  'inset 0 0 0 1px rgba(255,255,255,0.07), inset 0 6px 14px rgba(0,0,0,0.85)',
              }}
            >
              {/* the tube */}
              <div
                className="relative isolate overflow-hidden bg-[#050505]"
                style={{
                  aspectRatio: '4 / 3',
                  // A CRT's corners are barrel-rounded, not uniformly radiused.
                  borderRadius: '14% / 18%',
                  boxShadow:
                    'inset 0 0 70px 26px rgba(0,0,0,0.95), inset 0 0 16px 3px rgba(59,255,168,0.10)',
                }}
              >
                {children}

                {/* phosphor wash */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-20"
                  style={{
                    background:
                      'radial-gradient(78% 58% at 50% 42%, rgba(59,255,168,0.10), transparent 72%)',
                  }}
                />

                {/* scanlines + the rolling bar */}
                <div
                  aria-hidden="true"
                  className="scanlines pointer-events-none absolute inset-0 z-30 opacity-75"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 z-30 h-[20%]"
                  style={{
                    background:
                      'linear-gradient(to bottom, transparent, rgba(255,255,255,0.05) 45%, transparent)',
                    animation: 'crt-roll 8s linear infinite',
                  }}
                />

                {/* glass: the bulge highlight is what sells the tube */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-40"
                  style={{
                    background:
                      'radial-gradient(58% 42% at 30% 22%, rgba(255,255,255,0.16), rgba(255,255,255,0.04) 46%, transparent 68%)',
                  }}
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-40"
                  style={{
                    background:
                      'linear-gradient(122deg, rgba(255,255,255,0.10) 0%, transparent 34%)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* ---- control column ---------------------------------------- */}
          <div
            className="flex w-[19%] shrink-0 flex-col items-center rounded-[0.8rem] px-[4%] py-[3.5%]"
            style={{
              background: 'linear-gradient(168deg,#d8cfba 0%,#bcb29b 46%,#9d9380 100%)',
              boxShadow:
                'inset 0 1px 0 rgba(255,255,255,0.65), inset 0 -2px 5px rgba(0,0,0,0.28), 0 2px 6px rgba(0,0,0,0.4)',
            }}
          >
            <Dial label="CH" ticks={13} big />
            <Dial label="VOL" ticks={9} />

            {/* channel card */}
            <div
              className="mt-[8%] w-full rounded-[3px] px-1 py-[3px] text-center"
              style={{ background: '#2a241e', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.8)' }}
            >
              <span
                className="block font-mono text-[0.42rem] leading-none tracking-[0.14em] text-[#ffb000]"
                style={{ textShadow: '0 0 6px rgba(255,176,0,0.85)' }}
              >
                VHF 01
              </span>
            </div>

            {/* speaker grille */}
            <div className="mt-[10%] flex w-full flex-1 flex-col justify-end gap-[2px] pb-[4%]">
              {Array.from({ length: 9 }, (_, i) => (
                <span
                  key={i}
                  className="block h-[2px] w-full rounded-full"
                  style={{ background: 'rgba(50,42,34,0.42)', boxShadow: '0 1px 0 rgba(255,255,255,0.4)' }}
                />
              ))}
            </div>

            {/* power lamp */}
            <span
              className="mb-[4%] block h-[7px] w-[7px] rounded-full bg-signal"
              style={{ boxShadow: '0 0 9px 2px rgba(245,51,63,0.8), inset 0 -1px 2px rgba(0,0,0,0.4)' }}
            />
          </div>
        </div>

        {/* ---- maker's plate ------------------------------------------- */}
        <div className="mt-[2%] flex items-center justify-between px-[1.5%]">
          <span className="font-mono text-[0.55rem] tracking-[0.2em] text-[#a49a8b]/70 uppercase">
            Qublox
          </span>
          <span className="font-mono text-[0.5rem] tracking-[0.16em] text-[#a49a8b]/45 uppercase">
            Model QX-CRT · Solid State · 1984
          </span>
        </div>
      </div>

      {/* ---- feet -------------------------------------------------------- */}
      <div aria-hidden="true" className="mx-auto flex w-[70%] justify-between">
        <span
          className="h-3.5 w-8 skew-x-[14deg] rounded-b-[4px]"
          style={{ background: 'linear-gradient(#1d1813,#0d0a08)' }}
        />
        <span
          className="h-3.5 w-8 -skew-x-[14deg] rounded-b-[4px]"
          style={{ background: 'linear-gradient(#1d1813,#0d0a08)' }}
        />
      </div>
    </div>
  )
}

/** A rotary dial with a knurled rim, a pointer and a printed tick ring. */
function Dial({ label, ticks, big = false }: { label: string; ticks: number; big?: boolean }) {
  return (
    <div className={`relative w-full ${big ? 'mt-[4%]' : 'mt-[12%]'}`}>
      <svg viewBox="0 0 100 100" className="w-full">
        {/* tick ring */}
        {Array.from({ length: ticks }, (_, i) => {
          const angle = -210 + (i * 240) / (ticks - 1)
          return (
            <line
              key={i}
              x1="50"
              y1="7"
              x2="50"
              y2={i % 3 === 0 ? 14 : 11}
              stroke="#463d31"
              strokeWidth={i % 3 === 0 ? 2.4 : 1.4}
              transform={`rotate(${angle + 180} 50 50)`}
              opacity="0.7"
            />
          )
        })}

        <defs>
          <radialGradient id={`knob-${label}`} cx="0.36" cy="0.3" r="0.85">
            <stop offset="0%" stopColor="#5c5346" />
            <stop offset="45%" stopColor="#2f2820" />
            <stop offset="100%" stopColor="#141009" />
          </radialGradient>
        </defs>

        {/* knurled rim */}
        <circle cx="50" cy="50" r="33" fill="#100d09" />
        {Array.from({ length: 28 }, (_, i) => (
          <rect
            key={i}
            x="49"
            y="17"
            width="2"
            height="7"
            fill="#3d3529"
            transform={`rotate(${(i * 360) / 28} 50 50)`}
          />
        ))}

        <circle cx="50" cy="50" r="27" fill={`url(#knob-${label})`} />
        {/* pointer */}
        <rect x="48.4" y="26" width="3.2" height="16" rx="1.6" fill="#d8cfba" transform="rotate(-32 50 50)" />
        <circle cx="42" cy="40" r="4" fill="rgba(255,255,255,0.14)" />
      </svg>
      <span className="mt-[2%] block text-center font-mono text-[0.42rem] tracking-[0.18em] text-[#463d31]">
        {label}
      </span>
    </div>
  )
}
