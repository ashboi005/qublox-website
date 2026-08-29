/**
 * A 16mm spring-wound camera, drawn as white line art.
 *
 * An earlier version was a rendered object — gradients, coloured glass,
 * plastic highlights. Against a white beam on pure black it read as a sticker
 * dropped onto the page. Line art belongs to the same drawing as the beam, so
 * the camera looks like it is emitting the light rather than sitting near it.
 */
export function MovieCamera({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 170 124"
      className={className}
      aria-hidden="true"
      fill="none"
      stroke="#ffffff"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
    >
      {/* film magazines */}
      <circle cx="54" cy="30" r="26" />
      <circle cx="54" cy="30" r="9" />
      <circle cx="107" cy="35" r="21" />
      <circle cx="107" cy="35" r="7" />

      {/* spokes, so the reels read as reels rather than rings */}
      <g strokeWidth="1.6" opacity="0.7">
        <path d="M54 12v8M54 40v8M36 30h8M64 30h8" />
        <path d="M107 21v7M107 42v7M89 35h7M114 35h7" />
      </g>

      {/* body */}
      <rect x="34" y="50" width="88" height="52" rx="6" />
      {/* the operator's window */}
      <rect x="43" y="59" width="30" height="15" rx="2" strokeWidth="1.6" opacity="0.8" />
      <path d="M48 66h9" strokeWidth="1.6" opacity="0.8" />

      {/* lens barrel */}
      <rect x="118" y="60" width="30" height="32" rx="3" />
      <path d="M124 60v32M131 60v32" strokeWidth="1.4" opacity="0.6" />
      <ellipse cx="152" cy="76" rx="8" ry="16" />
      <ellipse cx="152" cy="76" rx="3.4" ry="7" strokeWidth="1.6" opacity="0.75" />

      {/* viewfinder, handle, crank */}
      <rect x="24" y="54" width="11" height="20" rx="2.5" />
      <rect x="62" y="100" width="34" height="9" rx="3" strokeWidth="1.8" />
      <circle cx="32" cy="88" r="6" strokeWidth="1.8" />
      <path d="M18 88h8" strokeWidth="1.8" />

      {/* record lamp — the one thing that is not white */}
      <circle cx="112" cy="58" r="3" fill="#ff2f36" stroke="none" />
    </svg>
  )
}
