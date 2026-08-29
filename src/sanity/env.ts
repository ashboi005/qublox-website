export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-01'
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || ''

/**
 * The whole site is designed to run before Sanity exists. Every read goes
 * through this flag; when it is false we never construct a client at all.
 */
export const sanityConfigured = projectId.length > 0
