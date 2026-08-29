import { groq } from 'next-sanity'

/**
 * Every query projects straight into the shapes in src/types/content.ts, so
 * the components stay identical whether the data came from Sanity or from
 * the bundled fallback.
 */

export const settingsQuery = groq`*[_type == "siteSettings"][0]{
  tagline,
  aboutLead,
  aboutBody,
  techIntro,
  communityLead,
  contactLead,
  email,
  location,
  socials[]{ label, href }
}`

export const servicesQuery = groq`*[_type == "service"] | order(order asc){
  _id, title, marquee, description, capabilities
}`

export const projectsQuery = groq`*[_type == "project"] | order(anchor asc){
  _id, title, client, year, discipline, blurb, anchor, side,
  "imageUrl": image.asset->url,
  "plate": { "hue": coalesce(plateHue, 180), "variant": coalesce(plateVariant, "bars") }
}`

export const teamQuery = groq`*[_type == "teamMember"] | order(order asc){
  _id, name, role, serial, jp, clearance, since,
  specs[]{ label, value },
  "imageUrl": image.asset->url,
  "hue": coalesce(hue, 188)
}`

export const eventsQuery = groq`*[_type == "communityEvent"] | order(order asc){
  _id, title, kind, date, location, blurb, status, seats
}`

export const techModulesQuery = groq`*[_type == "techModule"] | order(order asc){
  _id, code, name, status, lines
}`
