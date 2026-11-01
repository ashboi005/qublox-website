import { ScrambleText } from '@/components/ui/ScrambleText'
import type { SiteSettings } from '@/types/content'

/**
 * The last thing on the page is the instrument strip that opened it, closing
 * the loop: same monospace, same hairlines, same serial-number register.
 */
export function Footer({ settings }: { settings: SiteSettings }) {
  return (
    <footer
      data-ground="deco"
      className="edge-x border-t-2 border-deco-gold/30 bg-deco-night-deep pt-10 pb-8 text-deco-cream"
    >
      <div className="mx-auto max-w-[76rem]">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <ScrambleText
              text="QUBLOX"
              as="div"
              className="display text-[clamp(3rem,13vw,9rem)] leading-[0.8] text-deco-gold"
              dwell={420}
              stagger={62}
              playOnMount={false}
            />
            <p className="label mt-3 opacity-60">{settings.location}</p>
          </div>

          <nav aria-label="Elsewhere" className="flex flex-col items-start gap-1.5 sm:items-end">
            {settings.socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer noopener"
                className="label underline-offset-4 opacity-70 transition-opacity hover:underline hover:opacity-100"
              >
                {social.label} ↗
              </a>
            ))}
          </nav>
        </div>

        {/* The flagship — the one product that gets its own broadcast on this page. */}
        <a
          href="https://lokey.qubloxhq.com"
          target="_blank"
          rel="noreferrer noopener"
          className="group mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-deco-cream/20 pt-6"
        >
          <span className="label opacity-55">Flagship product</span>
          <span className="flex items-center gap-3">
            <span className="display text-[clamp(1.4rem,4vw,2.4rem)] leading-none text-deco-red">LOKEY</span>
            <span className="label opacity-70 transition-opacity group-hover:opacity-100">
              lokey.qubloxhq.com ↗
            </span>
          </span>
        </a>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-deco-cream/20 pt-4">
          <span className="label opacity-55">© {new Date().getFullYear()} QUBLOX — ALL RIGHTS RESERVED</span>
          <span className="label opacity-55">{settings.footer.serial}</span>
          <a href="#hero" className="label underline-offset-4 opacity-70 hover:underline hover:opacity-100">
            {settings.footer.backToTop}
          </a>
        </div>
      </div>
    </footer>
  )
}
