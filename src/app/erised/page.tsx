import type { Metadata } from 'next'
import { ErisedPage } from '@/components/community/ErisedPage'
import { getSiteContent } from '@/sanity/lib/content'

export const metadata: Metadata = {
  title: 'ERISED',
  description:
    'ERISED is Qublox’s open room. Once a month we clear the studio, put something unfinished on the projector, and argue about it.',
}

export default async function Page() {
  const { settings, events } = await getSiteContent()
  return <ErisedPage settings={settings} events={events} />
}
