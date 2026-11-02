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
        <div className="grid gap-12 border-t border-deco-cream/15 pt-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <StretchHeading
              id="contact-heading"
              className="text-[clamp(2.6rem,7vw,5.25rem)] text-deco-cream"
              from={64}
              to={112}
            >
              {copy.title}
            </StretchHeading>
            <p className="mt-6 max-w-[38ch] text-lg leading-[1.6] text-deco-cream">{copy.lead}</p>
            <p className="label mt-2 text-deco-muted">{copy.replyNote}</p>
            <a
              href={`mailto:${settings.email}`}
              className="mt-8 inline-flex min-h-11 items-center font-mono text-lg text-deco-gold underline decoration-1 underline-offset-[6px] transition-colors duration-[var(--dur-short)] ease-out hover:text-deco-cream"
            >
              {settings.email}
            </a>
          </div>

          <div className="md:col-span-7">
            {status.kind === 'sent' ? (
              <div
                className="rounded-[6px] border border-deco-gold/50 bg-deco-night-deep p-8 text-deco-gold"
                role="status"
              >
                <p className="font-display text-xl leading-tight font-extrabold">
                  {copy.successTitle}
                </p>
                <p className="mt-2 text-md leading-[1.6] text-deco-cream">{copy.successBody}</p>
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
                    <label htmlFor="budget" className="label mb-2 block text-deco-muted">
                      Budget
                    </label>
                    <select
                      id="budget"
                      name="budget"
                      defaultValue=""
                      className="min-h-12 w-full appearance-none rounded-[4px] border border-deco-muted/70 bg-deco-night-deep/50 px-3.5 py-2.5 text-md text-deco-cream outline-offset-0 transition-colors duration-[var(--dur-short)] ease-out hover:border-deco-cream"
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
                  <label htmlFor="message" className="label mb-2 block text-deco-muted">
                    What are you making?
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    required
                    minLength={10}
                    className="w-full resize-y rounded-[4px] border border-deco-muted/70 bg-deco-night-deep/50 px-3.5 py-3 text-md leading-[1.6] text-deco-cream outline-offset-0 transition-colors duration-[var(--dur-short)] ease-out placeholder:text-deco-muted/80 hover:border-deco-cream"
                    placeholder="A launch film, a rebrand, a site that has to do something nobody has seen. Rough is fine."
                  />
                </div>

                {/* Honeypot. Hidden from sight and from assistive tech alike. */}
                <div aria-hidden="true" className="absolute -left-[9999px]">
                  <label htmlFor="signal">Leave this field empty</label>
                  <input id="signal" name="signal" type="text" tabIndex={-1} autoComplete="off" />
                </div>

                {status.kind === 'error' && (
                  <p role="alert" className="rounded-[4px] border border-deco-red bg-deco-red/15 px-3.5 py-3 text-md text-deco-cream">
                    {status.message}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status.kind === 'sending'}
                  className="relative inline-flex min-h-12 w-full items-center justify-center rounded-[4px] bg-accent-deep px-7 text-md font-semibold whitespace-nowrap text-on-accent-deep transition-[background-color,color,transform] duration-[var(--dur-short)] ease-out hover:bg-deco-gold hover:text-deco-night-deep active:translate-y-px disabled:cursor-not-allowed disabled:opacity-55 sm:w-auto"
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
      <label htmlFor={name} className="label mb-2 block text-deco-muted">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        className="min-h-12 w-full rounded-[4px] border border-deco-muted/70 bg-deco-night-deep/50 px-3.5 py-2.5 text-md text-deco-cream outline-offset-0 transition-colors duration-[var(--dur-short)] ease-out hover:border-deco-cream"
      />
    </div>
  )
}
