import { ScrambleText } from '@/components/ui/ScrambleText'
import type { SiteSettings } from '@/types/content'

/**
 * The last thing on the page is the mast: the wordmark in lamp gold over the
 * night ground the reply sits on, the places to find the studio, the flagship
 * product, and the serial that closes the broadcast.
 */
export function Footer({ settings }: { settings: SiteSettings }) {
  return (
    <footer
      data-ground="deco"
      className="edge-x border-t border-deco-gold/25 bg-deco-night-deep pt-16 pb-10 text-deco-cream"
    >
      <div className="mx-auto max-w-[76rem]">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <ScrambleText
              text="QUBLOX"
              as="div"
              className="display text-[clamp(3rem,13vw,9rem)] leading-[0.82] text-deco-gold"
              dwell={420}
              stagger={62}
              playOnMount={false}
            />
            <p className="label mt-4 text-deco-muted">{settings.location}</p>
          </div>

          <nav aria-label="Elsewhere" className="flex flex-col items-start sm:items-end">
            {settings.socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex min-h-11 items-center text-md font-semibold text-deco-cream underline-offset-[6px] transition-colors duration-[var(--dur-short)] ease-out hover:text-deco-gold hover:underline"
              >
                {social.label}
              </a>
            ))}
          </nav>
        </div>

        {/* The flagship: the one product that gets its own broadcast on this page. */}
        <a
          href="https://lokey.qubloxhq.com"
          target="_blank"
          rel="noreferrer noopener"
          className="group mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-deco-cream/15 pt-6"
        >
          <span className="label text-deco-muted">Flagship product</span>
          <span className="flex items-baseline gap-4">
            <span className="display text-[clamp(1.5rem,4vw,2.5rem)] leading-none text-deco-red transition-colors duration-[var(--dur-short)] ease-out group-hover:text-deco-gold">
              LOKEY
            </span>
            <span className="text-md text-deco-cream underline-offset-[6px] group-hover:underline">
              lokey.qubloxhq.com
            </span>
          </span>
        </a>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-deco-cream/15 pt-5 text-deco-muted">
          <span className="label">© {new Date().getFullYear()} Qublox</span>
          <span className="readout">{settings.footer.serial}</span>
          <a
            href="#hero"
            className="label inline-flex min-h-11 items-center underline-offset-[6px] transition-colors duration-[var(--dur-short)] ease-out hover:text-deco-cream hover:underline"
          >
            {settings.footer.backToTop}
          </a>
        </div>
      </div>
    </footer>
  )
}
