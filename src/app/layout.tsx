import type { Metadata, Viewport } from 'next'
import {
  Archivo,
  Fredoka,
  Instrument_Serif,
  JetBrains_Mono,
} from 'next/font/google'
import './globals.css'

/**
 * Four faces, each bound to a job:
 *   Archivo (variable width) the display voice, stretched by scroll, and the
 *                            reading voice at its normal width
 *   JetBrains Mono           the instruments: readouts, the terminal, figures
 *   Instrument Serif         the counterweight in the hero marquee
 *   Fredoka                  ERISED only
 *
 * The marquee behind the set is where they meet, so the wall of type reads as
 * a specimen sheet rather than a repeated word.
 */

const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--font-archivo',
  display: 'swap',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-instrument',
  display: 'swap',
})

const fredoka = Fredoka({
  subsets: ['latin'],
  variable: '--font-fredoka',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://qublox.studio'),
  title: {
    default: 'Qublox, creative technology studio',
    template: '%s · Qublox',
  },
  description:
    'Qublox is a creative technology studio working across brand systems, motion, interactive web, film and spatial work.',
  openGraph: {
    title: 'Qublox, creative technology studio',
    description: 'Brand systems, motion, interactive web, film and spatial work.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'oklch(95.6% 0.007 95)' },
    { media: '(prefers-color-scheme: dark)', color: 'oklch(11.5% 0.012 280)' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${jetbrains.variable} ${instrumentSerif.variable} ${fredoka.variable}`}
    >
      <body>{children}</body>
    </html>
  )
}
