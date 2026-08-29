import { ScrambleText } from '@/components/ui/ScrambleText'
import type { SiteSettings } from '@/types/content'

/**
 * The last thing on the page is the instrument strip that opened it, closing
 * the loop: same monospace, same hairlines, same serial-number register.
 */
export function Footer({ settings }: { settings: SiteSettings }) {
  return (
    <footer
      data-ground="yellow"
      className="edge-x border-t-2 border-erised-ink/25 pt-10 pb-8 text-erised-ink"
    >
      <div className="mx-auto max-w-[76rem]">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <ScrambleText
              text="QUBLOX"
              as="div"
              className="display text-[clamp(3rem,13vw,9rem)] leading-[0.8]"
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

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-erised-ink/25 pt-4">
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
