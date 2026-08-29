import { NextResponse } from 'next/server'
import nodemailer, { type Transporter } from 'nodemailer'
import { z } from 'zod'

export const runtime = 'nodejs'

const ContactSchema = z.object({
  name: z.string().trim().min(2, 'Tell us your name.').max(120),
  email: z.email('That email address does not look right.').max(200),
  company: z.string().trim().max(160).optional().or(z.literal('')),
  budget: z.string().trim().max(60).optional().or(z.literal('')),
  message: z.string().trim().min(10, 'A little more detail, please.').max(4000),
  /** Honeypot. Real people never fill this in; bots almost always do. */
  signal: z.string().max(0).optional().or(z.literal('')),
})

/**
 * Naive fixed-window limiter, held in module memory. It stops a single client
 * hammering the form on a single instance; it is not a substitute for a real
 * limiter if this ever runs across many instances.
 */
const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 4
const hits = new Map<string, { count: number; resetAt: number }>()

function rateLimited(key: string): boolean {
  const now = Date.now()
  const entry = hits.get(key)

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return false
  }
  entry.count += 1
  if (entry.count > MAX_PER_WINDOW) return true

  // Keep the map from growing without bound on a long-lived instance.
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (now > v.resetAt) hits.delete(k)
  }
  return false
}

let transporter: Transporter | null = null

function getTransporter(): Transporter | null {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } = process.env
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) return null

  if (!transporter) {
    const port = Number(SMTP_PORT ?? 465)
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      // 465 is implicit TLS; 587 upgrades with STARTTLS.
      secure: port === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
    })
  }
  return transporter
}

export async function POST(request: Request) {
  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Send valid JSON.' }, { status: 400 })
  }

  const parsed = ContactSchema.safeParse(payload)
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return NextResponse.json(
      { error: first?.message ?? 'Check the form and try again.', field: first?.path[0] },
      { status: 400 },
    )
  }

  const { name, email, company, budget, message, signal } = parsed.data

  // Honeypot tripped. Answer as though it worked so the bot stops retrying.
  if (signal) return NextResponse.json({ ok: true })

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'

  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: 'That is a lot of messages. Try again in a few minutes.' },
      { status: 429 },
    )
  }

  const mailer = getTransporter()
  if (!mailer) {
    console.error('[qublox] Contact form submitted but SMTP is not configured.')
    return NextResponse.json(
      { error: 'The form is not connected yet. Email us directly in the meantime.' },
      { status: 503 },
    )
  }

  const to = process.env.CONTACT_TO || process.env.SMTP_USER!

  try {
    await mailer.sendMail({
      // Gmail rewrites From to the authenticated account, so put the sender in
      // Reply-To where it is actually useful.
      from: `"Qublox site" <${process.env.SMTP_USER}>`,
      to,
      replyTo: `"${name}" <${email}>`,
      subject: `New enquiry — ${name}${company ? ` · ${company}` : ''}`,
      text: [
        `Name:    ${name}`,
        `Email:   ${email}`,
        `Company: ${company || '—'}`,
        `Budget:  ${budget || '—'}`,
        '',
        message,
        '',
        `— sent from the Qublox site (${ip})`,
      ].join('\n'),
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[qublox] SMTP send failed.', error)
    return NextResponse.json(
      { error: 'Could not send that. Email us directly and we will pick it up.' },
      { status: 502 },
    )
  }
}
