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
export function RetroTV({
  children,
  brand,
  model,
  channel,
  channelIndex,
  powered,
  onTune,
  onPower,
}: {
  children: React.ReactNode
  brand: string
  model: string
  /** The channel card's readout — blank when the set is off. */
  channel: string
  /** Which channel is on air, so the dial's pointer sits where it should. */
  channelIndex: number
  powered: boolean
  /** +1 / −1 from the channel dial. */
  onTune: (direction: number) => void
  onPower: () => void
}) {
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
            <Dial
              label="CH"
              ticks={13}
              big
              // A quarter of the ring per channel, so the pointer visibly
              // steps round rather than creeping.
              angle={channelIndex * 34}
              onStep={onTune}
              title="Change channel"
            />
            <Dial label="VOL" ticks={9} />

            {/* channel card */}
            <div
              className="mt-[8%] w-full rounded-[3px] px-1 py-[3px] text-center"
              style={{ background: '#2a241e', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.8)' }}
            >
              <span
                className="block font-mono text-[0.42rem] leading-none tracking-[0.14em] transition-all duration-300"
                style={{
                  color: powered ? '#ffb000' : '#4a4034',
                  textShadow: powered ? '0 0 6px rgba(255,176,0,0.85)' : 'none',
                }}
              >
                {powered ? channel : '—'}
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

            {/* power */}
            <button
              type="button"
              onClick={onPower}
              aria-pressed={powered}
              className="group mb-[4%] flex cursor-pointer flex-col items-center gap-[3px] rounded-full p-[3px] transition-transform active:scale-90"
            >
              <span className="sr-only">{powered ? 'Switch the television off' : 'Switch the television on'}</span>
              <span
                aria-hidden="true"
                className="block h-[7px] w-[7px] rounded-full transition-all duration-300"
                style={{
                  background: powered ? 'var(--color-signal)' : '#5c5346',
                  boxShadow: powered
                    ? '0 0 9px 2px rgba(255,47,54,0.8), inset 0 -1px 2px rgba(0,0,0,0.4)'
                    : 'inset 0 1px 2px rgba(0,0,0,0.55)',
                }}
              />
              <span className="font-mono text-[0.36rem] tracking-[0.16em] text-[#463d31] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                PWR
              </span>
            </button>
          </div>
        </div>

        {/* ---- maker's plate ------------------------------------------- */}
        <div className="mt-[2%] flex items-center justify-between px-[1.5%]">
          <span className="font-mono text-[0.55rem] tracking-[0.2em] text-[#a49a8b]/70 uppercase">
            {brand}
          </span>
          <span className="font-mono text-[0.5rem] tracking-[0.16em] text-[#a49a8b]/45 uppercase">
            {model}
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

/**
 * A rotary dial with a knurled rim, a pointer and a printed tick ring.
 *
 * With `onStep` it becomes a real control: click to advance, and the arrow
 * keys turn it either way once it has focus — which is what a rotary control
 * should do for anyone not using a mouse. Without it, it is furniture, and is
 * hidden from assistive tech accordingly.
 *
 * The tick ring and the knob are separate layers so the ring can stay printed
 * on the cabinet while the knob turns against it, which is how the pointer
 * reads as pointing *at* something.
 */
function Dial({
  label,
  ticks,
  big = false,
  angle = 0,
  onStep,
  title,
}: {
  label: string
  ticks: number
  big?: boolean
  angle?: number
  onStep?: (direction: number) => void
  title?: string
}) {
  const body = (
    <>
      <span className="relative block w-full">
        {/* printed tick ring */}
        <svg viewBox="0 0 100 100" className="w-full">
          {Array.from({ length: ticks }, (_, i) => {
            const tick = -210 + (i * 240) / (ticks - 1)
            return (
              <line
                key={i}
                x1="50"
                y1="7"
                x2="50"
                y2={i % 3 === 0 ? 14 : 11}
                stroke="#463d31"
                strokeWidth={i % 3 === 0 ? 2.4 : 1.4}
                transform={`rotate(${tick + 180} 50 50)`}
                opacity="0.7"
              />
            )
          })}
        </svg>

        {/* the knob, which turns */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full transition-transform duration-300 ease-[cubic-bezier(0.34,1.4,0.64,1)]"
          style={{ transform: `rotate(${angle}deg)` }}
        >
          <defs>
            <radialGradient id={`knob-${label}`} cx="0.36" cy="0.3" r="0.85">
              <stop offset="0%" stopColor="#5c5346" />
              <stop offset="45%" stopColor="#2f2820" />
              <stop offset="100%" stopColor="#141009" />
            </radialGradient>
          </defs>

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
          <rect
            x="48.4"
            y="26"
            width="3.2"
            height="16"
            rx="1.6"
            fill="#d8cfba"
            transform="rotate(-32 50 50)"
          />
          <circle cx="42" cy="40" r="4" fill="rgba(255,255,255,0.14)" />
        </svg>
      </span>

      <span className="mt-[2%] block text-center font-mono text-[0.42rem] tracking-[0.18em] text-[#463d31]">
        {label}
      </span>
    </>
  )

  const spacing = big ? 'mt-[4%]' : 'mt-[12%]'

  if (!onStep) {
    return (
      <div aria-hidden="true" className={`relative w-full ${spacing}`}>
        {body}
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => onStep(1)}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
          event.preventDefault()
          onStep(-1)
        }
        if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
          event.preventDefault()
          onStep(1)
        }
      }}
      className={`relative w-full cursor-pointer rounded-full transition-transform active:scale-95 ${spacing}`}
    >
      <span className="sr-only">{title}</span>
      {body}
    </button>
  )
}
