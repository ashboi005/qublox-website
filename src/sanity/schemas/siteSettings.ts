import { defineArrayMember, defineField, defineType } from 'sanity'

/**
 * Every piece of standing copy on the site.
 *
 * Fields are grouped by the section they appear in and surfaced as Studio
 * groups, because flat this document became one long list where `eyebrow` and
 * `lead` each appeared six times with nothing to say which section they
 * belonged to. Grouped, an editor opens the tab for the section they are
 * looking at and sees only that section's words.
 *
 * Nothing here is required: the site deep-merges whatever it gets over the
 * bundled content, so an empty field falls back rather than blanking the page.
 */

const highlight = defineArrayMember({
  type: 'object',
  name: 'highlight',
  fields: [
    defineField({ name: 'word', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'color',
      type: 'string',
      options: { list: ['red', 'blue', 'yellow'], layout: 'radio' },
      initialValue: 'red',
    }),
  ],
  preview: { select: { title: 'word', subtitle: 'color' } },
})

const line = { type: 'string' as const }

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  groups: [
    { name: 'general', title: 'General', default: true },
    { name: 'hero', title: 'CH 01 — Hero' },
    { name: 'about', title: 'CH 02 — About' },
    { name: 'media', title: 'CH 03 — Media' },
    { name: 'machine', title: 'CH 04 — Tech' },
    { name: 'team', title: 'CH 05 — Crew' },
    { name: 'contact', title: 'CH 06 — Contact' },
    { name: 'community', title: 'ERISED' },
  ],
  fields: [
    // ---- general ---------------------------------------------------------
    defineField({
      name: 'tagline',
      type: 'string',
      group: 'general',
      description: 'One line describing the studio. Used for search and sharing.',
    }),
    defineField({
      name: 'channels',
      title: 'Header tuner',
      type: 'array',
      group: 'general',
      description:
        'The channel readout in the header. `id` must match a section’s data-channel: hero, about, work, tech, team, contact.',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'id',
              type: 'string',
              options: { list: ['hero', 'about', 'work', 'tech', 'team', 'contact'] },
              validation: (r) => r.required(),
            }),
            defineField({ name: 'label', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'name', type: 'string', validation: (r) => r.required() }),
          ],
          preview: { select: { title: 'label', subtitle: 'name' } },
        }),
      ],
    }),
    defineField({ name: 'email', type: 'string', group: 'general', validation: (r) => r.email() }),
    defineField({
      name: 'location',
      type: 'string',
      group: 'general',
      description: 'Shown in the hero’s instrument strip and the footer.',
    }),
    defineField({
      name: 'socials',
      type: 'array',
      group: 'general',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'label', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'href', type: 'url', validation: (r) => r.required() }),
          ],
          preview: { select: { title: 'label', subtitle: 'href' } },
        }),
      ],
    }),

    // ---- hero ------------------------------------------------------------
    defineField({
      name: 'hero',
      type: 'object',
      group: 'hero',
      options: { collapsible: false },
      fields: [
        defineField({
          name: 'marquee',
          title: 'Wall of type behind the set',
          type: 'array',
          of: [line],
          description:
            'The words that scroll behind the television. Short and loud — they are read at a glance while scrolling past. Each is set in a different face automatically.',
        }),
        defineField({
          name: 'broadcasts',
          title: 'What the set broadcasts',
          type: 'array',
          of: [line],
          description:
            'The logo is channel 01 and is always there. These follow it, one per channel, glitching over every five seconds — and viewers can turn the dial themselves. Short and shoutable: they are set very large.',
        }),
        defineField({ name: 'serial', title: 'Instrument strip — left', type: 'string' }),
        defineField({ name: 'established', title: 'Instrument strip — right', type: 'string' }),
        defineField({ name: 'scrollCue', title: 'Scroll cue', type: 'string' }),
        defineField({ name: 'tvBrand', title: 'Set — brand plate', type: 'string' }),
        defineField({ name: 'tvModel', title: 'Set — model plate', type: 'string' }),
        defineField({
          name: 'tvChannel',
          title: 'Set — channel window',
          type: 'string',
          description: 'The band shown on the set’s channel card. The channel number is added after it.',
        }),
      ],
    }),

    // ---- about -----------------------------------------------------------
    defineField({
      name: 'about',
      type: 'object',
      group: 'about',
      options: { collapsible: false },
      fields: [
        defineField({ name: 'eyebrow', type: 'string' }),
        defineField({ name: 'kicker', title: 'Eyebrow — right', type: 'string' }),
        defineField({
          name: 'lead',
          type: 'text',
          rows: 3,
          description: 'The large statement. Reveals word by word, so keep it under ~20 words.',
        }),
        defineField({
          name: 'highlights',
          title: 'Highlighted words',
          type: 'array',
          of: [highlight],
          description:
            'Words in the lead to pick out in a brand colour. Matched without case or punctuation.',
        }),
        defineField({ name: 'body', title: 'Paragraphs', type: 'array', of: [{ type: 'text', rows: 4 }] }),
        defineField({
          name: 'servicesTitle',
          title: 'Services heading',
          type: 'string',
          description: 'Heads the list of services. The services themselves are their own documents.',
        }),
      ],
    }),

    // ---- media -----------------------------------------------------------
    defineField({
      name: 'media',
      type: 'object',
      group: 'media',
      options: { collapsible: false },
      fields: [
        defineField({
          name: 'slateProduction',
          title: 'Clapperboard — production',
          type: 'string',
          description: 'Printed on the slate that claps the chapter open.',
        }),
        defineField({ name: 'slateDirector', title: 'Clapperboard — director', type: 'string' }),
        defineField({ name: 'eyebrow', type: 'string' }),
        defineField({ name: 'yearRange', title: 'Eyebrow — right', type: 'string' }),
        defineField({ name: 'recLabel', title: 'Footer — record lamp', type: 'string' }),
        defineField({ name: 'formatLabel', title: 'Footer — format', type: 'string' }),
      ],
    }),

    // ---- machine ---------------------------------------------------------
    defineField({
      name: 'machine',
      type: 'object',
      group: 'machine',
      options: { collapsible: false },
      fields: [
        defineField({
          name: 'bootLines',
          title: 'BIOS readout',
          type: 'array',
          of: [line],
          description: 'One entry per line. An empty entry is a blank line.',
        }),
        defineField({
          name: 'command',
          type: 'string',
          description: 'Typed at the prompt once the desktop is up.',
        }),
        defineField({
          name: 'fileName',
          title: 'File name',
          type: 'string',
          description: 'Shown in the window’s title bar.',
        }),
        defineField({ name: 'intro', type: 'text', rows: 2 }),
        defineField({ name: 'errorTitle', title: 'Error dialog — title', type: 'string' }),
        defineField({
          name: 'errorLines',
          title: 'Error dialog — body',
          type: 'array',
          of: [line],
        }),
        defineField({
          name: 'icons',
          title: 'Desktop icons',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'object',
              fields: [
                defineField({ name: 'label', type: 'string', validation: (r) => r.required() }),
                defineField({
                  name: 'kind',
                  type: 'string',
                  options: { list: ['doc', 'app', 'film'], layout: 'radio' },
                  initialValue: 'doc',
                }),
              ],
              preview: { select: { title: 'label', subtitle: 'kind' } },
            }),
          ],
          validation: (r) => r.max(4),
        }),
      ],
    }),

    // ---- team ------------------------------------------------------------
    defineField({
      name: 'team',
      type: 'object',
      group: 'team',
      options: { collapsible: false },
      fields: [
        defineField({ name: 'eyebrow', type: 'string' }),
        defineField({ name: 'note', title: 'Eyebrow — right', type: 'string' }),
        defineField({ name: 'scanner', title: 'Footer — scanner', type: 'string' }),
        defineField({
          name: 'authorisation',
          title: 'ID card — authorisation',
          type: 'text',
          rows: 3,
          description: 'Printed across every card. Set in uppercase automatically.',
        }),
        defineField({ name: 'agency', title: 'ID card — agency', type: 'string' }),
        defineField({ name: 'cardFooter', title: 'ID card — footer', type: 'string' }),
      ],
    }),

    // ---- contact ---------------------------------------------------------
    defineField({
      name: 'contact',
      type: 'object',
      group: 'contact',
      options: { collapsible: false },
      fields: [
        defineField({ name: 'eyebrow', type: 'string' }),
        defineField({ name: 'replyNote', title: 'Eyebrow — right', type: 'string' }),
        defineField({ name: 'title', type: 'string' }),
        defineField({ name: 'lead', type: 'text', rows: 3 }),
        defineField({
          name: 'budgets',
          title: 'Budget options',
          type: 'array',
          of: [line],
          description: 'Offered in the form’s budget menu.',
        }),
        defineField({ name: 'successTitle', title: 'After sending — title', type: 'string' }),
        defineField({ name: 'successBody', title: 'After sending — body', type: 'text', rows: 3 }),
      ],
    }),

    // ---- community -------------------------------------------------------
    defineField({
      name: 'community',
      type: 'object',
      group: 'community',
      options: { collapsible: false },
      fields: [
        defineField({ name: 'lead', type: 'text', rows: 3, description: 'Sits under the ERISED mark.' }),
        defineField({ name: 'eventsEyebrow', type: 'string' }),
        defineField({ name: 'openNote', title: 'Eyebrow — right', type: 'string' }),
        defineField({ name: 'closing', title: 'Closing line', type: 'string' }),
        defineField({ name: 'closingLinkLabel', title: 'Closing line — link', type: 'string' }),
      ],
    }),

    // ---- footer ----------------------------------------------------------
    defineField({
      name: 'footer',
      type: 'object',
      group: 'general',
      options: { collapsible: false },
      fields: [
        defineField({ name: 'serial', type: 'string' }),
        defineField({ name: 'backToTop', title: 'Back-to-top label', type: 'string' }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: 'Site settings' }) },
})
