import { NextStudio } from 'next-sanity/studio'
import config from '~/sanity.config'
import { sanityConfigured } from '@/sanity/env'

export const dynamic = 'force-static'
export { metadata, viewport } from 'next-sanity/studio'

export default function StudioPage() {
  if (!sanityConfigured) {
    return (
      <main
        style={{
          minHeight: '100dvh',
          display: 'grid',
          placeItems: 'center',
          background: 'var(--color-ink)',
          color: 'var(--color-paper)',
          fontFamily: 'var(--font-mono)',
          padding: '2rem',
        }}
      >
        <div style={{ maxWidth: '46ch', lineHeight: 1.7, fontSize: '0.875rem' }}>
          <p style={{ color: 'var(--color-phosphor)' }}>Studio offline</p>
          <p>
            Set <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code> in <code>.env.local</code> and restart
            the dev server. Until then the site renders from its bundled content, which is a
            complete set: nothing is missing.
          </p>
        </div>
      </main>
    )
  }
  return <NextStudio config={config} />
}
