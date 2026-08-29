/**
 * The Qublox mark, redrawn as vectors so it can be torn into colour channels.
 * A raster logo cannot be split; this can. Geometry follows the supplied
 * artwork: stacked Q over U, thin cut through the Q's bowl, thin stem in the
 * U, BLOX. set vertically with the signal dot.
 */
export function QubloxMark({
  fill = 'currentColor',
  cut = 'var(--tv-screen, #000)',
  showWordmark = true,
}: {
  fill?: string
  cut?: string
  showWordmark?: boolean
}) {
  return (
    <svg viewBox="0 0 300 340" fill="none" aria-hidden="true" className="h-full w-full">
      {/* Q — ring with an off-centre bowl */}
      <path
        d="M118 8a80 80 0 1 1 0 160 80 80 0 0 1 0-160Zm0 44a36 42 0 1 0 0 84 36 42 0 0 0 0-84Z"
        fill={fill}
        fillRule="evenodd"
      />
      {/* the diagonal that turns the O into a Q */}
      <path d="M139 116 178 158" stroke={cut} strokeWidth="9" strokeLinecap="butt" />

      {/* U — flat shoulders, fully round foot */}
      <path d="M42 182h152v76a76 76 0 0 1-152 0v-76Z" fill={fill} />
      {/* the stem inside the U */}
      <path d="M118 176v106" stroke={cut} strokeWidth="8" strokeLinecap="butt" />

      {showWordmark && (
        <>
          <text
            transform="rotate(90 236 176)"
            x="236"
            y="176"
            fill={fill}
            fontFamily="var(--font-display), sans-serif"
            fontSize="34"
            fontWeight="700"
            letterSpacing="2"
          >
            BLOX
          </text>
          <circle cx="238" cy="176" r="9" fill="#f5333f" />
        </>
      )}
    </svg>
  )
}
