'use client'

/**
 * The application: menu bar, double-ruled frame, block scrollbar, status line.
 *
 * Turbo Vision, not a green VT. Borland's IDE is the right reference on two
 * counts: it is the machine most of us actually learned on, and its blue is
 * already the brand's blue. A green-phosphor terminal is the generic answer to
 * "retro computer"; this one belongs to a specific machine.
 *
 * Every borrowed element carries real information rather than decorating: the
 * title in the top border names the file being read, the F-keys in the status
 * line are the controls that exist, and the prompt is typed by the scroll.
 */

const MENU = ['File', 'Edit', 'Search', 'Run', 'Compile', 'Debug', 'Options', 'Window', 'Help']

/**
 * Borland's hot-key red, taken a step deeper than the stock maroon so a
 * letter on the grey bar reads at body contrast (about 5:1), not 3.4:1.
 */
const HOT = 'text-[color-mix(in_oklab,var(--color-dos-maroon)_72%,var(--color-void))]'

export function TurboWindow({
  command,
  typed,
  fileName,
  children,
}: {
  command: string
  typed: number
  fileName: string
  children: React.ReactNode
}) {
  return (
    <div className="flex h-full flex-col border-2 border-t-dos-white border-l-dos-white border-r-ink-2 border-b-ink-2 font-mono shadow-lift">
      {/* menu bar */}
      <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 bg-dos-grey px-3 py-1 text-xs text-dos-blue-deep">
        {MENU.map((item) => (
          <span key={item}>
            <span className={HOT}>{item.charAt(0)}</span>
            {item.slice(1)}
          </span>
        ))}
      </div>

      {/* the screen */}
      <div className="relative flex-1 overflow-hidden bg-dos-blue text-dos-grey">
        <div className="scanlines pointer-events-none absolute inset-0 z-20 opacity-20" aria-hidden="true" />

        <div className="relative mx-1 mt-3 mb-1 flex h-[calc(100%-1rem)] flex-col border-2 border-double border-dos-grey/60 px-3 pt-5 sm:px-6">
          <span className="absolute -top-[0.7em] left-5 bg-dos-blue px-2 text-xs text-dos-yellow">
            ═ {fileName} ═
          </span>
          <span className="absolute -top-[0.7em] right-5 bg-dos-blue px-2 text-xs" aria-hidden="true">
            [■]
          </span>

          {/* the prompt, typing itself */}
          <p className="shrink-0 text-[clamp(0.875rem,1.9vw,1.35rem)] leading-none font-bold text-dos-white">
            <span className="text-dos-cyan">C:\QUBLOX&gt;&nbsp;</span>
            <span>{command.slice(0, typed)}</span>
            {/*
              Keyed by the typed length: while characters arrive the caret is
              remounted solid each time, and once typing stops it blinks four
              beats and then holds. Reduced motion holds it solid.
            */}
            <span
              key={typed}
              aria-hidden="true"
              className="ml-0.5 inline-block h-[0.95em] w-[0.5em] translate-y-[0.1em] animate-[caret_1.1s_steps(1)_4] bg-dos-grey motion-reduce:animate-none"
            />
          </p>

          <div className="mt-4 min-h-0 flex-1 overflow-hidden pb-2">{children}</div>
        </div>
      </div>

      {/* status line */}
      <div className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-1 bg-dos-grey px-3 py-1 text-xs text-dos-blue-deep">
        <StatusKey k="F1" label="Help" />
        <StatusKey k="F3" label="Open" />
        <StatusKey k="F9" label="Make" />
        <StatusKey k="Alt-X" label="Exit" />
        <a href="#team" className="-my-1 ml-auto py-1 underline-offset-2 [--color-focus:var(--color-dos-blue-deep)] hover:underline">
          <span className={HOT}>M</span>eet the crew
        </a>
      </div>
    </div>
  )
}

function StatusKey({ k, label }: { k: string; label: string }) {
  return (
    <span>
      <span className={HOT}>{k}</span> {label}
    </span>
  )
}
