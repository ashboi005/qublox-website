'use client'

import { useState } from 'react'
import { StretchHeading } from '@/components/ui/StretchHeading'
import type { SiteSettings } from '@/types/content'

/**
 * Contact — CH 07.
 *
 * Sits on the night deco ground — the indigo and neon of the Art Deco plates —
 * so the yellow stays ERISED's own. The form is
 * deliberately plain: four fields, one action, and errors that say what to fix.
 */

type Status = { kind: 'idle' | 'sending' | 'sent' } | { kind: 'error'; message: string }

export function Contact({ settings }: { settings: SiteSettings }) {
  const copy = settings.contact
  const [status, setStatus] = useState<Status>({ kind: 'idle' })

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus({ kind: 'sending' })

    const data = Object.fromEntries(new FormData(event.currentTarget))

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const body = await response.json().catch(() => ({}))

      if (!response.ok) {
        setStatus({ kind: 'error', message: body.error ?? 'Something went wrong. Try again.' })
        return
      }
      setStatus({ kind: 'sent' })
    } catch {
      setStatus({ kind: 'error', message: 'No connection. Check your network and try again.' })
    }
  }

  return (
    <section
      id="contact"
      data-ground="deco"
      data-channel="contact"
      className="edge-x relative overflow-hidden pt-[12vh] pb-[10vh]"
      aria-labelledby="contact-heading"
    >
      <div className="deco-sky pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto max-w-[76rem] text-deco-cream">
        <div
          className="flex items-baseline justify-between border-b pb-3"
          style={{ borderColor: 'rgba(243,231,201,0.25)' }}
        >
          <h2 id="contact-heading" className="label">
            {copy.eyebrow}
          </h2>
          <span className="label">{copy.replyNote}</span>
        </div>

        <div className="mt-10 grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <StretchHeading className="text-[clamp(2.4rem,7vw,5rem)]" from={64} to={112}>
              {copy.title}
            </StretchHeading>
            <p className="mt-6 max-w-[38ch] text-[0.98rem] leading-[1.75] opacity-80">
              {copy.lead}
            </p>
            <a
              href={`mailto:${settings.email}`}
              className="mt-6 inline-block font-mono text-[1.05rem] underline decoration-2 underline-offset-4 text-deco-gold hover:text-deco-red"
            >
              {settings.email}
            </a>
          </div>

          <div className="md:col-span-7">
            {status.kind === 'sent' ? (
              <div
                className="border-2 border-deco-gold bg-deco-night-deep p-8 text-deco-gold"
                role="status"
              >
                <p className="font-round text-[1.6rem] leading-tight font-semibold">
                  {copy.successTitle}
                </p>
                <p className="mt-2 text-[0.95rem] leading-relaxed opacity-80">{copy.successBody}</p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-5" noValidate>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field name="name" label="Your name" autoComplete="name" required />
                  <Field name="email" label="Email" type="email" autoComplete="email" required />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field name="company" label="Company" autoComplete="organization" />
                  <div>
                    <label htmlFor="budget" className="label mb-2 block opacity-70">
                      Budget
                    </label>
                    <select
                      id="budget"
                      name="budget"
                      defaultValue=""
                      className="w-full appearance-none border-2 border-deco-cream/40 bg-deco-night-deep/40 px-3 py-2.5 text-[0.95rem] outline-none focus-visible:border-deco-gold"
                    >
                      <option value="" className="bg-deco-night">Select a range</option>
                      {copy.budgets.map((budget) => (
                        <option key={budget} value={budget} className="bg-deco-night">
                          {budget}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="label mb-2 block opacity-70">
                    What are you making?
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    required
                    minLength={10}
                    className="w-full resize-y border-2 border-deco-cream/40 bg-deco-night-deep/40 px-3 py-2.5 text-[0.95rem] leading-relaxed outline-none placeholder:opacity-45 focus-visible:border-deco-gold"
                    placeholder="A launch film, a rebrand, a site that has to do something nobody has seen. Rough is fine."
                  />
                </div>

                {/* Honeypot. Hidden from sight and from assistive tech alike. */}
                <div aria-hidden="true" className="absolute -left-[9999px]">
                  <label htmlFor="signal">Leave this field empty</label>
                  <input id="signal" name="signal" type="text" tabIndex={-1} autoComplete="off" />
                </div>

                {status.kind === 'error' && (
                  <p role="alert" className="border-2 border-signal bg-signal/10 px-3 py-2.5 text-[0.9rem]">
                    {status.message}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status.kind === 'sending'}
                  className="group relative w-full border-2 border-deco-red bg-deco-red px-6 py-4 font-mono text-[0.85rem] tracking-[0.16em] text-deco-cream uppercase transition-colors duration-200 hover:border-deco-gold hover:bg-deco-gold hover:text-deco-night-deep disabled:opacity-60 sm:w-auto"
                >
                  {status.kind === 'sending' ? 'Sending…' : 'Send message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function Field({
  name,
  label,
  type = 'text',
  required,
  autoComplete,
}: {
  name: string
  label: string
  type?: string
  required?: boolean
  autoComplete?: string
}) {
  return (
    <div>
      <label htmlFor={name} className="label mb-2 block opacity-70">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        className="w-full border-2 border-deco-cream/40 bg-deco-night-deep/40 px-3 py-2.5 text-[0.95rem] outline-none focus-visible:border-deco-gold"
      />
    </div>
  )
}
