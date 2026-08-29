import { fallbackContent } from '@/content/fallback'
import type { SiteContent } from '@/types/content'
import { getClient } from './client'
import {
  eventsQuery,
  projectsQuery,
  servicesQuery,
  settingsQuery,
  teamQuery,
  techModulesQuery,
} from './queries'

/**
 * The single read the page makes.
 *
 * Sanity is treated as an override layer, not a dependency: any collection
 * that comes back empty (or fails outright) falls through to the bundled
 * content. That means the site is never blank because someone has not
 * finished filling in the Studio yet, and it runs with no env vars at all.
 */
export async function getSiteContent(): Promise<SiteContent> {
  const client = getClient()
  if (!client) return fallbackContent

  try {
    const [settings, services, projects, team, events, techModules] = await Promise.all([
      client.fetch(settingsQuery),
      client.fetch(servicesQuery),
      client.fetch(projectsQuery),
      client.fetch(teamQuery),
      client.fetch(eventsQuery),
      client.fetch(techModulesQuery),
    ])

    return {
      settings: {
        ...fallbackContent.settings,
        ...stripEmpty(settings),
        techModules: nonEmpty(techModules) ?? fallbackContent.settings.techModules,
      },
      services: nonEmpty(services) ?? fallbackContent.services,
      projects: nonEmpty(projects) ?? fallbackContent.projects,
      team: nonEmpty(team) ?? fallbackContent.team,
      events: nonEmpty(events) ?? fallbackContent.events,
    }
  } catch (error) {
    console.error('[qublox] Sanity read failed, serving bundled content.', error)
    return fallbackContent
  }
}

function nonEmpty<T>(value: T[] | null | undefined): T[] | null {
  return Array.isArray(value) && value.length > 0 ? value : null
}

/** Keeps a half-filled settings document from blanking out good defaults. */
function stripEmpty(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object') return {}
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).filter(
      ([, v]) => v !== null && v !== undefined && v !== '',
    ),
  )
}
