/**
 * A CRT vignette that only exists once the page has gone dark.
 *
 * It follows `--ground-dark`, which the background controller publishes from
 * the ground colour it is already interpolating — so the vignette arrives and
 * leaves exactly with the darkness, at whatever point in the page that
 * happens to be. It used to run off hand-tuned fractions of total scroll,
 * which drifted every time a section changed length and ended up greying out
 * the white run the clapperboard arrives on.
 */
export function Vignette() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[88]"
      style={{
        opacity: 'var(--ground-dark, 0)',
        background:
          'radial-gradient(120% 90% at 50% 45%, transparent 38%, rgba(0,0,0,0.42) 78%, rgba(0,0,0,0.78) 100%)',
      }}
    />
  )
}
