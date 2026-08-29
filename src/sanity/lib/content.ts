import { fallbackContent } from '@/content/fallback'
import type { SiteContent, SiteSettings } from '@/types/content'
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
 * Sanity is treated as an override layer, not a dependency: anything that
 * comes back empty — a missing field, an empty array, a whole failed read —
 * falls through to the bundled content. That means the site is never blank
 * because somebody has not finished filling in the Studio, and it runs with no
 * env vars at all.
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

    const merged = deepMerge(fallbackContent.settings, settings) as SiteSettings

    return {
      settings: {
        ...merged,
        machine: {
          ...merged.machine,
          // Modules are their own documents, so they are merged in separately
          // rather than living inside the settings object.
          modules: nonEmpty(techModules) ?? fallbackContent.settings.machine.modules,
        },
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

/**
 * Overlay `source` onto `base`, ignoring anything empty.
 *
 * Settings are nested now, so a shallow merge was no longer safe: filling in
 * one field of the hero group would have replaced the whole group and blanked
 * the other six. This recurses into plain objects and treats null, undefined,
 * empty strings and empty arrays as "not set", so a partially filled Studio
 * shows bundled copy everywhere it has nothing of its own to say.
 *
 * Arrays are replaced wholesale rather than merged element-wise — a list of
 * boot lines or budget options is a single editorial decision, and merging
 * them index by index would splice CMS entries into bundled ones.
 */
function deepMerge<T>(base: T, source: unknown): T {
  if (!isPlainObject(base) || !isPlainObject(source)) return base

  const out: Record<string, unknown> = { ...base }

  for (const [key, value] of Object.entries(source)) {
    if (value === null || value === undefined || value === '') continue
    if (Array.isArray(value)) {
      if (value.length > 0) out[key] = value
      continue
    }
    if (isPlainObject(value)) {
      out[key] = deepMerge(out[key], value)
      continue
    }
    out[key] = value
  }

  return out as T
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
