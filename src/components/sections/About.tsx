'use client'

import { StretchHeading } from '@/components/ui/StretchHeading'
import { RevealWords } from '@/components/ui/RevealWords'
import type { Service, SiteSettings } from '@/types/content'

/**
 * About, CH 02, STUDIO. The lower third: the caption the broadcast puts on
 * screen to tell you what you are looking at. Type-only by design; it is the
 * one quiet room between the CRT and the blackout.
 *
 * The statement is the section's heading. It used to sit under a tracked
 * caps row naming the channel, which the header's tuner already reads out.
 */
export function About({ settings, services }: { settings: SiteSettings; services: Service[] }) {
  const about = settings.about

  return (
    <section
      id="about"
      data-ground="bone"
      data-channel="about"
      className="edge-x relative pt-[18vh] pb-[14vh] md:pt-[24vh] md:pb-[20vh]"
      aria-labelledby="about-heading"
    >
      <div className="mx-auto max-w-[76rem]">
        <div className="rule-t grid gap-x-16 gap-y-12 pt-10 md:grid-cols-12">
          <div className="md:col-span-8">
            <RevealWords
              as="h2"
              id="about-heading"
              text={about.lead}
              highlights={about.highlights}
              className="max-w-[18ch] font-display text-[clamp(2.25rem,5.2vw,4.5rem)] leading-[1.08] font-semibold tracking-[-0.03em] text-ink"
            />
          </div>

          <div className="space-y-5 self-end md:col-span-4">
            {about.body.map((paragraph: string, index: number) => (
              <p key={index} className="text-md leading-[1.65] text-ink-2">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Services as a spec table. The list is a real inventory, so it is
            set as one, not as cards. */}
        <div className="mt-[14vh]">
          <StretchHeading
            className="text-[clamp(2.5rem,8vw,6.5rem)] text-ink"
            from={62}
            to={104}
          >
            {about.servicesTitle}
          </StretchHeading>

          <dl className="mt-12 border-b border-rule">
            {services.map((service, index) => (
              <div
                key={service._id}
                className="grid grid-cols-12 items-baseline gap-x-6 gap-y-3 border-t border-rule py-7 text-ink"
              >
                <dt className="col-span-12 flex items-baseline gap-5 md:col-span-4">
                  <span className="readout text-muted">{String(index + 1).padStart(2, '0')}</span>
                  <span className="text-title leading-tight font-semibold tracking-[-0.02em]">
                    {service.title}
                  </span>
                </dt>
                <dd className="col-span-12 max-w-[52ch] text-md leading-[1.6] text-ink-2 md:col-span-5">
                  {service.description}
                </dd>
                <dd className="col-span-12 flex flex-wrap gap-x-4 gap-y-1 md:col-span-3 md:justify-end">
                  {service.capabilities.map((capability) => (
                    <span key={capability} className="label text-muted">
                      {capability}
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
