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

export function TurboWindow({
  command,
  typed,
  children,
}: {
  command: string
  typed: number
  children: React.ReactNode
}) {
  return (
    <div className="flex h-full flex-col border-2 border-t-white border-l-white border-r-[#3a3a3a] border-b-[#3a3a3a] font-mono shadow-[3px_3px_0_rgba(0,0,0,0.5)]">
      {/* menu bar */}
      <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 bg-dos-grey px-2 py-1 text-[0.66rem] text-dos-blue-deep">
        {MENU.map((item) => (
          <span key={item}>
            <span className="text-[#a80000]">{item.charAt(0)}</span>
            {item.slice(1)}
          </span>
        ))}
      </div>

      {/* the screen */}
      <div className="relative flex-1 overflow-hidden bg-dos-blue text-dos-grey">
        <div className="scanlines pointer-events-none absolute inset-0 z-20 opacity-20" aria-hidden="true" />

        <div className="relative m-1 flex h-[calc(100%-0.5rem)] flex-col border-2 border-double border-dos-grey/60 px-3 pt-4 sm:px-6">
          <span className="absolute -top-[0.7em] left-5 bg-dos-blue px-2 text-[0.66rem] tracking-[0.12em] text-dos-yellow">
            ═ CAPABILITIES.TXT ═
          </span>
          <span className="absolute -top-[0.7em] right-5 bg-dos-blue px-2 text-[0.66rem]">[■]</span>

          {/* the prompt, typing itself */}
          <p className="shrink-0 text-[clamp(0.78rem,1.9vw,1.35rem)] leading-none font-bold text-dos-white">
            <span className="text-dos-cyan">C:\QUBLOX&gt;&nbsp;</span>
            <span>{command.slice(0, typed)}</span>
            <span
              aria-hidden="true"
              className="ml-0.5 inline-block h-[0.95em] w-[0.5em] translate-y-[0.1em] bg-dos-grey"
              style={{ animation: 'caret 1.1s steps(1) infinite' }}
            />
          </p>

          <div className="mt-3 min-h-0 flex-1 overflow-hidden pb-2">{children}</div>
        </div>
      </div>

      {/* status line */}
      <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 bg-dos-grey px-2 py-1 text-[0.64rem] text-dos-blue-deep">
        <StatusKey k="F1" label="Help" />
        <StatusKey k="F3" label="Open" />
        <StatusKey k="F9" label="Make" />
        <StatusKey k="Alt-X" label="Exit" />
        <a href="#team" className="ml-auto underline-offset-2 hover:underline">
          <span className="text-[#a80000]">↓</span> Crew
        </a>
      </div>
    </div>
  )
}


function StatusKey({ k, label }: { k: string; label: string }) {
  return (
    <span>
      <span className="text-[#a80000]">{k}</span> {label}
    </span>
  )
}
