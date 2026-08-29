import type { Metadata, Viewport } from 'next'
import {
  Archivo,
  Fredoka,
  Instrument_Serif,
  JetBrains_Mono,
  Playfair_Display,
  Space_Grotesk,
} from 'next/font/google'
import './globals.css'

/**
 * Five faces, each bound to a job:
 *   Archivo (variable width) — the display voice, stretched by scroll
 *   Space Grotesk           — body
 *   JetBrains Mono          — terminal, ID cards, every instrument label
 *   Instrument Serif        — the counterweight in the hero marquee
 *   Playfair Display italic — the cursive note in it
 *   Fredoka                 — ERISED only
 *
 * The marquee behind the set is where they meet: five rows, five treatments,
 * so the wall of type reads as a specimen sheet rather than a repeated word.
 */

const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--font-archivo',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
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

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  style: ['italic'],
  variable: '--font-playfair',
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
    default: 'Qublox — creative technology studio',
    template: '%s — Qublox',
  },
  description:
    'Qublox is a creative technology studio working across brand systems, motion, interactive web, film and spatial work.',
  openGraph: {
    title: 'Qublox — creative technology studio',
    description: 'Brand systems, motion, interactive web, film and spatial work.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f2f1ec' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${spaceGrotesk.variable} ${jetbrains.variable} ${instrumentSerif.variable} ${playfair.variable} ${fredoka.variable}`}
    >
      <body>{children}</body>
    </html>
  )
}
