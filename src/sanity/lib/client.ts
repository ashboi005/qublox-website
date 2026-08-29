import { createClient, type SanityClient } from 'next-sanity'
import { apiVersion, dataset, projectId, sanityConfigured } from '../env'

let cached: SanityClient | null = null

export function getClient(): SanityClient | null {
  if (!sanityConfigured) return null
  if (!cached) {
    cached = createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: true,
      perspective: 'published',
    })
  }
  return cached
}
