'use client'

import { StretchHeading } from '@/components/ui/StretchHeading'
import { RevealWords } from '@/components/ui/RevealWords'
import type { Service, SiteSettings } from '@/types/content'

/**
 * About — CH 02, STUDIO. The lower third: the caption the broadcast puts on
 * screen to tell you what you are looking at. Type-only by design; it is the
 * one quiet room between the CRT and the blackout.
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
        <div className="rule-t flex items-baseline justify-between pt-4 text-ink/45">
          <span className="label">{about.eyebrow}</span>
          <span className="label">{about.kicker}</span>
        </div>

        <div className="mt-[8vh] grid gap-x-16 gap-y-12 md:grid-cols-12">
          <div className="md:col-span-8">
            <h2 id="about-heading" className="sr-only">
              About Qublox
            </h2>
            <RevealWords
              text={about.lead}
              highlights={about.highlights}
              className="max-w-[18ch] text-[clamp(2rem,5.2vw,4.25rem)] leading-[1.16] font-medium tracking-[-0.025em] text-ink"
            />
          </div>

          <div className="space-y-6 self-end md:col-span-4">
            {about.body.map((paragraph: string, index: number) => (
              <p key={index} className="text-[0.975rem] leading-[1.75] text-ink/70">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Services as a spec table. The list is a real inventory, so it is
            set as one — not as cards. */}
        <div className="mt-[12vh]">
          <StretchHeading
            className="text-[clamp(2.5rem,8vw,6.5rem)] text-ink"
            from={62}
            to={104}
          >
            {about.servicesTitle}
          </StretchHeading>

          <dl className="mt-10">
            {services.map((service, index) => (
              <div
                key={service._id}
                className="rule-t group grid grid-cols-12 items-start gap-4 py-6 text-ink transition-colors duration-300 last:border-b last:border-current/20"
              >
                <dt className="col-span-12 flex items-baseline gap-4 md:col-span-4">
                  <span className="label text-ink/40">{String(index + 1).padStart(2, '0')}</span>
                  <span className="text-[1.35rem] leading-tight font-medium tracking-[-0.02em]">
                    {service.title}
                  </span>
                </dt>
                <dd className="col-span-12 text-[0.95rem] leading-relaxed text-ink/70 md:col-span-5">
                  {service.description}
                </dd>
                <dd className="col-span-12 flex flex-wrap gap-x-3 gap-y-1.5 md:col-span-3 md:justify-end">
                  {service.capabilities.map((capability) => (
                    <span key={capability} className="label text-ink/45">
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
