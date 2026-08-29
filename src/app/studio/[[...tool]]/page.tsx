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
          background: '#101114',
          color: '#f2f1ec',
          fontFamily: 'ui-monospace, monospace',
          padding: '2rem',
        }}
      >
        <div style={{ maxWidth: '46ch', lineHeight: 1.7, fontSize: '0.875rem' }}>
          <p style={{ color: '#3bffa8', letterSpacing: '0.16em' }}>STUDIO OFFLINE</p>
          <p>
            Set <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code> in <code>.env.local</code> and restart
            the dev server. Until then the site renders from its bundled content, which is a
            complete set — nothing is missing.
          </p>
        </div>
      </main>
    )
  }
  return <NextStudio config={config} />
}
