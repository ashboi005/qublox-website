/**
 * The shape every section consumes. Sanity documents are projected into these
 * exact types by the GROQ queries, so components never know or care whether
 * the data came from the CMS or from src/content/fallback.ts.
 */

export type Service = {
  _id: string
  title: string
  /** Shown in the hero's masked scroll column, so keep it short and loud. */
  marquee: string
  description: string
  capabilities: string[]
}

export type Project = {
  _id: string
  title: string
  client: string
  year: string
  discipline: string
  blurb: string
  /** Position along the camera's light trail, 0 = start, 1 = end. */
  anchor: number
  /** Which side of the trail the frame hangs off. */
  side: 'above' | 'below'
  imageUrl: string | null
  /** Falls back to a generated plate when there is no image yet. */
  plate: PlateSpec
}

/** A procedurally drawn stand-in frame, so the gallery is never empty boxes. */
export type PlateSpec = {
  hue: number
  variant: 'bars' | 'grid' | 'aperture' | 'waveform' | 'noise' | 'orbit'
}

export type TeamMember = {
  _id: string
  name: string
  role: string
  /** Rendered as the ID card's serial. */
  serial: string
  /** Katakana or kanji strip, as on the LAPD plate. */
  jp: string
  clearance: string
  since: string
  /** Two short spec rows on the card. */
  specs: { label: string; value: string }[]
  imageUrl: string | null
  hue: number
}

export type CommunityEvent = {
  _id: string
  title: string
  kind: string
  date: string
  location: string
  blurb: string
  status: 'upcoming' | 'past'
  seats: string
}

export type SiteSettings = {
  tagline: string
  aboutLead: string
  aboutBody: string[]
  techIntro: string
  techModules: TechModule[]
  communityLead: string
  contactLead: string
  email: string
  socials: { label: string; href: string }[]
  location: string
}

export type TechModule = {
  _id: string
  code: string
  name: string
  status: 'ONLINE' | 'STABLE' | 'BETA'
  lines: string[]
}

export type SiteContent = {
  settings: SiteSettings
  services: Service[]
  projects: Project[]
  team: TeamMember[]
  events: CommunityEvent[]
}
