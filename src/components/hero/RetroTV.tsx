'use client'

import { useState } from 'react'

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
 *
 * Every surface is lit from the top left: highlights on upper edges, the
 * deepest tone at the lower right, and one lift shadow under the cabinet. All
 * colours come from the set's tokens (wood, panel, glass), mixed rather than
 * typed, so the object stays in the site's palette.
 */

/** A token mixed toward another colour (or toward transparent, for alpha). */
function tone(token: string, pct: number, toward = 'transparent'): string {
  const into = toward === 'transparent' ? toward : `var(--color-${toward})`
  return `color-mix(in oklab, var(--color-${token}) ${pct}%, ${into})`
}

/** Degrees the channel knob turns per channel. */
const STEP_DEG = 34

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
  /*
    The knob keeps turning the same way round when the set wraps from its last
    channel back to the first (or the reverse), instead of unwinding most of a
    full turn backwards. `offset` counts the whole turns, in channel steps.
  */
  const [dial, setDial] = useState({ index: channelIndex, offset: 0 })
  if (dial.index !== channelIndex) {
    const delta = channelIndex - dial.index
    let offset = dial.offset
    if (channelIndex === 0 && delta < -1) offset += dial.index + 1
    else if (dial.index === 0 && delta > 1) offset -= channelIndex + 1
    setDial({ index: channelIndex, offset })
  }
  const knobAngle = (channelIndex + dial.offset) * STEP_DEG

  return (
    <div className="relative w-[min(80vw,46rem)]">
      {/* ---- antenna --------------------------------------------------- */}
      <svg
        aria-hidden="true"
        viewBox="0 0 200 130"
        className="absolute -top-[16%] left-[40%] h-[18%] w-[52%] -translate-x-1/2 overflow-visible"
      >
        <g strokeLinecap="round" style={{ stroke: tone('set-panel', 62, 'set-wood') }}>
          <path d="M100 128 L44 12" strokeWidth="2.6" />
          <path d="M100 128 L158 26" strokeWidth="2.6" />
        </g>
        {/* a hairline of light along each rod, from the upper left */}
        <g strokeLinecap="round" style={{ stroke: tone('paper', 55) }}>
          <path d="M99 126 L43.4 13" strokeWidth="0.8" />
          <path d="M99 126 L157 27" strokeWidth="0.8" />
        </g>
        <circle cx="44" cy="12" r="4.5" style={{ fill: tone('set-panel', 80, 'set-wood') }} />
        <circle cx="158" cy="26" r="4.5" style={{ fill: tone('set-panel', 80, 'set-wood') }} />
        {/* the base the rods pivot in */}
        <ellipse cx="100" cy="128" rx="14" ry="6" style={{ fill: 'var(--color-set-wood-deep)' }} />
        <ellipse cx="100" cy="126.4" rx="9" ry="2.6" style={{ fill: tone('set-wood', 80, 'set-panel') }} />
      </svg>

      {/* ---- cabinet ---------------------------------------------------- */}
      <div
        className="relative rounded-[1.4rem] p-[2.6%]"
        style={{
          background: [
            // a very faint figure in the veneer, so the wood is not a flat fill
            `repeating-linear-gradient(97deg, transparent 0 11px, ${tone('set-wood-deep', 22)} 11px 12px, transparent 12px 23px, ${tone('set-panel', 4)} 23px 24px, transparent 24px 37px)`,
            `linear-gradient(158deg, ${tone('set-wood', 78, 'set-panel')} 0%, var(--color-set-wood) 28%, var(--color-set-wood-deep) 64%, ${tone('set-wood-deep', 72, 'void')} 100%)`,
          ].join(', '),
          boxShadow: [
            `inset 0 1.5px 0 ${tone('set-panel', 26)}`,
            `inset 1.5px 0 0 ${tone('set-panel', 10)}`,
            `inset 0 -3px 6px ${tone('void', 70)}`,
            `0 2px 3px ${tone('void', 30)}`,
            'var(--shadow-lift)',
          ].join(', '),
        }}
      >
        <div className="flex gap-[2.4%]">
          {/* ---- picture area ------------------------------------------ */}
          <div className="relative flex-1">
            {/* bezel */}
            <div
              className="relative rounded-[1.1rem] p-[3.6%]"
              style={{
                background: `linear-gradient(165deg, ${tone('set-wood-deep', 86, 'set-panel')} 0%, ${tone('set-wood-deep', 62, 'void')} 72%)`,
                boxShadow: [
                  `inset 0 0 0 1px ${tone('on-void', 7)}`,
                  `inset 0 6px 14px ${tone('void', 85)}`,
                  // the lower lip of the bezel catches the light
                  `inset 0 -1px 0 ${tone('set-panel', 12)}`,
                ].join(', '),
              }}
            >
              {/* the tube */}
              <div
                className="relative isolate overflow-hidden"
                style={{
                  aspectRatio: '4 / 3',
                  background: tone('set-glass', 50, 'void'),
                  // A CRT's corners are barrel-rounded, not uniformly radiused.
                  borderRadius: '14% / 18%',
                  boxShadow: `inset 0 0 70px 26px ${tone('void', 95)}, inset 0 0 16px 3px ${tone('phosphor', 10)}`,
                }}
              >
                {children}

                {/* phosphor wash */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-20"
                  style={{
                    background: `radial-gradient(78% 58% at 50% 42%, ${tone('phosphor', 9)}, transparent 72%)`,
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
                    background: `linear-gradient(to bottom, transparent, ${tone('on-void', 4)} 45%, transparent)`,
                    animation: 'crt-roll 11s linear infinite',
                  }}
                />

                {/* glass: the bulge highlight is what sells the tube */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-40"
                  style={{
                    background: `radial-gradient(58% 42% at 30% 22%, ${tone('on-void', 14)}, ${tone('on-void', 4)} 46%, transparent 68%)`,
                  }}
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-40"
                  style={{
                    background: `linear-gradient(122deg, ${tone('on-void', 9)} 0%, transparent 34%)`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* ---- control column ---------------------------------------- */}
          <div
            className="flex w-[19%] shrink-0 flex-col items-center rounded-[0.8rem] px-[4%] py-[3.5%] max-sm:w-[22%] max-sm:px-[2.5%]"
            style={{
              background: [
                // brushed: fine vertical grain in the panel's lacquer
                `repeating-linear-gradient(90deg, ${tone('paper', 7)} 0 1px, transparent 1px 3px)`,
                `linear-gradient(168deg, ${tone('set-panel', 64, 'paper')} 0%, var(--color-set-panel) 46%, ${tone('set-panel', 78, 'set-wood')} 100%)`,
              ].join(', '),
              boxShadow: [
                `inset 0 1px 0 ${tone('paper', 70)}`,
                `inset 0 -2px 5px ${tone('void', 24)}`,
                `0 2px 6px ${tone('void', 38)}`,
              ].join(', '),
            }}
          >
            <Dial
              label="ch"
              ticks={13}
              big
              // A step of the ring per channel, so the pointer visibly steps
              // round rather than creeping.
              angle={knobAngle}
              onStep={onTune}
              title="Change channel"
            />
            {/* The volume dial and the grille are furniture; on a phone the
                column is too narrow for them beside readable readouts, so
                they step aside and the set keeps its proportions. */}
            <div className="contents max-sm:hidden">
              <Dial label="vol" ticks={9} />
            </div>

            {/* channel card */}
            <div
              className="mt-[10%] mb-auto w-full rounded-[3px] px-1 py-[5px] text-center sm:mb-0"
              style={{
                background: 'var(--color-set-wood-deep)',
                boxShadow: `inset 0 1px 3px ${tone('void', 80)}, 0 1px 0 ${tone('paper', 45)}`,
              }}
            >
              <span
                className="readout block leading-none whitespace-nowrap text-amber transition-opacity duration-(--dur-long) ease-in-out"
                style={{
                  opacity: powered ? 1 : 0,
                  textShadow: `0 0 6px ${tone('amber', 60)}`,
                }}
              >
                {powered ? channel : ' '}
              </span>
            </div>

            {/* speaker grille */}
            <div
              aria-hidden="true"
              className="mt-[10%] flex w-full flex-1 flex-col justify-end gap-[2px] pb-[4%] max-sm:hidden"
            >
              {Array.from({ length: 9 }, (_, i) => (
                <span
                  key={i}
                  className="block h-[2px] w-full rounded-full"
                  style={{
                    background: tone('set-wood', 42),
                    boxShadow: `0 1px 0 ${tone('paper', 40)}`,
                  }}
                />
              ))}
            </div>

            {/* power: a lit push button. The hit area is the full 44px even
                where the cap itself is drawn smaller. */}
            <button
              type="button"
              onClick={onPower}
              aria-pressed={powered}
              className="group flex min-h-11 min-w-11 cursor-pointer flex-col items-center justify-center gap-1 rounded-[6px]"
            >
              <span className="sr-only">{powered ? 'Switch the television off' : 'Switch the television on'}</span>
              <span
                aria-hidden="true"
                className="relative block h-4 w-4 rounded-full transition-transform duration-(--dur-micro) ease-out group-active:translate-y-px"
                style={{
                  background: `radial-gradient(circle at 38% 32%, ${tone('set-wood', 70, 'set-panel')}, var(--color-set-wood-deep) 70%)`,
                  boxShadow: `0 1px 0 ${tone('paper', 55)}, 0 1px 2px ${tone('void', 50)}, inset 0 -1px 1px ${tone('void', 60)}`,
                }}
              >
                {/* the lamp, unlit and lit, crossfaded rather than switched */}
                <span
                  className="absolute inset-[30%] rounded-full"
                  style={{ background: tone('set-wood', 70, 'set-panel') }}
                />
                <span
                  className="absolute inset-[30%] rounded-full transition-opacity duration-(--dur-long) ease-in-out"
                  style={{
                    opacity: powered ? 1 : 0,
                    background: 'var(--color-signal)',
                    boxShadow: `0 0 6px 1px ${tone('signal', 70)}`,
                  }}
                />
              </span>
              <span className="readout leading-none text-set-wood/80 transition-colors duration-(--dur-short) ease-out group-hover:text-set-wood group-focus-visible:text-set-wood"
              >
                pwr
              </span>
            </button>
          </div>
        </div>

        {/* ---- maker's plate ------------------------------------------- */}
        <div className="mt-[2.2%] flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-[1.5%]">
          <span
            className="font-display text-[1rem] leading-none font-extrabold tracking-[0.03em] uppercase"
            style={{
              ['--wdth' as string]: 125,
              fontVariationSettings: "'wdth' var(--wdth)",
              color: tone('set-panel', 88, 'set-wood'),
            }}
          >
            {brand}
          </span>
          <span className="readout leading-none" style={{ color: tone('set-panel', 68, 'set-wood') }}>
            {model}
          </span>
        </div>
      </div>

      {/* ---- feet -------------------------------------------------------- */}
      <div aria-hidden="true" className="mx-auto flex w-[70%] justify-between">
        <span
          className="h-3.5 w-8 skew-x-[14deg] rounded-b-[4px]"
          style={{
            background: `linear-gradient(var(--color-set-wood-deep), ${tone('set-wood-deep', 50, 'void')})`,
          }}
        />
        <span
          className="h-3.5 w-8 -skew-x-[14deg] rounded-b-[4px]"
          style={{
            background: `linear-gradient(var(--color-set-wood-deep), ${tone('set-wood-deep', 50, 'void')})`,
          }}
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
        <svg aria-hidden="true" viewBox="0 0 100 100" className="w-full">
          {Array.from({ length: ticks }, (_, i) => {
            const tick = -210 + (i * 240) / (ticks - 1)
            return (
              <line
                key={i}
                x1="50"
                y1="7"
                x2="50"
                y2={i % 3 === 0 ? 14 : 11}
                strokeWidth={i % 3 === 0 ? 2.4 : 1.4}
                strokeLinecap="round"
                transform={`rotate(${tick + 180} 50 50)`}
                style={{ stroke: tone('set-wood', 72) }}
              />
            )
          })}
        </svg>

        {/* the knob, which turns: a long settle, like a detent finding home */}
        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full"
          style={{
            transform: `rotate(${angle}deg)`,
            transition: 'transform var(--dur-long) var(--ease-out)',
          }}
        >
          <defs>
            <radialGradient id={`knob-${label}`} cx="0.36" cy="0.3" r="0.85">
              <stop offset="0%" style={{ stopColor: tone('set-wood', 72, 'set-panel') }} />
              <stop offset="45%" style={{ stopColor: 'var(--color-set-wood)' }} />
              <stop offset="100%" style={{ stopColor: tone('set-wood-deep', 70, 'void') }} />
            </radialGradient>
          </defs>

          {/* contact shadow on the panel, offset away from the light */}
          <circle cx="51.5" cy="52.5" r="34" style={{ fill: tone('void', 22) }} />
          <circle cx="50" cy="50" r="33" style={{ fill: tone('set-wood-deep', 60, 'void') }} />
          {Array.from({ length: 28 }, (_, i) => (
            <rect
              key={i}
              x="49"
              y="17"
              width="2"
              height="7"
              transform={`rotate(${(i * 360) / 28} 50 50)`}
              style={{ fill: tone('set-wood', 86, 'set-panel') }}
            />
          ))}

          <circle cx="50" cy="50" r="27" style={{ fill: `url(#knob-${label})` }} />
          {/* pointer */}
          <rect
            x="48.4"
            y="26"
            width="3.2"
            height="16"
            rx="1.6"
            transform="rotate(-32 50 50)"
            style={{ fill: 'var(--color-set-panel)' }}
          />
          <circle cx="42" cy="40" r="4" style={{ fill: tone('on-void', 12) }} />
        </svg>
      </span>

      <span className="readout mt-[3%] block text-center leading-none text-set-wood">
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
      className={`relative min-h-11 w-full cursor-pointer rounded-full transition-transform duration-(--dur-micro) ease-out active:scale-[0.97] ${spacing}`}
    >
      <span className="sr-only">{title}</span>
      {body}
    </button>
  )
}
