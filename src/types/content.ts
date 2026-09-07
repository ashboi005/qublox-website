/**
 * The shape every section consumes.
 *
 * Sanity documents are projected into these exact types by the GROQ queries,
 * so components never know or care whether the data came from the CMS or from
 * src/content/fallback.ts.
 *
 * Settings are grouped by section rather than kept flat. Flat, the Studio
 * became one long undifferentiated list where `eyebrow` and `lead` appeared
 * six times each with no way to tell which section they belonged to; grouped,
 * every field sits next to the thing it labels.
 */

export type Service = {
  _id: string
  title: string
  /** Shown in the hero's scrolling wall, so keep it short and loud. */
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
  /** Which side of the trail the frame hangs off, where the wave allows. */
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
  /** Katakana or kanji strip, as on the reference plate. */
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

export type TechModule = {
  _id: string
  code: string
  name: string
  status: 'ONLINE' | 'STABLE' | 'BETA'
  lines: string[]
}

/** A word in a lead line picked out in one of the three brand colours. */
export type Highlight = { word: string; color: 'red' | 'blue' | 'yellow' }

/** CH 01 — the set. */
export type HeroSettings = {
  /**
   * The wall of type behind the television. Independent of the services list
   * so it can be tuned for rhythm — short, loud phrases that read at a glance
   * while scrolling past.
   */
  marquee: string[]
  /**
   * What the set broadcasts. The logo is channel 01 and is always present;
   * these follow it, one per channel, cycling on a timer and on the dial.
   */
  broadcasts: string[]
  /** Instrument strip along the foot of the frame. */
  serial: string
  established: string
  scrollCue: string
  /** Printed on the set itself. */
  tvBrand: string
  tvModel: string
  tvChannel: string
}

/** CH 02 — the caption. */
export type AboutSettings = {
  eyebrow: string
  kicker: string
  lead: string
  highlights: Highlight[]
  body: string[]
  servicesTitle: string
}

/** CH 03 — the camera run. */
export type MediaSettings = {
  /** Printed on the clapperboard that opens the chapter. */
  slateProduction: string
  slateDirector: string
  eyebrow: string
  yearRange: string
  recLabel: string
  formatLabel: string
}

/** CH 04 — the machine, from cold start to running. */
export type MachineSettings = {
  /** The BIOS readout, one entry per line. Blank entries are blank lines. */
  bootLines: string[]
  /** Typed at the prompt once the desktop is up. */
  command: string
  /** Named in the window's title bar and on the desktop icon. */
  fileName: string
  intro: string
  errorTitle: string
  errorLines: string[]
  icons: { label: string; kind: 'doc' | 'app' | 'film' }[]
  modules: TechModule[]
}

/** CH 05 — the crew. */
export type TeamSettings = {
  eyebrow: string
  note: string
  scanner: string
  /** The paragraph printed across every ID card. */
  authorisation: string
  agency: string
  cardFooter: string
}

/** ERISED, on its own page. */
export type CommunitySettings = {
  lead: string
  eventsEyebrow: string
  openNote: string
  closing: string
  closingLinkLabel: string
}

/** CH 06 — the reply. */
export type ContactSettings = {
  eyebrow: string
  replyNote: string
  title: string
  lead: string
  budgets: string[]
  successTitle: string
  successBody: string
}

export type FooterSettings = {
  serial: string
  backToTop: string
}

/** One entry in the header's tuner, keyed to a section's `data-channel`. */
export type Channel = { id: string; label: string; name: string }

export type SiteSettings = {
  tagline: string
  /** The header readout. Order sets the signal-strength climb. */
  channels: Channel[]
  email: string
  location: string
  socials: { label: string; href: string }[]
  hero: HeroSettings
  about: AboutSettings
  media: MediaSettings
  machine: MachineSettings
  team: TeamSettings
  community: CommunitySettings
  contact: ContactSettings
  footer: FooterSettings
}

export type SiteContent = {
  settings: SiteSettings
  services: Service[]
  projects: Project[]
  team: TeamMember[]
  events: CommunityEvent[]
}
